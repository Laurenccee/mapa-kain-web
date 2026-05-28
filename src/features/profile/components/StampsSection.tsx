import React from "react";
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
    <div className="col-span-1 flex h-fit flex-col gap-4 sm:col-span-3">
      {/* The title stays completely separate and clean */}
      <h1 className="text-xl">All Store Stamps</h1>

      {/* 2. Create a nested grid layout specifically for the cards list */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex flex-col justify-center">
              <CardTitle>Jollibe</CardTitle>
              <CardDescription>12 stamp out of 12</CardDescription>
            </div>
            <CardAction className="aspect-square h-full rounded-lg bg-black"></CardAction>
          </CardHeader>
          <CardContent className="grid grid-cols-5 gap-2">
            {[...Array(10)].map((_, index) => (
              <div
                key={index}
                className="border-border bg-accent aspect-square rounded-full border border-dashed"
              ></div>
            ))}
          </CardContent>
        </Card>

        {/* Future cards added here will automatically wrap nicely into rows and columns! */}
      </div>
    </div>
  );
}
