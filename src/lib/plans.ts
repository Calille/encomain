export type PlanId = "essential" | "professional" | "signature" | "bespoke";

export const PLAN_OPTIONS: { value: PlanId | ""; label: string }[] = [
  { value: "", label: "No plan" },
  { value: "essential", label: "Essential" },
  { value: "professional", label: "Professional" },
  { value: "signature", label: "Signature" },
  { value: "bespoke", label: "Bespoke" },
];

export function formatPlanLabel(plan: string | null | undefined): string {
  if (!plan) return "No plan";
  const match = PLAN_OPTIONS.find((p) => p.value === plan);
  if (match?.label) return match.label;
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}
