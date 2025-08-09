"use client";

import revalidate from "@/actions/revalidateTag";
import {Button} from "@/components/ui/button";

const Page = () => {
    return (
        <div>
            <Button className="btn btn-primary" onClick={async () => await revalidate("/")}>Refresh Home Page</Button>
        </div>
    )
}
export default Page
