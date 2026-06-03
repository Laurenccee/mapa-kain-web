"use client";

import InputField from "@/components/shared/InputField";
import { Loading02Icon, User03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React, { useEffect, useTransition } from "react";
import { MenuData, MenuFormData, MenuSchema } from "../schemas/menuSchema";
import { Controller, SubmitHandler, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createMenuAction, uploadMenuImage } from "../actions/menu";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Button } from "@/components/ui/button";
import InputArea from "@/components/shared/InputArea";
import { Switch } from "@/components/ui/switch";
import { AppImagePicker } from "@/components/shared/AppImagePicker";
import { useRouter } from "next/navigation";
import { CreateMenuFormProps } from "../types/menu";

import { toPreviewImageUrl, toPreviewPrice } from "../utils/menuPreviewHelper";

export default function CreateMenuForm({
  onPreviewChange,
  onSuccess,
}: CreateMenuFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const { store } = useAuth();
  const { control, handleSubmit, reset } = useForm<
    MenuFormData,
    unknown,
    MenuData
  >({
    resolver: zodResolver(MenuSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "0",
      menu_image_url: "",
      is_available: true,
    },
  });

  const watchedValues = useWatch({ control });

  useEffect(() => {
    if (!onPreviewChange) {
      return;
    }

    let imageUrlToRevoke: string | null = null;
    const previewImage = toPreviewImageUrl(watchedValues.menu_image_url);

    if (previewImage.startsWith("blob:")) {
      imageUrlToRevoke = previewImage;
    }

    onPreviewChange({
      image_url: previewImage,
      name: watchedValues.name?.trim() || "Your menu name",
      price: toPreviewPrice(watchedValues.price),
      description:
        watchedValues.description?.trim() ||
        "Your menu description will appear here.",
      available: watchedValues.is_available ?? true,
    });

    return () => {
      if (imageUrlToRevoke) {
        URL.revokeObjectURL(imageUrlToRevoke);
      }
    };
  }, [
    onPreviewChange,
    watchedValues.description,
    watchedValues.menu_image_url,
    watchedValues.is_available,
    watchedValues.name,
    watchedValues.price,
  ]);

  const handleCreateMenu: SubmitHandler<MenuData> = (data) => {
    startTransition(async () => {
      let uploadedPath: string | null = null;
      try {
        if (data.menu_image_url instanceof File) {
          uploadedPath = `${store?.id}/menu-${Date.now()}.${data.menu_image_url.name.split(".").pop()}`;
          const publicUrl = await uploadMenuImage(
            data.menu_image_url,
            uploadedPath,
            store?.id,
          );
          data.menu_image_url = publicUrl;
        }

        const result = await createMenuAction(data, store?.id);

        if (result?.success === false) {
          toast.error(
            result.message || "An error occurred during menu creation.",
          );
        } else {
          toast.success("Menu created successfully!");
          reset();
          onSuccess?.();
          router.refresh();
        }
      } catch (error) {
        toast.error("An error occurred during menu creation.");
      }
    });
  };
  return (
    <form
      id="create-menu-form"
      onSubmit={handleSubmit(handleCreateMenu)}
      className="flex w-full flex-col gap-4"
    >
      <AppImagePicker
        name="menu_image_url"
        control={control}
        label="Menu Image"
        variant="menu"
      />
      <div className="flex flex-col gap-2">
        <InputField
          label="Name"
          type="text"
          name="name"
          control={control}
          isPending={isPending}
          placeholder="Eg. Pork Adobo"
          leadingIcon={
            <HugeiconsIcon
              icon={User03Icon}
              color="currentColor"
              strokeWidth={1.5}
            />
          }
        />
        <InputArea
          label="Description"
          type="text"
          name="description"
          control={control}
          isPending={isPending}
          placeholder="Enter a description for the menu item"
        />
        <InputField
          label="Price"
          type="text"
          name="price"
          control={control}
          isPending={isPending}
          placeholder="Eg. 100.00"
          leadingIcon={
            <HugeiconsIcon
              icon={User03Icon}
              color="currentColor"
              strokeWidth={1.5}
            />
          }
        />
        <Controller
          control={control}
          name="is_available"
          render={({ field }) => (
            <div className="mt-2 flex items-center justify-between rounded-md border p-3">
              <p className="text-sm font-medium">Available for orders</p>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />
      </div>
      <Button form="create-menu-form" size="lg" disabled={isPending}>
        {isPending ? "Creating..." : "Create Menu"}
        {isPending && (
          <HugeiconsIcon icon={Loading02Icon} className="animate-spin" />
        )}
      </Button>
    </form>
  );
}
