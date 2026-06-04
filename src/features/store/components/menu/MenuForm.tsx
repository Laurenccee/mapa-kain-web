"use client";

import React, { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, SubmitHandler, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading02Icon, User03Icon } from "@hugeicons/core-free-icons";

import InputField from "@/components/shared/InputField";
import InputArea from "@/components/shared/InputArea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AppImagePicker } from "@/components/shared/AppImagePicker";

import { MenuData, MenuFormData, MenuSchema } from "../../schemas/menuSchema";
import {
  toPreviewImageUrl,
  toPreviewPrice,
} from "../../utils/menuPreviewHelper";
import { uploadMenuImage } from "@/actions/imageUpload";
import { deleteMenuImage } from "../../actions/menu";
import { MenuBaseFormProps } from "../../types/menu";

export default function MenuForm({
  mode,
  storeId,
  itemId,
  initialValues,
  previousImageUrl = null,
  onPreviewChange,
  onSuccess,
  submitAction,
}: MenuBaseFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const filePreviewUrlRef = useRef<string | null>(null);
  const lastPickedFileRef = useRef<File | null>(null);

  const isUpdate = mode === "update";
  const formId = isUpdate ? `update-menu-form-${itemId}` : "create-menu-form";

  const { control, handleSubmit, reset } = useForm<
    MenuFormData,
    unknown,
    MenuData
  >({
    resolver: zodResolver(MenuSchema),
    defaultValues: initialValues,
  });

  const watchedValues = useWatch({ control, defaultValue: initialValues });

  // Reset form values dynamically if initial values shift (critical for updates)
  useEffect(() => {
    if (isUpdate) {
      reset(initialValues);
    }
  }, [initialValues, reset, isUpdate]);

  useEffect(() => {
    return () => {
      if (filePreviewUrlRef.current) {
        URL.revokeObjectURL(filePreviewUrlRef.current);
      }
    };
  }, []);

  // Unified live preview syncing
  useEffect(() => {
    if (!onPreviewChange) return;

    const values = { ...initialValues, ...watchedValues };
    let previewImage: string;

    if (values.menu_image_url instanceof File) {
      if (values.menu_image_url !== lastPickedFileRef.current) {
        if (filePreviewUrlRef.current) {
          URL.revokeObjectURL(filePreviewUrlRef.current);
        }
        filePreviewUrlRef.current = URL.createObjectURL(values.menu_image_url);
        lastPickedFileRef.current = values.menu_image_url;
      }
      previewImage = filePreviewUrlRef.current ?? "";
    } else {
      lastPickedFileRef.current = null;
      previewImage = toPreviewImageUrl(values.menu_image_url);
    }

    onPreviewChange({
      image_url: previewImage,
      name: values.name?.trim() || "Your menu name",
      price: toPreviewPrice(values.price),
      description:
        values.description?.trim() ||
        "Your menu description will appear here.",
      available: values.is_available ?? true,
    });
  }, [
    onPreviewChange,
    initialValues,
    watchedValues.description,
    watchedValues.menu_image_url,
    watchedValues.is_available,
    watchedValues.name,
    watchedValues.price,
  ]);

  const handleFormSubmit: SubmitHandler<MenuData> = (data) => {
    startTransition(async () => {
      let uploadedPath: string | null = null;
      try {
        if (data.menu_image_url instanceof File) {
          uploadedPath = `${storeId}/menu-${Date.now()}.${data.menu_image_url.name.split(".").pop()}`;
          const publicUrl = await uploadMenuImage(
            data.menu_image_url,
            previousImageUrl,
            storeId,
          );
          data.menu_image_url = publicUrl;
        }

        const targetId = isUpdate ? itemId! : storeId;
        const result = await submitAction(data, targetId);

        if (result?.success === false) {
          throw new Error(
            result.message || `An error occurred during menu ${mode}.`,
          );
        }

        toast.success(`Menu ${isUpdate ? "updated" : "created"} successfully!`);

        if (!isUpdate) reset();
        onSuccess?.();
        router.refresh();
      } catch (error: any) {
        if (uploadedPath) {
          await deleteMenuImage(uploadedPath, storeId);
        }
        toast.error(error.message || `An error occurred during menu ${mode}.`);
      }
    });
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(handleFormSubmit)}
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
        {isPending
          ? isUpdate
            ? "Updating..."
            : "Creating..."
          : isUpdate
            ? "Update Menu"
            : "Create Menu"}
        {isPending && (
          <HugeiconsIcon icon={Loading02Icon} className="animate-spin" />
        )}
      </Button>
    </form>
  );
}
