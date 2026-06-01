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
import { useEffect, useTransition } from "react";
import {
  RegisterStoreData,
  RegisterStoreSchema,
} from "../schemas/storeSchemas";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { BuildingSelectionResult } from "@/features/map/utils/buildingSelection";
import { registerStoreAction } from "../actions/store";
import { ROUTES } from "@/utils/constants/routes";
import { useRouter } from "next/navigation";

interface RegisterStoreFormProps {
  selectedBuilding: BuildingSelectionResult | null;
}

export default function RegisterStoreForm({
  selectedBuilding,
}: RegisterStoreFormProps) {
  const [isPending, startTransition] = useTransition();
  const selectedBuildingId = selectedBuilding?.buildingId ?? "";

  const router = useRouter();

  const { control, handleSubmit, setValue, clearErrors } =
    useForm<RegisterStoreData>({
      resolver: zodResolver(RegisterStoreSchema),
      defaultValues: {
        name: "",
        openTime: "",
        closeTime: "",
        description: "",

        buildingId: selectedBuildingId || "",
      },
    });

  useEffect(() => {
    const id = selectedBuilding?.buildingId ?? "";
    setValue("buildingId", id, {
      shouldValidate: true,
      shouldDirty: Boolean(id),
    });

    if (id) clearErrors("buildingId");
  }, [selectedBuilding?.buildingId, setValue, clearErrors]);

  const handleRegisterStore: SubmitHandler<RegisterStoreData> = async (
    data,
  ) => {
    startTransition(async () => {
      try {
        const result = await registerStoreAction(data);

        if (result?.success === false) {
          toast.error(
            result.message || "An error occurred during store registration.",
          );
        } else {
          toast.success("Store registration request submitted!");
          router.replace(ROUTES.MAP);
        }
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
          label="Building ID"
          type="text"
          name="buildingId"
          control={control}
          isPending={isPending}
          placeholder="Select a building on the map"
          readOnly={true}
          leadingIcon={
            <HugeiconsIcon
              icon={User03Icon}
              color="currentColor"
              strokeWidth={1.5}
            />
          }
        />
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
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Open Time"
            type="time"
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
            type="time"
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
    </form>
  );
}
