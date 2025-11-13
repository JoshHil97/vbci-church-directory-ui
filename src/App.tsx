import { useEffect, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";

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
  (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080") +
  "/api/members";

function App() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<MemberPayload>({
    fullName: "",
    email: "",
    phone: "",
    ministry: "",
  });

  const [search, setSearch] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);

  // ---------- LOAD MEMBERS ----------
  const fetchMembers = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(API_BASE);
      if (!res.ok) {
        throw new Error(`Failed to load members (${res.status})`);
      }

      const data: Member[] = await res.json();
      setMembers(data);
    } catch (err) {
      console.error(err);
      setError("Could not load members. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMembers();
  }, []);

  // ---------- FORM HANDLERS ----------
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!form.fullName.trim() || !form.email.trim()) {
      setError("Full name and email are required.");
      return;
    }

    try {
      setLoading(true);

      const method = editingId === null ? "POST" : "PUT";
      const url =
        editingId === null ? API_BASE : `${API_BASE}/${encodeURIComponent(editingId)}`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error(`Failed to save member (${res.status})`);
      }

      // Refresh list
      await fetchMembers();

      // Reset form + editing state
      setForm({
        fullName: "",
        email: "",
        phone: "",
        ministry: "",
      });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError("Could not save member. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (member: Member) => {
    setForm({
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      ministry: member.ministry,
    });
    setEditingId(member.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      fullName: "",
      email: "",
      phone: "",
      ministry: "",
    });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this member?")) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Failed to delete member (${res.status})`);
      }

      // Optimistic update
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
      setError("Could not delete member. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- FILTERED LIST ----------
  const filteredMembers = members.filter((member) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      member.fullName.toLowerCase().includes(q) ||
      member.email.toLowerCase().includes(q) ||
      member.phone.toLowerCase().includes(q) ||
      member.ministry.toLowerCase().includes(q)
    );
  });

  const totalMembers = members.length;
  const matchingCount = filteredMembers.length;

  return (
    <div className="min-h-screen bg-[#050014] text-white flex justify-center px-4 py-10">
      <div className="w-full max-w-6xl">
        {/* HEADER */}
        <header className="flex items-center gap-4 mb-8">
          {/* If your logo file is different, update the src below or remove the img */}
          <div className="h-12 w-12 rounded-full bg-[#3b0b6d] flex items-center justify-center text-xs font-bold">
            VBCI
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              VBCI Church Directory
            </h1>
            <p className="text-sm text-purple-200">
              Keep track of members and ministries — powered by your Java Spring
              Boot API and React frontend.
            </p>
          </div>
        </header>

        {/* TOP GRID: FORM + SEARCH */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* ADD / EDIT FORM */}
          <section className="bg-[#16002b] border border-purple-700/60 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.35)] p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingId === null ? "Add New Member" : "Edit Member"}
            </h2>

            {error && (
              <p className="mb-3 text-sm text-red-400 bg-red-500/10 border border-red-500/40 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleInputChange}
                  className="w-full rounded-md bg-[#0c0018] border border-purple-500/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="e.g. Sarah Mensah"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  className="w-full rounded-md bg-[#0c0018] border border-purple-500/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="e.g. sarah@example.com"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  className="w-full rounded-md bg-[#0c0018] border border-purple-500/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="e.g. 07..."
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Ministry</label>
                <input
                  type="text"
                  name="ministry"
                  value={form.ministry}
                  onChange={handleInputChange}
                  className="w-full rounded-md bg-[#0c0018] border border-purple-500/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="Tech, Worship, Youth..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold hover:from-purple-400 hover:to-pink-400 disabled:opacity-60"
                >
                  {editingId === null
                    ? loading
                      ? "Saving..."
                      : "Save Member"
                    : loading
                    ? "Updating..."
                    : "Update Member"}
                </button>
                {editingId !== null && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-md border border-purple-400 px-4 py-2 text-sm hover:bg-purple-900/40"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <p className="text-[11px] text-purple-200/80 pt-1">
                * Name and email are required. Data is stored via the VBCI
                Church Directory API.
              </p>
            </form>
          </section>

          {/* SEARCH / STATS */}
          <section className="bg-[#16002b] border border-purple-700/60 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Search Members</h2>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md bg-[#0c0018] border border-purple-500/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 mb-4"
              placeholder="Search by name, email, or ministry..."
            />

            <div className="text-sm space-y-1 text-purple-100">
              <p>
                <span className="font-semibold">Total members:</span>{" "}
                {totalMembers}
              </p>
              <p>
                <span className="font-semibold">Matching search:</span>{" "}
                {matchingCount}
              </p>
            </div>
          </section>
        </div>

        {/* MEMBERS TABLE */}
        <section className="bg-[#16002b] border border-purple-700/60 rounded-2xl shadow-[0_0_40px_rgba(88,28,135,0.4)] overflow-hidden">
          <div className="px-6 py-4 border-b border-purple-700/70">
            <h2 className="text-lg font-semibold">All Members</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#1f0038] text-purple-100/90">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Name</th>
                  <th className="px-6 py-3 text-left font-medium">Email</th>
                  <th className="px-6 py-3 text-left font-medium">Phone</th>
                  <th className="px-6 py-3 text-left font-medium">Ministry</th>
                  <th className="px-6 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-6 text-center text-purple-200"
                    >
                      {loading
                        ? "Loading members..."
                        : "No members found. Try adding one above."}
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member: Member) => (
                    <tr
                      key={member.id}
                      className="border-t border-purple-800/70 hover:bg-purple-900/30"
                    >
                      <td className="px-6 py-3 whitespace-nowrap">
                        {member.fullName}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        {member.email}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        {member.phone}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        {member.ministry}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          onClick={() => startEdit(member)}
                          className="inline-flex items-center rounded-md border border-purple-400 px-3 py-1 text-xs hover:bg-purple-900/60"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(member.id)}
                          className="inline-flex items-center rounded-md bg-red-500/90 px-3 py-1 text-xs hover:bg-red-400"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
