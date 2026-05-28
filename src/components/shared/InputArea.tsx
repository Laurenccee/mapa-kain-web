"use client";

import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "../ui/input-group";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { ROUTES } from "@/utils/constants/routes";
import Link from "next/link";

interface InputFieldProps {
  name: string;
  label: string;
  control: any;
  isPending?: boolean;
  type?: string;
  placeholder?: string;
  description?: string;
  error?: string;
  forgetPasswordLink?: boolean;

  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export default function InputField({
  name,
  label,
  control,
  isPending = false,
  type = "text",
  leadingIcon,
  trailingIcon,
  description,
  error,
  forgetPasswordLink,
  ...rest
}: InputFieldProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <div className="text-accent-foreground flex justify-between">
            {label && (
              <FieldLabel className="text-sm sm:text-sm" htmlFor={field.name}>
                {label}
              </FieldLabel>
            )}
          </div>

          <InputGroup className="transition-all">
            <InputGroupTextarea
              {...field}
              placeholder={rest.placeholder}
              disabled={isPending}
              className="placeholder:text-muted-foreground tracking-wide"
              aria-invalid={fieldState.invalid}
            />
            {leadingIcon && (
              <InputGroupAddon className="text-muted-foreground/60">
                {leadingIcon}
              </InputGroupAddon>
            )}
            {trailingIcon && (
              <InputGroupAddon
                align="inline-end"
                className="text-muted-foreground/60"
              >
                {trailingIcon}
              </InputGroupAddon>
            )}
          </InputGroup>

          {description && (
            <FieldDescription className="text-muted-foreground text-xs tracking-[0.2em]">
              {description}
            </FieldDescription>
          )}
          {error && (
            <FieldError className="font-mono text-xs font-semibold tracking-[0.2em] text-red-500">
              {error}
            </FieldError>
          )}
        </Field>
      )}
    />
  );
}
