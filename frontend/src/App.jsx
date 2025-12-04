import { useEffect, useState } from "react";
import axios from "axios";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: "",
  });
  const [error, setError] = useState("");

  const backendBaseUrl = "http://127.0.0.1:8000";

  const handleLogin = async () => {
    try {
      setError("");
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;
      const idToken = await u.getIdToken();

      setUser(u);
      setToken(idToken);
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to sign in. Check console for details.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setToken("");
    setNotes([]);
  };

  const fetchNotes = async (idToken) => {
    try {
      setLoadingNotes(true);
      setError("");
      const res = await axios.get(`${backendBaseUrl}/notes`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setNotes(res.data);
    } catch (err) {
      console.error("Fetch notes error:", err);
      setError("Failed to load notes.");
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newNote.title.trim()) return;

    try {
      setError("");
      const res = await axios.post(
        `${backendBaseUrl}/notes`,
        newNote,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setNotes((prev) => [res.data, ...prev]);
      setNewNote({ title: "", content: "", tags: "" });
    } catch (err) {
      console.error("Create note error:", err);
      setError("Failed to create note.");
    }
  };

  // When token changes (user logs in), load notes
  useEffect(() => {
    if (token) {
      fetchNotes(token);
    }
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-semibold">
            <span className="text-sky-400">AI</span> Task Manager
          </h1>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt="avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div className="text-sm leading-tight">
                    <div className="font-medium">{user.displayName}</div>
                    <div className="text-xs text-slate-400">
                      {user.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm px-3 py-1.5 rounded-md border border-slate-700 hover:bg-slate-800 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="px-4 py-2 rounded-md bg-sky-500 hover:bg-sky-400 text-sm font-medium text-slate-950 transition"
              >
                Sign in with Google
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6 space-y-4">
          {error && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          {!user && (
            <div className="mt-10 text-center text-slate-300">
              <p className="text-lg">
                Please sign in to view and manage your notes.
              </p>
            </div>
          )}

          {user && (
            <div className="grid gap-6 md:grid-cols-[2fr,3fr] mt-4">
              {/* New note form */}
              <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/40">
                <h2 className="text-lg font-semibold mb-3">Create a note</h2>
                <form onSubmit={handleCreateNote} className="space-y-3">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newNote.title}
                      onChange={(e) =>
                        setNewNote({ ...newNote, title: e.target.value })
                      }
                      className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm outline-none focus:border-sky-500"
                      placeholder="Meeting notes, ideas…"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-1">
                      Content
                    </label>
                    <textarea
                      rows={4}
                      value={newNote.content}
                      onChange={(e) =>
                        setNewNote({ ...newNote, content: e.target.value })
                      }
                      className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm outline-none focus:border-sky-500"
                      placeholder="Details, tasks, anything…"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-1">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={newNote.tags}
                      onChange={(e) =>
                        setNewNote({ ...newNote, tags: e.target.value })
                      }
                      className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm outline-none focus:border-sky-500"
                      placeholder="e.g. work,urgent,idea"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-1 w-full rounded-md bg-sky-500 hover:bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition"
                  >
                    Save note
                  </button>
                </form>
              </section>

              {/* Notes list */}
              <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/40">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">Your notes</h2>
                  {loadingNotes && (
                    <span className="text-xs text-slate-400">Loading…</span>
                  )}
                </div>

                {notes.length === 0 && !loadingNotes && (
                  <p className="text-sm text-slate-400">
                    No notes yet. Create your first note on the left.
                  </p>
                )}

                <ul className="space-y-3">
                  {notes.map((note) => (
                    <li
                      key={note.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-medium text-slate-50">
                          {note.title}
                        </h3>
                        {note.tags && (
                          <span className="text-[10px] uppercase tracking-wide rounded-full bg-sky-500/10 text-sky-300 px-2 py-0.5">
                            {note.tags}
                          </span>
                        )}
                      </div>
                      {note.content && (
                        <p className="mt-1 text-xs text-slate-300 whitespace-pre-wrap">
                          {note.content}
                        </p>
                      )}
                      <p className="mt-1 text-[10px] text-slate-500">
                        Created:{" "}
                        {new Date(note.created_at).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
