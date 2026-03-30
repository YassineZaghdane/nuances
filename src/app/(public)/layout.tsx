import { Navbar } from "@/components/vitrine/Navbar";
import { ChatbotWidget } from "@/components/vitrine/ChatbotWidget";
import { CartDrawer } from "@/components/vitrine/CartDrawer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <ChatbotWidget />
    </div>
  );
}
