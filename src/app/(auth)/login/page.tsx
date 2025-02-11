import { login } from "~/utils/auth/actions";

// app/login/page.tsx
export default async function Page() {
  return (
    <>
      <h1>Sign in</h1>
      <a href="/login/google">Login with Google</a>
      {/* @ts-expect-error action mismatch */}
      <form action={login}>
        <label htmlFor="email">Email</label>
        <input name="email" id="email" />
        <br />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
        <br />
        <button>Continue</button>
      </form>
    </>
  );
}
