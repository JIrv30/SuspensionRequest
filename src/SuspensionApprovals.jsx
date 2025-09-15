import { useEffect, useState } from "react";
import { supabase } from "./supabase-client";

const TABLE_NAME = "Suspensions"; // 

export default function SuspensionApprovals() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null); // row currently being actioned
  const [rejectNote, setRejectNote] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [acting, setActing] = useState(false);

  // Replace with actual headteacher name/email from your auth/user context if you have it
  const HEADTEACHER_NAME = "Kerry Payne";

  const fetchPending = async () => {
    setLoading(true);
    setErrorMsg("");
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(
        `
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
        `
      )
      .eq("approval_status", "pending")
      .order("incident_date", { ascending: false })
      .limit(100);

    if (error) {
      setErrorMsg(error.message || "Failed to load pending suspensions.");
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const approve = async (row) => {
    setActing(true);
    setErrorMsg("");
    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .update({
          approval_status: "approved",
          approved_by: HEADTEACHER_NAME,
          approved_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      if (error) throw error;

      // Optimistic UI: remove it from the list
      setItems((prev) => prev.filter((i) => i.id !== row.id));
    } catch (err) {
      setErrorMsg(err.message || "Failed to approve.");
    } finally {
      setActing(false);
    }
  };

  const reject = async (row) => {
    if (!rejectNote.trim()) {
      setErrorMsg("Please add a short note explaining the rejection.");
      return;
    }
    setActing(true);
    setErrorMsg("");
    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .update({
          approval_status: "rejected",
          approval_note: rejectNote.trim(),
          approved_by: HEADTEACHER_NAME,
          approved_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      if (error) throw error;

      setItems((prev) => prev.filter((i) => i.id !== row.id));
      setActionId(null);
      setRejectNote("");
    } catch (err) {
      setErrorMsg(err.message || "Failed to reject.");
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Suspension Authorisations</h1>
        <button
          onClick={fetchPending}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="text-gray-600">Loading pending suspensions…</div>
      ) : items.length === 0 ? (
        <div className="text-gray-600">No suspensions awaiting authorisation.</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {items.map((row) => (
            <div
              key={row.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {row.student_name} <span className="text-gray-400">•</span>{" "}
                    Year {row.year_group}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {row.number_of_days} day{row.number_of_days === 1 ? "" : "s"}
                    {row.is_pending ? " (5-day case pending)" : ""}
                  </p>
                </div>
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                  Awaiting approval
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-gray-500">Incident date</dt>
                  <dd className="font-medium text-gray-800">
                    {row.incident_date || "—"}
                  </dd>
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
                  <dd className="font-medium text-gray-800">
                    {row.reintegration_date || "—"}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-gray-500">Arbor</dt>
                  <dd className="truncate font-medium text-indigo-700">
                    {row.arbor_url ? (
                      <a
                        className="underline hover:no-underline"
                        href={row.arbor_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {row.arbor_url}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
              </dl>

              {/* Actions */}
              <div className="mt-4 flex flex-col gap-3 md:flex-row">
                <button
                  onClick={() => approve(row)}
                  disabled={acting && actionId !== row.id}
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  Approve
                </button>

                {actionId === row.id ? (
                  <div className="w-full">
                    <textarea
                      className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                      rows={3}
                      placeholder="Add a short note explaining the rejection…"
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => reject(row)}
                        disabled={acting}
                        className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        Confirm Reject
                      </button>
                      <button
                        onClick={() => {
                          setActionId(null);
                          setRejectNote("");
                        }}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setActionId(row.id);
                      setRejectNote("");
                      setErrorMsg("");
                    }}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
