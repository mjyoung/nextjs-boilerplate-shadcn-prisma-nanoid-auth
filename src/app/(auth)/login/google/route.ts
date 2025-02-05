import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";

import { env } from "~/env";
import { google } from "~/utils/auth/providers/google";

export async function GET(): Promise<Response> {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const url = google.createAuthorizationURL(state, codeVerifier, [
    "profile",
    "email",
  ]);

  const cookieStore = await cookies();

  cookieStore.set("google_oauth_state", state, {
    path: "/",
    secure: env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  cookieStore.set("google_oauth_code_verifier", codeVerifier, {
    path: "/",
    secure: env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  return Response.redirect(url);
}
