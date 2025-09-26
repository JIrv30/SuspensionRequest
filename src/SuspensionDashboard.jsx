import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase-client"; // adjust path if needed

const TABLE_NAME = "Suspensions";

const statusClasses = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

export default function SuspensionsDashboard() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("pending"); // 'pending' | 'approved' | 'rejected' | 'all'
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [query, setQuery] = useState("");

  // Filters
  const [yearFilter, setYearFilter] = useState(""); // "" = All, otherwise "1".."13"
  const [dateFrom, setDateFrom] = useState("");     // YYYY-MM-DD
  const [dateTo, setDateTo] = useState("");         // YYYY-MM-DD

  // NEW: which date column to filter by
  const [dateField, setDateField] = useState("incident"); // 'incident' | 'start' | 'end'

  const fetchAll = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      let q = supabase
        .from(TABLE_NAME)
        .select(`
          id,
          student_name,
          year_group,
          number_of_days,
          is_pending,
          incident_date,
          start_date,
          start_time,
          end_date,
          end_time,
          reintegration_date,
          arbor_url,
          approval_status,
          approval_note,
          approved_by,
          approved_at
        `)
        // Default ordering by incident_date keeps list sensible
        .order("incident_date", { ascending: false });

      // Year group filter
      if (yearFilter) q = q.eq("year_group", Number(yearFilter));

      // Date range filter — apply to selected date column
      const dateCol =
        dateField === "start"
          ? "start_date"
          : dateField === "end"
          ? "end_date"
          : "incident_date";

      if (dateFrom) q = q.gte(dateCol, dateFrom);
      if (dateTo) q = q.lte(dateCol, dateTo);

      const { data, error } = await q;
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      setErrorMsg(err?.message || "Failed to load suspensions.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and whenever filters change
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearFilter, dateFrom, dateTo, dateField]);

  // Counts reflect the fetched set (after server-side filters)
  const counts = useMemo(() => {
    const base = { pending: 0, approved: 0, rejected: 0 };
    for (const r of items) {
      if (r.approval_status === "pending") base.pending++;
      else if (r.approval_status === "approved") base.approved++;
      else if (r.approval_status === "rejected") base.rejected++;
    }
    return base;
  }, [items]);

  // Client filtering: tab + free-text search
  const filtered = useMemo(() => {
    let rows = items;
    if (tab !== "all") rows = rows.filter((r) => r.approval_status === tab);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter((r) => (r.student_name || "").toLowerCase().includes(q));
    }
    return rows;
  }, [items, tab, query]);

  const resetFilters = () => {
    setYearFilter("");
    setDateFrom("");
    setDateTo("");
    setDateField("incident");
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Suspensions Dashboard</h1>

        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
          {/* Status tabs (client-side) */}
          <div className="flex rounded-xl border border-gray-200 bg-white p-1">
            {[
              { key: "pending", label: `Pending (${counts.pending})` },
              { key: "approved", label: `Approved (${counts.approved})` },
              { key: "rejected", label: `Rejected (${counts.rejected})` },
              { key: "all", label: "All" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                  tab === t.key ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by student…"
              className="w-full md:w-64 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button
              onClick={fetchAll}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-12">
        {/* Year group */}
        <div className="md:col-span-3">
          <label className="mb-1 block text-sm font-medium text-gray-700">Year group</label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All</option>
            {Array.from({ length: 13 }, (_, i) => i + 1).map((y) => (
              <option key={y} value={y}>Year {y}</option>
            ))}
          </select>
        </div>

        {/* NEW: Date field toggle */}
        <div className="md:col-span-3">
          <label className="mb-1 block text-sm font-medium text-gray-700">Filter by date</label>
          <div className="flex rounded-lg border border-gray-200 bg-white p-1">
            {[
              { key: "incident", label: "Incident" },
              { key: "start", label: "Start" },
              { key: "end", label: "End" },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setDateField(opt.key)}
                className={`flex-1 rounded-md px-2.5 py-1.5 text-sm ${
                  dateField === opt.key ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date range */}
        <div className="md:col-span-3">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {dateField === "incident" ? "Incident date from" : dateField === "start" ? "Start date from" : "End date from"}
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="md:col-span-3">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {dateField === "incident" ? "Incident date to" : dateField === "start" ? "Start date to" : "End date to"}
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="md:col-span-12 flex items-center justify-end gap-2">
          <button
            onClick={resetFilters}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
            disabled={loading}
          >
            Reset filters
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="text-gray-600">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-600">
          {tab === "all" && !query && !yearFilter && !dateFrom && !dateTo
            ? "No suspensions recorded."
            : "No records match your filters."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filtered.map((row) => (
            <div key={row.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {row.student_name} <span className="text-gray-400">•</span> Year {row.year_group}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {row.number_of_days} day{row.number_of_days === 1 ? "" : "s"}
                    {row.is_pending ? " (5-day case pending)" : ""}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    statusClasses[row.approval_status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {row.approval_status
                    ? row.approval_status[0].toUpperCase() + row.approval_status.slice(1)
                    : "—"}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Incident date</dt>
                  <dd className="font-medium text-gray-800">{row.incident_date || "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Start</dt>
                  <dd className="font-medium text-gray-800">
                    {row.start_date || "—"} {row.start_time ? `(${row.start_time})` : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">End</dt>
                  <dd className="font-medium text-gray-800">
                    {row.end_date || "—"} {row.end_time ? `(${row.end_time})` : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Reintegration</dt>
                  <dd className="font-medium text-gray-800">{row.reintegration_date || "—"}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-gray-500">Arbor</dt>
                  <dd className="truncate font-medium text-indigo-700">
                    {row.arbor_url ? (
                      <a className="underline hover:no-underline" href={row.arbor_url} target="_blank" rel="noreferrer">
                        {row.arbor_url}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>

                {row.approval_status === "rejected" && row.approval_note && (
                  <div className="col-span-2">
                    <dt className="text-gray-500">Rejection note</dt>
                    <dd className="font-medium text-gray-800">{row.approval_note}</dd>
                  </div>
                )}
                {(row.approval_status === "approved" || row.approval_status === "rejected") && (
                  <>
                    <div>
                      <dt className="text-gray-500">Updated by</dt>
                      <dd className="font-medium text-gray-800">{row.approved_by || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Updated at</dt>
                      <dd className="font-medium text-gray-800">
                        {row.approved_at ? new Date(row.approved_at).toLocaleString() : "—"}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
