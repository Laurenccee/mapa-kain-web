"use client";

import InputArea from "@/components/shared/InputArea";
import InputField from "@/components/shared/InputField";
import { Button } from "@/components/ui/button";
import {
  ArrowRight02Icon,
  Loading02Icon,
  User03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTransition } from "react";
import {
  RegisterStoreData,
  RegisterStoreSchema,
} from "../schemas/storeSchemas";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { BuildingSelectionResult } from "@/features/map/utils/buildingSelection";

interface RegisterStoreFormProps {
  selectedBuilding: BuildingSelectionResult | null;
}

export default function RegisterStoreForm({
  selectedBuilding,
}: RegisterStoreFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const { control, handleSubmit } = useForm<RegisterStoreData>({
    resolver: zodResolver(RegisterStoreSchema),
    defaultValues: {
      name: "",
      openTime: "",
      closeTime: "",
      description: "",

      mapSelection: {
        buildingId: "",
        latitude: 0,
        longitude: 0,
        geometry: {
          type: "Polygon",
          coordinates: [],
        },
        properties: {},
      },
    },
  });

  const handleRegisterStore: SubmitHandler<RegisterStoreData> = async (
    data,
  ) => {
    startTransition(async () => {
      try {
        console.log("Registering store:", data);
        toast.success("Store registration request submitted!");
      } catch (error) {
        toast.error("An error occurred during store registration.");
      }
    });
  };

  console.log(`Selected Building: ${selectedBuilding}`);
  return (
    <form
      id="register-store-form"
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(handleRegisterStore)}
    >
      <div className="flex flex-col gap-2">
        <InputField
          label="Store Name"
          type="text"
          name="name"
          control={control}
          isPending={isPending}
          placeholder="Eg. Aling Nena's Carinderia"
          leadingIcon={
            <HugeiconsIcon
              icon={User03Icon}
              color="currentColor"
              strokeWidth={1.5}
            />
          }
        />
        <div className="flex gap-4">
          <InputField
            label="Open Time"
            type="text"
            name="openTime"
            control={control}
            isPending={isPending}
            placeholder="Eg. 08:00"
            leadingIcon={
              <HugeiconsIcon
                icon={User03Icon}
                color="currentColor"
                strokeWidth={1.5}
              />
            }
          />
          <InputField
            label="Close Time"
            type="text"
            name="closeTime"
            control={control}
            isPending={isPending}
            placeholder="Eg. 22:00"
            leadingIcon={
              <HugeiconsIcon
                icon={User03Icon}
                color="currentColor"
                strokeWidth={1.5}
              />
            }
          />
        </div>
        <InputArea
          label="Store Description"
          type="text"
          name="description"
          control={control}
          isPending={isPending}
          placeholder="Tell us about your kitchen, best dishes, etc..."
          leadingIcon={
            <HugeiconsIcon
              icon={User03Icon}
              color="currentColor"
              strokeWidth={1.5}
            />
          }
        />
      </div>
      <Button
        form="register-store-form"
        type="submit"
        size="lg"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? "Registering Store..." : "Register Store"}
        {isPending ? (
          <HugeiconsIcon icon={Loading02Icon} className="animate-spin" />
        ) : (
          <HugeiconsIcon icon={ArrowRight02Icon} />
        )}
      </Button>
      <div className="flex flex-col gap-2">
        <div>
          {selectedBuilding?.buildingId ? (
            <div>
              <h3>Selected Building Details</h3>
              <p>ID: {selectedBuilding.buildingId}</p>

              <pre>{JSON.stringify(selectedBuilding.properties, null, 2)}</pre>
            </div>
          ) : (
            <p>Please select a building on the map to see details.</p>
          )}
        </div>
      </div>
    </form>
  );
}
