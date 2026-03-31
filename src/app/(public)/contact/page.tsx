export default function ContactPage() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP || "21612345678";
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="font-serif text-4xl font-bold text-dark text-center mb-12">
        Nous contacter
      </h1>
      <div className="max-w-xl mx-auto space-y-8 text-center">
        <div>
          <p className="text-muted">Adresse</p>
          <p className="font-medium text-dark mt-1">Nabeul, Tunisie</p>
        </div>
        <div>
          <p className="text-muted">Instagram</p>
          <a
            href="https://instagram.com/nuancesparfums"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gold hover:underline mt-1 inline-block"
          >
            @nuancesparfums
          </a>
        </div>
        <div>
          <p className="text-muted">WhatsApp</p>
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gold hover:underline mt-1 inline-block"
          >
            Envoyer un message
          </a>
        </div>
      </div>
    </div>
  );
}
