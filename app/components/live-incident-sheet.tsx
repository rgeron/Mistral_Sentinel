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
    <div className="flex flex-col w-full max-w-2xl bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
      {/* HUMAN TRANSFER OVERLAY */}
      {humanTransferActive && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="p-4 bg-black rounded-lg animate-pulse mb-6 shadow-md border border-gray-800">
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
          <h2 className="text-3xl font-black tracking-tight text-black mb-2">
            TRANSFER INITIATED
          </h2>
          <p className="text-gray-600 font-mono text-lg mb-8 uppercase">
            Connecting to human dispatcher
          </p>
          <button
            onClick={() => setHumanTransferActive(false)}
            className="px-6 py-2.5 bg-black hover:bg-gray-900 border border-gray-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            Dismiss Alert
          </button>
        </div>
      )}

      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
            <svg
              className="w-5 h-5 text-black"
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
          <h2 className="text-lg font-bold text-black tracking-tight">
            Live Incident Sheet
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 font-mono font-medium">
          <span className="relative flex h-2 w-2">
            {isConnected ? (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-300"></span>
            )}
          </span>
          {isConnected ? "Live" : "Waiting..."}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4 max-h-125 overflow-y-auto custom-scrollbar">
        {incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
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
            <p className="text-black font-semibold">No incident data yet</p>
            <p className="text-gray-500 text-sm mt-1 font-medium">
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
                  className="group flex flex-col p-4 rounded-lg bg-gray-50 border-2 border-dashed border-gray-300 animate-in fade-in slide-in-from-bottom-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-black font-bold uppercase tracking-wider text-sm">
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
                    <span className="text-xs text-gray-500 font-mono font-medium">
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
                  className="group flex flex-col p-4 rounded-lg bg-black text-white border border-gray-800 shadow-sm animate-in fade-in slide-in-from-bottom-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 text-xs font-bold bg-white text-black rounded-md uppercase tracking-wider">
                      Service Dispatched
                    </span>
                    <span className="text-xs text-gray-400 font-mono font-medium">
                      {time}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                        Service Type
                      </span>
                      <span className="text-white font-semibold capitalize flex items-center gap-2">
                        {incident.data.service_type === "police" && "🚓"}
                        {incident.data.service_type === "firefighter" && "🚒"}
                        {incident.data.service_type === "ambulance" && "🚑"}
                        {incident.data.service_type || "Unknown"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                        Priority
                      </span>
                      <span className="text-white font-semibold capitalize">
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
                className="group flex flex-col p-4 rounded-lg bg-white border border-gray-200 shadow-sm hover:border-gray-300 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-bold bg-gray-100 border border-gray-200 text-black rounded-md uppercase tracking-widest">
                      Info Update
                    </span>
                    {incident.data.gravity_score && (
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 border border-gray-200 text-black uppercase tracking-widest`}
                      >
                        Gravity: {incident.data.gravity_score}/5
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 font-mono font-medium">
                    {time}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {incident.data.location && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                        Location
                      </span>
                      <span className="text-black font-semibold">
                        {incident.data.location}
                      </span>
                    </div>
                  )}

                  {incident.data.caller_type && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                        Caller
                      </span>
                      <span className="text-black font-semibold capitalize">
                        {incident.data.caller_type}
                      </span>
                    </div>
                  )}

                  {incident.data.situation && (
                    <div className="flex flex-col gap-1 sm:col-span-2 mt-2 pt-3 border-t border-gray-100">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                        Situation Summary
                      </span>
                      <p className="text-gray-800 leading-relaxed text-sm mt-1 font-medium">
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
