export type StepKey = "buy" | "download" | "setup" | "customize" | "launch";

export interface Step {
  key: StepKey;
  title: string;
  description: string;
  color: string; // hex, drives node/glow fill — keep in sync with your existing gradient accents
  optional?: boolean;
}
