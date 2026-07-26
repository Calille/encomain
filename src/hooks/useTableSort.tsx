import { useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

export type SortDirection = "asc" | "desc";

export interface SortState<K extends string> {
  key: K | null;
  direction: SortDirection | null;
}

/**
 * Three-click column sort: asc → desc → clear (default order).
 */
export function useTableSort<K extends string>() {
  const [sort, setSort] = useState<SortState<K>>({ key: null, direction: null });

  const cycleSort = (key: K) => {
    setSort((prev) => {
      if (prev.key !== key) {
        return { key, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      return { key: null, direction: null };
    });
  };

  return { sort, cycleSort };
}

export function compareValues(
  a: string | number | null | undefined,
  b: string | number | null | undefined,
  direction: SortDirection
): number {
  const empty = direction === "asc" ? 1 : -1;
  if (a == null || a === "") {
    if (b == null || b === "") return 0;
    return empty;
  }
  if (b == null || b === "") return -empty;

  let result = 0;
  if (typeof a === "number" && typeof b === "number") {
    result = a - b;
  } else {
    result = String(a).localeCompare(String(b), "en-GB", {
      numeric: true,
      sensitivity: "base",
    });
  }
  return direction === "asc" ? result : -result;
}

export function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection | null;
}) {
  const className = "ml-1 inline h-3.5 w-3.5 shrink-0 opacity-70";
  if (!active || !direction) {
    return <ArrowUpDown className={className} strokeWidth={1.5} />;
  }
  if (direction === "asc") {
    return <ArrowUp className={className} strokeWidth={1.5} />;
  }
  return <ArrowDown className={className} strokeWidth={1.5} />;
}
