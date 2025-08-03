"use client";

import {useState, useRef, ChangeEvent} from "react";
import Image from "next/image";
import { useUploadThing } from "@/hooks/useUploadthing";
import { toast } from "sonner"
import {isBase64Image} from "@/lib/utils";
import Loader from "@/components/ui/Loader";

const UpdateProfile = ({user}: {user:IUser}) => {
    const [files, setFiles] = useState<File[]>([]);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [error, setError] = useState(false);
    const InputRef = useRef<HTMLInputElement | null>(null);
    const [image, setImage] = useState(user?.avatar === "" ? "/assets/Icons/profile.svg" : user?.avatar as string);
    const [name, setName] = useState(user?.name);
    const [isLoading, setIsLoading] = useState(false);

    const handleImage = async (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0 && e.target.files[0]) {
            const file = e.target.files[0];

            if (!file.type.includes("image")) {
                toast("Invalid file type", {
                    description: "Please select an image file.",
                    action: {
                        label: "Try again",
                        onClick: () => InputRef.current?.click(),
                    }
                });
                setError(true);
                return;
            }

            setFiles([file]);

            await uploadImage(file);
        }
    };

    const { startUpload, routeConfig } = useUploadThing("profilePicture", {
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

    const uploadImage = async (file: File) => {
        setIsImageLoading(true);
        try {
            const base64String = await fileToBase64(file);
            const hasImageChanged = isBase64Image(base64String);

            if (hasImageChanged) {
                const imgRes = await startUpload([file]);

                if (imgRes && imgRes[0]?.url) {
                    const imageUrl = imgRes[0].url;
                    setImage(imageUrl);
                } else {
                    toast("Uh oh! Something went wrong.", {
                        description: "File upload failed. Please try again.",
                        action: {
                            label: "Try again",
                            onClick: () => InputRef.current?.click(),
                        }
                    });
                    setError(true);
                }
            } else {
                toast("Invalid image", {
                    description: "The selected image is not valid.",
                    action: {
                        label: "Try again",
                        onClick: () => InputRef.current?.click(),
                    }
                });
                setError(true)
            }
        } catch (err) {
            toast("Upload error", {
                description: "Failed to process the image, Please try again.",
                action: {
                    label: "Try again",
                    onClick: () => InputRef.current?.click(),
                }
            })
        } finally {
            setIsImageLoading(false);
        }
    }
    return (
        <div className="flex flex-col gap-3 p-8 border border-white/10 rounded-md">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                    <Image
                        src={image}
                        alt={user?.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-contain"
                    />
                </div>
                <input type="file" className="hidden" name="image" onChange={handleImage} ref={InputRef} />
                <button onClick={() => InputRef?.current && InputRef?.current?.click()} className="cursor-pointer bg-gradient-glass transition-all p-2 rounded-md font-bold text-md">
                    Upload Profile Picture
                </button>
                <button onClick={() => setImage("/assets/Icons/profile.svg")} className="cursor-pointer bg-gradient-glass transition-all p-2 rounded-md font-bold text-md">
                    Remove
                </button>
                {isImageLoading && <div className="w-fit"><Loader /></div>}
                {error && <span className="font-normal text-red-500">Something went error, Please try again</span>}
            </div>
            <div className="flex flex-col gap-1 justify-center"></div>
        </div>
    )
}
export default UpdateProfile;