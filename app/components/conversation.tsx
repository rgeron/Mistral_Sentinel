"use client";

import { useConversation } from "@elevenlabs/react";
import { useCallback } from "react";

export function Conversation() {
  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (message) => console.log("Message:", message),
    onError: (error) => console.error("Error:", error),
  });

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation with your agent
      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "", // Replace with your agent ID
        connectionType: "webrtc", // either "webrtc" or "websocket"
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
      <h2 className="text-xl font-bold text-black mb-2 tracking-tight">
        Emergency Voice Agent
      </h2>

      <div className="flex gap-4">
        <button
          onClick={startConversation}
          disabled={conversation.status === "connected"}
          className="px-6 py-2.5 bg-black text-white font-medium rounded-lg shadow-sm border border-transparent hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 flex items-center justify-center min-w-35"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {conversation.status === "connected" ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-400"></span>
              )}
            </span>
            {conversation.status === "connected" ? "Connected" : "Start Call"}
          </div>
        </button>

        <button
          onClick={stopConversation}
          disabled={conversation.status !== "connected"}
          className="px-6 py-2.5 bg-white text-black font-medium border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 flex items-center justify-center min-w-35"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
              ></path>
            </svg>
            End Call
          </div>
        </button>
      </div>

      <div className="flex flex-col items-center mt-6 w-full p-4 bg-gray-50 border border-gray-100 rounded-lg">
        <div className="flex justify-between w-full text-sm text-gray-500 mb-2 font-mono">
          <span>Status:</span>
          <span
            className={`font-semibold ${conversation.status === "connected" ? "text-black" : "text-gray-400"}`}
          >
            {conversation.status.toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between w-full text-sm text-gray-500 font-mono">
          <span>Agent Activity:</span>
          <span
            className={`font-semibold ${conversation.isSpeaking ? "text-black animate-pulse" : "text-gray-400"}`}
          >
            {conversation.isSpeaking ? "SPEAKING" : "LISTENING"}
          </span>
        </div>

        {/* Visual equalizer effect when speaking */}
        {conversation.isSpeaking && (
          <div className="flex items-center gap-1 mt-4 h-8">
            {[40, 80, 50, 90, 60].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-black rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  height: `${h}%`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
