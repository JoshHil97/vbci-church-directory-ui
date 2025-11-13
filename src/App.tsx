import { useState } from "react";
import type { FormEvent } from "react";

type MemberPayload = {
  fullName: string;
  email: string;
  phone: string;
  ministry: string;
};

interface Member extends MemberPayload {
  id: number;
}

// Use env variable if set, otherwise default to localhost (good for dev)
const API_BASE =
  (import.meta.env.VITE_API_BASE_URL ??
    "http://localhost:8080") + "/api/members";

export default function App() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<MemberPayload>({
    fullName: "",
    email: "",
    phone: "",
    ministry: "",
  });

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  // ---- LOAD MEMBERS ----
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API_BASE);
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      console.error(err);
      setError("Could not load members from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // ---- FORM HANDLERS ----
  const handleChange = (field: keyof MemberPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      fullName: "",
      email: "",
      phone: "",
      ministry: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email) return;

    try {
      setError(null);

      if (editingId === null) {
        // CREATE
        await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        // UPDATE
        await fetch(`${API_BASE}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      resetForm();
      fetchMembers();
    } catch (err) {
      console.error(err);
      setError("Something went wrong saving this member.");
    }
  };

  const handleEdit = (member: Member) => {
    setForm({
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      ministry: member.ministry,
    });
    setEditingId(member.id);
  };

  const handleDelete = async (id: number) => {
    try {
      setError(null);
      await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      fetchMembers();
    } catch (err) {
      console.error(err);
      setError("Failed to delete member.");
    }
  };

  // ---- FILTERED MEMBERS ----
  const filteredMembers = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.phone || "").toLowerCase().includes(q) ||
      (m.ministry || "").toLowerCase().includes(q)
    );
  });

  // ---- UI ----
  return (
    <div className="min-h-screen bg-[#060016] text-violet-50 flex flex-col items-center px-4 py-10">
      {/* HEADER */}
      <header className="w-full max-w-6xl flex flex-col items-center mb-10 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-black/40 flex items-center justify-center overflow-hidden border border-violet-500/70 shadow-lg shadow-violet-900/60">
            <img
              src={vbciLogo}
              alt="VBCI Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <div className="text-center md:text-left">
            <p className="text-xs tracking-[0.2em] text-violet-300 uppercase mb-1">
              Victory Bible Church International
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              VBCI{" "}
              <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Church Directory
              </span>
            </h1>
            <p className="text-[11px] text-violet-200/80 mt-1">
              Jesus is our victory — and this tool helps us care for the people
              He sends.
            </p>
          </div>
        </div>
      </header>

      <main className="w-full max-w-6xl space-y-8">
        {/* TOP ROW: FORM + SEARCH */}
        <section className="grid gap-6 md:grid-cols-[1.6fr,1fr]">
          {/* FORM CARD */}
          <form
            onSubmit={handleSubmit}
            className="bg-[#12002b] border border-violet-700/70 rounded-2xl px-6 py-5 shadow-xl shadow-violet-900/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-violet-100">
                {editingId ? "Edit Member" : "Add New Member"}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-violet-300 hover:text-violet-100 underline"
                >
                  Cancel edit
                </button>
              )}
            </div>

            <div className="space-y-3">
              <input
                placeholder="Full Name *"
                value={form.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                className="w-full p-2.5 rounded-lg bg-[#0b001c] border border-violet-700/70 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              <input
                placeholder="Email *"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full p-2.5 rounded-lg bg-[#0b001c] border border-violet-700/70 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              <input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full p-2.5 rounded-lg bg-[#0b001c] border border-violet-700/70 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              <input
                placeholder="Ministry (Tech, Worship, Youth, Sound...)"
                value={form.ministry}
                onChange={(e) => handleChange("ministry", e.target.value)}
                className="w-full p-2.5 rounded-lg bg-[#0b001c] border border-violet-700/70 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>

            <button
              type="submit"
              className="mt-4 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-400 py-2.5 rounded-lg text-sm font-semibold text-[#060016] hover:opacity-90 transition"
            >
              {editingId ? "Update Member" : "Save Member"}
            </button>

            <p className="text-[11px] text-violet-200/70 mt-2">
              * Name and email are required. Data is stored via the VBCI Church
              Directory API.
            </p>

            {error && (
              <p className="text-[11px] text-red-300 mt-2">{error}</p>
            )}
          </form>

          {/* SEARCH CARD */}
          <div className="bg-[#100025] border border-violet-700/60 rounded-2xl px-6 py-5 space-y-4">
            <h2 className="text-lg font-semibold text-violet-100">
              Search Members
            </h2>
            <input
              placeholder="Search by name, email, phone, or ministry…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[#0b001c] border border-violet-700/70 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <div className="text-xs text-violet-200/85 space-y-1">
              <p>
                Total members:{" "}
                <span className="font-semibold text-violet-300">
                  {members.length}
                </span>
              </p>
              <p>
                Matching search:{" "}
                <span className="font-semibold text-violet-300">
                  {filteredMembers.length}
                </span>
              </p>
              {loading && (
                <p className="text-[11px] text-violet-300/80">
                  Loading latest data from the server…
                </p>
              )}
            </div>
          </div>
        </section>

        {/* TABLE SECTION */}
        <section className="bg-[#0c001f] border border-violet-700/60 rounded-2xl p-5 shadow-lg shadow-violet-900/50">
          <h2 className="text-lg font-semibold mb-4 text-violet-100">
            All Members
          </h2>

          {filteredMembers.length === 0 && !loading ? (
            <p className="text-sm text-violet-200/80">
              No members found. Try adjusting your search or adding a new member
              above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#150031] text-violet-100">
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-left">Ministry</th>
                    <th className="p-3 text-right w-40">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((m) => (
                    <tr
                      key={m.id}
                      className="border-t border-violet-800/60 hover:bg-[#150032] transition"
                    >
                      <td className="p-3">{m.fullName}</td>
                      <td className="p-3 text-violet-200">{m.email}</td>
                      <td className="p-3 text-violet-200">{m.phone}</td>
                      <td className="p-3 text-violet-200">{m.ministry}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(m)}
                          className="text-xs px-3 py-1 rounded-full bg-violet-500/90 hover:bg-violet-400 text-black font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(m.id)}
                          className="text-xs px-3 py-1 rounded-full bg-red-500/90 hover:bg-red-400 text-white font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="pt-4 text-center text-[11px] text-violet-300/80">
          Victory Bible Church International • Jesus is our Victory
        </footer>
      </main>
    </div>
  );
}
