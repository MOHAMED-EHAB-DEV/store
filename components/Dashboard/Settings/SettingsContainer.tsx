"use client";

import {Suspense, useState} from 'react';
import Profile from "@/components/Dashboard/Settings/Profile";
import {capitalizeFirstChar} from "@/lib/utils";
import ChangePassword from "@/components/Dashboard/Settings/ChangePassword";
import Settings from "@/components/Dashboard/Settings/Settings";
import Loader from "@/components/ui/Loader";
import { IUser } from '@/types';

const Cases = ["profile", "change-password", "settings",];

const SettingsContainer = ({user}: { user: IUser }) => {
    const [selectedSection, setSelectedSection] = useState("profile");

    const renderSection = () => {
        switch (selectedSection) {
            case "settings":
                return <Suspense fallback={<Loader/>}><Settings userId={user._id}/></Suspense>;
            case "change-password":
                return <Suspense fallback={<Loader/>}><ChangePassword user={user}/></Suspense>;
            case "profile":
            default:
                return <Suspense fallback={<Loader/>}><Profile user={user}/></Suspense>;
        }
    };

    const handleTabClick = (section: string) => {
        requestIdleCallback(() => {
            setSelectedSection(section);
        });
    };

    return (
        <div className="flex flex-col gap-1 p-8">
            <div className="flex flex-col pb-5 border-b-2 border-b-white/10">
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p></p>
            </div>
            <div className="flex items-center border-b border-b-white/10 bg-dark mt-5">
                {Cases.map((section, index) => (
                    <div onClick={() => handleTabClick(section)} key={index}
                         className={`w-1/3 flex cursor-pointer items-center p-2 justify-center border transition-all rounded-sm ${section === selectedSection ? "border-white font-bold text-white" : "border-white/10 font-medium text-secondary"}`}>
                        {capitalizeFirstChar(section)}
                    </div>
                ))}
            </div>

            {renderSection()}
        </div>
    )
}
export default SettingsContainer
