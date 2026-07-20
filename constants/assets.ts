import { Instagram } from "@/components/ui/svgs/icons/Instagram";
import { Linkedin } from "@/components/ui/svgs/icons/Linkedin";

export const socialImgs = [
  { name: "Instagram", Icon: Instagram, link: "https://www.instagram.com/__m4_e__/" },
  { name: "Linkedin", Icon: Linkedin, link: "https://www.linkedin.com/in/1-mohammed" },
] as const;

export const Gradients = [
  "from-blue-500 via-purple-500 to-pink-500",
  "from-green-500 via-teal-500 to-blue-500",
  "from-orange-500 via-red-500 to-pink-500",
  "from-purple-500 via-indigo-500 to-blue-500",
] as const;

export const Icons = ["Zap", "ExternalLink", "Palette", "Code"] as const;
