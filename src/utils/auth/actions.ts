"use server";

import { redirect } from "next/navigation";
// import { z } from "zod";

// import { env } from "~/env";
import { db } from "~/server/db";
import {
  createSession,
  deleteSessionTokenCookie,
  generateSessionToken,
  getCurrentSession,
  invalidateSession,
  setSessionTokenCookie,
} from "~/utils/auth";
import { hashPassword, verifyPasswordHash } from "~/utils/auth/password";
import {
  loginSchema,
  signupSchema,
  // resetPasswordSchema,
} from "~/utils/auth/validators";

export interface ActionResult {
  error?: string;
}

export async function login(
  // _: any,
  formData: FormData,
): Promise<ActionResult> {
  const obj = Object.fromEntries(formData.entries());

  const parsed = loginSchema.safeParse(obj);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      error: err.fieldErrors.email?.[0] ?? err.fieldErrors.password?.[0],
    };
  }

  const { email, password } = parsed.data;

  const existingUser = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, hashedPassword: true },
  });

  if (!existingUser) {
    return {
      error: "Incorrect email or password",
    };
  }

  if (!existingUser?.hashedPassword) {
    return {
      error: "Incorrect email or password",
    };
  }

  const validPassword = await verifyPasswordHash(
    existingUser.hashedPassword,
    password,
  );

  if (!validPassword) {
    throw new Error("Incorrect email or password");
  }

  const token = generateSessionToken();
  const session = await createSession(token, existingUser.id);
  await setSessionTokenCookie(token, session.expiresAt);
  return redirect("/");
}

export async function signup(
  // _: any,
  formData: FormData,
): Promise<ActionResult> {
  const obj = Object.fromEntries(formData.entries());

  const parsed = signupSchema.safeParse(obj);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      error: err.fieldErrors.email?.[0] ?? err.fieldErrors.password?.[0],
    };
  }

  const { email, password, firstName, lastName } = parsed.data;

  const existingUser = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, hashedPassword: true },
  });

  if (existingUser) {
    console.error("Cannot create account with that email");
    return {
      error: "Cannot create account with that email",
    };
  }

  const hashedPassword = await hashPassword(password);
  const user = await db.user.create({
    data: {
      email,
      hashedPassword,
      firstName,
      lastName,
    },
  });

  const token = generateSessionToken();
  const session = await createSession(token, user.id);
  await setSessionTokenCookie(token, session.expiresAt);

  return redirect("/");
}

export async function logout(): Promise<void> {
  const { session } = await getCurrentSession();
  if (session) {
    await invalidateSession(session.id);
    await deleteSessionTokenCookie();
  }

  return redirect("/");
}

// export async function resendVerificationEmail(): Promise<{
//   error?: string;
//   success?: boolean;
// }> {
//   const { user } = await getCurrentSession();
//   if (!user) {
//     return redirect("/login");
//   }
//   const lastSent = await db.query.emailVerificationCodes.findFirst({
//     where: (table, { eq }) => eq(table.userId, user.id),
//     columns: { expiresAt: true },
//   });

//   if (lastSent && isWithinExpirationDate(lastSent.expiresAt)) {
//     return {
//       error: `Please wait ${timeFromNow(lastSent.expiresAt)} before resending`,
//     };
//   }
//   const verificationCode = await generateEmailVerificationCode(
//     user.id,
//     user.email,
//   );
//   await sendMail(user.email, EmailTemplate.EmailVerification, {
//     code: verificationCode,
//   });

//   return { success: true };
// }

// export async function verifyEmail(
//   _: any,
//   formData: FormData,
// ): Promise<{ error: string } | void> {
//   const code = formData.get("code");
//   if (typeof code !== "string" || code.length !== 8) {
//     return { error: "Invalid code" };
//   }
//   const { user } = await getCurrentSession();
//   if (!user) {
//     return redirect(Paths.Login);
//   }

//   const dbCode = await db.transaction(async (tx) => {
//     const item = await tx.query.emailVerificationCodes.findFirst({
//       where: (table, { eq }) => eq(table.userId, user.id),
//     });
//     if (item) {
//       await tx
//         .delete(emailVerificationCodes)
//         .where(eq(emailVerificationCodes.id, item.id));
//     }
//     return item;
//   });

//   if (!dbCode || dbCode.code !== code)
//     return { error: "Invalid verification code" };

