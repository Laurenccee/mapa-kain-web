"use client";

import InputField from "@/components/shared/InputField";
import { Loading02Icon, User03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React, { useEffect, useTransition } from "react";
import { MenuData, MenuFormData, MenuSchema } from "../schemas/menuSchema";
import { Controller, SubmitHandler, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateMenuAction, uploadMenuImage } from "../actions/menu";
import { Button } from "@/components/ui/button";
import InputArea from "@/components/shared/InputArea";
import { Switch } from "@/components/ui/switch";
import { AppImagePicker } from "@/components/shared/AppImagePicker";
import { useRouter } from "next/navigation";
import { UpdateMenuFormProps } from "../types/menu";
import { toPreviewImageUrl, toPreviewPrice } from "../utils/menuPreviewHelper";

const toFormValues = (
  menuItem: UpdateMenuFormProps["menuItem"],
): MenuFormData => ({
  name: menuItem.name ?? "",
  description: menuItem.description ?? "",
  price: String(menuItem.price ?? 0),
  menu_image_url: menuItem.image_url ?? "",
  is_available: menuItem.is_available,
});

export default function UpdateMenuForm({
  menuItem,
  onPreviewChange,
  onSuccess,
}: UpdateMenuFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const { control, handleSubmit, reset } = useForm<
    MenuFormData,
    unknown,
    MenuData
  >({
    resolver: zodResolver(MenuSchema),
    defaultValues: toFormValues(menuItem),
  });

  const watchedValues = useWatch({ control });

  useEffect(() => {
    reset(toFormValues(menuItem));
  }, [menuItem, reset]);

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

  const handleUpdateMenu: SubmitHandler<MenuData> = (data) => {
    startTransition(async () => {
      try {
        const menuImageUrl =
          data.menu_image_url instanceof File
            ? await uploadMenuImage(
                data.menu_image_url,
                menuItem.image_url,
                menuItem.store_id,
              )
            : data.menu_image_url;

        const result = await updateMenuAction(
          {
            ...data,
            menu_image_url: menuImageUrl,
          },
          menuItem.id,
        );

        if (result?.success === false) {
          toast.error(
            result.message || "An error occurred during menu update.",
          );
        } else {
          toast.success("Menu updated successfully!");
          onSuccess?.();
          router.refresh();
        }
      } catch (error) {
        toast.error("An error occurred during menu update.");
      }
    });
  };

  const formId = `update-menu-form-${menuItem.id}`;

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(handleUpdateMenu)}
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
      <Button form={formId} size="lg" disabled={isPending}>
        {isPending ? "Updating..." : "Update Menu"}
        {isPending && (
          <HugeiconsIcon icon={Loading02Icon} className="animate-spin" />
        )}
      </Button>
    </form>
  );
}
