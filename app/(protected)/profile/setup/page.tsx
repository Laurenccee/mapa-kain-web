import SignOutButton from '@/components/shared/SignOutButton';
import ProfileSetupForm from '@/features/profile/components/ProfileSetupForm';
import React from 'react';

export default function SetupProfilePage() {
  return (
    <>
      <div className="p-4 self-end">
        <SignOutButton />
      </div>
      <section className="flex flex-1 justify-center items-center w-full px-4 flex-col gap-8">
        <div className="sm:max-w-xs w-full flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl underline sm:text-center font-serif text-foreground">
              Setup Profile
            </h1>
            <p className="text-sm sm:text-center text-accent-foreground">
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
