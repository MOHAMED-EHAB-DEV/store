import Pricing from "@/components/home/Pricing";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Pricing | MHD Store",
  description: "View pricing plans for premium web templates at MHD Store.",
  path: "/pricing",
  screenshotName: "pricing"
});

const Page = () => {
  return (
    <div className="py-36 max-w-6xl mx-auto">
      <Pricing />
    </div>
  );
};

export default Page;