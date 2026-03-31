export const dynamic = "force-dynamic";

export default function ParametresPage() {
  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl font-bold text-dark">Paramètres</h1>
      <div className="rounded-xl border border-warm/20 bg-cream p-6 max-w-xl">
        <h2 className="font-serif text-lg font-semibold text-dark mb-4">Boutique</h2>
        <p className="text-muted text-sm">Nom : Nuances Parfums</p>
        <p className="text-muted text-sm mt-1">Adresse : Nabeul, Tunisie</p>
        <p className="text-muted text-sm mt-1">Contact : Instagram · WhatsApp</p>
      </div>
      <div className="rounded-xl border border-warm/20 bg-cream p-6 max-w-xl">
        <h2 className="font-serif text-lg font-semibold text-dark mb-4">Utilisateurs ERP</h2>
        <p className="text-muted text-sm">Gestion des accès (ADMIN uniquement).</p>
      </div>
      <div className="rounded-xl border border-warm/20 bg-cream p-6 max-w-xl">
        <h2 className="font-serif text-lg font-semibold text-dark mb-4">Seuils d&apos;alerte stock</h2>
        <p className="text-muted text-sm">Configurer les seuils par défaut pour les alertes stock.</p>
      </div>
    </div>
  );
}
