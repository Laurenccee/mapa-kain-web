export interface InputFieldProps {
  name: string;
  label: string;
  control: any;
  isPending?: boolean;
  type?: string;
  placeholder?: string;
  description?: string;
  error?: string;
  forgetPasswordLink?: boolean;

  readOnly?: boolean;
  disabled?: boolean;

  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}
