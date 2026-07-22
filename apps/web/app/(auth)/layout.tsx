import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-12">
      <div className="space-y-1">
        <Link href="/" className="text-sm font-semibold tracking-wide text-teal-700 uppercase">
          TaskFlow
        </Link>
        <p className="text-sm text-slate-500">
          Placeholder auth UI — final styling waits for Figma Design Gate D.05.
        </p>
      </div>
      {children}
    </div>
  );
}
