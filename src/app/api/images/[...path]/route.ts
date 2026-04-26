import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join, resolve } from "path";
import { lookup } from "mime-types";

function uploadsRoot() {
  return process.env.UPLOADS_DIR ?? join(process.cwd(), "..", "uploads", "nuances");
}

export async function GET(_: Request, { params }: { params: { path: string[] } }) {
  try {
    const root = resolve(uploadsRoot());
    const filePath = resolve(join(root, ...params.path));

    // Guard against path traversal
    if (!filePath.startsWith(root)) {
      return NextResponse.json({ error: "Chemin invalide" }, { status: 400 });
    }

    const bytes = await readFile(filePath);
    const mime = lookup(filePath) || "application/octet-stream";

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image introuvable" }, { status: 404 });
  }
}
