"use client";

import InputField from "@/components/shared/InputField";
import { Button } from "@/components/ui/button";

import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  Loading02Icon,
  LockPasswordIcon,
  User03Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import {
  ProfileSetupData,
  ProfileSetupSchema,
} from "../schemas/profileSchemas";
import FormActions from "@/features/auth/components/FormActions";
import { createProfile } from "../actions/profileSetup";
import { AppImagePicker } from "@/components/shared/AppImagePicker";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfileSetupForm() {
  const [isPending, startTransistion] = useTransition();
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
      try {
        let profileData = { ...data };

        if (data.avatar_url instanceof File) {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            toast.error("Authentication is required.");
            return;
          }

          const file = data.avatar_url;
          const ext = file.name.split(".").pop() || "jpg";
          const storagePath = `${user.id}/avatar-${Date.now()}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(storagePath, file, {
              contentType: file.type,
              upsert: true,
            });

          if (uploadError) {
            toast.error("Failed to upload avatar.");
            return;
          }

          const { data: publicUrlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(storagePath);

          profileData = { ...profileData, avatar_url: publicUrlData.publicUrl };
        }

        const result = await createProfile(profileData);

        if (result?.success === false) {
          toast.error(
            result.message || "An error occurred during profile creation.",
          );
          return;
        }
        toast.success("Profile created successfully!");
        router.replace("/");
      } catch (error) {
        toast.error("An error occurred during profile creation.");
      }
    });
  };

  return (
    <form
      id="create-profile-form"
      className="flex flex-col gap-4"
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
              icon={User03Icon}
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
              icon={LockPasswordIcon}
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
