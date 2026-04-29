"use client";

import { useEffect, useState } from "react";
import { ErpPage } from "@/components/erp/ErpPage";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type UserRow = {
  id: string;
  nom: string;
  email: string;
  role: "VENDEUR";
  actif: boolean;
};

export default function UsersSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({ nom: "", email: "", role: "VENDEUR", password: "" });
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur");
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && !isAdmin) {
      router.replace("/erp/dashboard");
      return;
    }
    if (status === "authenticated" && isAdmin) {
      load();
    }
  }, [status, isAdmin, router]);

  const createUser = async () => {
    setErr(null);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return setErr(data?.error || "Erreur création");
    setForm({ nom: "", email: "", role: "VENDEUR", password: "" });
    await load();
  };

  const toggleActif = async (u: UserRow) => {
    const res = await fetch(`/api/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actif: !u.actif }),
    });
    const data = await res.json();
    if (!res.ok) return setErr(data?.error || "Erreur mise à jour");
    await load();
  };

  const resetPassword = async (u: UserRow) => {
    const pw = prompt(`Nouveau mot de passe pour ${u.nom} (min 6)`);
    if (!pw) return;
    const res = await fetch(`/api/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    const data = await res.json();
    if (!res.ok) return setErr(data?.error || "Erreur mot de passe");
    await load();
  };

  const removeUser = async (u: UserRow) => {
    if (!confirm(`Supprimer ${u.nom} ?`)) return;
    const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return setErr(data?.error || "Erreur suppression");
    await load();
  };

  if (status === "loading") return null;
  if (!isAdmin) return null;

  return (
    <ErpPage
      title="Comptes utilisateurs"
      subtitle="Vendeurs"
      actions={<Link href="/erp/parametres" style={{ fontSize: "0.72rem", color: "#C4960A", textDecoration: "none" }}>← Retour</Link>}
    >
      <div style={{ background: "#FDFAF5", border: "1px solid #EDE5D4", borderRadius: "6px", padding: "1rem", marginBottom: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "0.6rem" }}>
          <input placeholder="Nom" value={form.nom} onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))} style={{ padding: "0.6rem", border: "1px solid #EDE5D4" }} />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} style={{ padding: "0.6rem", border: "1px solid #EDE5D4" }} />
          <input type="password" placeholder="Mot de passe" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} style={{ padding: "0.6rem", border: "1px solid #EDE5D4" }} />
          <button onClick={createUser} style={{ padding: "0.6rem 0.9rem", border: "none", background: "#1A1208", color: "white", cursor: "pointer" }}>
            Créer
          </button>
        </div>
      </div>

      <div style={{ background: "#FDFAF5", border: "1px solid #EDE5D4", borderRadius: "6px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#FAF7F2" }}>
              {["Nom", "Email", "Rôle", "Statut", "Actions"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "0.7rem 0.9rem", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#C4B090" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderTop: "1px solid #F0EBE0" }}>
                <td style={{ padding: "0.75rem 0.9rem" }}>{u.nom}</td>
                <td style={{ padding: "0.75rem 0.9rem" }}>{u.email}</td>
                <td style={{ padding: "0.75rem 0.9rem" }}>{u.role}</td>
                <td style={{ padding: "0.75rem 0.9rem" }}>{u.actif ? "Actif" : "Inactif"}</td>
                <td style={{ padding: "0.75rem 0.9rem", display: "flex", gap: "0.4rem" }}>
                  <button onClick={() => toggleActif(u)} style={{ border: "1px solid #EDE5D4", background: "white", padding: "0.25rem 0.45rem", cursor: "pointer" }}>
                    {u.actif ? "Désactiver" : "Activer"}
                  </button>
                  <button onClick={() => resetPassword(u)} style={{ border: "1px solid #EDE5D4", background: "white", padding: "0.25rem 0.45rem", cursor: "pointer" }}>
                    Mot de passe
                  </button>
                  <button onClick={() => removeUser(u)} style={{ border: "1px solid #FAEAEA", background: "#FAEAEA", color: "#8B3A3A", padding: "0.25rem 0.45rem", cursor: "pointer" }}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div style={{ padding: "0.8rem", fontSize: "0.78rem", color: "#8A7B68" }}>Chargement...</div>}
      </div>
      {err && <div style={{ marginTop: "0.8rem", color: "#8B3A3A", fontSize: "0.8rem" }}>{err}</div>}
    </ErpPage>
  );
}
