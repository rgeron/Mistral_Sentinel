"use client";

import Pusher from "pusher-js";
import { useEffect, useState } from "react";

type IncidentData = {
  location?: string;
  caller_type?: string;
  emergency_summary?: string;
  timestamp?: string;
};

export function LiveIncidentSheet() {
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only initialize if we have the key
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
      console.warn(
        "Pusher key missing. Set NEXT_PUBLIC_PUSHER_KEY in .env.local",
      );
      return;
    }

    // Enable pusher logging - don't include this in production
    // Pusher.logToConsole = true;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1",
    });

    pusher.connection.bind("connected", () => {
      setIsConnected(true);
    });

    pusher.connection.bind("disconnected", () => {
      setIsConnected(false);
    });

    const channel = pusher.subscribe("incident-channel");

    channel.bind("incident-update", (data: IncidentData) => {
      console.log("Received incident data:", data);

      // Ensure we have a timestamp
      const incidentWithTime = {
        ...data,
        timestamp: data.timestamp || new Date().toISOString(),
      };

      setIncidents((prev) => [incidentWithTime, ...prev]);
    });

    return () => {
      pusher.unsubscribe("incident-channel");
      pusher.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col w-full max-w-2xl bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden">
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

      <div className="p-4 flex flex-col gap-4 max-h-[500px] overflow-y-auto custom-scrollbar">
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
          incidents.map((incident, idx) => (
            <div
              key={`${incident.timestamp}-${idx}`}
              className="group flex flex-col p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 text-xs font-semibold bg-rose-500/20 text-rose-300 rounded-md">
                  Update Received
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {incident.timestamp
                    ? new Date(incident.timestamp).toLocaleTimeString()
                    : "Just now"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {incident.location && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                      Location
                    </span>
                    <span className="text-white font-medium">
                      {incident.location}
                    </span>
                  </div>
                )}

                {incident.caller_type && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                      Caller Type
                    </span>
                    <span className="text-white font-medium capitalize">
                      {incident.caller_type}
                    </span>
                  </div>
                )}

                {incident.emergency_summary && (
                  <div className="flex flex-col gap-1 sm:col-span-2 mt-2 pt-3 border-t border-white/10">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                      Emergency Summary
                    </span>
                    <p className="text-gray-300 leading-relaxed text-sm mt-1">
                      {incident.emergency_summary}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
