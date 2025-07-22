import React from 'react'
import {cn} from "@/lib/utils";

const Logo = ({ onClick, className="" } : { onClick?: () => void, className?: string, }) => {
    return (
        <div
            className={cn("flex items-center justify-start p-2 h-10 gap-1 hover:rotate-360 cursor-pointer", className)}
            onClick={onClick ? onClick : undefined}
        >
            <div className="w-[10px] h-full bg-white" />
            <div className="flex w-full h-full flex-col gap-1">
                <div className="w-3 h-3 bg-white" />
                <div className="w-3 h-3 bg-white" />
            </div>
        </div>
    )
}
export default Logo
