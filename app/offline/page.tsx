import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <WifiOff className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">You&apos;re offline</h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            Please check your internet connection and try again. Some features may be limited
            while offline.
          </p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Button asChild>
            <Link href="/">Try again</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
