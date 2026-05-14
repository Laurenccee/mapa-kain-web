import { ThemeToggle } from '@/components/shared/ThemeToggle';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b-2 backdrop-blur px-4 bg-transparent border-b-transparent sm:bg-card sm:border-b-border sm:px-6 py-3">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between relative">
          <Link
            href="/"
            className="text-xl text-foreground absolute left-1/2 -translate-x-1/2 sm:static sm:translate-x-0"
          >
            MapaKain
          </Link>
          <div className="hidden sm:block flex-1" />
          <div className="z-10 ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>
      <footer className="hidden sm:block">
        <div className="w-full border-t-2 bg-card/95 backdrop-blur flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 gap-2">
          <span className="text-sm text-foreground">
            &copy; {new Date().getFullYear()} OnSpot. All rights reserved.
          </span>
          <div className="flex gap-4 text-sm text-muted-foreground">
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
