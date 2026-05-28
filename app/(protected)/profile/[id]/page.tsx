import SignOutButton from "@/components/shared/SignOutButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProfileSection from "@/features/profile/components/ProfileSection";
import ProfileStats from "@/features/profile/components/ProfileStats";
import StampsSection from "@/features/profile/components/StampsSection";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <section className="flex min-h-screen flex-1 flex-col items-center justify-center gap-8 px-4 py-8 pb-32">
      <div className="flex w-full flex-col gap-8 sm:max-w-4xl">
        <ProfileSection />
        <Card className="bg-primary">
          <CardContent className="flex flex-col gap-4">
            <div>
              <h1 className="text-primary-foreground text-xl">
                Own a Carinderia?
              </h1>
              <p className="text-primary-foreground">
                Register your store today to join the MapaKain community. Reach
                more food lovers and reward your most loyal customers with our
                artisanal Suki program.
              </p>
            </div>
            <Button size="lg" variant="secondary" className="w-fit">
              <Link href="/store/register">Register Your Store</Link>
              <HugeiconsIcon icon={ArrowRight01Icon} size={32} />
            </Button>
          </CardContent>
        </Card>

        {/* Main Grid: Has exactly 2 direct children elements now */}
        <div className="grid grid-cols-1 items-start gap-8 sm:grid-cols-5">
          <StampsSection />

          {/* Right Column: Sidebar Panels (Takes up 1/4 space on desktop) */}
          <div className="col-span-2 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h1 className="text-xl">Rewards Ready</h1>
              <Card>
                <CardHeader className="gap-0">
                  <div className="flex flex-col justify-center">
                    <CardTitle>Free Extra Rice</CardTitle>
                    <CardDescription>Redeem your reward now!</CardDescription>
                  </div>
                  <CardAction className="aspect-square h-full rounded-lg bg-black"></CardAction>
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
                  <Link href="/profile/edit">
                    <Button size="lg" className="w-full">
                      Edit Profile
                    </Button>
                  </Link>
                  <Link href="/terms-and-conditions">
                    <Button size="lg" className="w-full">
                      Terms and Conditions
                    </Button>
                  </Link>
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
