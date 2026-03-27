"use client";
import { updateTag } from "next/cache";
import { Button } from "@/components/ui/button";

const Page = () => {
  return (
    <div>
      <Button
        className="btn btn-primary"
        onClick={async () => updateTag("home")}
      >
        Refresh Home Page
      </Button>
      <Button
        className="btn btn-secondary"
        onClick={async () => updateTag("blogs")}
      >
        Refresh Blog Page
      </Button>
    </div>
  );
};
export default Page;