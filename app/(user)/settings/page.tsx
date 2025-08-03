import SettingsContainer from "@/components/Dashboard/Settings/SettingsContainer";
import {authenticateUser} from "@/middleware/auth";

const Page = async () => {
    const user = await authenticateUser();
    return <SettingsContainer user={user!} />;
}
export default Page;