import { useState, FormEvent } from "react";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import { whatLoseWhenDeleteMyAccount } from "@/constants/auth";
import { sonnerToast } from "@/components/ui/sonner";
import { Eye } from "@/components/ui/svgs/icons/Eye";
import { EyeOff } from "@/components/ui/svgs/icons/EyeOff";
import { Lock } from "@/components/ui/svgs/icons/Lock";
import { Mail } from "@/components/ui/svgs/icons/Mail";
import { X } from "@/components/ui/svgs/icons/X";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { revalidatePath } from "next/cache";

const Settings = ({ userId }: { userId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    confirmPassword: "",
  });
  const router = useRouter();

  const handleInputChange = ({
    target: { name, value },
  }: {
    target: { name: string; value: string };
  }) =>
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
        body: JSON.stringify({
          email: formData.email,
          password: formData.currentPassword,
        }),
      }).then((res) => res.json());

      if (response.success) {
        sonnerToast.success(response.message);
        revalidatePath("/");
        router.push("/");
      } else return sonnerToast.error(response.message);
    } catch (err) {
      // // console.log(err)
      return sonnerToast.error((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="border border-white/10 w-full p-8 rounded-sm bg-transparent flex flex-col gap-4">
      <h1 className="text-white font-bold text-3xl">Danger Zone</h1>
      <p className="text-secondary text-md font-medium">Delete your account.</p>

      <button
        type="button"
        onClick={() => setIsDialogOpen(true)}
        className="bg-[linear-gradient(135deg,#ff4e50_0%,#f44336_50%,#d32f2f_100%)] rounded-md w-fit cursor-pointer px-4 py-2 font-bold text-white border-none outline-none focus:outline-none"
      >
        Delete your account
      </button>

      <Modal open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <ModalContent className="bg-primary border-none w-[900px] data-[state=open]:animate-in data-[state=closed]:animate-out">
          <ModalHeader className="gap-3">
            <ModalTitle className="font-paras text-3xl">
              Delete account
            </ModalTitle>
            <ModalDescription className="text-md font-light ">
              Are you sure to delete your account? Before go, we want you to
              understand what deleting your account means
            </ModalDescription>
            <div className="flex justify-center flex-col gap-3">
              {whatLoseWhenDeleteMyAccount.map((v, idx) => (
                <div key={idx} className="flex gap-2">
                  <div className="rounded-full w-5 h-5 flex items-center justify-center bg-red-700/90 p-1">
                    <X className="w-full h-full" />
                  </div>
                  <span className="text-sm font-stretch-75% text-secondary">
                    {v}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-sm font-medium">
              If you are sure, confirm by using your credentials below:
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-2 justify-center"
            >
              <div>
                <div className="w-4/5">
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    isRequired
                    startContent={<Mail className="w-5 h-5 text-gray-400" />}
                    classNames={{
                        inputWrapper: "bg-white/5 border-white/10 rounded-lg backdrop-blur-sm focus-within:ring-2 focus-within:ring-gold focus-within:border-transparent"
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="w-4/5">
                  <Input
                    type={isPasswordVisible ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Enter your current password"
                    isRequired
                    startContent={<Lock className="w-5 h-5 text-gray-400" />}
                    endContent={
                      <button
                        type="button"
                        aria-label="Toggle password visibility"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {isPasswordVisible ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    }
                    classNames={{
                        inputWrapper: "bg-white/5 border-white/10 rounded-lg backdrop-blur-sm focus-within:ring-2 focus-within:ring-gold focus-within:border-transparent"
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="w-4/5">
                  <Input
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    isRequired
                    startContent={<Lock className="w-5 h-5 text-gray-400" />}
                    endContent={
                      <button
                        type="button"
                        aria-label="Toggle confirm password visibility"
                        onClick={() =>
                          setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                        }
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {isConfirmPasswordVisible ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    }
                    classNames={{
                        inputWrapper: "bg-white/5 border-white/10 rounded-lg backdrop-blur-sm focus-within:ring-2 focus-within:ring-gold focus-within:border-transparent"
                    }}
                  />
                </div>
                {formData.confirmPassword &&
                  formData.currentPassword !== formData.confirmPassword && (
                    <p className="text-red-400 text-sm mt-2">
                      Passwords don't match
                    </p>
                  )}
              </div>

              <button
                disabled={
                  isLoading ||
                  formData.currentPassword !== formData.confirmPassword
                }
                className={`self-end btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed`}
                type="submit"
              >
                {isLoading ? "Confirming" : "Confirm"}
              </button>
            </form>
          </ModalHeader>
        </ModalContent>
      </Modal>
    </div>
  );
};
export default Settings;
