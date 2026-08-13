"use client";

import { useActionState, useState } from "react";
import Field from "@/components/Field";
import { adminLoginAction, type AdminLoginState } from "./actions";

const initialState: AdminLoginState = null;

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(adminLoginAction, initialState);
  const [key, setKey] = useState("");
  return (
    <form action={formAction} className="space-y-4">
      <Field label="Admin key" id="key" type="password" value={key} onChange={setKey} autoComplete="off" />
      {state?.error && (
        <p role="alert" className="rounded-xl bg-burgundy/10 p-3 text-sm text-burgundy">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-burgundy px-7 py-3.5 text-sm font-medium text-ivory transition hover:bg-burgundy-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Checking…" : "Sign In"}
      </button>
    </form>
  );
}
