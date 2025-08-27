import ComingSoon from '@/components/shared/ComingSoon'
import React from 'react'

const Page = () => {
    return (
        <div className='my-24'>
            <ComingSoon
                title="Blog Launch Countdown"
                description="Our exclusive blog is almost here! Discover stories, tips, and insights designed to spark your creativity and elevate your journey. Stay tuned for the grand reveal!"
                dateUnlocked={new Date("2025-09-09T12:00:00Z")}
            />
        </div>
    )
}
export default Page
