import Header from "@/components/layouts/Header";
import SignOutButton from "@/components/shared/SignOutButton";
import ProfileForm from "@/features/profile/components/ProfileForm";

export default function SetupProfilePage() {
  return (
    <section className="flex w-full flex-1 flex-col items-center justify-center gap-8 px-4">
      <div className="flex w-full flex-col gap-8 sm:max-w-xs">
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground font-serif text-4xl underline sm:text-center">
            Setup Profile
          </h1>
          <p className="text-accent-foreground text-sm sm:text-center">
            Let's start by setting up your profile. This will help us
            personalize.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <ProfileForm
            mode="create"
            profileId={""}
            defaultValues={{
              full_name: "",
              username: "",
              phone_number: "",
              avatar_url: "",
            }}
          />
        </div>
      </div>
    </section>
  );
}
