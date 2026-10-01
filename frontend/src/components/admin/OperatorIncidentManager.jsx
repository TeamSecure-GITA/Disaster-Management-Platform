import React, { useState, useEffect } from "react";
import { fetchIncidents, updateIncidentStatus } from "../../services/gisService";
import { CheckCircle2, AlertTriangle, ShieldAlert, XCircle, RefreshCw, Filter, Eye, Camera, MapPin, Activity } from "lucide-react";

export default function OperatorIncidentManager() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [actionRemarks, setActionRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (typeFilter !== "all") params.incidentType = typeFilter;
      const res = await fetchIncidents(params);
      if (res && res.data) {
        setIncidents(res.data);
        if (selectedIncident) {
          const updated = res.data.find((i) => i._id === selectedIncident._id);
          if (updated) setSelectedIncident(updated);
        }
      }
    } catch (err) {
      console.warn("Failed to load incidents:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [statusFilter, typeFilter]);

  const handleUpdateStatus = async (incidentId, newStatus) => {
    setActionLoading(true);
    setActionSuccess("");
    try {
      await updateIncidentStatus(incidentId, {
        status: newStatus,
        remarks: actionRemarks.trim() || `Status updated to ${newStatus} by incident command operator.`,
      });
      setActionSuccess(`Successfully updated incident to "${newStatus.toUpperCase()}"`);
      setActionRemarks("");
      await loadIncidents();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "verified":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700">Verified Threat</span>;
      case "escalated":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-950 text-red-300 border border-red-700 animate-pulse">Escalated to SDRF</span>;
      case "resolved":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-700">Resolved</span>;
      case "rejected":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">Rejected False Alarm</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-700">Pending Review</span>;
    }
  };

  const getSeverityBadge = (severity) => {
    const sev = (severity || "medium").toLowerCase();
    if (sev === "critical") return <span className="text-red-400 font-bold uppercase text-xs">Critical</span>;
    if (sev === "high") return <span className="text-orange-400 font-bold uppercase text-xs">High</span>;
    if (sev === "medium") return <span className="text-amber-400 font-medium uppercase text-xs">Medium</span>;
    return <span className="text-emerald-400 text-xs">Low</span>;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <ShieldAlert className="w-6 h-6 text-indigo-400" />
            Field Incident Verification &amp; Escalation Command
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative triage queue for offline-synced citizen and responder field slope/crack reports.
          </p>
        </div>
        <button
          onClick={loadIncidents}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition border border-slate-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Live Queue
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-2">
          <Filter className="w-3.5 h-3.5 text-indigo-400" /> Filter:
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending Review</option>
          <option value="verified">Verified Threat</option>
          <option value="escalated">Escalated to SDRF</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Incident Types</option>
          <option value="landslide_crack">Slope Crack / Fissure</option>
          <option value="blocked_road">Blocked Road</option>
          <option value="slope_movement">Slope Movement</option>
          <option value="flooding">Flash Flooding</option>
          <option value="bridge_damage">Bridge Damage</option>
        </select>

        <div className="ml-auto text-xs text-slate-400">
          Total in Queue: <span className="text-white font-semibold">{incidents.length}</span>
        </div>
      </div>

      {actionSuccess && (
        <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs rounded-lg flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess("")} className="text-emerald-400 hover:text-white">&times;</button>
        </div>
      )}

      {/* Main Grid: Queue List & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incident List (Left side) */}
        <div className="lg:col-span-5 space-y-3 max-h-[640px] overflow-y-auto pr-1">
          {loading && incidents.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">Loading incident queue...</div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg">
              No reports match the selected filters.
            </div>
          ) : (
            incidents.map((item) => {
              const isSelected = selectedIncident?._id === item._id;
              return (
                <div
                  key={item._id}
                  onClick={() => setSelectedIncident(item)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition ${
                    isSelected
                      ? "bg-indigo-950/40 border-indigo-500/80 shadow-md shadow-indigo-950/50"
                      : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-white capitalize">
                      {item.incidentType ? item.incidentType.replace(/_/g, " ") : "Incident"}
                    </span>
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(item.severity)}
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 mb-2">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {item.locationMeta?.address || item.locationMeta?.district || (item.location?.coordinates ? `${item.location.coordinates[1].toFixed(2)}, ${item.location.coordinates[0].toFixed(2)}` : "Location Recorded")}
                    </span>
                    <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Incident Detail & Verification Actions (Right side) */}
        <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800 rounded-xl p-5">
          {selectedIncident ? (
            <div className="space-y-5">
              {/* Header Info */}
              <div className="flex justify-between items-start border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-bold text-white capitalize">
                      {selectedIncident.incidentType?.replace(/_/g, " ")}
                    </span>
                    {getSeverityBadge(selectedIncident.severity)}
                    {getStatusBadge(selectedIncident.status)}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-3">
                    <span>ID: <code className="text-slate-300 font-mono">{selectedIncident._id}</code></span>
                    {selectedIncident.offlineId && (
                      <span className="text-indigo-400">Synced Offline (ID: {selectedIncident.offlineId.slice(0, 8)}...)</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Risk Score</div>
                  <div className="text-lg font-black text-rose-400">{selectedIncident.riskScore || 50}/100</div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Field Description</label>
                <div className="text-xs text-slate-200 bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed">
                  {selectedIncident.description}
                </div>
              </div>

              {/* Geotechnical & Terrain Telemetry */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800/70 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Crack Width</span>
                  <strong className="text-white">{selectedIncident.crackWidth ? `${selectedIncident.crackWidth} cm` : "Not recorded"}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Crack Length</span>
                  <strong className="text-white">{selectedIncident.crackLength ? `${selectedIncident.crackLength} m` : "Not recorded"}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Slope Trend</span>
                  <strong className="text-white">{selectedIncident.slopeTrend || "Stationary"}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Road Status</span>
                  <strong className={selectedIncident.isRoadBlocked ? "text-rose-400" : "text-emerald-400"}>
                    {selectedIncident.roadStatus || (selectedIncident.isRoadBlocked ? "Blocked" : "Clear")}
                  </strong>
                </div>
              </div>

              {/* Location Coordinates & DEM */}
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/70 text-xs flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <div>
                    <div className="text-white font-medium">
                      {selectedIncident.locationMeta?.address || "Field Coordinates"}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {selectedIncident.location?.coordinates
                        ? `Lat ${selectedIncident.location.coordinates[1].toFixed(4)}, Lng ${selectedIncident.location.coordinates[0].toFixed(4)}`
                        : "No GPS"}
                      {selectedIncident.locationMeta?.district ? ` • ${selectedIncident.locationMeta.district}` : ""}
                      {selectedIncident.locationMeta?.state ? `, ${selectedIncident.locationMeta.state}` : ""}
                    </div>
                  </div>
                </div>

                {selectedIncident.demDerived && (
                  <span className="text-[11px] bg-indigo-950 text-indigo-300 border border-indigo-700/60 px-2 py-0.5 rounded">
                    DEM Elevation: {selectedIncident.demElevationMeters ? `${selectedIncident.demElevationMeters}m` : "Derived"}
                  </span>
                )}
              </div>

              {/* Media Photos Preview */}
              {selectedIncident.media && selectedIncident.media.length > 0 && (
                <div>
                  <label className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-indigo-400" /> Evidence Photos &amp; Video ({selectedIncident.media.length})
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {selectedIncident.media.map((m, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-800 bg-black/40 w-24 h-24">
                        <img
                          src={m.url}
                          alt="Field proof"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=200&auto=format&fit=crop&q=60"; }}
                        />
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-[10px] text-white font-medium"
                        >
                          View Full
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Operator Action Decision Box */}
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-3">
                <label className="text-xs font-semibold text-white block">
                  Authoritative Operator Decision &amp; Action Notes
                </label>
                <input
                  type="text"
                  placeholder="Optional remarks (e.g. Ground inspection dispatched; verified with local SDRF unit)..."
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedIncident._id, "verified")}
                    className="flex-1 min-w-[120px] bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verify Report
                  </button>

                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedIncident._id, "escalated")}
                    className="flex-1 min-w-[120px] bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Escalate to SDRF
                  </button>

                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedIncident._id, "resolved")}
                    className="flex-1 min-w-[100px] bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    Mark Resolved
                  </button>

                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedIncident._id, "rejected")}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition border border-slate-700 disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 text-slate-500 text-xs">
              Select an incident from the left queue to review proof, inspect crack telemetry, and authorize verification or SDRF dispatch.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
