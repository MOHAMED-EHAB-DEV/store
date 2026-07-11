"use client";

import { useUser } from "@/context/UserContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SUPPORT_CATEGORIES } from "@/constants/support";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TicketFormProps {
  onSuccess?: () => void;
}

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function TicketForm({ onSuccess }: TicketFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: searchParams?.get("subject") || "",
    description: searchParams?.get("message") || "",
    category: searchParams?.get("category") || "general",
    priority: "medium",
  });

  useEffect(() => {
    const ticket = sessionStorage.getItem("ticket");
    if (ticket) {
      setFormData(JSON.parse(ticket));
      sessionStorage.removeItem("ticket");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user) {
      sessionStorage.setItem("ticket", JSON.stringify(formData));
      router.push("/login?message=unauthorized&url=/support");
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create ticket");
      }

      toast.success("Ticket created successfully");
      onSuccess?.();
      router.push(`/dashboard/support/${data.data._id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Subject <span className="text-red-400">*</span>
        </label>
        <Input
          type="text"
          value={formData.subject}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, subject: e.target.value }))
          }
          placeholder="Brief summary of your issue"
          className="w-full h-auto rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:border-transparent"
          maxLength={200}
        />
      </div>

      {/* Category & Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Category
          </label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, category: value }))
            }
          >
            <SelectTrigger className="w-full h-auto rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-[#15161b] border-white/10 text-white">
              {SUPPORT_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Priority
          </label>
          <Select
            value={formData.priority}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, priority: value }))
            }
          >
            <SelectTrigger className="w-full h-auto rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent className="bg-[#15161b] border-white/10 text-white">
              {priorities.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Description <span className="text-red-400">*</span>
        </label>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Please describe your issue in detail..."
          rows={6}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:border-transparent resize-none"
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full btn btn-primary disabled:opacity-50"
      >
        {isSubmitting ? "Creating Ticket..." : "Create Support Ticket"}
      </Button>
    </form>
  );
}
