"use client";
import { updateTag } from "next/cache";
import { Button } from "@/components/ui/button";

const Page = () => {
  return (
    <div>
      <Button
        className="btn btn-primary"
        onClick={async () => updateTag("/")}
      >
        Refresh Home Page
      </Button>
    </div>
  );
};
export default Page;