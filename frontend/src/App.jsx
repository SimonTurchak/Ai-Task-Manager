import { useEffect, useState } from "react";
import axios from "axios";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");


  // Notes state
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: "",

    
  });

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
  });
    // Chatbot state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]); // {from: "user" | "assistant", text: string}
  const [chatLoading, setChatLoading] = useState(false);


  const [error, setError] = useState("");
  const backendBaseUrl = "http://127.0.0.1:8000";

  // ------------- AUTH -------------

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
    setTasks([]);
  };

  // ------------- NOTES API -------------

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
      const res = await axios.post(`${backendBaseUrl}/notes`, newNote, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setNotes((prev) => [res.data, ...prev]);
      setNewNote({ title: "", content: "", tags: "" });
    } catch (err) {
      console.error("Create note error:", err);
      setError("Failed to create note.");
    }
  };

    const handleSendChat = async (e) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || !token) return;

    // Add user message locally
    setChatMessages((prev) => [...prev, { from: "user", text: trimmed }]);
    setChatInput("");
    setChatLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${backendBaseUrl}/assistant/chat`,
        { message: trimmed },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setChatMessages((prev) => [
        ...prev,
        { from: "assistant", text: res.data.reply },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setError("Assistant failed to respond.");
    } finally {
      setChatLoading(false);
    }
  };

  // ------------- TASKS API -------------

  const fetchTasks = async (idToken) => {
    try {
      setLoadingTasks(true);
      setError("");
      const res = await axios.get(`${backendBaseUrl}/tasks`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Fetch tasks error:", err);
      setError("Failed to load tasks.");
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      setError("");
      const payload = {
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        priority: newTask.priority,
        // note_id: null  // if your backend has this optional field
      };

      const res = await axios.post(`${backendBaseUrl}/tasks`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setTasks((prev) => [res.data, ...prev]);
      setNewTask({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
      });
    } catch (err) {
      console.error("Create task error:", err);
      setError("Failed to create task.");
    }
  };

  // ------------- INITIAL LOAD AFTER LOGIN -------------

  useEffect(() => {
    if (token) {
      fetchNotes(token);
      fetchTasks(token);
    }
  }, [token]);

  // ------------- UI -------------

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
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
        <div className="mx-auto max-w-6xl px-4 py-6 space-y-4">
          {error && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          {!user && (
            <div className="mt-10 text-center text-slate-300">
              <p className="text-lg">
                Please sign in to view and manage your notes and tasks.
              </p>
            </div>
          )}

          {user && (
            <div className="space-y-6 mt-2">
              {/* ROW 1: Notes */}
              <div className="grid gap-6 md:grid-cols-[2fr,3fr]">
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
                        placeholder="Meeting notes, ideas..."
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
                        placeholder="Details, tasks, anything..."
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

              {/* ROW 2: Tasks */}
              <div className="grid gap-6 md:grid-cols-[2fr,3fr]">
                {/* New task form */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/40">
                  <h2 className="text-lg font-semibold mb-3">Create a task</h2>
                  <form onSubmit={handleCreateTask} className="space-y-3">
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={newTask.title}
                        onChange={(e) =>
                          setNewTask({ ...newTask, title: e.target.value })
                        }
                        className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm outline-none focus:border-sky-500"
                        placeholder="Follow up, send CV, call..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={newTask.description}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            description: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm outline-none focus:border-sky-500"
                        placeholder="Details for this task..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-slate-300 mb-1">
                          Status
                        </label>
                        <select
                          value={newTask.status}
                          onChange={(e) =>
                            setNewTask({
                              ...newTask,
                              status: e.target.value,
                            })
                          }
                          className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm outline-none focus:border-sky-500"
                        >
                          <option value="todo">To do</option>
                          <option value="in_progress">In progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-slate-300 mb-1">
                          Priority
                        </label>
                        <select
                          value={newTask.priority}
                          onChange={(e) =>
                            setNewTask({
                              ...newTask,
                              priority: e.target.value,
                            })
                          }
                          className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm outline-none focus:border-sky-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="mt-1 w-full rounded-md bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition"
                    >
                      Save task
                    </button>
                  </form>
                </section>

                {/* Tasks list */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/40">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">Your tasks</h2>
                    {loadingTasks && (
                      <span className="text-xs text-slate-400">Loading…</span>
                    )}
                  </div>

                  {tasks.length === 0 && !loadingTasks && (
                    <p className="text-sm text-slate-400">
                      No tasks yet. Create one on the left.
                    </p>
                  )}

                  <ul className="space-y-3">
                    {tasks.map((task) => (
                      <li
                        key={task.id}
                        className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-medium text-slate-50">
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wide rounded-full bg-slate-700/60 text-slate-200 px-2 py-0.5">
                              {task.status}
                            </span>
                            <span
                              className={`text-[10px] uppercase tracking-wide rounded-full px-2 py-0.5 ${
                                task.priority === "high"
                                  ? "bg-red-500/20 text-red-300"
                                  : task.priority === "low"
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "bg-amber-500/20 text-amber-300"
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>
                        </div>
                        {task.description && (
                          <p className="text-xs text-slate-300">
                            {task.description}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-500">
                          Created:{" "}
                          {new Date(task.created_at).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
                            {/* ROW 3: AI Assistant */}
              <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/40">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">AI Assistant</h2>
                  {chatLoading && (
                    <span className="text-xs text-slate-400">
                      Thinking…
                    </span>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-[2fr,3fr]">
                  {/* Input */}
                  <form
                    onSubmit={handleSendChat}
                    className="space-y-3 max-md:order-2"
                  >
                    <label className="block text-sm text-slate-300 mb-1">
                      Ask about your notes or tasks
                    </label>
                    <textarea
                      rows={3}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm outline-none focus:border-sky-500"
                      placeholder="For example: 'Give me a summary of my notes' or 'What should I do next?'"
                    />
                    <button
                      type="submit"
                      disabled={chatLoading}
                      className="w-full rounded-md bg-purple-500 hover:bg-purple-400 disabled:opacity-60 px-4 py-2 text-sm font-semibold text-slate-950 transition"
                    >
                      {chatLoading ? "Thinking..." : "Ask assistant"}
                    </button>
                  </form>

                  {/* Messages */}
                  <div className="border border-slate-800 rounded-xl bg-slate-950/60 px-3 py-2 text-sm max-md:order-1">
                    {chatMessages.length === 0 ? (
                      <p className="text-slate-400 text-sm">
                        No conversation yet. Ask the assistant something about
                        your notes or tasks, like “summarize my tasks“.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {chatMessages.map((m, idx) => (
                          <div
                            key={idx}
                            className={`flex ${
                              m.from === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg px-3 py-2 whitespace-pre-wrap ${
                                m.from === "user"
                                  ? "bg-sky-500 text-slate-950"
                                  : "bg-slate-800 text-slate-100"
                              }`}
                            >
                              {m.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
