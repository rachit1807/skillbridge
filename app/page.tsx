"use client";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Sun,
  Moon,
  BookOpen,
  LayoutDashboard,
  Search,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Menu,
  Play,
  Clock,
  BarChart3,
  Bookmark,
  CheckCircle2,
  Loader2,
  GraduationCap,
  Command,
  ArrowDown,
  Flame,
  Layers,
  Zap,
  Atom,
  Braces,
  Lightbulb,
} from "lucide-react";
import { api, setAccessToken } from "../lib/axiosClient";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { courses } from "../lib/courses";
import { AuthContext, type UserT } from "../components/AuthContext";
type Enrollment = { courseId: string; completed: string; notes: string };

export default function Home() {
  const [user, setUser] = useState<UserT | null>(null),
    
    [theme, setTheme] = useState("dark"),
    [view, setView] = useState("home"),
    [auth, setAuth] = useState<string | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [toast, setToast] = useState(""),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState("All"),
    [enrolled, setEnrolled] = useState<Enrollment[]>([]),
    [selected, setSelected] = useState<string | null>(null),
    [lesson, setLesson] = useState(0),
    [notes, setNotes] = useState(""),
    [mobile, setMobile] = useState(false);
  useEffect(() => {
    const ripple = (event: PointerEvent) => {
      const button = (event.target as HTMLElement).closest("button");
      if (!button || button.disabled) return;
      const r = button.getBoundingClientRect();
      const spark = document.createElement("span");
      spark.className = "click-spark";
      spark.style.left = event.clientX - r.left + "px";
      spark.style.top = event.clientY - r.top + "px";
      spark.setAttribute("aria-hidden", "true");
      button.appendChild(spark);
      setTimeout(() => spark.remove(), 650);
    };
    document.addEventListener("pointerdown", ripple);
    return () => document.removeEventListener("pointerdown", ripple);
  }, []);
  useEffect(() => {
    const t = localStorage.getItem("sb-theme") || "dark";
    setTheme(t);
    document.documentElement.dataset.theme = t;
    api("auth/me")
      .then((d) => {
        setUser(d.user);
        setAccessToken(d.accessToken);
        return api("enrollments");
      })
      .then((d) => setEnrolled(d.enrollments))
      .catch(() => {})
      ;
  }, []);
  useEffect(() => {
    const expire = () => {
      setUser(null);
      setEnrolled([]);
      setSelected(null);
      setAuth("login");
      setError("Your session expired. Sign in to continue.");
      setView("home");
    };
    window.addEventListener("session-expired", expire);
    return () => window.removeEventListener("session-expired", expire);
  }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    if (auth || selected) {
      const previousFocus=document.activeElement as HTMLElement;
      const dialog=document.querySelector<HTMLElement>('[aria-modal="true"]');
      const focusables=()=>Array.from(dialog?.querySelectorAll<HTMLElement>('button:not(:disabled),input,textarea,a[href],[tabindex="0"]')||[]);
      const listener = (e: KeyboardEvent) => {
        if(e.key==="Tab"){const elements=focusables();const first=elements[0],last=elements[elements.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}
        if (e.key === "Escape") {
          setAuth(null);
          setSelected(null);
        }
      };
      document.addEventListener("keydown", listener);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", listener);
        document.body.style.overflow = prev;
        previousFocus?.focus();
      };
    }
  }, [auth, selected]);
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("sb-theme", next);
    document.documentElement.dataset.theme = next;
  }
  function go(v: string) {
    if (v === "dashboard" && !user) {
      setAuth("login");
      setError("");
      return;
    }
    setView(v);
    setMobile(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function authenticate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const d = await api(
        "auth/" + (auth === "register" ? "register" : "login"),
        "POST",
        Object.fromEntries(f),
      );
      setUser(d.user);
      setAccessToken(d.accessToken);
      setEnrolled((await api("enrollments")).enrollments);
      setAuth(null);
      setView("dashboard");
      setToast(
        auth === "register"
          ? "Your next chapter starts here. Welcome aboard!"
          : "Welcome back. Let’s keep building.",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    try {
      await api("auth/logout", "POST");
      setUser(null);
      setAccessToken(null);
      setEnrolled([]);
      setView("home");
      setSelected(null);
      setToast("You have been signed out.");
    } catch (e) {
      setToast((e as Error).message);
    }
  }
  function openCourse(id: string) {
    setSelected(id);
    setLesson(0);
    setNotes(enrolled.find((e) => e.courseId === id)?.notes || "");
    setError("");
  }
  async function enroll(id: string) {
    if (!user) {
      setSelected(null);
      setAuth("register");
      return;
    }
    setBusy(true);
    try {
      setEnrolled(
        (await api("enrollments", "POST", { courseId: id })).enrollments,
      );
      setToast("You’re enrolled. Let’s make progress.");
    } catch (e) {
      setToast((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function updateProgress(id: string, completed: number[]) {
    setBusy(true);
    try {
      setEnrolled(
        (await api("enrollments", "PATCH", { courseId: id, completed }))
          .enrollments,
      );
      setToast("Progress saved.");
    } catch (e) {
      setToast((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const current = courses.find((c) => c.id === selected),
    registration = enrolled.find((e) => e.courseId === selected),
    done: number[] = registration ? JSON.parse(registration.completed) : [];
  const totalDone = enrolled.reduce(
    (n, e) => n + JSON.parse(e.completed).length,
    0,
  );
  const completedCourses = enrolled.filter(
    (e) =>
      JSON.parse(e.completed).length ===
      courses.find((c) => c.id === e.courseId)?.lessons.length,
  ).length;
  const filtered = courses.filter(
    (c) =>
      (category === "All" || c.category === category) &&
      (c.title + " " + c.category + " " + c.description)
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  function Card({
    course: c,
    index = 0,
  }: {
    course: (typeof courses)[number];
    index?: number;
  }) {
    const entry = enrolled.find((e) => e.courseId === c.id);
    const percentage = entry
      ? Math.round(
          (JSON.parse(entry.completed).length / c.lessons.length) * 100,
        )
      : 0;
    return (
      <button
        className="course-card"
        onClick={() => openCourse(c.id)}
        style={{ "--course": c.color } as React.CSSProperties}
      >
        <div className="course-art">
          <span className="art-index">SB / 0{courses.indexOf(c) + 1}</span>
          <div className="art-lines" />
          <span className="art-symbol">{c.icon}</span>
          <span className="art-tag">{c.category.toUpperCase()}</span>
          <ArrowUpRight size={21} />
        </div>
        <div className="course-body">
          <div className="card-kicker">
            <span>{c.level}</span>
            <span>
              <Clock size={12} />
              {c.hours} hours
            </span>
          </div>
          <h3>{c.title}</h3>
          <p>{c.description}</p>
          <div className="card-footer">
            <span>
              {entry
                ? percentage + "% complete"
                : c.lessons.length + " guided lessons"}
            </span>
            <span>
              {entry ? "Continue" : "Explore course"}
              <ArrowRight size={15} />
            </span>
          </div>
          {entry && (
            <div className="progress">
              <span style={{ width: percentage + "%" }} />
            </div>
          )}
        </div>
      </button>
    );
  }
  return (
    <AuthContext.Provider value={{ user }}>
      <div className="site-shell">
        <div className="storm-background" aria-hidden="true">
          <div className="storm-cloud cloud-one" />
          <div className="storm-cloud cloud-two" />
          <svg className="lightning lightning-one" viewBox="0 0 160 600">
            <path d="M100 0 55 145 106 140 36 310 79 294 12 540 105 310 66 321 140 119 88 128 126 0" />
          </svg>
          <svg className="lightning lightning-two" viewBox="0 0 160 600">
            <path d="M100 0 55 145 106 140 36 310 79 294 12 540 105 310 66 321 140 119 88 128 126 0" />
          </svg>
          <div className="education-drift">
            {[
              BookOpen,
              GraduationCap,
              Atom,
              Braces,
              Lightbulb,
              Command,
              BookOpen,
              Atom,
            ].map((Icon, i) => (
              <span key={i} style={{ "--i": i } as React.CSSProperties}>
                <Icon strokeWidth={0.8} />
              </span>
            ))}
          </div>
        </div>
        <header>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              go("home");
            }}
            className="brand"
          >
            <span className="brand-mark">
              <Layers size={23} />
            </span>
            skillbridge<span className="brand-dot">.</span>
          </a>
          <nav
            className={mobile ? "nav open" : "nav"}
            aria-label="Main navigation"
          >
            <button
              className={view === "home" ? "active" : ""}
              onClick={() => go("home")}
            >
              Overview
            </button>
            <button
              className={view === "courses" ? "active" : ""}
              onClick={() => go("courses")}
            >
              Explore courses
            </button>
            <button
              className={view === "dashboard" ? "active" : ""}
              onClick={() => go("dashboard")}
            >
              My workspace{user && <span className="nav-dot" />}
            </button>
          </nav>
          <div className="header-actions">
            <button
              className="icon-button theme storm-control"
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? "Switch to light theme"
                  : "Switch to dark theme"
              }
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              <span className="theme-label">
                {theme === "dark" ? "Dawn" : "Storm"}
              </span>
            </button>
            {user ? (
              <button
                className="avatar"
                onClick={() => go("profile")}
                aria-label="Your profile"
              >
                {user.name.slice(0, 1).toUpperCase()}
              </button>
            ) : (
              <button
                className="signin storm-signin"
                onClick={() => {
                  setAuth("login");
                  setError("");
                }}
              >
                <span>Sign in</span>{" "}
                <span className="button-arrow">
                  <ArrowUpRight size={16} />
                </span>
              </button>
            )}
            <button
              className="icon-button mobile-menu"
              onClick={() => setMobile(!mobile)}
              aria-label="Toggle navigation"
            >
              {mobile ? <X /> : <Menu />}
            </button>
          </div>
        </header>
        <main>
          {view === "home" && (
            <>
              <section className="hero">
                <div className="hero-copy">
                  <div className="eyebrow">
                    <span className="live-dot" /> A LITTLE CURIOSITY. A LOT OF
                    POSSIBILITY.
                  </div>
                  <h1>
                    Learn with purpose.
                    <br />
                    Build with <span>confidence.</span>
                  </h1>
                  <p className="hero-description">
                    Close the gap between where you are and what’s next.
                    Practical courses. Real momentum. A space to make it yours.
                  </p>
                  <div className="hero-actions">
                    <button
                      className="button primary"
                      onClick={() => go("courses")}
                    >
                      <Zap size={16} />
                      <span>Find your next skill</span>
                      <span className="button-arrow">
                        <ArrowUpRight size={19} />
                      </span>
                    </button>
                    <button
                      className="text-button secondary-cta"
                      onClick={() => go(user ? "dashboard" : "courses")}
                    >
                      {user ? "Open my workspace" : "See what’s inside"}
                      <ArrowRight size={17} />
                    </button>
                  </div>
                  <div className="hero-proof">
                    <div className="learning-badge">
                      <GraduationCap size={21} />
                    </div>
                    <div>
                      <strong>Small steps. Serious growth.</strong>
                      <span>Learn at your pace, on your terms.</span>
                    </div>
                  </div>
                </div>
                <div className="hero-visual" aria-hidden="true">
                  <div className="visual-grid" />
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="orbit orbit-three" />
                  <div className="nucleus">
                    <GraduationCap size={55} strokeWidth={1.2} />
                    <Zap className="core-bolt" size={22} />
                  </div>
                  {Array.from({ length: 16 }, (_, i) => (
                    <i
                      key={i}
                      className="particle"
                      style={{ "--i": i } as React.CSSProperties}
                    />
                  ))}
                  <span className="visual-label top">
                    <Zap size={11} /> POWER YOUR NEXT CHAPTER
                  </span>
                  <div className="floating-chip chip-one">
                    <Command size={18} />
                    <div>
                      Build something real
                      <span>From concepts to confidence</span>
                    </div>
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="floating-chip chip-two">
                    <span className="chip-flame">
                      <Flame size={20} />
                    </span>
                    <div>
                      Keep the momentum<span>One lesson at a time</span>
                    </div>
                  </div>
                  <span className="visual-coordinate">
                    KNOWLEDGE IS YOUR SUPERPOWER
                  </span>
                  <span className="visual-number">01—∞</span>
                </div>
              </section>
              <div className="principles">
                <span>DESIGNED FOR YOUR NEXT MOVE</span>
                <div>
                  <BookOpen size={18} /> Practical, focused lessons
                </div>
                <div>
                  <BarChart3 size={18} /> Progress that stays with you
                </div>
                <div>
                  <Bookmark size={18} /> Your own learning space
                </div>
              </div>
              <section className="section">
                <div className="section-heading">
                  <div>
                    <div className="eyebrow muted">
                      THE LEARNING COLLECTION / 01
                    </div>
                    <h2>
                      Pick a direction.
                      <br />
                      <span>Make it your own.</span>
                    </h2>
                  </div>
                  <div className="section-aside">
                    <p>
                      Skills for the things you want to build.
                      <br />
                      Start with curiosity. Leave with something real.
                    </p>
                    <button
                      className="text-button"
                      onClick={() => go("courses")}
                    >
                      Explore the collection <ArrowUpRight size={17} />
                    </button>
                  </div>
                </div>
                <div className="course-grid">
                  {courses.slice(0, 3).map((c, i) => (
                    <Card key={c.id} course={c} index={i} />
                  ))}
                </div>
              </section>
              <section className="manifesto">
                <div className="eyebrow">LESS SCROLLING. MORE BECOMING.</div>
                <h2>
                  Your potential isn’t a destination.
                  <br />
                  It’s a <em>work in progress.</em>
                </h2>
                <button
                  className="button primary"
                  onClick={() => (user ? go("dashboard") : setAuth("register"))}
                >
                  {user ? "Back to your workspace" : "Create your free account"}
                  <ArrowUpRight size={19} />
                </button>
                <span>NO SUBSCRIPTIONS. JUST YOUR NEXT STEP.</span>
              </section>
            </>
          )}
          {view === "courses" && (
            <section className="section catalog">
              <div className="eyebrow">THE LEARNING COLLECTION</div>
              <h1>
                Find your <span>next thing.</span>
              </h1>
              <p className="page-description">
                Six paths to new possibilities. All free. All yours to explore.
              </p>
              <div className="catalog-tools">
                <div className="filters">
                  {[
                    "All",
                    "Development",
                    "Design",
                    "Backend",
                    "Data",
                    "Tools",
                  ].map((c) => (
                    <button
                      key={c}
                      className={category === c ? "selected" : ""}
                      onClick={() => setCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <label className="search">
                  <Search size={17} />
                  <input
                    placeholder="Search the collection…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search courses"
                  />
                </label>
              </div>
              <div className="results-count">
                {filtered.length} courses to move you forward
              </div>
              <div className="course-grid">
                {filtered.map((c) => (
                  <Card key={c.id} course={c} />
                ))}
              </div>
              {!filtered.length && (
                <div className="empty">
                  <Search />
                  <h3>No courses found</h3>
                  <p>Try another keyword or explore all categories.</p>
                  <button
                    className="button"
                    onClick={() => {
                      setSearch("");
                      setCategory("All");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </section>
          )}
          {view === "dashboard" && user && (
            <ProtectedRoute>
              <section className="section workspace">
                <div className="workspace-top">
                  <div>
                    <div className="eyebrow">
                      <span className="live-dot" /> YOUR PERSONAL WORKSPACE
                    </div>
                    <h1>
                      Keep going, <span>{user.name.split(" ")[0]}.</span>
                    </h1>
                    <p className="page-description">
                      Every small step adds up. Here’s where you left off.
                    </p>
                  </div>
                  <button className="button" onClick={() => go("courses")}>
                    Explore courses <ArrowUpRight size={18} />
                  </button>
                </div>
                <div className="stats">
                  <div>
                    <span>YOUR COLLECTION</span>
                    <strong>
                      {String(enrolled.length).padStart(2, "0")}
                      <BookOpen />
                    </strong>
                    <p>Courses enrolled</p>
                  </div>
                  <div>
                    <span>FORWARD MOTION</span>
                    <strong>
                      {String(totalDone).padStart(2, "0")}
                      <Flame />
                    </strong>
                    <p>Lessons completed</p>
                  </div>
                  <div>
                    <span>THE FINISH LINE</span>
                    <strong>
                      {String(completedCourses).padStart(2, "0")}
                      <GraduationCap />
                    </strong>
                    <p>Courses completed</p>
                  </div>
                </div>
                <div className="section-heading compact">
                  <h2>Your learning, in motion.</h2>
                  <span className="small-label">
                    {enrolled.length} IN YOUR WORKSPACE
                  </span>
                </div>
                {enrolled.length ? (
                  <div className="course-grid">
                    {courses
                      .filter((c) => enrolled.some((e) => e.courseId === c.id))
                      .map((c) => (
                        <Card key={c.id} course={c} />
                      ))}
                  </div>
                ) : (
                  <div className="empty">
                    <BookOpen size={38} />
                    <h3>A fresh page. A new possibility.</h3>
                    <p>
                      Your enrolled courses will live here. Pick your first one
                      to get started.
                    </p>
                    <button
                      className="button primary"
                      onClick={() => go("courses")}
                    >
                      Find your first course <ArrowRight size={17} />
                    </button>
                  </div>
                )}
              </section>
            </ProtectedRoute>
          )}
          {view === "profile" && user && (
            <section className="section profile-page">
              <div className="eyebrow">YOUR ACCOUNT</div>
              <h1>
                A space for <span>you.</span>
              </h1>
              <div className="profile-card">
                <div className="profile-intro">
                  <span className="avatar large">
                    {user.name[0].toUpperCase()}
                  </span>
                  <h2>{user.name}</h2>
                  <p>{user.email}</p>
                </div>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setBusy(true);
                    try {
                      const f = new FormData(e.currentTarget);
                      setUser(
                        (await api("profile", "PATCH", { name: f.get("name") }))
                          .user,
                      );
                      setToast("Profile updated.");
                    } catch (e) {
                      setToast((e as Error).message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <label>
                    Display name
                    <input
                      name="name"
                      defaultValue={user.name}
                      required
                      minLength={2}
                      maxLength={60}
                    />
                  </label>
                  <label>
                    Email address
                    <input value={user.email} readOnly />
                    <small>Your email identifies your learning account.</small>
                  </label>
                  <button className="button primary" disabled={busy}>
                    Save changes <Check size={17} />
                  </button>
                </form>
                <div className="profile-bottom">
                  <span>Signed in securely on this device</span>
                  <button className="text-button" onClick={logout}>
                    Sign out <LogOut size={16} />
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>
        <footer>
          <a
            className="brand"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              go("home");
            }}
          >
            <span className="brand-mark">
              <Layers size={20} />
            </span>
            skillbridge<span className="brand-dot">.</span>
          </a>
          <p>A little progress, every day.</p>
          <span>© {new Date().getFullYear()} SkillBridge</span>
          <button
            className="text-button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Back to top ↑
          </button>
        </footer>
      </div>
      {toast && (
        <div role="status" className="toast">
          <CheckCircle2 size={18} />
          {toast}
          <button
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {auth && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAuth(null);
          }}
        >
          <section
            className="auth-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
          >
            <button
              className="modal-close icon-button"
              onClick={() => setAuth(null)}
              aria-label="Close"
            >
              <X />
            </button>
            <span className="auth-logo">
              <Layers size={29} />
            </span>
            <div className="eyebrow">YOUR NEXT CHAPTER</div>
            <h2 id="auth-title">
              {auth === "register"
                ? "Make room for growth."
                : "Good to see you again."}
            </h2>
            <p>
              {auth === "register"
                ? "A free account. A world of possibilities."
                : "Your learning journey is right where you left it."}
            </p>
            <form onSubmit={authenticate}>
              {auth === "register" && (
                <label>
                  Your name
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={60}
                    placeholder="Alex Morgan"
                    autoFocus
                  />
                </label>
              )}
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  autoFocus={auth !== "register"}
                />
              </label>
              <label>
                Password
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete={
                    auth === "register" ? "new-password" : "current-password"
                  }
                  placeholder="At least 8 characters"
                />
              </label>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button className="button primary full" disabled={busy}>
                {busy ? (
                  <Loader2 className="spin" size={18} />
                ) : auth === "register" ? (
                  "Create account"
                ) : (
                  "Sign in"
                )}
                <ArrowRight size={18} />
              </button>
            </form>
            <p className="auth-switch">
              {auth === "register"
                ? "Already learning with us?"
                : "New around here?"}
              <button
                onClick={() => {
                  setAuth(auth === "register" ? "login" : "register");
                  setError("");
                }}
              >
                {auth === "register" ? "Sign in" : "Create an account"}
              </button>
            </p>
            <div className="auth-note">
              Your progress is saved securely to your account.
            </div>
          </section>
        </div>
      )}
      {current && (
        <div className="modal-backdrop course-backdrop">
          <section
            className="lesson-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-title"
          >
            <aside className="lesson-sidebar">
              <button className="text-button" onClick={() => setSelected(null)}>
                <ChevronLeft size={17} /> Back to collection
              </button>
              <div className="eyebrow">
                {current.category} / {current.level}
              </div>
              <h2 id="course-title">{current.title}</h2>
              <p>{current.description}</p>
              <div className="lesson-meta">
                <span>
                  <Clock size={15} />
                  {current.hours} hours
                </span>
                <span>
                  <BookOpen size={15} />
                  {current.lessons.length} lessons
                </span>
              </div>
              {registration && (
                <>
                  <div className="progress">
                    <span
                      style={{
                        width:
                          (done.length / current.lessons.length) * 100 + "%",
                      }}
                    />
                  </div>
                  <small>
                    {done.length} of {current.lessons.length} lessons complete
                  </small>
                </>
              )}
              <div className="lesson-list">
                {current.lessons.map((l, i) => (
                  <button
                    className={lesson === i ? "current" : ""}
                    key={l.title}
                    onClick={() => setLesson(i)}
                  >
                    <span>
                      {done.includes(i) ? (
                        <Check size={15} />
                      ) : (
                        String(i + 1).padStart(2, "0")
                      )}
                    </span>
                    {l.title}
                    {lesson === i && <Play size={12} />}
                  </button>
                ))}
              </div>
            </aside>
            <article className="lesson-content">
              <button
                className="modal-close icon-button"
                onClick={() => setSelected(null)}
                aria-label="Close course"
              >
                <X />
              </button>
              <div className="eyebrow">
                LESSON {String(lesson + 1).padStart(2, "0")} /{" "}
                {String(current.lessons.length).padStart(2, "0")}
              </div>
              <div
                className="lesson-illustration"
                style={{ "--course": current.color } as React.CSSProperties}
              >
                <span>{current.icon}</span>
                <div className="lesson-orbit" />
                <small>UNDERSTAND. PRACTICE. BUILD.</small>
              </div>
              <h2>{current.lessons[lesson].title}</h2>
              <p className="lesson-text">{current.lessons[lesson].body}</p>
              <div className="practice">
                <span>
                  <Command size={16} /> MAKE IT REAL
                </span>
                <p>{current.lessons[lesson].task}</p>
              </div>
              {!registration ? (
                <div className="enroll-callout">
                  <p>
                    Make this part of your journey. Enroll to save progress and
                    personal notes.
                  </p>
                  <button
                    className="button primary"
                    disabled={busy}
                    onClick={() => enroll(current.id)}
                  >
                    {user ? "Enroll for free" : "Create account to enroll"}
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <label className="notes-label">
                    Your notes
                    <textarea
                      maxLength={10000}
                      placeholder="Ideas, questions, things worth remembering…"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </label>
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        setEnrolled(
                          (
                            await api("enrollments", "PATCH", {
                              courseId: current.id,
                              notes,
                            })
                          ).enrollments,
                        );
                        setToast("Notes saved.");
                      } catch (e) {
                        setToast((e as Error).message);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Save notes <Check size={15} />
                  </button>
                  <div className="lesson-actions">
                    <button
                      disabled={busy}
                      className={
                        done.includes(lesson) ? "button" : "button primary"
                      }
                      onClick={() =>
                        updateProgress(
                          current.id,
                          done.includes(lesson)
                            ? done.filter((i) => i !== lesson)
                            : [...done, lesson],
                        )
                      }
                    >
                      <CheckCircle2 size={18} />
                      {done.includes(lesson)
                        ? "Completed · undo"
                        : "Mark as complete"}
                    </button>
                    {lesson < current.lessons.length - 1 && (
                      <button
                        className="text-button"
                        onClick={() => setLesson(lesson + 1)}
                      >
                        Next lesson <ChevronRight size={18} />
                      </button>
                    )}
                  </div>
                  {done.length === current.lessons.length && (
                    <div className="completion">
                      <GraduationCap />
                      <h3>You made it. Keep building.</h3>
                      <p>
                        You’ve completed this course. Your next chapter is
                        waiting.
                      </p>
                      <button
                        className="text-button"
                        onClick={() => {
                          setSelected(null);
                          go("courses");
                        }}
                      >
                        Find your next course <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </article>
          </section>
        </div>
      )}
    </AuthContext.Provider>
  );
}
