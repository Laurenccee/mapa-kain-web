import ProfileSection from '@/features/profile/components/ProfileSection';
import ProfileStats from '@/features/profile/components/ProfileStats';

export default function ProfilePage() {
  return (
    <section className="flex flex-1 justify-center items-center min-h-screen px-4 flex-col gap-8">
      <div className="sm:max-w-7xl w-full flex flex-col gap-8">
        <div>
          <ProfileSection />
        </div>
        <ProfileStats />
      </div>
    </section>
  );
}
