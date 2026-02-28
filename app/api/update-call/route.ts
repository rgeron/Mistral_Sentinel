import { NextResponse } from "next/server";
import Pusher from "pusher";

// Initialize Pusher only if we have the credentials
const getPusherInstance = () => {
  if (
    !process.env.PUSHER_APP_ID ||
    !process.env.NEXT_PUBLIC_PUSHER_KEY ||
    !process.env.PUSHER_SECRET
  ) {
    return null;
  }

  return new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1",
    useTLS: true,
  });
};

const pusher = getPusherInstance();

export async function POST(request: Request) {
  try {
    // Parse the incoming JSON body from ElevenLabs Server Tool
    const body = await request.json();
    console.log("Received webhook from ElevenLabs:", body);

    // If Pusher is not configured, we still want to return 200 so ElevenLabs doesn't retry/fail
    if (!pusher) {
      console.warn(
        "Pusher credentials missing, cannot trigger event. Check environment variables.",
      );
      return NextResponse.json({
        success: true,
        message: "Received (Pusher not configured)",
      });
    }

    // Add a simple timestamp if not provided
    const dataToSend = {
      ...body,
      timestamp: new Date().toISOString(),
    };

    // Trigger an event on the 'incident-channel'
    // The event name 'incident-update' must match what the client is listening for
    await pusher.trigger("incident-channel", "incident-update", dataToSend);

    // Respond back to ElevenLabs
    return NextResponse.json({ success: true, message: "Live UI updated" });
  } catch (error) {
    console.error("Error handling ElevenLabs webhook:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 },
    );
  }
}
