import Link from "next/link";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold tracking-tighter text-primary">404</h1>
          <h2 className="text-2xl font-semibold tracking-tight">Page not found</h2>
          <p className="mx-auto max-w-md text-muted-foreground">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been
            removed, renamed, or doesn&apos;t exist.
          </p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/categories">Browse categories</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
