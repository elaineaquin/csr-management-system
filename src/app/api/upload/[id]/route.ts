import { auth } from "@/lib/auth";
import { storageFactory, UploadRequest } from "@/lib/upload-request";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { unlink } from "fs/promises";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string | null }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id || id === "null") {
    return NextResponse.json({});
  }

  const storage = storageFactory.createStorage();
  try {
    const uploadRequest = new UploadRequest(storage);
    const attachment = await uploadRequest.download(id);
    await unlink(attachment.localPath);
    return NextResponse.json(attachment);
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "File not found or failed to download" },
      { status: 404 }
    );
  }
}
