import assert from "node:assert/strict";
const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:8787";
async function call(path, method = "GET", body, token) {
  const r = await fetch(origin + "/api/" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return {
    status: r.status,
    data: await r.json(),
    cookie: r.headers.get("set-cookie"),
  };
}
const email = `test-${Date.now()}@example.test`;
const credentials = {
  email,
  password: "Test-only-pass-482!",
  name: "Test Learner",
};
assert.equal((await call("enrollments")).status, 401);
assert.equal(
  (await call("auth/register", "POST", { ...credentials, password: "short" }))
    .status,
  400,
);
const first = await call("auth/register", "POST", credentials);
assert.equal(first.status, 200);
assert.equal(first.data.accessToken.split(".").length, 3);
assert.match(first.cookie, /HttpOnly/i);
assert.match(first.cookie, /SameSite=Lax/i);
const token = first.data.accessToken;
assert.equal((await call("auth/register", "POST", credentials)).status, 409);
assert.equal(
  (
    await call("auth/login", "POST", {
      ...credentials,
      password: "incorrect-pass",
    })
  ).status,
  401,
);
assert.equal(
  (await call("auth/me", "GET", null, token)).data.user.email,
  email,
);
assert.equal(
  (await call("auth/me", "GET", null, token + "tampered")).status,
  401,
);
assert.equal(
  (
    await call(
      "enrollments",
      "PATCH",
      { courseId: "web", completed: [0] },
      token,
    )
  ).status,
  403,
);
assert.equal(
  (await call("enrollments", "POST", { courseId: "missing" }, token)).status,
  404,
);
assert.equal(
  (await call("enrollments", "POST", { courseId: "web" }, token)).status,
  200,
);
assert.equal(
  (await call("enrollments", "POST", { courseId: "web" }, token)).data
    .enrollments.length,
  1,
);
assert.equal(
  (
    await call(
      "enrollments",
      "PATCH",
      { courseId: "web", completed: [99] },
      token,
    )
  ).status,
  400,
);
const progress = await call(
  "enrollments",
  "PATCH",
  { courseId: "web", completed: [0, 1], notes: "My saved test note" },
  token,
);
assert.equal(progress.status, 200);
assert.equal(progress.data.enrollments[0].notes, "My saved test note");
const other = await call("auth/register", "POST", {
  ...credentials,
  email: "other-" + email,
});
assert.equal(
  (await call("enrollments", "GET", null, other.data.accessToken)).data
    .enrollments.length,
  0,
);
assert.equal(
  (
    await call(
      "enrollments",
      "PATCH",
      { courseId: "web", completed: [0] },
      other.data.accessToken,
    )
  ).status,
  403,
);
const login = await call("auth/login", "POST", credentials);
assert.equal(login.status, 200);
assert.equal(
  (await call("enrollments", "GET", null, login.data.accessToken)).data
    .enrollments[0].completed,
  "[0,1]",
);
assert.equal(
  (await call("profile", "PATCH", { name: "Updated Learner" }, token)).data.user
    .name,
  "Updated Learner",
);
await call("auth/logout", "POST", null, token);
assert.equal((await call("auth/me", "GET", null, token)).status, 401);
await call("auth/logout", "POST", null, login.data.accessToken);
await call("auth/logout", "POST", null, other.data.accessToken);
console.log(
  "PASS: validation, registration, JWT signatures, secure cookie, login, access control, enrollment, progress, notes, profile, session persistence, cross-account isolation and logout.",
);
