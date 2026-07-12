export interface SupportCategory {
  value: string;
  label: string;
  description: string;
}

export const SUPPORT_CATEGORIES: SupportCategory[] = [
  { value: "general", label: "General Inquiry", description: "Questions about our templates and platform" },
  { value: "billing", label: "Billing & Payments", description: "Payment issues, invoices, and refunds" },
  { value: "technical", label: "Technical Issue", description: "Help with template bugs or site issues" },
  { value: "account", label: "Account Related", description: "Login, password, profile, and download access" },
  { value: "custom-build", label: "Custom Build", description: "Request to build a custom template" },
  { value: "template-customization", label: "Template Customization", description: "Requests for customizing your purchased templates" },
  { value: "other", label: "Other", description: "Any other queries or general feedback" },
];
