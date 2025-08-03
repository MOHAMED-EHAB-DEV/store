import UpdateProfile from "./UpdateProfile";

const Profile = ({user} : {user:IUser}) => {
    return (
        <div className="flex flex-col pt-5 gap-8">
            <div className="flex flex-col justify-center gap-2 pb-4 border-b border-b-white/10">
                <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
                <p className="text-md font-medium text-secondary">Update your Profile Settings</p>
            </div>

            {/*<div className=""></div>*/}
            <UpdateProfile user={user} />
        </div>
    )
}
export default Profile;