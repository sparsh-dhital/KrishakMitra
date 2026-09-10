import { ArrowLeft, Home, SearchX } from "lucide-react";
import { Button } from "../components/ui";

export default function NotFoundPage({ onBack, onHome }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-5 py-12 text-forest sm:px-8">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-harvest/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />

      <section className="relative w-full max-w-xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-forest text-harvest shadow-xl shadow-forest/20">
          <SearchX className="h-9 w-9" strokeWidth={1.8} />
        </div>
        <p className="mt-8 text-xs font-extrabold uppercase tracking-[.22em] text-brand">
          Page not found
        </p>
        <h1 className="mt-4 font-display text-6xl font-extrabold tracking-tight text-forest sm:text-8xl">
          404
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-muted sm:text-lg">
          This path does not lead anywhere yet. Let&apos;s get you back to the
          KrishakMitra workspace.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="primary" onClick={onHome} className="gap-2">
            <Home className="h-4 w-4" />
            Go to home
          </Button>
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go back
          </Button>
        </div>
      </section>
    </main>
  );
}
