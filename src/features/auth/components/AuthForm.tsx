"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight02Icon,
  Loading02Icon,
  LockPasswordIcon,
  User03Icon,
} from "@hugeicons/core-free-icons";

import InputField from "@/components/shared/InputField";
import { Button } from "@/components/ui/button";
import PasswordRulesCard from "../../../components/shared/PasswordRuleCard";
import FormActions from "./FormActions";

import {
  SignInSchema,
  SignUpSchema,
  SignInData,
  SignUpData,
} from "../schemas/authSchema";
import { AuthFormProps } from "../types";

export default function AuthForm({
  mode,
  action,
  onSuccessRoute,
  successMessage,
  errorMessage,
}: AuthFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isSignIn = mode === "sign-in";
  const activeSchema = isSignIn ? SignInSchema : SignUpSchema;

  const { control, handleSubmit, setValue } = useForm<SignInData | SignUpData>({
    resolver: zodResolver(activeSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(isSignIn && { rememberMe: true }),
    } as any,
  });

  const rememberMeValue = useWatch({ control, name: "rememberMe" });
  const passwordValue = useWatch({ control, name: "password" }) || "";

  const handleAuthSubmit: SubmitHandler<any> = async (data) => {
    startTransition(async () => {
      try {
        const result = await action(data);

        if (result?.success === false) {
          toast.error(result.message || errorMessage);
          return;
        }

        toast.success(successMessage);
        router.replace(onSuccessRoute);
      } catch (error) {
        toast.error(errorMessage);
      }
    });
  };

  return (
    <form
      id={`${mode}-form`}
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(handleAuthSubmit)}
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

      {/* Conditional UI additions based on form mode */}
      {isSignIn ? (
        <FormActions
          rememberMe={!!rememberMeValue}
          onRememberMeChange={(val) => setValue("rememberMe", val)}
        />
      ) : (
        <PasswordRulesCard password={passwordValue} />
      )}

      <Button
        form={`${mode}-form`}
        size="lg"
        type="submit"
        className="w-full"
        disabled={isPending}
      >
        {isSignIn
          ? isPending
            ? "Signing in..."
            : "Sign in to your account"
          : isPending
            ? "Creating Account..."
            : "Create Account"}
        {isPending ? (
          <HugeiconsIcon icon={Loading02Icon} className="animate-spin" />
        ) : (
          <HugeiconsIcon icon={ArrowRight02Icon} />
        )}
      </Button>
    </form>
  );
}
