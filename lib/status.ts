export type Status = "PASS" | "FLAGGED" | "FAILING" | "INFO";

export const STATUS_LABEL: Record<Status, string> = {
  PASS: "Pass",
  FLAGGED: "Flagged",
  FAILING: "Failing",
  INFO: "Info",
};

export const STATUS_ORDER: Status[] = ["FAILING", "FLAGGED", "INFO", "PASS"];

export function worstStatus(statuses: Status[]): Status {
  for (const s of STATUS_ORDER) {
    if (statuses.includes(s)) return s;
  }
  return "INFO";
}
