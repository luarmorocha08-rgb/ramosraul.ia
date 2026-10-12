import "server-only";

export type AiMode = "live" | "demo";

const EFFORTS = ["low", "medium", "high"] as const;
type Effort = (typeof EFFORTS)[number];

export const aiConfig = {
  get mode(): AiMode {
    return process.env.ANTHROPIC_API_KEY ? "live" : "demo";
  },
  model: process.env.ANTHROPIC_MODEL?.trim() || "claude-opus-5-5",
  effort: (EFFORTS as readonly string[]).includes(process.env.ANTHROPIC_EFFORT ?? "")
    ? (process.env.ANTHROPIC_EFFORT as Effort)
    : ("low" as Effort),
  perMinute: Number(process.env.AI_RATE_LIMIT_PER_MINUTE) || 8,
  perSessionDaily: Number(process.env.AI_DAILY_REQUESTS_PER_SESSION) || 40,
  globalDaily: Number(process.env.AI_GLOBAL_DAILY_LIMIT) || 2000,
};
