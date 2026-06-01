"use client";

import InputField from "@/components/shared/InputField";
import { Button } from "@/components/ui/button";

import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  AtIcon,
  Loading02Icon,
  LockPasswordIcon,
  Phone,
  User03Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import {
  ProfileSetupData,
  ProfileSetupSchema,
} from "../schemas/profileSchemas";
import { createProfile, deleteAvatar, uploadAvatar } from "../actions/profile";
import { AppImagePicker } from "@/components/shared/AppImagePicker";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";

export default function ProfileSetupForm() {
  const [isPending, startTransistion] = useTransition();
  const { profile } = useAuth();
  const router = useRouter();

  const { control, handleSubmit } = useForm<ProfileSetupData>({
    resolver: zodResolver(ProfileSetupSchema),
    defaultValues: {
      full_name: "",
      username: "",
      phone_number: "",
      avatar_url: "",
    },
  });

  const handleCreateProfile: SubmitHandler<ProfileSetupData> = async (data) => {
    startTransistion(async () => {
      let uploadedPath: string | null = null;
      try {
        if (data.avatar_url instanceof File) {
          uploadedPath = `${profile.id}/avatar-${Date.now()}.${data.avatar_url.name.split(".").pop()}`;
          const publicUrl = await uploadAvatar(data.avatar_url, profile.id);
          data.avatar_url = publicUrl;
        }

        const result = await createProfile(data);

        if (result?.success === false) {
          toast.error(
            result.message || "An error occurred during profile creation.",
          );
          return;
        }
        toast.success("Profile created successfully!");
        router.replace("/");
      } catch (error) {
        if (uploadedPath) {
          await deleteAvatar(uploadedPath);
        }
        toast.error("An error occurred during profile creation.");
      }
    });
  };

  return (
    <form
      id="create-profile-form"
      className="flex flex-col gap-8"
      onSubmit={handleSubmit(handleCreateProfile)}
    >
      <AppImagePicker name="avatar_url" control={control} variant="avatar" />
      <div className="flex flex-col gap-2">
        <InputField
          label="Fullname"
          name="full_name"
          control={control}
          isPending={isPending}
          placeholder="Eg. Juan Dela Cruz"
          leadingIcon={
            <HugeiconsIcon
              icon={User03Icon}
              color="currentColor"
              strokeWidth={1.5}
            />
          }
        />
        <InputField
          label="Username"
          name="username"
          control={control}
          isPending={isPending}
          placeholder="Eg. juan"
          leadingIcon={
            <HugeiconsIcon
              icon={AtIcon}
              color="currentColor"
              strokeWidth={1.5}
            />
          }
        />
        <InputField
          label="Phone Number"
          type="tel"
          name="phone_number"
          control={control}
          isPending={isPending}
          placeholder="+63 XXX XXX XXXX"
          leadingIcon={
            <HugeiconsIcon
              icon={Phone}
              color="currentColor"
              strokeWidth={1.5}
            />
          }
        />
      </div>
      <Button
        form="create-profile-form"
        type="submit"
        size="lg"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? "Creating profile..." : "Create Profile"}
        {isPending ? (
          <HugeiconsIcon icon={Loading02Icon} className="animate-spin" />
        ) : (
          <HugeiconsIcon icon={ArrowRight02Icon} />
        )}
      </Button>
    </form>
  );
}
