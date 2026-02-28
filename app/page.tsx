import { Conversation } from "./components/conversation";
import { LiveIncidentSheet } from "./components/live-incident-sheet";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-12 p-8 md:p-24 bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none"></div>

      <div className="z-10 w-full max-w-6xl flex flex-col items-center font-sans tracking-wide">
        <h1 className="text-5xl font-extrabold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 pb-2">
          Emergency Command Center
        </h1>
        <p className="text-gray-400 text-lg mb-12 text-center max-w-2xl">
          AI-powered dispatch system. Initiate a call with the voice agent and
          watch as it extracts critical information in real-time.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-start">
          <div className="flex flex-col gap-6 w-full">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <h3 className="text-xl font-semibold mb-2 text-white flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                Voice Dispatch
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Connect via WebRTC for ultra-low latency interactive voice
                response.
              </p>
              <Conversation />
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-xl">
              <h3 className="text-lg font-semibold mb-3 text-white">
                Integration Setup Guide
              </h3>
              <ul className="text-sm text-gray-400 space-y-3 font-mono">
                <li className="flex gap-2">
                  <span className="text-blue-400">1.</span>
                  <span>
                    Set{" "}
                    <code className="bg-black/30 px-1 rounded text-blue-300">
                      NEXT_PUBLIC_ELEVENLABS_AGENT_ID
                    </code>{" "}
                    in{" "}
                    <code className="bg-black/30 px-1 rounded text-gray-300">
                      .env.local
                    </code>
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">2.</span>
                  <span>
                    Set Pusher credentials in{" "}
                    <code className="bg-black/30 px-1 rounded text-gray-300">
                      .env.local
                    </code>{" "}
                    (APP_ID, KEY, SECRET, CLUSTER)
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">3.</span>
                  <span>
                    Create ElevenLabs Server Tool{" "}
                    <code className="bg-black/30 px-1 rounded text-green-300">
                      update_live_dashboard
                    </code>{" "}
                    pointing to your API route.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col w-full h-full justify-start items-center">
            <LiveIncidentSheet />
          </div>
        </div>
      </div>
    </main>
  );
}
