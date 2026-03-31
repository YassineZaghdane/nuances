import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-beige">
      <div className="container mx-auto grid min-h-[70vh] grid-cols-1 items-center gap-8 px-4 py-16 md:grid-cols-2 md:gap-12">
        <div className="space-y-6">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-dark md:text-5xl lg:text-6xl">
            L&apos;art du parfum à Nabeul
          </h1>
          <p className="max-w-lg text-lg text-muted">
            Découvrez nos huiles et parfums d&apos;exception. Nuances Parfums, partenaire
            officiel V.o Aromatiques, vous propose des fragrances uniques pour
            sublimer votre quotidien.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/boutique">
              <Button size="lg" className="font-medium">
                Découvrir la boutique
              </Button>
            </Link>
            <Link href="/commande">
              <Button size="lg" variant="outline">
                Commander
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative aspect-square max-w-md rounded-2xl bg-warm/20 md:ml-auto">
          <div className="absolute inset-0 flex items-center justify-center text-muted/50">
            <span className="font-serif text-6xl">♡</span>
          </div>
        </div>
      </div>
    </section>
  );
}
