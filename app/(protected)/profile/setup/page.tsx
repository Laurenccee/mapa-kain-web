import SignOutButton from "@/components/shared/SignOutButton";
import ProfileSetupForm from "@/features/profile/components/ProfileSetupForm";

export default function SetupProfilePage() {
  return (
    <>
      <div className="self-end p-4">
        <SignOutButton />
      </div>
      <section className="flex w-full flex-1 flex-col items-center justify-center gap-8 px-4">
        <div className="flex w-full flex-col gap-8 sm:max-w-xs">
          <div className="flex flex-col gap-2">
            <h1 className="text-foreground font-serif text-2xl underline sm:text-center">
              Setup Profile
            </h1>
            <p className="text-accent-foreground text-sm sm:text-center">
              Let's start by setting up your profile. This will help us
              personalize.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <ProfileSetupForm />
          </div>
        </div>
      </section>
    </>
  );
}
