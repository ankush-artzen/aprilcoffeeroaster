// import { loadCollectionProductsPage } from "lib/shopify";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(request: NextRequest) {
//   const collection =
//     request.nextUrl.searchParams.get("collection")?.trim() || "all";
//   const cursor = request.nextUrl.searchParams.get("cursor");

//   const page = await loadCollectionProductsPage({
//     collection,
//     cursor,
//   });

//   return NextResponse.json(page);
// }
import { loadCollectionProductsPage } from "lib/shopify";
import { connection, NextRequest, NextResponse } from "next/server";

const COLLECTION_HANDLE_PATTERN = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;
const CURSOR_PATTERN = /^[A-Za-z0-9+/=_-]+$/;
const MAX_COLLECTION_LENGTH = 100;
const MAX_CURSOR_LENGTH = 512;

export async function GET(request: NextRequest) {
  await connection();

  try {
    const collection =
      request.nextUrl.searchParams.get("collection")?.trim().toLowerCase() ||
      "all";
    const cursor =
      request.nextUrl.searchParams.get("cursor")?.trim() || undefined;

    if (
      collection.length > MAX_COLLECTION_LENGTH ||
      (collection !== "all" && !COLLECTION_HANDLE_PATTERN.test(collection))
    ) {
      return NextResponse.json(
        { error: "Invalid collection handle" },
        { status: 400 }
      );
    }

    if (
      cursor !== undefined &&
      (cursor.length > MAX_CURSOR_LENGTH || !CURSOR_PATTERN.test(cursor))
    ) {
      return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
    }

    const page = await loadCollectionProductsPage({
      collection,
      cursor,
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load collection products" },
      { status: 500 }
    );
  }
}