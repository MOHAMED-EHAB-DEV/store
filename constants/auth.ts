export const passwordRequirements = (password: string) => [
  { text: "At least 8 characters", met: password.length >= 8 },
  { text: "Contains uppercase letter", met: /[A-Z]/.test(password) },
  { text: "Contains lowercase letter", met: /[a-z]/.test(password) },
  { text: "Contains number", met: /\d/.test(password) },
] as const;

export const whatLoseWhenDeleteMyAccount = [
  "You'll lose all your purchased template.",
  "You won't be able to access your order history or download links.",
  "You’ll lose access to your saved template and account-related features.",
] as const;
