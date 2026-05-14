import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground">
        <Sparkles className="size-4" />
        Next.js 15 · TypeScript · Tailwind v4 · shadcn/ui
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        AI Cliché Remover
      </h1>
      <p className="max-w-md text-balance text-muted-foreground">
        Paste text, get every AI cliché and tell-tale phrase highlighted, with
        one-click rewrites. The scaffold is ready — start building.
      </p>
      <div className="flex gap-3">
        <Button>Get started</Button>
        <Button variant="outline" asChild>
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Docs
          </a>
        </Button>
      </div>
    </main>
  );
}
