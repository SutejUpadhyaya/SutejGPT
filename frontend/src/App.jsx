import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function App() {
  // ---- AUTH STATE ----
  const [token, setToken] = useState(() => localStorage.getItem("sutej_token") || "");
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Who am I?
  const [meLoading, setMeLoading] = useState(false);
  const [meError, setMeError] = useState("");
  const [me, setMe] = useState(null); // {id,email,isAdmin} | null

  // ---- APP STATE ----
  const [endpoint, setEndpoint] = useState("ask"); // "ask" | "interpret" | "memory"
  const [mode, setMode] = useState("casual"); // "casual" | "professional"
  const [input, setInput] = useState("");
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---- MEMORY TAB STATE ----
  const [facts, setFacts] = useState([]);
  const [factsLoading, setFactsLoading] = useState(false);
  const [factsError, setFactsError] = useState("");
  const [newFact, setNewFact] = useState("");

  const isAuthed = useMemo(() => Boolean(token), [token]);

  function persistToken(nextToken) {
    setToken(nextToken);
    if (nextToken) {
      localStorage.setItem("sutej_token", nextToken);
    } else {
      localStorage.removeItem("sutej_token");
    }
  }

  function authHeaders() {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  }

  function isAdmin() {
    if (!me) return false;
    return me.isAdmin === true;
  }

  // Interpret doesn't use modes
  useEffect(() => {
    if (endpoint === "interpret") {
      setMode("casual");
    }
  }, [endpoint]);

  // On load (if token exists), fetch /auth/me
  useEffect(() => {
    if (!token) return;
    void loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When switching to Memory tab:
  // - If not admin -> show error message (no /facts call)
  // - If admin -> load facts
  useEffect(() => {
    if (!isAuthed) return;

    if (endpoint !== "memory") return;

    setFactsError("");
    setNewFact("");

    if (!isAdmin()) {
      setFacts([]);
      setFactsError("You can’t access these memories. Admin-only.");
      return;
    }

    void loadFacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, isAuthed, me]);

  async function loadMe() {
    setMeLoading(true);
    setMeError("");

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: "GET",
        headers: authHeaders()
      });

      const data = await res.json();

      if (res.status === 401) {
        persistToken("");
        setMe(null);
        setMeError("Session expired. Please log in again.");
        setMeLoading(false);
        return;
      }

      if (!res.ok) {
        setMe(null);
        setMeError(data && data.error ? data.error : "Failed to load user info");
        setMeLoading(false);
        return;
      }

      setMe(data);
    } catch (err) {
      setMe(null);
      setMeError(err && err.message ? err.message : "Failed to load user info");
    }

    setMeLoading(false);
  }

  async function handleAuthSubmit() {
    setAuthLoading(true);
    setAuthError("");

    try {
      const url = `${API_BASE}/auth/${authMode}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data && data.error ? data.error : "Auth failed");
        setAuthLoading(false);
        return;
      }

      if (!data || !data.token) {
        setAuthError("No token returned from server");
        setAuthLoading(false);
        return;
      }

      persistToken(data.token);

      // reset auth form
      setAuthEmail("");
      setAuthPassword("");
      setAuthError("");

      // load /auth/me (so we know if admin)
      setMe(null);
      await loadMe();
    } catch (err) {
      setAuthError(err && err.message ? err.message : "Auth failed");
    }

    setAuthLoading(false);
  }

  function handleLogout() {
    persistToken("");
    setMe(null);
    setMeError("");
    setOutput(null);
    setInput("");
    setFacts([]);
    setFactsError("");
    setNewFact("");
  }

  function getPlaceholder() {
    if (endpoint === "ask") return "Ask anything...";
    if (endpoint === "interpret") return "Paste a message written by Sutej...";
    return "";
  }

  function buildRequestBody() {
    if (endpoint === "ask") return { query: input, mode };
    if (endpoint === "interpret") return { text: input };
    return null;
  }

  async function handleSubmit() {
    setLoading(true);
    setOutput(null);

    const url = `${API_BASE}/${endpoint}`;
    const body = buildRequestBody();

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.status === 401) {
        persistToken("");
        setMe(null);
        setOutput({ error: "Session expired. Please log in again." });
        setLoading(false);
        return;
      }

      setOutput(data);
    } catch (err) {
      setOutput({ error: err && err.message ? err.message : "Request failed" });
    }

    setLoading(false);
  }

  function handleClear() {
    setInput("");
    setOutput(null);
  }

  // -----------------------
  // Memory tab API helpers (admin only)
  // -----------------------
  async function loadFacts() {
    setFactsLoading(true);
    setFactsError("");

    try {
      const res = await fetch(`${API_BASE}/facts`, {
        method: "GET",
        headers: authHeaders()
      });

      const data = await res.json();

      if (res.status === 401) {
        persistToken("");
        setMe(null);
        setFactsError("Session expired. Please log in again.");
        setFactsLoading(false);
        return;
      }

      if (res.status === 403) {
        setFacts([]);
        setFactsError("You can’t access these memories. Admin-only.");
        setFactsLoading(false);
        return;
      }

      if (!res.ok) {
        setFactsError(data && data.error ? data.error : "Failed to load memories");
        setFactsLoading(false);
        return;
      }

      if (data && Array.isArray(data.facts)) {
        setFacts(data.facts);
      } else {
        setFacts([]);
      }
    } catch (err) {
      setFactsError(err && err.message ? err.message : "Failed to load memories");
    }

    setFactsLoading(false);
  }

  async function addFact() {
    const trimmed = String(newFact || "").trim();
    if (!trimmed) return;

    setFactsLoading(true);
    setFactsError("");

    try {
      const res = await fetch(`${API_BASE}/facts`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ fact: trimmed })
      });

      const data = await res.json();

      if (res.status === 401) {
        persistToken("");
        setMe(null);
        setFactsError("Session expired. Please log in again.");
        setFactsLoading(false);
        return;
      }

      if (res.status === 403) {
        setFactsError("You can’t access these memories. Admin-only.");
        setFactsLoading(false);
        return;
      }

      if (!res.ok) {
        setFactsError(data && data.error ? data.error : "Failed to add memory");
        setFactsLoading(false);
        return;
      }

      if (data && Array.isArray(data.facts)) {
        setFacts(data.facts);
      } else {
        await loadFacts();
      }

      setNewFact("");
    } catch (err) {
      setFactsError(err && err.message ? err.message : "Failed to add memory");
    }

    setFactsLoading(false);
  }

  async function deleteFact(fact) {
    setFactsLoading(true);
    setFactsError("");

    try {
      const res = await fetch(`${API_BASE}/facts`, {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({ fact })
      });

      const data = await res.json();

      if (res.status === 401) {
        persistToken("");
        setMe(null);
        setFactsError("Session expired. Please log in again.");
        setFactsLoading(false);
        return;
      }

      if (res.status === 403) {
        setFactsError("You can’t access these memories. Admin-only.");
        setFactsLoading(false);
        return;
      }

      if (!res.ok) {
        setFactsError(data && data.error ? data.error : "Failed to delete memory");
        setFactsLoading(false);
        return;
      }

      if (data && Array.isArray(data.facts)) {
        setFacts(data.facts);
      } else {
        await loadFacts();
      }
    } catch (err) {
      setFactsError(err && err.message ? err.message : "Failed to delete memory");
    }

    setFactsLoading(false);
  }

  // -----------------------
  // Output rendering
  // -----------------------
  function renderAskOutput() {
    if (!output) return null;

    if (output.error) {
      return (
        <div className="output-area card">
          <div className="card-title">Error</div>
          <pre className="json">{JSON.stringify(output, null, 2)}</pre>
        </div>
      );
    }

    if (output.answer) {
      return (
        <div className="output-area card">
          <div className="card-title">Answer</div>
          <pre className="answer-text">{output.answer}</pre>
        </div>
      );
    }

    return (
      <div className="output-area card">
        <div className="card-title">Output</div>
        <pre className="json">{JSON.stringify(output, null, 2)}</pre>
      </div>
    );
  }

  function renderInterpretOutput() {
    if (!output) return null;

    if (output.error) {
      return (
        <div className="output-area card">
          <div className="card-title">Error</div>
          <pre className="json">{JSON.stringify(output, null, 2)}</pre>
        </div>
      );
    }

    const hasStructured =
      output.summary &&
      output.intent &&
      output.tone &&
      output.ask_from_recipient &&
      output.misinterpretation_risks &&
      output.suggested_replies &&
      output.rewrites;

    if (!hasStructured) {
      return (
        <div className="output-area card">
          <div className="card-title">Interpretation</div>
          <pre className="json">{JSON.stringify(output, null, 2)}</pre>
        </div>
      );
    }

    return (
      <div className="output-area card">
        <div className="card-title">Interpretation</div>

        <div className="grid">
          <div className="grid-item">
            <div className="label">Summary</div>
            <div className="value">{output.summary}</div>
          </div>

          <div className="grid-item">
            <div className="label">Intent</div>
            <div className="value">{output.intent}</div>
          </div>

          <div className="grid-item">
            <div className="label">Tone / Vibe</div>
            <div className="value">{output.tone}</div>
          </div>

          <div className="grid-item">
            <div className="label">What Sutej wants from you</div>
            <div className="value">{output.ask_from_recipient}</div>
          </div>
        </div>

        <div className="divider" />

        <div className="stack">
          <div className="grid-item">
            <div className="label">Likely misinterpretations</div>
            <ul className="list">
              {output.misinterpretation_risks.map((x, idx) => (
                <li key={`risk-${idx}`}>{x}</li>
              ))}
            </ul>
          </div>

          <div className="grid-item">
            <div className="label">Suggested replies</div>
            <ul className="list">
              {output.suggested_replies.map((x, idx) => (
                <li key={`reply-${idx}`}>{x}</li>
              ))}
            </ul>
          </div>

          <div className="grid-item">
            <div className="label">Rewrites (same meaning)</div>
            <div className="rewrites">
              <div className="rewrite">
                <div className="rewrite-title">Clearer</div>
                <div className="rewrite-text">{output.rewrites.clearer}</div>
              </div>

              <div className="rewrite">
                <div className="rewrite-title">More direct</div>
                <div className="rewrite-text">{output.rewrites.more_direct}</div>
              </div>

              <div className="rewrite">
                <div className="rewrite-title">More professional</div>
                <div className="rewrite-text">{output.rewrites.more_professional}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderMemoryTab() {
    const admin = isAdmin();

    return (
      <div className="output-area card">
        <div className="card-title">Core Memories</div>

        {!admin ? (
          <div className="admin-warning" style={{ marginTop: 12 }}>
            You can’t access these memories. Admin-only.
          </div>
        ) : null}

        {admin ? (
          <div style={{ marginTop: 10 }}>
            <div className="memory-subtitle">
              Add one memory per entry (multi-sentence is fine). These are treated as true and used when relevant.
            </div>

            <div className="memory-add">
              <textarea
                className="textarea"
                rows={4}
                placeholder="Add a new core memory..."
                value={newFact}
                onChange={(e) => setNewFact(e.target.value)}
                disabled={factsLoading}
              />
              <div className="actions">
                <button
                  className="primary"
                  onClick={addFact}
                  disabled={factsLoading || !String(newFact || "").trim()}
                >
                  {factsLoading ? "Working..." : "Add memory"}
                </button>

                <button
                  className="secondary"
                  onClick={loadFacts}
                  disabled={factsLoading}
                >
                  Refresh
                </button>
              </div>
            </div>

            {factsError ? (
              <div className="auth-error" style={{ marginTop: 12 }}>
                {factsError}
              </div>
            ) : null}

            <div className="divider" />

            {factsLoading && facts.length === 0 ? (
              <div className="memory-empty">Loading...</div>
            ) : null}

            {!factsLoading && facts.length === 0 ? (
              <div className="memory-empty">No memories yet. Add a few above.</div>
            ) : null}

            {facts.length > 0 ? (
              <div className="memory-list">
                {facts.map((f, idx) => (
                  <div className="memory-item" key={`fact-${idx}`}>
                    <div className="memory-text">{f}</div>
                    <button
                      className="secondary memory-delete"
                      onClick={() => deleteFact(f)}
                      disabled={factsLoading}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  // -----------------------
  // LOGIN SCREEN (when not authed)
  // -----------------------
  if (!isAuthed) {
    const disableAuth = authLoading || !authEmail.trim() || !authPassword.trim();

    return (
      <div className="page">
        <div className="shell">
          <h1 className="title">SutejGPT</h1>

          <div className="card auth-card">
            <div className="card-title">
              {authMode === "login" ? "Log in" : "Create an account"}
            </div>

            <div className="auth-row">
              <button
                className={`tab ${authMode === "login" ? "tab-active" : ""}`}
                onClick={() => setAuthMode("login")}
                disabled={authLoading}
              >
                Login
              </button>
              <button
                className={`tab ${authMode === "register" ? "tab-active" : ""}`}
                onClick={() => setAuthMode("register")}
                disabled={authLoading}
              >
                Register
              </button>
            </div>

            <div className="auth-fields">
              <input
                className="input"
                placeholder="Email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                autoComplete="email"
              />
              <input
                className="input"
                placeholder="Password (min 6 chars)"
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                autoComplete={authMode === "login" ? "current-password" : "new-password"}
              />
            </div>

            {authError ? <div className="auth-error">{authError}</div> : null}

            <div className="actions">
              <button
                className="primary"
                onClick={handleAuthSubmit}
                disabled={disableAuth}
              >
                {authLoading ? "Working..." : authMode === "login" ? "Login" : "Register"}
              </button>
            </div>

            <div className="auth-note">
              Token is stored locally on this device (localStorage) for now.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------
  // MAIN APP (when authed)
  // -----------------------
  const disableSubmit = !input || loading;

  return (
    <div className="page">
      <div className="shell">
        <div className="topbar">
          <h1 className="title">SutejGPT</h1>
          <button className="secondary logout" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Optional: show who you are */}
        {meLoading ? (
          <div className="auth-note" style={{ marginBottom: 8 }}>
            Loading account…
          </div>
        ) : null}

        {meError ? (
          <div className="auth-error" style={{ marginBottom: 8 }}>
            {meError}
          </div>
        ) : null}

        {/* Primary tabs */}
        <div className="tab-row">
          <button
            className={`tab ${endpoint === "ask" ? "tab-active" : ""}`}
            onClick={() => setEndpoint("ask")}
          >
            Ask
          </button>

          <button
            className={`tab ${endpoint === "interpret" ? "tab-active" : ""}`}
            onClick={() => setEndpoint("interpret")}
          >
            Interpret
          </button>

          <button
            className={`tab ${endpoint === "memory" ? "tab-active" : ""}`}
            onClick={() => setEndpoint("memory")}
          >
            Memory
          </button>
        </div>

        {/* Mode tabs only for Ask */}
        {endpoint === "ask" ? (
          <div className="tab-row tab-row-secondary">
            <button
              className={`tab ${mode === "casual" ? "tab-active" : ""}`}
              onClick={() => setMode("casual")}
            >
              Casual
            </button>

            <button
              className={`tab ${mode === "professional" ? "tab-active" : ""}`}
              onClick={() => setMode("professional")}
            >
              Professional
            </button>
          </div>
        ) : null}

        {/* Ask + Interpret input */}
        {endpoint !== "memory" ? (
          <div className="card input-card">
            <div className="card-title">
              {endpoint === "ask" ? "Ask SutejGPT" : "Interpret a Sutej message"}
            </div>

            <textarea
              className="textarea"
              rows={7}
              placeholder={getPlaceholder()}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <div className="actions">
              <button
                className="primary"
                onClick={handleSubmit}
                disabled={disableSubmit}
              >
                {loading ? "Thinking..." : "Submit"}
              </button>

              <button
                className="secondary"
                onClick={handleClear}
                disabled={loading}
              >
                Clear
              </button>
            </div>
          </div>
        ) : null}

        {/* Output */}
        {endpoint === "ask" ? renderAskOutput() : null}
        {endpoint === "interpret" ? renderInterpretOutput() : null}
        {endpoint === "memory" ? renderMemoryTab() : null}
      </div>
    </div>
  );
}
