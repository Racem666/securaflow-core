"use client";

import React, { useEffect, useState } from "react";
import {
    Shield,
    CheckCircle2,
    Clock,
    AlertOctagon,
    RefreshCw,
    Cpu,
    ChevronRight,
    X,
    Copy
} from "lucide-react";

interface IOCData {
    ips?: string[];
    urls?: string[];
    domains?: string[];
    hashes?: string[];
    firewall_rules?: string[];
    enriched_ips?: EnrichedIP[];
}

interface AiAnalysis {
    ai_severity?: string;
    attack_vector?: string;
    mitre_technique?: string;
    confidence_score?: number;
    recommended_actions?: string[];
    iocs?: IOCData;
}

interface Incident {
    id: number;
    title: string;
    description?: string;
    category: string;
    reporter_email: string;
    severity: string;
    status: string;
    created_at: string;
    ai_analysis?: AiAnalysis;
}

export default function Dashboard() {
    const [mounted, setMounted] = useState(false);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

    const fetchIncidents = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:8000/api/v1/incidents");
            if (res.ok) {
                const data = await res.json();
                setIncidents(data);
            }
        } catch (err) {
            console.error("Failed to fetch incidents", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchIncidents();
    }, []);

    if (!mounted) {
        return null;
    }

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            const res = await fetch(`http://localhost:8000/api/v1/incidents/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                setIncidents((prev) =>
                    prev.map((inc) => (inc.id === id ? { ...inc, status: newStatus } : inc))
                );
                if (selectedIncident?.id === id) {
                    setSelectedIncident((prev) => (prev ? { ...prev, status: newStatus } : null));
                }
            }
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const total = incidents.length;
    const highSeverity = incidents.filter((i) => i.severity === "High" || i.severity === "Critical").length;
    const openCount = incidents.filter((i) => i.status === "Open").length;

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Shield className="text-blue-500 w-8 h-8" /> SecuraFlow Operations Console
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Autonomous threat intake, AI triage, and incident lifecycle management</p>
                    </div>
                    <button
                        onClick={fetchIncidents}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-700 text-sm transition"
                    >
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
                        <Clock className="w-8 h-8 text-blue-400" />
                        <div>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Reports</p>
                            <p className="text-2xl font-bold">{total}</p>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
                        <AlertOctagon className="w-8 h-8 text-rose-400" />
                        <div>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">High Risk Threats</p>
                            <p className="text-2xl font-bold text-rose-400">{highSeverity}</p>
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
                        <CheckCircle2 className="w-8 h-8 text-amber-400" />
                        <div>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Awaiting Triage</p>
                            <p className="text-2xl font-bold text-amber-400">{openCount}</p>
                        </div>
                    </div>
                </div>

                {/* Dynamic Split Layout: Table on the left, Drawer on the right */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Table Container */}
                    <div className={`transition-all duration-300 ${selectedIncident ? "lg:col-span-2" : "lg:col-span-3"}`}>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                            <table className="w-full text-left text-sm text-slate-300">
                                <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                                    <tr>
                                        <th className="px-5 py-4">ID</th>
                                        <th className="px-5 py-4">Title</th>
                                        <th className="px-5 py-4">Category</th>
                                        <th className="px-5 py-4">Severity</th>
                                        <th className="px-5 py-4">Workflow State</th>
                                        <th className="px-5 py-4 text-right">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {incidents.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-slate-500">
                                                {loading ? "Loading incidents..." : "No incidents reported yet."}
                                            </td>
                                        </tr>
                                    ) : (
                                        incidents.map((inc) => (
                                            <tr
                                                key={inc.id}
                                                onClick={() => setSelectedIncident(inc)}
                                                className={`cursor-pointer hover:bg-slate-800/40 transition ${selectedIncident?.id === inc.id ? "bg-slate-800/60 border-l-4 border-blue-500" : ""
                                                    }`}
                                            >
                                                <td className="px-5 py-4 font-mono text-blue-400">INC-{String(inc.id).padStart(4, "0")}</td>
                                                <td className="px-5 py-4 font-medium text-slate-200">{inc.title}</td>
                                                <td className="px-5 py-4 text-slate-400">{inc.category}</td>
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${inc.severity === "Critical" || inc.severity === "High"
                                                                ? "bg-rose-950/70 text-rose-400 border border-rose-800/50"
                                                                : "bg-blue-950/70 text-blue-400 border border-blue-800/50"
                                                            }`}
                                                    >
                                                        {inc.severity}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                                                    <select
                                                        value={inc.status}
                                                        onChange={(e) => handleStatusChange(inc.id, e.target.value)}
                                                        className={`bg-slate-950 text-xs border rounded-lg px-2.5 py-1 focus:outline-none ${inc.status === "Resolved"
                                                                ? "border-emerald-600 text-emerald-400"
                                                                : inc.status === "Under Investigation"
                                                                    ? "border-amber-600 text-amber-400"
                                                                    : "border-slate-700 text-slate-300"
                                                            }`}
                                                    >
                                                        <option value="Open">Open</option>
                                                        <option value="Under Investigation">Under Investigation</option>
                                                        <option value="Resolved">Resolved</option>
                                                    </select>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <span className="text-blue-400 hover:text-blue-300 text-xs inline-flex items-center gap-1">
                                                        Inspect <ChevronRight className="w-3 h-3" />
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* AI Intelligence & IOC Drawer */}
                    {/* AI Intelligence Drawer */}
                    {selectedIncident && (
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-2xl relative sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">

                            {/* Raw User Description */}
                            <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-800">
                                <p className="text-xs text-slate-400 font-medium uppercase">Reporter Description</p>
                                <p className="text-xs text-slate-300 italic">"{selectedIncident.description || "No description provided."}"</p>
                                <p className="text-[10px] text-slate-500 mt-1">From: {selectedIncident.reporter_email}</p>
                            </div>

                            {/* AI Analysis Section */}
                            {selectedIncident.ai_analysis ? (
                                <div className="space-y-4 text-xs">
                                    <div>
                                        <span className="text-slate-400 uppercase font-semibold">Attack Vector</span>
                                        <p className="text-slate-200 font-medium mt-0.5">{selectedIncident.ai_analysis.attack_vector || "Under analysis"}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                                            <span className="text-slate-400 uppercase font-semibold">MITRE Technique</span>
                                            <p className="text-purple-400 font-mono font-medium mt-1">
                                                {selectedIncident.ai_analysis.mitre_technique || "T1000"}
                                            </p>
                                        </div>
                                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                                            <span className="text-slate-400 uppercase font-semibold">Confidence</span>
                                            <p className="text-emerald-400 font-bold mt-1">
                                                {selectedIncident.ai_analysis.confidence_score || 85}%
                                            </p>
                                        </div>
                                    </div>

                                    {/* Recommended Containment Steps */}
                                    <div>
                                        <span className="text-slate-400 uppercase font-semibold block mb-2">Recommended Response Steps</span>
                                        <ul className="space-y-1.5 list-none">
                                            {selectedIncident.ai_analysis.recommended_actions?.map((step, idx) => (
                                                <li key={idx} className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2 flex items-start gap-2 text-slate-300">
                                                    <span className="text-blue-400 font-bold">{idx + 1}.</span>
                                                    <span>{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Extracted Artifacts (IOCs) */}
                                    {selectedIncident.ai_analysis?.iocs && (
                                        <div className="space-y-3 pt-3 border-t border-slate-800">
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-400 uppercase font-semibold text-xs tracking-wider">
                                                    Extracted Artifacts (IOCs)
                                                </span>
                                                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                                                    RegEx Parser
                                                </span>
                                            </div>

                                            {/* IPs */}
                                            {/* Threat-Enriched IP Telemetry */}
                                            {selectedIncident.ai_analysis.iocs.enriched_ips && selectedIncident.ai_analysis.iocs.enriched_ips.length > 0 ? (
                                                <div>
                                                    <span className="text-[11px] text-slate-500 block mb-1.5">Enriched IP Telemetry & Geolocation</span>
                                                    <div className="space-y-2">
                                                        {selectedIncident.ai_analysis.iocs.enriched_ips.map((item, idx) => (
                                                            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 space-y-1">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-mono text-xs text-rose-300 font-bold">{item.ip}</span>
                                                                    <span
                                                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${item.threat_score >= 50
                                                                                ? "bg-rose-950/60 border-rose-800 text-rose-400"
                                                                                : "bg-blue-950/60 border-blue-800 text-blue-400"
                                                                            }`}
                                                                    >
                                                                        Risk Score: {item.threat_score}%
                                                                    </span>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                                                                    <div>
                                                                        <span className="text-slate-600 block text-[10px]">Location</span>
                                                                        <span className="text-slate-300">
                                                                            {item.country} ({item.country_code}) • {item.city}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-slate-600 block text-[10px]">Network / ASN</span>
                                                                        <span className="text-slate-300 truncate block" title={item.isp}>
                                                                            {item.isp}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-1.5 pt-1 text-[10px]">
                                                                    <span className="text-slate-500">Classification:</span>
                                                                    <span className="text-slate-400 italic">{item.classification}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Fallback if no enriched data exists */
                                                selectedIncident.ai_analysis.iocs.ips && selectedIncident.ai_analysis.iocs.ips.length > 0 && (
                                                    <div>
                                                        <span className="text-[11px] text-slate-500 block mb-1">Target IP Addresses</span>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {selectedIncident.ai_analysis.iocs.ips.map((ip, idx) => (
                                                                <span key={idx} className="bg-rose-950/50 border border-rose-800/60 text-rose-300 font-mono text-[11px] px-2 py-0.5 rounded">
                                                                    {ip}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )
                                            )}

                                            {/* Malicious URLs */}
                                            {selectedIncident.ai_analysis.iocs.urls && selectedIncident.ai_analysis.iocs.urls.length > 0 && (
                                                <div>
                                                    <span className="text-[11px] text-slate-500 block mb-1">Malicious URLs</span>
                                                    <div className="space-y-1">
                                                        {selectedIncident.ai_analysis.iocs.urls.map((url, idx) => (
                                                            <p key={idx} className="bg-amber-950/40 border border-amber-800/50 text-amber-300 font-mono text-[11px] px-2 py-1 rounded truncate">
                                                                {url}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Hashes */}
                                            {selectedIncident.ai_analysis.iocs.hashes && selectedIncident.ai_analysis.iocs.hashes.length > 0 && (
                                                <div>
                                                    <span className="text-[11px] text-slate-500 block mb-1">File Hashes</span>
                                                    <div className="space-y-1">
                                                        {selectedIncident.ai_analysis.iocs.hashes.map((hash, idx) => (
                                                            <p key={idx} className="bg-slate-950 border border-slate-800 text-slate-400 font-mono text-[10px] px-2 py-1 rounded truncate">
                                                                {hash}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Automated Firewall Rule Export */}
                                            {selectedIncident.ai_analysis.iocs.firewall_rules && selectedIncident.ai_analysis.iocs.firewall_rules.length > 0 && (
                                                <div className="mt-3 bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                                                    <span className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                                                        <span>Automated Firewall Drop Command</span>
                                                        <button
                                                            onClick={() => {
                                                                const cmd = selectedIncident.ai_analysis?.iocs?.firewall_rules?.[0] || "";
                                                                navigator.clipboard.writeText(cmd);
                                                                alert("Firewall command copied to clipboard!");
                                                            }}
                                                            className="text-[10px] text-blue-400 hover:text-blue-300 underline font-normal flex items-center gap-1"
                                                        >
                                                            <Copy className="w-3 h-3" /> Copy
                                                        </button>
                                                    </span>
                                                    <code className="text-[11px] font-mono text-emerald-400 block bg-slate-900 p-2 rounded border border-slate-800 break-all">
                                                        {selectedIncident.ai_analysis.iocs.firewall_rules[0]}
                                                    </code>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </div>
                            ) : (
                                <div className="text-center py-6 text-slate-500 text-xs">
                                    No automated AI intelligence logged for this ticket.
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </main>
    );
}