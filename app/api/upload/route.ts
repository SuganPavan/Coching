import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check Cloudinary credentials are configured before attempting upload.
  // Missing env vars produce a cryptic Cloudinary SDK error; this gives a
  // clear actionable message to the developer instead.
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env.local file.",
      },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5 MB." },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, and WebP images are allowed." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadToCloudinary(buffer, folder);

    return NextResponse.json(
      { url: result.secure_url, publicId: result.public_id },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Cloudinary errors come back as objects with an `http_code` and `message`
    const cloudErr = error as { http_code?: number; message?: string } | null;
    const message =
      cloudErr?.message ||
      (error instanceof Error ? error.message : "Upload failed");

    console.error("[Upload] Cloudinary error:", error);

    return NextResponse.json(
      { error: `Upload failed: ${message}` },
      { status: 500 }
    );
  }
}
