import SignOutButton from '@/components/shared/SignOutButton';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import ProfileSection from '@/features/profile/components/ProfileSection';
import ProfileStats from '@/features/profile/components/ProfileStats';
import Link from 'next/link';

export default function ProfilePage() {
  return (
    <section className="flex flex-1 justify-center items-center min-h-screen px-4 py-8 pb-32 flex-col gap-8">
      <div className="sm:max-w-7xl w-full flex flex-col gap-8">
        <div>
          <ProfileSection />
        </div>
        <ProfileStats />

        {/* Main Grid: Has exactly 2 direct children elements now */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 items-start">
          <div className="col-span-1 sm:col-span-3 flex flex-col gap-4 h-fit">
            {/* The title stays completely separate and clean */}
            <h1 className="text-xl">All Store Stamps</h1>

            {/* 2. Create a nested grid layout specifically for the cards list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col justify-center">
                    <CardTitle>Jollibe</CardTitle>
                    <CardDescription>12 stamp out of 12</CardDescription>
                  </div>
                  <CardAction className="bg-black aspect-square h-full rounded-lg"></CardAction>
                </CardHeader>
                <CardContent className="grid grid-cols-5 gap-2">
                  {[...Array(10)].map((_, index) => (
                    <div
                      key={index}
                      className="bg-gray-200 border aspect-square border-gray-300 rounded-full"
                    ></div>
                  ))}
                </CardContent>
              </Card>

              {/* Future cards added here will automatically wrap nicely into rows and columns! */}
            </div>
          </div>

          {/* Right Column: Sidebar Panels (Takes up 1/4 space on desktop) */}
          <div className="flex flex-col gap-8 col-span-1">
            <div className="flex flex-col gap-4">
              <h1 className="text-xl">Rewards Ready</h1>
              <Card>
                <CardHeader className="gap-0">
                  <div className="flex flex-col justify-center">
                    <CardTitle>Free Extra Rice</CardTitle>
                    <CardDescription>Redeem your reward now!</CardDescription>
                  </div>
                  <CardAction className="bg-black aspect-square h-full rounded-lg"></CardAction>
                </CardHeader>
                <CardContent>
                  <Button size="lg" className="w-full">
                    <Link href="/redeem">Redeem Reward</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-4">
              <h1 className="text-xl">Account Setting</h1>
              <Card>
                <CardContent className="flex flex-col gap-2">
                  <Button size="lg" className="w-full">
                    <Link href="/profile/edit">Edit Profile</Link>
                  </Button>
                  <Button size="lg" className="w-full">
                    <Link href="/profile/edit">Terms and Conditions</Link>
                  </Button>
                  <SignOutButton
                    size="lg"
                    variant="default"
                    className="bg-black"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
