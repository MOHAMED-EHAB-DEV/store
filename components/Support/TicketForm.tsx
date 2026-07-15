"use client";

import { useUser } from "@/context/UserContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SUPPORT_CATEGORIES } from "@/constants/support";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";

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
  const [subject, setSubject] = useState(searchParams?.get("subject") || "");
  const [description, setDescription] = useState(searchParams?.get("message") || "");
  const [category, setCategory] = useState(searchParams?.get("category") || "general");
  const [priority, setPriority] = useState("medium");

  useEffect(() => {
    const ticket = sessionStorage.getItem("ticket");
    if (ticket) {
      const parsed = JSON.parse(ticket);
      if (parsed.subject) setSubject(parsed.subject);
      if (parsed.description) setDescription(parsed.description);
      if (parsed.category) setCategory(parsed.category);
      if (parsed.priority) setPriority(parsed.priority);
      sessionStorage.removeItem("ticket");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = { subject, description, category, priority };

    if (!user) {
      sessionStorage.setItem("ticket", JSON.stringify(payload));
      router.push("/login?message=unauthorized&url=/support");
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      <Input
        label="Subject"
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Brief summary of your issue"
        maxLength={200}
        isRequired
        classNames={{
          inputWrapper: "rounded-xl border border-white/10 bg-white/5 focus-within:ring-purple-500/50 focus-within:border-transparent"
        }}
      />

      {/* Category & Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Select
            label="Category"
            labelPlacement="outside"
            selectedKeys={category ? [category] : []}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Select category"
            classNames={{
              trigger: "w-full h-auto rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent",
              popoverContent: "bg-[#15161b] border-white/10 text-white"
            }}
          >
            {SUPPORT_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div>
          <Select
            label="Priority"
            labelPlacement="outside"
            selectedKeys={priority ? [priority] : []}
            onChange={(e) => setPriority(e.target.value)}
            placeholder="Select priority"
            classNames={{
              trigger: "w-full h-auto rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent",
              popoverContent: "bg-[#15161b] border-white/10 text-white"
            }}
          >
            {priorities.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Description */}
      <div className="w-full">
        <Textarea
          label="Description"
          isRequired
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Please describe your issue in detail..."
          rows={6}
          classNames={{
            inputWrapper: "rounded-xl",
            input: "py-3"
          }}
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
