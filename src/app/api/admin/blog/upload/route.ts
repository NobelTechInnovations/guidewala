import { NextRequest, NextResponse } from "next/server";
import { isImageFile, saveAdminUpload } from "@/lib/upload";
import { mediaPath } from "@/lib/media";

/** Uploads a blog image (cover or inline) and returns its site path for the post. */
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }
  if (!isImageFile(file)) {
    return NextResponse.json({ error: "Image must be JPG, PNG, WEBP, GIF or AVIF." }, { status: 400 });
  }
  const filename = await saveAdminUpload(file, "blogImg");
  return NextResponse.json({ url: mediaPath("blogImg", filename) }, { status: 201 });
}
