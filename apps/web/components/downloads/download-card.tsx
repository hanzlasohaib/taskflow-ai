import { Download } from "lucide-react";

import type { DownloadArtifact } from "@/lib/downloads";

type Props = {
  artifact: DownloadArtifact & { available?: boolean };
};

export function DownloadCard({ artifact }: Props) {
  const available = artifact.available !== false;

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card/70 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{artifact.platform}</p>
          <h3 className="mt-1 text-base font-semibold text-foreground">{artifact.title}</h3>
        </div>
        {artifact.recommended ? (
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary uppercase">
            Recommended
          </span>
        ) : null}
      </div>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{artifact.description}</p>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div>
          <dt className="font-medium text-foreground/80">Version</dt>
          <dd>{artifact.version}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground/80">Size</dt>
          <dd>{artifact.sizeLabel}</dd>
        </div>
      </dl>
      {available ? (
        <a
          href={artifact.href}
          download={artifact.fileName}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Download className="h-4 w-4" aria-hidden />
          Download {artifact.fileName}
        </a>
      ) : (
        <p className="mt-5 rounded-xl border border-dashed border-border px-4 py-2.5 text-center text-sm text-muted-foreground">
          Build not published yet — run <code className="text-foreground">pnpm sync:downloads</code> after creating
          the APK.
        </p>
      )}
    </article>
  );
}
