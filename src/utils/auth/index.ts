// TODO: https://github.com/saasykits/next-lucia-auth/blob/ab6acd77fb3c699b659554cce6e60aa9e9ce0d4d/src/lib/auth/actions.ts
// https://lucia-auth.com/getting-started/nextjs-app

import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { type User } from "@prisma/client";
import { Google } from "arctic";
import { Lucia, TimeSpan } from "lucia";

import { env } from "~/env";
import { db } from "~/server/db";

const adapter = new PrismaAdapter(db.session, db.user);

export const lucia = new Lucia(adapter, {
  getSessionAttributes: (/* attributes */) => {
    return {};
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      email: attributes.email,
      emailVerified: attributes.emailVerified,
      createdAt: attributes.createdAt,
      updatedAt: attributes.updatedAt,
    };
  },
  sessionExpiresIn: new TimeSpan(30, "d"),
  sessionCookie: {
    name: "session",

    expires: false, // session cookies have very long lifespan (2 years)
    attributes: {
      secure: env.NODE_ENV === "production",
    },
  },
});

export const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI,
);

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

type DatabaseUserAttributes = Omit<User, "hashedPassword">;
