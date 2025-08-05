"use client";

import revalidate from "@/actions/revalidateTag";

const Page = () => {
    return (
        <div>
            <button className="btn btn-primary" onClick={() => revalidate("/")}>Refresh Home Page</button>
        </div>
    )
}
export default Page