//   if (!isWithinExpirationDate(dbCode.expiresAt))
//     return { error: "Verification code expired" };

//   if (dbCode.email !== user.email) return { error: "Email does not match" };

//   await lucia.invalidateUserSessions(user.id);
//   await db
//     .update(users)
//     .set({ emailVerified: true })
//     .where(eq(users.id, user.id));
//   const session = await lucia.createSession(user.id, {});
//   const sessionCookie = lucia.createSessionCookie(session.id);
//   cookies().set(
//     sessionCookie.name,
//     sessionCookie.value,
//     sessionCookie.attributes,
//   );
//   redirect(Paths.Dashboard);
// }

// export async function sendPasswordResetLink(
//   _: any,
//   formData: FormData,
// ): Promise<{ error?: string; success?: boolean }> {
//   const email = formData.get("email");
//   const parsed = z.string().trim().email().safeParse(email);
//   if (!parsed.success) {
//     return { error: "Provided email is invalid." };
//   }
//   try {
//     const user = await db.query.users.findFirst({
//       where: (table, { eq }) => eq(table.email, parsed.data),
//     });

//     if (!user || !user.emailVerified)
//       return { error: "Provided email is invalid." };

//     const verificationToken = await generatePasswordResetToken(user.id);

//     const verificationLink = `${env.NEXT_PUBLIC_APP_URL}/reset-password/${verificationToken}`;

//     await sendMail(user.email, EmailTemplate.PasswordReset, {
//       link: verificationLink,
//     });

//     return { success: true };
//   } catch (error) {
//     return { error: "Failed to send verification email." };
//   }
// }

// export async function resetPassword(
//   _: any,
//   formData: FormData,
// ): Promise<{ error?: string; success?: boolean }> {
//   const obj = Object.fromEntries(formData.entries());

//   const parsed = resetPasswordSchema.safeParse(obj);

//   if (!parsed.success) {
//     const err = parsed.error.flatten();
//     return {
//       error: err.fieldErrors.password?.[0] ?? err.fieldErrors.token?.[0],
//     };
//   }
//   const { token, password } = parsed.data;

//   const dbToken = await db.transaction(async (tx) => {
//     const item = await tx.query.passwordResetTokens.findFirst({
//       where: (table, { eq }) => eq(table.id, token),
//     });
//     if (item) {
//       await tx
//         .delete(passwordResetTokens)
//         .where(eq(passwordResetTokens.id, item.id));
//     }
//     return item;
//   });

//   if (!dbToken) return { error: "Invalid password reset link" };

//   if (!isWithinExpirationDate(dbToken.expiresAt))
//     return { error: "Password reset link expired." };

//   await lucia.invalidateUserSessions(dbToken.userId);
//   const hashedPassword = await new Scrypt().hash(password);
//   await db
//     .update(users)
//     .set({ hashedPassword })
//     .where(eq(users.id, dbToken.userId));
//   const session = await lucia.createSession(dbToken.userId, {});
//   const sessionCookie = lucia.createSessionCookie(session.id);
//   cookies().set(
//     sessionCookie.name,
//     sessionCookie.value,
//     sessionCookie.attributes,
//   );
//   redirect(Paths.Dashboard);
// }

// const _timeFromNow = (time: Date) => {
//   const now = new Date();
//   const diff = time.getTime() - now.getTime();
//   const minutes = Math.floor(diff / 1000 / 60);
//   const seconds = Math.floor(diff / 1000) % 60;
//   return `${minutes}m ${seconds}s`;
// };

// async function _generateEmailVerificationCode(
//   userId: string,
//   email: string,
// ): Promise<string> {
//   await db
//     .delete(emailVerificationCodes)
//     .where(eq(emailVerificationCodes.userId, userId));
//   const code = generateRandomString(8, alphabet("0-9")); // 8 digit code
//   await db.insert(emailVerificationCodes).values({
//     userId,
//     email,
//     code,
//     expiresAt: createDate(new TimeSpan(10, "m")), // 10 minutes
//   });
//   return code;
// }

// async function generatePasswordResetToken(userId: string): Promise<string> {
//   await db
//     .delete(passwordResetTokens)
//     .where(eq(passwordResetTokens.userId, userId));
//   const tokenId = generateId(40);
//   await db.insert(passwordResetTokens).values({
//     id: tokenId,
//     userId,
//     expiresAt: createDate(new TimeSpan(2, "h")),
//   });
//   return tokenId;
// }
