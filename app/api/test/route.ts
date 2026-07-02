import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "No code provided in URL" }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "http://localhost:3000/api/test" // Must exactly match the authorized redirect URI in GCP console
    );

    console.log("Exchanging code for tokens...");
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log("=========================================");
    console.log("OAUTH TOKENS RESPONSE:");
    console.log(tokens);
    console.log("=========================================");
    console.log("Your Refresh Token is:");
    console.log(tokens.refresh_token);
    console.log("=========================================");

    return NextResponse.json({ 
      message: "Success! Check your terminal for the tokens.",
      refresh_token: tokens.refresh_token || "No refresh token returned (might need to force prompt)"
    });
  } catch (error: any) {
    console.error("Error exchanging code:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
