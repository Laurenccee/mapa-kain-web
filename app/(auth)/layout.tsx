import { ThemeToggle } from "@/components/shared/ThemeToggle";
import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="sm:bg-card sm:border-b-border sticky top-0 z-50 w-full border-b-2 border-b-transparent bg-transparent px-4 py-3 backdrop-blur sm:px-6">
        <div className="relative mx-auto flex max-w-screen-2xl items-center justify-between">
          <Link
            href="/"
            className="text-foreground absolute left-1/2 -translate-x-1/2 text-xl sm:static sm:translate-x-0"
          >
            MapaKain
          </Link>
          <div className="hidden flex-1 sm:block" />
          <div className="z-10 ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center">
        {children}
      </main>
      <footer className="hidden sm:block">
        <div className="bg-card/95 flex w-full flex-col items-center justify-between gap-2 border-t-2 px-4 py-3 backdrop-blur sm:flex-row sm:px-6">
          <span className="text-foreground text-sm">
            &copy; {new Date().getFullYear()} OnSpot. All rights reserved.
          </span>
          <div className="text-muted-foreground flex gap-4 text-sm">
            <a href="/terms" className="hover:underline">
              Terms
            </a>
            <a href="/privacy" className="hover:underline">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
