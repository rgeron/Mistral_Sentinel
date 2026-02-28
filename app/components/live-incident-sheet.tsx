"use client";

import Pusher from "pusher-js";
import { useEffect, useState } from "react";

type ToolPayloadType =
  | "update_information"
  | "dispatch_emergency_services"
  | "transfer_to_human";

type IncidentData = {
  type: ToolPayloadType;
  data: {
    // update_information
    location?: string;
    caller_type?: string;
    situation?: string; // mapping from previous emergency_summary
    gravity_score?: number;

    // dispatch_emergency_services
    service_type?: string;
    priority?: string;

    // transfer_to_human
    transfer?: boolean;
    human_requested?: boolean;

    timestamp?: string;
  };
};

export function LiveIncidentSheet() {
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [humanTransferActive, setHumanTransferActive] = useState(false);

  useEffect(() => {
    // Only initialize if we have the key
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
      console.warn(
        "Pusher key missing. Set NEXT_PUBLIC_PUSHER_KEY in .env.local",
      );
      return;
    }

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1",
    });

    pusher.connection.bind("connected", () => setIsConnected(true));
    pusher.connection.bind("disconnected", () => setIsConnected(false));

    const channel = pusher.subscribe("incident-channel");

    channel.bind(
      "incident-update",
      (payload: IncidentData | Record<string, unknown>) => {
        console.log("Received incident data:", payload);

        // Handle legacy flat format if somehow sent, otherwise assume structured format
        let formattedPayload: IncidentData;
        if (payload.type && payload.data) {
          formattedPayload = payload as IncidentData;
        } else {
          formattedPayload = {
            type: "update_information",
            data: payload as IncidentData["data"],
          };
        }

        // Ensure we have a timestamp
        formattedPayload.data.timestamp =
          formattedPayload.data.timestamp || new Date().toISOString();

        // Check for human transfer tool hook
        if (formattedPayload.type === "transfer_to_human") {
          setHumanTransferActive(true);
        }

        setIncidents((prev) => [formattedPayload, ...prev]);
      },
    );

    return () => {
      pusher.unsubscribe("incident-channel");
      pusher.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col w-full max-w-2xl bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden relative">
      {/* HUMAN TRANSFER OVERLAY */}
      {humanTransferActive && (
        <div className="absolute inset-0 z-50 bg-red-900/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="p-4 bg-red-500 rounded-full animate-pulse mb-6 shadow-[0_0_50px_rgba(239,68,68,0.6)]">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-black tracking-widest text-white mb-2">
            TRANSFER INITIATED
          </h2>
          <p className="text-red-200 font-mono text-lg mb-8">
            CONNECTING TO HUMAN DISPATCHER
          </p>
          <button
            onClick={() => setHumanTransferActive(false)}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-colors border border-white/20"
          >
            Dismiss Alert
          </button>
        </div>
      )}

      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/20 rounded-lg">
            <svg
              className="w-5 h-5 text-rose-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">
            Live Incident Sheet
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400 font-mono">
          <span className="relative flex h-2 w-2">
            {isConnected ? (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
            )}
          </span>
          {isConnected ? "Live" : "Waiting..."}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4 max-h-125 overflow-y-auto custom-scrollbar">
        {incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <p className="text-gray-400 font-medium">No incident data yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Start a call and the agent will extract facts automatically
            </p>
          </div>
        ) : (
          incidents.map((incident, idx) => {
            const time = incident.data.timestamp
              ? new Date(incident.data.timestamp).toLocaleTimeString()
              : "Just now";

            // 1. Render Transfer Events
            if (incident.type === "transfer_to_human") {
              return (
                <div
                  key={`${incident.data.timestamp}-${idx}`}
                  className="group flex flex-col p-4 rounded-xl bg-red-900/40 border border-red-500/30 animate-in fade-in slide-in-from-bottom-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider text-sm">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      Human Transfer Requested
                    </div>
                    <span className="text-xs text-red-500 font-mono">
                      {time}
                    </span>
                  </div>
                </div>
              );
            }

            // 2. Render Dispatch Events
            if (incident.type === "dispatch_emergency_services") {
              return (
                <div
                  key={`${incident.data.timestamp}-${idx}`}
                  className="group flex flex-col p-4 rounded-xl bg-orange-900/30 border border-orange-500/30 animate-in fade-in slide-in-from-bottom-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 text-xs font-bold bg-orange-500/20 text-orange-400 rounded-md uppercase tracking-wider">
                      Service Dispatched
                    </span>
                    <span className="text-xs text-orange-500 font-mono">
                      {time}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                        Service Type
                      </span>
                      <span className="text-white font-medium capitalize flex items-center gap-2">
                        {incident.data.service_type === "police" && "🚓"}
                        {incident.data.service_type === "firefighter" && "🚒"}
                        {incident.data.service_type === "ambulance" && "🚑"}
                        {incident.data.service_type || "Unknown"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                        Priority
                      </span>
                      <span
                        className={`font-medium capitalize ${incident.data.priority === "high" ? "text-red-400" : "text-yellow-400"}`}
                      >
                        {incident.data.priority || "Normal"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            // 3. Render Standard Information Updates
            return (
              <div
                key={`${incident.data.timestamp}-${idx}`}
                className="group flex flex-col p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-semibold bg-blue-500/20 text-blue-300 rounded-md">
                      Info Update
                    </span>
                    {incident.data.gravity_score && (
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          incident.data.gravity_score >= 4
                            ? "bg-red-500/30 text-red-300"
                            : incident.data.gravity_score >= 3
                              ? "bg-orange-500/30 text-orange-300"
                              : "bg-green-500/30 text-green-300"
                        }`}
                      >
                        Gravity: {incident.data.gravity_score}/5
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    {time}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {incident.data.location && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                        Location
                      </span>
                      <span className="text-white font-medium">
                        {incident.data.location}
                      </span>
                    </div>
                  )}

                  {incident.data.caller_type && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                        Caller
                      </span>
                      <span className="text-white font-medium capitalize">
                        {incident.data.caller_type}
                      </span>
                    </div>
                  )}

                  {incident.data.situation && (
                    <div className="flex flex-col gap-1 sm:col-span-2 mt-2 pt-3 border-t border-white/10">
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                        Situation Summary
                      </span>
                      <p className="text-gray-300 leading-relaxed text-sm mt-1">
                        {incident.data.situation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
