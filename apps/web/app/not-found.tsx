export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        That route does not exist. Head back to TaskFlow to continue.
      </p>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- keep not-found free of next/link */}
      <a
        href="/"
        className="mt-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Go home
      </a>
    </main>
  );
}
