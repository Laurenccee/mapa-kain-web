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
import StampsSection from "@/features/profile/components/StampsSection";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

const sectionTitleClassName = "text-lg sm:text-xl";

const mobileFlatCardClassName =
  "gap-0 bg-transparent py-0 ring-0 sm:gap-4 sm:bg-card sm:py-4 sm:ring-1 sm:ring-foreground/10";

export default function ProfilePage() {
  return (
    <section className="flex flex-col px-4 py-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 sm:gap-8">
        <ProfileSection />

        <Card className="bg-primary">
          <CardContent className="flex flex-col gap-4 p-4 sm:p-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-primary-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
                Own a Carinderia?
              </h2>
              <p className="text-primary-foreground/90 text-sm leading-relaxed sm:text-base">
                Register your store today to join the MapaKain community. Reach
                more food lovers and reward your most loyal customers with our
                artisanal Suki program.
              </p>
            </div>
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-fit"
              asChild
            >
              <Link href="/store/register">
                Register Your Store
                <HugeiconsIcon icon={ArrowRight01Icon} />
              </Link>
            </Button>
          </CardContent>
        </Card>

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
