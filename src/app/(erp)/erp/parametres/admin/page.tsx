"use client";

import { useState } from "react";
import { ErpPage } from "@/components/erp/ErpPage";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (status === "loading") return null;
  if ((session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
    router.replace("/erp/dashboard");
    return null;
  }

  const save = async () => {
    setLoading(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, email, currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur");
      setMsg("Compte admin mis à jour.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErpPage
      title="Compte admin"
      subtitle="Modifier identifiant et mot de passe"
      actions={<Link href="/erp/parametres" style={{ fontSize: "0.72rem", color: "#C4960A", textDecoration: "none" }}>← Retour</Link>}
    >
      <div style={{ maxWidth: "760px", background: "#FDFAF5", border: "1px solid #EDE5D4", borderRadius: "6px", padding: "1.2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
          <input placeholder="Nom admin" value={nom} onChange={(e) => setNom(e.target.value)} style={{ padding: "0.65rem", border: "1px solid #EDE5D4" }} />
          <input placeholder="Email admin" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: "0.65rem", border: "1px solid #EDE5D4" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginTop: "0.8rem" }}>
          <input type="password" placeholder="Mot de passe actuel" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={{ padding: "0.65rem", border: "1px solid #EDE5D4" }} />
          <input type="password" placeholder="Nouveau mot de passe (min 6)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ padding: "0.65rem", border: "1px solid #EDE5D4" }} />
        </div>
        <button onClick={save} disabled={loading} style={{ marginTop: "0.9rem", padding: "0.6rem 1rem", border: "none", background: "#1A1208", color: "white", cursor: "pointer" }}>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
        {msg && <div style={{ marginTop: "0.7rem", color: "#2E7D52", fontSize: "0.8rem" }}>{msg}</div>}
        {err && <div style={{ marginTop: "0.7rem", color: "#8B3A3A", fontSize: "0.8rem" }}>{err}</div>}
      </div>
    </ErpPage>
  );
}
