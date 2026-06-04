"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  AtIcon,
  Loading02Icon,
  User03Icon,
  Phone,
} from "@hugeicons/core-free-icons";

import InputField from "@/components/shared/InputField";
import { Button } from "@/components/ui/button";
import { AppImagePicker } from "@/components/shared/AppImagePicker";

import {
  ProfileSetupData,
  ProfileSetupSchema,
} from "../schemas/profileSchemas";
import { createProfile, editProfile, deleteAvatar } from "../actions/profile";
import { uploadAvatar } from "@/actions/imageUpload";
import { ProfileFormProps } from "../types";
import { ROUTES } from "@/utils/constants/routes";

export default function ProfileForm({
  mode,
  profileId,
  defaultValues,
}: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const { control, handleSubmit } = useForm<ProfileSetupData>({
    resolver: zodResolver(ProfileSetupSchema),
    defaultValues,
  });

  const handleProfileSubmit: SubmitHandler<ProfileSetupData> = async (data) => {
    startTransition(async () => {
      let uploadedPath: string | null = null;
      try {
        if (data.avatar_url instanceof File) {
          uploadedPath = `${profileId}/avatar-${Date.now()}.${data.avatar_url.name.split(".").pop()}`;
          const avatarArg =
            mode === "update" ? defaultValues.avatar_url : profileId;
          const publicUrl = await uploadAvatar(data.avatar_url, avatarArg);
          data.avatar_url = publicUrl;
        }
        const result =
          mode === "update"
            ? await editProfile(data)
            : await createProfile(data);

        if (!result?.success) {
          throw new Error(result?.message || `Failed to ${mode} profile.`);
        }

        toast.success(
          `Profile ${mode === "update" ? "updated" : "created"} successfully!`,
        );

        if (mode === "update") {
          router.replace(ROUTES.PROFILE(profileId));
        } else {
          router.replace(ROUTES.ROOT);
        }
      } catch (error: any) {
        if (uploadedPath) {
          await deleteAvatar(uploadedPath);
        }
        toast.error(
          error.message || `An error occurred during profile ${mode}.`,
        );
      }
    });
  };

  return (
    <form
      id="profile-form"
      className="flex flex-col gap-8"
      onSubmit={handleSubmit(handleProfileSubmit)}
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
              icon={Phone}
              color="currentColor"
              strokeWidth={1.5}
            />
          }
        />
      </div>

      <Button
        form="profile-form"
        type="submit"
        size="lg"
        className="w-full"
        disabled={isPending}
      >
        {isPending
          ? `${mode === "update" ? "Updating" : "Creating"} profile...`
          : `${mode === "update" ? "Update" : "Create"} Profile`}
        {isPending ? (
          <HugeiconsIcon icon={Loading02Icon} className="animate-spin" />
        ) : (
          <HugeiconsIcon icon={ArrowRight02Icon} />
        )}
      </Button>
    </form>
  );
}
