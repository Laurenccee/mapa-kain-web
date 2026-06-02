import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

export default function StampsSection() {
  return (
    <div className="flex h-fit flex-col gap-3 sm:gap-4 lg:col-span-3">
      <h2 className="text-lg sm:text-xl">All Store Stamps</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col justify-center">
              <CardTitle>Jollibe</CardTitle>
              <CardDescription>12 stamp out of 12</CardDescription>
            </div>
            <CardAction className="aspect-square h-full rounded-lg bg-black"></CardAction>
          </CardHeader>
          <CardContent className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {[...Array(10)].map((_, index) => (
              <div
                key={index}
                className="border-border bg-accent aspect-square rounded-full border border-dashed"
              ></div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-muted border-2 border-dashed bg-transparent ring-0">
          <CardContent className="flex h-full flex-col items-center justify-center gap-2">
            <p className="text-sm">Add more stores to collect stamps!</p>
            <Button variant="outline" size="icon-lg">
              <Link href="/map">
                <HugeiconsIcon icon={Plus} />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
