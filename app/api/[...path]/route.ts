import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../db";
import { users, sessions, enrollments, authAttempts } from "../../../db/schema";
import { eq, and, sql } from "drizzle-orm";
import { courses } from "../../../lib/courses";
async function readBody(req: NextRequest) {
  const text = await req.text();
  if (text.length > 20000) throw new Error("invalid_body");
  const body = JSON.parse(text);
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new Error("invalid_body");
  return body as Record<string, unknown>;
}
function json(data: unknown, init?: ResponseInit) {
  const response = NextResponse.json(data, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
const hex = (b: ArrayBuffer) =>
  Array.from(new Uint8Array(b), (v) => v.toString(16).padStart(2, "0")).join(
    "",
  );
async function hash(password: string, salt: string) {
  const k = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return hex(
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: new TextEncoder().encode(salt),
        iterations: 100000,
        hash: "SHA-256",
      },
      k,
      256,
    ),
  );
}
function fail(message: string, status = 400) {
  return json({ error: message }, { status });
}
const b64 = (v: string) =>
  btoa(v).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
const decode = (v: string) => atob(v.replace(/-/g, "+").replace(/_/g, "/"));
async function signature(input: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return b64(
    String.fromCharCode(
      ...new Uint8Array(
        await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(input)),
      ),
    ),
  );
}
async function verifySignature(input:string,encoded:string,secret:string){const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["verify"]);const bytes=Uint8Array.from(decode(encoded),c=>c.charCodeAt(0));return crypto.subtle.verify("HMAC",key,bytes,new TextEncoder().encode(input));}
async function makeJWT(s: {
  id: string;
  userId: string;
  expires: number;
  signingKey: string;
}) {
  const input =
    b64(JSON.stringify({ alg: "HS256", typ: "JWT" })) +
    "." +
    b64(
      JSON.stringify({
        sub: s.userId,
        jti: s.id,
        exp: Math.floor(s.expires / 1000),
      }),
    );
  return input + "." + (await signature(input, s.signingKey));
}
async function handle(req: NextRequest) {
  try {
    const path = new URL(req.url).pathname.replace("/api/", "");
    const db = getDb();
    const cookie =
      req.headers.get("authorization")?.replace(/^Bearer /, "") ||
      req.cookies.get("sb_session")?.value;
    let session: typeof sessions.$inferSelect | null = null;
    let user: typeof users.$inferSelect | null = null;
    if (cookie) {
      try {
        const parts = cookie.split(".");
        const header = JSON.parse(decode(parts[0]));
        const payload = JSON.parse(decode(parts[1]));
        const candidate = (
          await db.select().from(sessions).where(eq(sessions.id, payload.jti))
        )[0];
        if (
          header.alg === "HS256" &&
          header.typ === "JWT" &&
          candidate &&
          candidate.expires > Date.now() &&
          payload.exp > Date.now() / 1000 &&
          payload.sub === candidate.userId &&
          parts.length===3 && await verifySignature(parts[0]+"."+parts[1],parts[2],candidate.signingKey)
        ) {
          session = candidate;
          user = (
            await db.select().from(users).where(eq(users.id, session.userId))
          )[0];
        }
      } catch {}
    }

    if (Number(req.headers.get("content-length") || 0) > 20000)
      return fail("Request is too large.", 413);
    if (req.method !== "GET") {
      const origin = req.headers.get("origin");
      if (origin && origin !== new URL(req.url).origin)
        return fail("Request origin rejected", 403);
    }
    if (path === "auth/logout") {
      if(req.method!=="POST")return fail("Method not allowed",405);
      if (session) await db.delete(sessions).where(eq(sessions.id, session.id));
      const r = json({ ok: true });
      r.cookies.set("sb_session", "", { httpOnly: true, path: "/", maxAge: 0 });
      return r;
    }
    if (path === "auth/register" || path === "auth/login") {
      if (req.method !== "POST") return fail("Method not allowed", 405);
      const b = await readBody(req);
      const email = String(b.email || "")
        .trim()
        .toLowerCase();
      const password = String(b.password || "");
      const rateId = hex(
        await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(email + ":" + path),
        ),
      );
      const now = Date.now();
      await db
        .insert(authAttempts)
        .values({ id: rateId, count: 1, reset: now + 900000 })
        .onConflictDoUpdate({
          target: authAttempts.id,
          set: {
            count: sql`CASE WHEN ${authAttempts.reset} < ${now} THEN 1 ELSE ${authAttempts.count}+1 END`,
            reset: sql`CASE WHEN ${authAttempts.reset} < ${now} THEN ${now + 900000} ELSE ${authAttempts.reset} END`,
          },
        });
      const attempt = (
        await db.select().from(authAttempts).where(eq(authAttempts.id, rateId))
      )[0];
      if (attempt.count > 12)
        return fail("Too many attempts. Please try again in 15 minutes.", 429);
      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        email.length > 254 ||
        password.length < 8 ||
        password.length > 128
      )
        return fail("Use a valid email and a password of 8–128 characters.");
      let u = (await db.select().from(users).where(eq(users.email, email)))[0];
      if (path.endsWith("register")) {
        const name = String(b.name || "").trim();
        if (name.length < 2 || name.length > 60)
          return fail("Your name must contain 2–60 characters.");
        if (u) return fail("An account already exists with this email.", 409);
        const salt = crypto.randomUUID();
        u = {
          id: crypto.randomUUID(),
          name,
          email,
          password: salt + ":" + (await hash(password, salt)),
        };
        await db.insert(users).values(u);
      } else {
        if (!u) return fail("Email or password is incorrect.", 401);
        const [salt, digest] = u.password.split(":");
        if ((await hash(password, salt)) !== digest)
          return fail("Email or password is incorrect.", 401);
      }
      const id = crypto.randomUUID();
      const record = {
        id,
        userId: u.id,
        expires: Date.now() + 7 * 86400000,
        signingKey: crypto.randomUUID() + crypto.randomUUID(),
      };
      await db.insert(sessions).values(record);
      const token = await makeJWT(record);
      const r = json({
        user: { id: u.id, name: u.name, email: u.email },
        accessToken: token,
      });
      r.cookies.set("sb_session", token, {
        httpOnly: true,
        secure: new URL(req.url).protocol === "https:",
        sameSite: "lax",
        path: "/",
        maxAge: 604800,
      });
      return r;
    }
    if (path === "courses") return json({ courses });
    if (!user) return fail("Please sign in to continue.", 401);
    if (path === "auth/me")
      return json({
        user: { id: user.id, name: user.name, email: user.email },
        accessToken: cookie,
      });
    if (path === "profile" && req.method === "PATCH") {
      const b = await readBody(req);
      const name = String(b.name || "").trim();
      if (name.length < 2 || name.length > 60)
        return fail("Your name must contain 2–60 characters.");
      await db.update(users).set({ name }).where(eq(users.id, user.id));
      return json({ user: { id: user.id, name, email: user.email } });
    }
    if (path === "enrollments") {
      if (req.method === "GET")
        return json({
          enrollments: await db
            .select()
            .from(enrollments)
            .where(eq(enrollments.userId, user.id)),
        });
      const b = await readBody(req);
      const c = courses.find((c) => c.id === b.courseId);
      if (!c) return fail("Course not found", 404);
      const id = user.id + ":" + c.id;
      if (req.method === "POST") {
        await db
          .insert(enrollments)
          .values({ id, userId: user.id, courseId: c.id })
          .onConflictDoNothing();
      } else if (req.method === "PATCH") {
        const existing = (
          await db
            .select()
            .from(enrollments)
            .where(and(eq(enrollments.id, id), eq(enrollments.userId, user.id)))
        )[0];
        if (!existing) return fail("Enroll before updating progress.", 403);
        const update: any = {};
        if (b.completed !== undefined) {
          if (
            !Array.isArray(b.completed) ||
            b.completed.some(
              (n: any) =>
                !Number.isInteger(n) || n < 0 || n >= c.lessons.length,
            )
          )
            return fail("Invalid lesson progress.");
          update.completed = JSON.stringify([...new Set(b.completed)]);
        }
        if (b.notes !== undefined) {
          if (typeof b.notes !== "string" || b.notes.length > 10000)
            return fail("Notes must be under 10,000 characters.");
          update.notes = b.notes;
        }
        await db.update(enrollments).set(update).where(eq(enrollments.id, id));
      } else return fail("Method not allowed", 405);
      return json({
        enrollments: await db
          .select()
          .from(enrollments)
          .where(eq(enrollments.userId, user.id)),
      });
    }
    return fail("Not found", 404);
  } catch (e) {
    if (
      e instanceof SyntaxError ||
      (e instanceof Error && e.message === "invalid_body")
    )
      return fail("Send a valid JSON object under 20,000 characters.", 400);
    console.error("API request failed", e);
    return fail("Something went wrong. Please try again.", 500);
  }
}
export const GET = handle;
export const POST = handle;
export const PATCH = handle;
