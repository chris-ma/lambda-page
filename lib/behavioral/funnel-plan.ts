export type FunnelStageMatcher =
  | { type: "pageview" }
  | { type: "scroll"; depth: 25 | 50 | 75 | 100 }
  | { type: "cta_click"; selector: string }
  | { type: "form_focus"; field: string }
  | { type: "form_submit" };

export type FunnelStageDef = {
  id: string;
  label: string;
  matcher: FunnelStageMatcher;
  rationale: string;
};
