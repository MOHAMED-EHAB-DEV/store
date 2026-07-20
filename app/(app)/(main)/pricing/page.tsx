import { buildMetadata } from "@/lib/seo";
import GSAPInitializer from "@/components/home/GSAPInitializer";
import Header from "@/components/pricing/Header";
import PricingCards from "@/components/pricing/PricingCards";
import CompareFeatures from "@/components/pricing/CompareFeatures";
import CTA from "@/components/shared/CTA";

export const metadata = buildMetadata({
  title: "Premium Templates & Custom Next.js Development Pricing | MHD Store",
  description: "View pricing plans for premium React and Tailwind CSS web templates, and get a quote for our custom Next.js development services with limited slots.",
  path: "/pricing",
  screenshotName: "pricing"
});

const Page = () => {
  return (
    <div className="relative min-h-screen text-white overflow-hidden py-36 font-inter">
      <GSAPInitializer />
      
      {/* Background elements */}
      <div className="fixed inset-0 bg-[#0A0A0B] -z-50 overflow-hidden pointer-events-none">
        <div className="absolute top-[0%] left-[10%] w-[30%] h-[30%] bg-purple-600/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-pink-600/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <Header />
        <PricingCards />
        <CompareFeatures />
        <CTA />
      </div>
    </div>
  );
};

export default Page;