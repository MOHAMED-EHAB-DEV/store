"use client";

import {useState} from 'react'
import Profile from "@/components/Dashboard/Settings/Profile";
import {capitalizeFirstChar} from "@/lib/utils";
import ChangePassword from "@/components/Dashboard/Settings/ChangePassword";
import Settings from "@/components/Dashboard/Settings/Settings";

const Cases = ["profile", "change-password", "settings",];

const SettingsContainer = ({user}:{user:IUser}) => {
    const [selectedSection, setSelectedSection] = useState("profile");

    const renderSection = () => {
        switch (selectedSection) {
            case "settings":
                return <Settings userId={user._id as string} />;
            case "change-password":
                return <ChangePassword user={user} />;
            case "profile":
                return <Profile user={user}/>;
            default:
                return <Profile user={user}/>
        }
    }

    return (
        <div className="flex flex-col gap-1 p-8">
            <div className="flex flex-col pb-5 border-b-2 border-b-white/10">
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p></p>
            </div>
            <div className="flex items-center border-b border-b-white/10 bg-dark mt-5">
                {Cases.map((section, index) => (
                    <div onClick={() => setSelectedSection(section)} key={index} className={`w-1/3 flex cursor-pointer items-center p-2 justify-center border transition-all rounded-sm ${section === selectedSection ? "border-white font-bold text-white" : "border-white/10 font-medium text-secondary"}`}>
                        {capitalizeFirstChar(section)}
                    </div>
                ))}
            </div>

            {renderSection()}
        </div>
    )
}
export default SettingsContainer
