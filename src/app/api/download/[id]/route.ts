import { auth } from "@/lib/auth";
import { storageFactory, UploadRequest } from "@/lib/upload-request";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const url = new URL(request.url);
  const filename = url.searchParams.get("filename") || id;

  const storage = storageFactory.createStorage();

  try {
    const uploadRequest = new UploadRequest(storage);
    const attachment = await uploadRequest.download(id);
    const fileResponse = await fetch(attachment.localPath);
    if (!fileResponse.ok) throw new Error("Failed to fetch file");

    return new Response(fileResponse.body, {
      status: 200,
      headers: {
        "Content-Type":
          fileResponse.headers.get("Content-Type") ??
          "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 404 }
    );
  }
}
