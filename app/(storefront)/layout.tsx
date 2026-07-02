import type { ReactNode } from "react";
import { AnnouncementBar } from "../../components/layout/announcement-bar";
import { Navbar } from "../../components/layout/navbar";
import { Footer } from "../../components/layout/footer";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Navbar />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
