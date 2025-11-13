import { useEffect, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";

// -------- Types --------
type MemberPayload = {
  fullName: string;
  email: string;
  phone: string;
  ministry: string;
};

interface Member extends MemberPayload {
  id: number;
}

// -------- API base URL --------
// Uses env in production, falls back to localhost for dev.
const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)
    ? `${import.meta.env.VITE_API_BASE_URL}/api/members`
    : "http://localhost:8080/api/members";

export default function App() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<MemberPayload>({
    fullName: "",
    email: "",
    phone: "",
    ministry: "",
  });

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  // ---------- Helpers ----------
  const resetForm = () => {
    setForm({
      fullName: "",
      email: "",
      phone: "",
      ministry: "",
    });
    setEditingId(null);
  };

  // ---------- API calls ----------
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(API_BASE);
      if (!res.ok) {
        throw new Error(`Failed to load members (status ${res.status})`);
      }

      const data = (await res.json()) as Member[];
      // Sort by name for nicer UI
      const sorted = [...data].sort((a, b) =>
        a.fullName.localeCompare(b.fullName),
      );
      setMembers(sorted);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Something went wrong loading members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMembers();
  }, []);

  // ---------- Event handlers ----------
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic frontend validation
    if (!form.fullName.trim() || !form.email.trim()) {
      setError("Full name and email are required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Error response:", text);
        throw new Error(
          `Failed to ${editingId ? "update" : "create"} member (status ${
            res.status
          })`,
        );
      }

      await fetchMembers();
      resetForm();
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Something went wrong saving the member.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (member: Member) => {
    setForm({
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      ministry: member.ministry,
    });
    setEditingId(member.id);

    // Scroll to top of form on small screens
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this member?",
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Failed to delete member (status ${res.status})`);
      }

      // Optimistic update
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Something went wrong deleting the member.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Derived state ----------
  const filteredMembers = members.filter((m) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;

    return (
      m.fullName.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.phone ?? "").toLowerCase().includes(q) ||
      (m.ministry ?? "").toLowerCase().includes(q)
    );
  });

  const totalCount = members.length;
  const matchCount = filteredMembers.length;

  // ---------- UI ----------
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#050013] via-[#060018] to-black text-white overflow-hidden">
      {/* Watermark background logo */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]">
        <img
          src="/vbci-logo.png"
          alt=""
          className="w-[540px] sm:w-[680px] max-w-full select-none"
        />
      </div>

      {/* Foreground content */}
      <div className="relative max-w-5xl mx-auto px-4 py-10">
        {/* Header with logo */}
        <header className="flex flex-col items-center space-y-3 mt-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-700/30 border border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.8)]">
              <img
                src="/vbci-logo.png"
                alt="VBCI Logo"
                className="w-9 h-9 object-contain transition-transform duration-500 hover:scale-110 hover:rotate-3"
              />
            </div>
            <div className="text-xs uppercase tracking-[0.2em] text-purple-300/80">
              Victory Bible Church International
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-center">
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-purple-200 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(168,85,247,0.9)]">
              VBCI Church Directory
            </span>
          </h1>

          <p className="text-center text-gray-300 max-w-2xl text-sm sm:text-base">
            Keep track of members and ministries for VBCI — powered by your Java
            Spring Boot API and a modern React + TypeScript frontend.
          </p>
        </header>

        {/* Error banner */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Top grid: form + search */}
        <main className="grid gap-8 lg:grid-cols-[3fr,2fr] mb-10">
          {/* Add / edit form */}
          <section className="rounded-2xl border border-purple-700/60 bg-gradient-to-br from-purple-900/50 via-purple-900/30 to-purple-800/40 p-[1px] shadow-[0_0_40px_rgba(168,85,247,0.35)]">
            <div className="rounded-2xl bg-[#090018]/95 p-6 sm:p-7">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">
                  {editingId ? "Edit Member" : "Add New Member"}
                </h2>
                {loading && (
                  <span className="text-xs text-purple-300 animate-pulse">
                    Saving...
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Full Name <span className="text-pink-300">*</span>
                  </label>
                  <input
                    name="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Sarah Mensah"
                    className="w-full rounded-md border border-purple-700/60 bg-[#050014]/80 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-pink-400 focus:ring-2 focus:ring-pink-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Email <span className="text-pink-300">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="e.g. sarah@example.com"
                    className="w-full rounded-md border border-purple-700/60 bg-[#050014]/80 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-pink-400 focus:ring-2 focus:ring-pink-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Phone
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g. 07..."
                    className="w-full rounded-md border border-purple-700/60 bg-[#050014]/80 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-pink-400 focus:ring-2 focus:ring-pink-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Ministry
                  </label>
                  <input
                    name="ministry"
                    type="text"
                    value={form.ministry}
                    onChange={handleChange}
                    placeholder="Tech, Worship, Youth..."
                    className="w-full rounded-md border border-purple-700/60 bg-[#050014]/80 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-pink-400 focus:ring-2 focus:ring-pink-500/50"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-md bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400 py-2.5 text-sm font-semibold text-white shadow-[0_0_18px_rgba(236,72,153,0.6)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {editingId ? "Save Changes" : "Save Member"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-md border border-purple-700/70 bg-transparent px-3 py-2.5 text-xs font-medium text-purple-200 transition hover:bg-purple-900/40"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-gray-400 pt-1">
                  * Name and email are required. Data is stored via the VBCI
                  Church Directory API.
                </p>
              </form>
            </div>
          </section>

          {/* Search / stats */}
          <section className="rounded-2xl border border-purple-800/70 bg-[#060018]/90 p-6 sm:p-7 shadow-[0_0_30px_rgba(88,28,135,0.6)]">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              Search Members
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or ministry..."
                className="w-full rounded-md border border-purple-700/60 bg-[#050014]/90 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-pink-400 focus:ring-2 focus:ring-pink-500/50"
              />

              <div className="flex flex-wrap gap-3 text-xs text-gray-300">
                <div className="flex items-center gap-2 rounded-full border border-purple-700/60 bg-purple-900/30 px-3 py-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
                  <div>
                    <div className="font-semibold text-white">
                      Total members: {totalCount}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      From the VBCI Church Directory API
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-purple-700/60 bg-purple-900/20 px-3 py-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-pink-400" />
                  <div>
                    <div className="font-semibold text-white">
                      Matching search: {matchCount}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      Filtered by your search term
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 pt-1">
                Tip: You can search by ministry (e.g. &quot;Tech&quot;,
                &quot;Worship&quot;) to quickly see everyone serving in a team.
              </p>
            </div>
          </section>
        </main>

        {/* Members table */}
        <section className="rounded-2xl border border-purple-800/70 bg-[#050015]/95 p-4 sm:p-6 shadow-[0_0_30px_rgba(59,7,100,0.7)]">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">All Members</h2>

          <div className="overflow-x-auto rounded-xl border border-purple-900/60 bg-[#050012]/90">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-purple-900/60 text-xs uppercase tracking-wide text-gray-200">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Ministry</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-gray-400 text-sm"
                    >
                      No members found. Try adding one above.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member, idx) => (
                    <tr
                      key={member.id}
                      className={`border-t border-purple-900/60 ${
                        idx % 2 === 0 ? "bg-[#060018]" : "bg-[#050015]"
                      }`}
                    >
                      <td className="px-4 py-3 align-top font-medium text-white">
                        {member.fullName}
                      </td>
                      <td className="px-4 py-3 align-top text-gray-200">
                        {member.email}
                      </td>
                      <td className="px-4 py-3 align-top text-gray-300">
                        {member.phone || "-"}
                      </td>
                      <td className="px-4 py-3 align-top text-gray-300">
                        {member.ministry || "-"}
                      </td>
                      <td className="px-4 py-3 align-top text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditClick(member)}
                            className="rounded-full border border-purple-500/70 bg-purple-800/70 px-3 py-1 text-[11px] font-medium text-purple-50 transition hover:bg-purple-600 hover:border-purple-400"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(member.id)}
                            className="rounded-full border border-red-500/70 bg-red-700/70 px-3 py-1 text-[11px] font-medium text-red-50 transition hover:bg-red-500 hover:border-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer with logo + tech stack */}
        <footer className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-purple-900/60 pt-5 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <img
              src="/vbci-logo.png"
              alt="VBCI logo"
              className="w-8 h-8 object-contain transition-transform duration-700 hover:rotate-[360deg] hover:scale-110"
            />
            <span>
              © {new Date().getFullYear()} Victory Bible Church International.
              All rights reserved.
            </span>
          </div>
          <div className="text-[11px] text-gray-500 text-center sm:text-right">
            Built by Joshua Hilarion · Java Spring Boot · React · TypeScript ·
            Tailwind CSS
          </div>
        </footer>
      </div>
    </div>
  );
}
