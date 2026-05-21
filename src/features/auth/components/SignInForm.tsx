"use client";

import InputField from "@/components/shared/InputField";
import { Button } from "@/components/ui/button";
import { SignInData, SignInSchema } from "../schemas/authSchema";

import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  Loading02Icon,
  LockPasswordIcon,
  User03Icon,
} from "@hugeicons/core-free-icons";
import { signInAction } from "../actions/auth";
import { toast } from "sonner";
import FormActions from "./FormActions";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/utils/constants/routes";

export default function SignInForm() {
  const [isPending, startTransistion] = useTransition();
  const router = useRouter();

  const { control, handleSubmit, watch, setValue } = useForm<SignInData>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const handleSignIn: SubmitHandler<SignInData> = async (data) => {
    startTransistion(async () => {
      try {
        const result = await signInAction(data);

        if (result?.success === false) {
          toast.error(result.message || "An error occurred during sign in.");
          return;
        }
        toast.success("Signed in successfully!");
        router.replace(ROUTES.MAP);
      } catch (error) {
        toast.error("An error occurred during sign in.");
      }
    });
  };

  return (
    <form
      id="sign-in-form"
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(handleSignIn)}
    >
      <div className="flex flex-col gap-2">
        <InputField
          label="Email"
          type="email"
          name="email"
          control={control}
          isPending={isPending}
          placeholder="Eg. john.doe@example.com"
          leadingIcon={
            <HugeiconsIcon
              icon={User03Icon}
              color="currentColor"
              strokeWidth={1.5}
            />
          }
        />
        <InputField
          label="Password"
          type="password"
          name="password"
          control={control}
          isPending={isPending}
          placeholder="Enter password"
          leadingIcon={
            <HugeiconsIcon
              icon={LockPasswordIcon}
              color="currentColor"
              strokeWidth={1.5}
            />
          }
        />
      </div>
      <FormActions
        rememberMe={watch("rememberMe")}
        onRememberMeChange={(val) => setValue("rememberMe", val)}
      />
      <Button
        form="sign-in-form"
        size="lg"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? "Signing in..." : "Sign in to your account"}
        {isPending ? (
          <HugeiconsIcon icon={Loading02Icon} className="animate-spin" />
        ) : (
          <HugeiconsIcon icon={ArrowRight02Icon} />
        )}
      </Button>
    </form>
  );
}
