import {Suspense} from "react";
import SettingsContainer from "@/components/Dashboard/Settings/SettingsContainer";
import {authenticateUser} from "@/middleware/auth";
import Loader from "@/components/ui/Loader";

const Page = async () => {
    const user = await authenticateUser();
    return <Suspense fallback={<Loader />}><SettingsContainer user={user!} /></Suspense>;
}
export default Page;