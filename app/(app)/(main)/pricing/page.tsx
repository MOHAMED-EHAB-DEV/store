import Pricing from "@/components/home/Pricing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | MHD Store",
  description: "View pricing plans for premium web templates at MHD Store.",
  alternates: {
    canonical: "https://mhd-store.vercel.app/pricing",
  },
};

const Page = () => {
  return (
    <div className="py-36 max-w-6xl mx-auto">
      <Pricing />
    </div>
  );
};

export default Page;