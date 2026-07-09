"use client";
import revalidate from "@/actions/revalidateTag";
import { Button } from "@/components/ui/button";

const Page = () => {
  return (
    <div>
      <Button
        className="btn btn-primary"
        onClick={async () => revalidate("/")}
      >
        Refresh Home Page
      </Button>
      <Button
        className="btn border border-white/20 hover:border-white/40 bg-transparent hover:bg-white/10 backdrop-blur-sm"
        onClick={async () => revalidate("/blogs")}
      >
        Refresh Blog Page
      </Button>
    </div>
  );
};
export default Page;