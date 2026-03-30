import { Navbar } from "@/components/vitrine/Navbar";
import { ChatbotWidget } from "@/components/vitrine/ChatbotWidget";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <ChatbotWidget />
    </div>
  );
}
