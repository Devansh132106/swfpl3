import { GROUP_LABELS } from "@/config/auctionRules";
import type { PlayerGroup } from "@/lib/auction/types";

interface Props {
  activeGroup: PlayerGroup | null;
  auctionRound: number;
  auctionComplete: boolean;
  remainingInGroup: number;
  unsoldCount: number;
}

export function GroupPhaseBar({
  activeGroup, auctionRound, auctionComplete, remainingInGroup, unsoldCount,
}: Props) {
  if (!activeGroup) return null;

  return (
    <div className="glass-strong rounded-2xl px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Current Phase</div>
          <div className="font-display text-lg font-bold text-[oklch(0.85_0.18_150)]">
            {GROUP_LABELS[activeGroup]}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>Round <strong className="text-foreground">{auctionRound}</strong></span>
          <span>Left in group: <strong className="text-foreground">{remainingInGroup}</strong></span>
          {unsoldCount > 0 && (
            <span>Unsold total: <strong className="text-destructive">{unsoldCount}</strong></span>
          )}
        </div>
      </div>
      {auctionComplete && (
        <div className="mt-2 rounded-lg bg-[oklch(0.7_0.2_150)]/20 px-3 py-1.5 text-center text-sm font-semibold text-[oklch(0.85_0.18_150)]">
          All players sold — auction complete
        </div>
      )}
      {!auctionComplete && unsoldCount > 0 && remainingInGroup === 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          Unsold players will return in the next round until everyone is sold.
        </div>
      )}
    </div>
  );
}
