import { redirect } from "next/navigation";

// 🟢 CRITICAL: Tells Next.js this route handles its redirect dynamically at runtime
export const dynamic = "force-dynamic";

export default function RootPage() {
  redirect("/map");
}
