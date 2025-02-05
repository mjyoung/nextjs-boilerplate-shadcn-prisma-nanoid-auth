import { OAuth2RequestError } from "arctic";
import { cookies } from "next/headers";

import { db } from "~/server/db";
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from "~/utils/auth";
import { google } from "~/utils/auth/providers/google";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const storedState = cookieStore.get("google_oauth_state")?.value ?? null;
  const storedCodeVerifier =
    cookieStore.get("google_oauth_code_verifier")?.value ?? null;

  if (
    !code ||
    !state ||
    !storedCodeVerifier ||
    !storedState ||
    state !== storedState
  ) {
    return new Response(null, {
      status: 400,
      headers: { Location: "/login" },
    });
  }

  try {
    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier,
    );
    const response = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      },
    );
    const googleUser: GoogleUser = await response.json();
    if (!googleUser.email) {
      return new Response(null, {
        status: 400,
        headers: { Location: "/login" },
      });
    }

    const existingUser = await db.user.findUnique({
      where: { email: googleUser.email },
    });

    if (existingUser) {
      const token = generateSessionToken();
      const session = await createSession(token, existingUser.id);
      await setSessionTokenCookie(token, session.expiresAt);
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    }

    const newUser = await db.user.create({
      data: {
        email: googleUser.email,
        emailVerified: true,
        firstName: googleUser.given_name,
        lastName: googleUser.family_name,
      },
    });

    const token = generateSessionToken();
    const session = await createSession(token, newUser.id);
    await setSessionTokenCookie(token, session.expiresAt);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  } catch (e) {
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return new Response(JSON.stringify({ message: "Invalid code" }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify({ message: "internal server error" }), {
      status: 500,
    });
  }
}

interface GoogleUser {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
}
