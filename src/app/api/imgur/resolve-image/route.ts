import { NextResponse } from "next/server";

function extractOgImage(html: string): string | null {
  // imgur pages contiennent souvent:
  // <meta property="og:image" content="https://i.imgur.com/...jpg">
  const re =
    /<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i;
  const m = html.match(re);
  if (m?.[1]) return m[1].replace(/&amp;/g, "&");

  // fallback: twitter:image
  const re2 =
    /<meta\s+[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i;
  const m2 = html.match(re2);
  if (m2?.[1]) return m2[1].replace(/&amp;/g, "&");

  return null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    if (!url) {
      return NextResponse.json(
        { error: "Missing `url` query param" },
        { status: 400 }
      );
    }

    // Si l'URL ressemble déjà à un direct image (i.imgur.com) → on renvoie tel quel.
    if (/^https?:\/\/i\.imgur\.com\//i.test(url)) {
      return NextResponse.json({ src: url });
    }

    const isAlbum = /imgur\.com\/(a|gallery)\//i.test(url);
    if (!isAlbum) {
      return NextResponse.json({ src: url });
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) NuancesParfums/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Impossibile de charger la page Imgur (${res.status})` },
        { status: 502 }
      );
    }

    const html = await res.text();
    const src = extractOgImage(html);

    return NextResponse.json({ src });
  } catch (e: unknown) {
    const err = e as Error;
    return NextResponse.json(
      { error: err.message || "Resolve image failed" },
      { status: 500 }
    );
  }
}

