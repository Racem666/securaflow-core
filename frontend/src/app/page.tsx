"use client";

import React, { useState } from "react";
import { ShieldAlert, CheckCircle, AlertTriangle } from "lucide-react";

export default function Home() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "Phishing",
        reporter_email: "",
    });

    const [status, setStatus] = useState<{
        type: "idle" | "loading" | "success" | "error";
        message: string;
        incidentId?: string;
    }>({ type: "idle", message: "" });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus({ type: "loading", message: "Submitting report..." });

        try {
            const response = await fetch("http://localhost:8000/api/v1/incidents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || "Server rejected submission");
            }

            const data = await response.json();

            // Safely check either nested 'data' or top-level fields
            const severity = data.data?.severity || data.severity || "Assigned";
            const incidentId = data.incident_id || (data.id ? `INC-${String(data.id).padStart(4, "0")}` : "INC-Logged");

            setStatus({
                type: "success",
                message: `Incident logged successfully! Severity auto-assigned: ${severity}`,
                incidentId: incidentId,
            });

            setFormData({ title: "", description: "", category: "Phishing", reporter_email: "" });
        } catch (err: unknown) {
            console.error("Submission error details:", err);

            const message =
                err instanceof Error
                    ? err.message
                    : typeof err === "object" && err !== null && "message" in err
                    ? String((err as { message?: unknown }).message)
                    : "Unable to submit report. Check console for details.";

            setStatus({
                type: "error",
                message,
            });
        }
    };

    return (
        <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
            <div className="max-w-xl w-full bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <ShieldAlert className="w-8 h-8 text-blue-500" />
                    <h1 className="text-2xl font-bold tracking-wide">SecuraFlow Incident Report</h1>
                </div>

                {status.type === "success" && (
                    <div className="mb-6 p-4 bg-emerald-900/50 border border-emerald-500/50 text-emerald-200 rounded-lg flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" />
                        <div>
                            <p className="font-semibold">{status.message}</p>
                            <p className="text-sm text-emerald-300">Reference ID: {status.incidentId}</p>
                        </div>
                    </div>
                )}

                {status.type === "error" && (
                    <div className="mb-6 p-4 bg-rose-900/50 border border-rose-500/50 text-rose-200 rounded-lg flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                        <p className="text-sm">{status.message}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-300">Email Address</label>
                        <input
                            type="email"
                            name="reporter_email"
                            required
                            value={formData.reporter_email}
                            onChange={handleChange}
                            placeholder="user@company.com"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-300">Incident Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
                        >
                            <option value="Phishing">Phishing Attempt</option>
                            <option value="Malware">Malware / Suspicious File</option>
                            <option value="Unauthorized Access">Unauthorized Access</option>
                            <option value="Data Leak">Data Leakage</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-300">Title / Subject</label>
                        <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Suspicious Email from HR impersonator"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-300">Detailed Description</label>
                        <textarea
                            name="description"
                            required
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Provide details about the suspicious activity..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status.type === "loading"}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors duration-200 disabled:opacity-50"
                    >
                        {status.type === "loading" ? "Submitting..." : "Submit Incident Report"}
                    </button>
                </form>
            </div>
        </main>
    );
}