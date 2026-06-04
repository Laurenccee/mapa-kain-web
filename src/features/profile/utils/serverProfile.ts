import { guardServerAction } from "@/features/auth/utils/serverAuth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getProfileOnServer() {
  const { user } = await guardServerAction();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, username, phone_number, avatar_url")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return {
      id: user.id,
      full_name: "",
      username: "",
      phone_number: "",
      avatar_url: "",
    };
  }

  return profile;
}
