import { NextResponse } from "next/server"

export async function POST() {
  // In a production app, invalidate the token server-side (e.g. blocklist/redis).
  // For dev, the client just removes the token from localStorage.
  return NextResponse.json({ success: true })
}
