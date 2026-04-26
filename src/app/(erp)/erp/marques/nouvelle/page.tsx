import { MarqueForm } from "@/components/erp/MarqueForm";

export const dynamic = "force-dynamic";

export default function ErpMarquesNouvellePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold text-dark">Nouvelle marque</h1>
      <MarqueForm mode="creation" />
    </div>
  );
}
