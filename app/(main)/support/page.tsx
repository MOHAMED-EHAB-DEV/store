import ComingSoon from '@/components/shared/ComingSoon'
import React from 'react'

const Page = () => {
    return (
        <div className='my-24'>
            <ComingSoon
                title="Support Launch Countdown"
                description="We're building a dedicated support hub to assist you every step of the way. Get ready for faster answers, expert guidance, and a seamless experience. Your support journey begins soon!"
                dateUnlocked={new Date("2025-09-09T12:00:00Z")}
            />
        </div>
    )
}
export default Page
