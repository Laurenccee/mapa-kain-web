import SignOutButton from '@/components/shared/SignOutButton';
import React from 'react';

export default function Dashboard() {
  return (
    <section className="flex flex-1 justify-center items-center w-full px-4 flex-col gap-8">
      <SignOutButton />
    </section>
  );
}
