import type { TrustStatus } from "@/lib/vouch";

export function TrustChip({ status }: { status: TrustStatus }) {
  if (status === "trusted") {
    return (
      <span
        className="chip bg-canopy-100 text-canopy-900 dark:bg-canopy-900/60 dark:text-canopy-100"
        title="This member has at least two valid vouches."
      >
        <span aria-hidden="true" className="mr-1">
          {"\u{2714}"}
        </span>
        Trusted
      </span>
    );
  }
  return (
    <span
      className="chip bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
      title="Fewer than two vouches so far. They can still post needs and offers."
    >
      <span aria-hidden="true" className="mr-1">
        {"\u{231B}"}
      </span>
      Pending trust
    </span>
  );
}
