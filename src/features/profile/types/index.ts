export interface ProfileFormProps {
  mode: "create" | "update";
  profileId: string;
  defaultValues: {
    full_name: string;
    username: string;
    phone_number: string;
    avatar_url: string;
  };
}
