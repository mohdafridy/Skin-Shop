import Link from "next/link";
import { adminLogoutAction } from "./actions";

export default function AdminHeader({ title }: { title: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-gold/20 pb-5">
      <div>
        <Link href="/admin" className="text-xs font-semibold uppercase tracking-[0.2em] text-burgundy">
          The Skin Shop — Admin
        </Link>
        <h1 className="mt-1 font-display text-3xl text-ink">{title}</h1>
      </div>
      <form action={adminLogoutAction}>
        <button
          type="submit"
          className="rounded-full border border-ink px-5 py-2 text-sm font-medium text-ink transition hover:bg-ink hover:text-ivory"
        >
          Sign Out
        </button>
      </form>
    </div>
  );
}
