"use client";

import {useState, useRef, ChangeEvent} from "react";
import Image from "next/image";
import {useUploadThing} from "@/hooks/useUploadthing";
import {toast} from "sonner";
import {isBase64Image} from "@/lib/utils";
import Loader from "@/components/ui/Loader";
import {useRouter} from "next/navigation";
import {User} from "@/components/ui/svgs/Icons";
import {Dropzone, DropzoneContent, DropzoneEmptyState} from '@/components/ui/kibo-ui/dropzone';

const UpdateProfile = ({user}: { user: IUser }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [error, setError] = useState(false);
    const InputRef = useRef<HTMLInputElement | null>(null);
    const [image, setImage] = useState(user?.avatar === "" ? "/assets/Icons/profile.svg" : user?.avatar as string);
    const [name, setName] = useState(user?.name);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const [filePreview, setFilePreview] = useState<string | undefined>();

    const handleImage = async (files: File[]) => {
        if (files && files.length > 0 && files[0]) {
            const file = files[0];
            const fileBase64 = await fileToBase64(file);
            setFiles([file]);
            setFilePreview(fileBase64);
        }
    };

    const {startUpload, routeConfig} = useUploadThing("profilePicture", {
        onClientUploadComplete: () => console.log("Done Uploading")
    });

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const uploadImage = async (file: File): Promise<string | null> => {
        setIsImageLoading(true);
        try {
            const imgRes = await startUpload([file]);
            if (imgRes && imgRes[0]?.url) {
                return imgRes[0].url;
            } else {
                toast("Uh oh! Something went wrong.", {
                    description: "File upload failed. Please try again.",
                });
                return null;
            }
        } catch (err) {
            toast("Upload error", {
                description: "Failed to process the image, Please try again.",
            });
            return null;
        } finally {
            setIsImageLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (files.length > 0) {
                const uploaded = await uploadImage(files[0]);
                if (uploaded) {
                    setImage(uploaded);
                    setFilePreview(undefined);
                }
            }

            const response = await fetch("/api/user/update-profile", {
                method: "POST",
                body: JSON.stringify({
                    name,
                    avatar: image,
                }),
            }).then((res) => res.json());

            toast("Profile updated successfully!");
            router.refresh();
            return response;
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-8 border border-white/10 rounded-md">
            <h1 className="text-white font-bold text-3xl">Update Profile</h1>
            <div className="flex flex-col justify-center gap-2">
                <label htmlFor="image" className="text-gray-300 font-medium text-sm">Profile Picture</label>
                <div className="flex flex-col items-center gap-3">
                    {/*<div className="w-8 h-8 flex items-center justify-center self-start">*/}
                    {/*</div>*/}
                    <Dropzone
                        accept={{'image/*': ['.png', '.jpg', '.jpeg']}}
                        onDrop={handleImage}
                        onError={(err) => {
                            setError(true);
                            setTimeout(4000, () => setError(false))
                        }}
                        src={files}
                        maxFiles={1}
                    >
                        <DropzoneEmptyState/>
                        <DropzoneContent>
                            {image && (
                                <Image
                                    src={filePreview ? filePreview : image}
                                    alt={user?.name}
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-contain rounded-full"
                                />
                            )}
                        </DropzoneContent>
                    </Dropzone>
                    {isImageLoading && <div className="w-fit"><Loader/></div>}
                    {error &&
                        <span className="font-normal text-red-500">Something went error, Please try again</span>}
                </div>
            </div>
            <div className="flex flex-col gap-2 justify-center">
                <label className="text-gray-300 font-medium text-sm" htmlFor="name">Name</label>
                <div className="relative">
                    <User
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-20"/>
                    <input type="text"
                           className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent backdrop-blur-sm"
                           name="name" placeholder="Enter your name" value={name}
                           onChange={(e: ChangeEvent) => setName(e.target.value! as string)}/>
                </div>
            </div>

            <button disabled={isLoading}
                    className={`self-end btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed`}
                    type="submit">
                {isLoading ? "Updating Profile" : "Update Profile"}
            </button>
        </form>
    )
}
export default UpdateProfile;