import { useEffect, useState } from "react";
import { supabase } from "./supabase-client";
import { useStudents } from "./useStudents";

export default function SuspensionForm() {
  const [search, setSearch] = useState("");
  const { data: students, loading, error } = useStudents(search);

  const yearGroups = [7, 8, 9, 10, 11];
  const suspensionLength = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    yearGroup: "",
    suspensionDays: "",
    isPending: false,
    incidentDate: "",
    startTime: "AM",
    startDate: "",
    endTime: "PM",
    endDate: "",
    reintegrationDate: "",
    arborUrl: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let v = type === "checkbox" ? checked : value;
    if (name === "yearGroup" || name === "suspensionDays") {
      v = v === "" ? "" : Number(v);
    }
    setFormData((prev) => ({ ...prev, [name]: v }));
  };

  const handleStudentChange = (e) => {
    const selectedId = e.target.value;
    const selected = students.find((s) => s.id === selectedId);
    setFormData((prev) => ({
      ...prev,
      studentId: selectedId,
      studentName: selected?.student_name || "",
    }));
  };

  const validate = () => {
    if (!formData.studentName) return "Please select a student.";
    if (formData.yearGroup === "" || formData.yearGroup === null) return "Please choose a year group.";
    if (formData.suspensionDays === "" || formData.suspensionDays === null)
      return "Please select the number of suspension days.";
    if (!formData.incidentDate) return "Please enter the incident date.";
    if (!formData.startDate) return "Please enter the suspension start date.";
    if (!formData.endDate) return "Please enter the suspension end date.";
    if (!formData.startTime) return "Please select a start time (AM/PM).";
    if (!formData.endTime) return "Please select an end time (AM/PM).";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const problem = validate();
    if (problem) {
      setErrorMsg(problem);
      return;
    }

    setSubmitting(true);

    const payload = {
      student_name: formData.studentName,
      year_group: Number(formData.yearGroup),
      number_of_days: Number(formData.suspensionDays),
      is_pending: formData.isPending,
      incident_date: formData.incidentDate,
      start_time: formData.startTime,
      start_date: formData.startDate,
      end_time: formData.endTime,
      end_date: formData.endDate,
      reintegration_date: formData.reintegrationDate || null,
      arbor_url: formData.arborUrl || null,
    };

    try {
      const { data, error } = await supabase
        .from("Suspensions")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      setFormData({
        studentId: "",
        studentName: "",
        yearGroup: "",
        suspensionDays: "",
        isPending: false,
        incidentDate: "",
        startTime: "AM",
        startDate: "",
        endTime: "PM",
        endDate: "",
        reintegrationDate: "",
        arborUrl: "",
      });
      setSearch("");
      console.log("Inserted:", data);
    } catch (err) {
      console.error("Insert failed:", err);
      setErrorMsg(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-800">Suspension Record Form</h2>

      {errorMsg && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Student */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Student</label>
        <input
          type="text"
          placeholder="Search student…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-1 mb-2 w-full rounded-md border border-gray-300 p-2"
        />
        {error && (
          <div className="mb-2 rounded-md border border-yellow-200 bg-yellow-50 p-2 text-xs text-yellow-800">
            {error}
          </div>
        )}
        <select
          name="studentId"
          value={formData.studentId}
          onChange={handleStudentChange}
          className="block w-full rounded-md border border-gray-300 p-2"
          required
        >
          <option value="">{loading ? "Loading…" : "Select student…"}</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.student_name}
            </option>
          ))}
        </select>
      </div>

      {/* Year Group */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Year Group</label>
        <select
          name="yearGroup"
          value={formData.yearGroup}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Select year group...</option>
          {yearGroups.map((year) => (
            <option key={year} value={year}>{`Year ${year}`}</option>
          ))}
        </select>
      </div>

      {/* Suspension Days */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Number of Suspension Days
        </label>
        <select
          name="suspensionDays"
          value={formData.suspensionDays}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Select suspension length...</option>
          {suspensionLength.map((d) => (
            <option key={d} value={d}>
              {d} day{d === 1 ? "" : "s"}
            </option>
          ))}
        </select>
      </div>

      {/* Is Pending */}
      <div className="flex items-center">
        <input
          type="checkbox"
          name="isPending"
          checked={formData.isPending}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600"
        />
        <label className="ml-2 block text-sm text-gray-700">Pending Suspension</label>
      </div>

      {/* Incident Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Incident Date</label>
        <input
          type="date"
          name="incidentDate"
          value={formData.incidentDate}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      {/* Suspension Start */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Suspension Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Time</label>
          <select
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option>AM</option>
            <option>PM</option>
          </select>
        </div>
      </div>

      {/* Suspension End */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Suspension End Date
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Time</label>
          <select
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option>AM</option>
            <option>PM</option>
          </select>
        </div>
      </div>

      {/* Reintegration Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Reintegration Date
        </label>
        <input
          type="date"
          name="reintegrationDate"
          value={formData.reintegrationDate}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {/* Arbor URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Arbor URL</label>
        <input
          type="url"
          name="arborUrl"
          value={formData.arborUrl}
          onChange={handleChange}
          placeholder="https://..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-indigo-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        {submitting ? "Saving..." : "Save Suspension Record"}
      </button>
    </form>
  );
}
