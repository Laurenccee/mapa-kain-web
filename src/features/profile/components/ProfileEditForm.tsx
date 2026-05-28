"use client";

import InputField from "@/components/shared/InputField";
import { Button } from "@/components/ui/button";

import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  AtIcon,
  Loading02Icon,
  LockPasswordIcon,
  Phone,
  PhoneCall,
  TelephoneFreeIcons,
  User03Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import {
  ProfileSetupData,
  ProfileSetupSchema,
} from "../schemas/profileSchemas";
import {
  createProfile,
  deleteAvatar,
  editProfile,
  uploadAvatar,
} from "../actions/profile";
import { AppImagePicker } from "@/components/shared/AppImagePicker";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";

export default function ProfileEditForm() {
  const [isPending, startTransistion] = useTransition();
  const { profile } = useAuth();
  const router = useRouter();

  const { control, handleSubmit } = useForm<ProfileSetupData>({
    resolver: zodResolver(ProfileSetupSchema),
    defaultValues: {
      full_name: profile.full_name,
      username: profile.username,
      phone_number: profile.phone_number,
      avatar_url: profile.avatar_url,
    },
  });

  console.log(profile);

  const handleCreateProfile: SubmitHandler<ProfileSetupData> = async (data) => {
    startTransistion(async () => {
      let uploadedPath: string | null = null;
      try {
        if (data.avatar_url instanceof File) {
          uploadedPath = `${profile.id}/avatar-${Date.now()}.${data.avatar_url.name.split(".").pop()}`;
          const publicUrl = await uploadAvatar(
            data.avatar_url,
            profile.avatar_url,
          );
          data.avatar_url = publicUrl;
        }

        const result = await editProfile(data);

        if (!result?.success)
          throw new Error(result?.message || "DB update failed");

        toast.success("Profile updated successfully!");
        router.replace(`/profile/${profile.id}`);
      } catch (error) {
        if (uploadedPath) {
          await deleteAvatar(uploadedPath);
        }
        toast.error("An error occurred during profile update.");
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
      <div className="flex flex-col gap-4">
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
              icon={TelephoneFreeIcons}
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
