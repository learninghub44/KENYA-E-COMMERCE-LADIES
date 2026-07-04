import type { ReactNode } from "react";

interface StaticPageProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

function StaticPage({ title, subtitle, children }: StaticPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-semibold prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3 prose-p:text-muted-foreground prose-li:text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

export { StaticPage };
