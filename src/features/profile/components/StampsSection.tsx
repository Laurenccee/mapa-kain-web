import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      </div>
    </div>
  );
}
