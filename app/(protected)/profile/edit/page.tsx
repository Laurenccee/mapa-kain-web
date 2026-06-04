import { guardServerAction } from "@/features/auth/utils/serverAuth";
import ProfileForm from "@/features/profile/components/ProfileForm";
import { getProfileOnServer } from "@/features/profile/utils/serverProfile";

export default async function EditProfilePage() {
  const profile = await getProfileOnServer();

  return (
    <section className="flex h-full w-full flex-1 flex-col items-center justify-center gap-8 px-4">
      <div className="flex w-full flex-col gap-8 sm:max-w-xs">
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground font-serif text-4xl underline sm:text-center">
            Edit Profile
          </h1>
          <p className="text-accent-foreground text-sm sm:text-center">
            Let's start by setting up your profile. This will help us
            personalize your culinary journey.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <ProfileForm
            mode="update"
            profileId={profile.id}
            defaultValues={{
              full_name: profile.full_name,
              username: profile.username,
              phone_number: profile.phone_number,
              avatar_url: profile.avatar_url,
            }}
          />
        </div>
      </div>
    </section>
  );
}
