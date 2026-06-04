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
import StampsSection from "@/features/profile/components/StampsSection";
import StoreCard from "@/features/profile/components/StoreCard";
import Link from "next/link";

const sectionTitleClassName = "text-lg sm:text-xl";

const mobileFlatCardClassName =
  "gap-0 bg-transparent py-0 ring-0 sm:gap-4 sm:bg-card sm:py-4 sm:ring-1 sm:ring-foreground/10";

export default function ProfilePage() {
  return (
    <section className="flex flex-col px-4 py-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 sm:gap-8">
        <ProfileSection />

        <StoreCard />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5 lg:gap-8">
          <StampsSection />

          <div className="flex flex-col gap-6 lg:col-span-2 lg:gap-8">
            <section className="flex flex-col gap-3 sm:gap-4">
              <h2 className={sectionTitleClassName}>Rewards Ready</h2>
              <Card>
                <CardHeader className="gap-3 sm:gap-4">
                  <div className="flex min-w-0 flex-col justify-center gap-0.5">
                    <CardTitle className="text-base sm:text-lg">
                      Free Extra Rice
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Redeem your reward now!
                    </CardDescription>
                  </div>
                  <CardAction className="size-14 shrink-0 rounded-lg bg-black sm:size-16" />
                </CardHeader>
                <CardContent>
                  <Button size="lg" className="w-full" asChild>
                    <Link href="/redeem">Redeem Reward</Link>
                  </Button>
                </CardContent>
              </Card>
            </section>

            <section className="flex flex-col gap-3 sm:gap-4">
              <h2 className={sectionTitleClassName}>Account Settings</h2>
              <Card className={mobileFlatCardClassName}>
                <CardContent className="flex flex-col gap-4 px-0 sm:px-4">
                  <div className="flex flex-col gap-1">
                    <Button size="lg" className="w-full" asChild>
                      <Link href="/profile/edit">Edit Profile</Link>
                    </Button>
                    <Button size="lg" className="w-full" asChild>
                      <Link href="/terms-and-conditions">
                        Terms and Conditions
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
