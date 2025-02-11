import { signup } from "~/utils/auth/actions";

export default async function Page() {
  return (
    <>
      <h1>Create an account</h1>
      <a href="/login/google">Login with Google</a>
      {/* @ts-expect-error action mismatch */}
      <form action={signup}>
        <label htmlFor="email">Email</label>
        <input name="email" id="email" />
        <br />
        <label htmlFor="firstName">First Name</label>
        <input name="firstName" id="firstName" />
        <br />
        <label htmlFor="lastName">Last Name</label>
        <input name="lastName" id="lastName" />
        <br />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
        <br />
        <button>Continue</button>
      </form>
    </>
  );
}
