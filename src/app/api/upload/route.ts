import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { storageFactory, UploadRequest } from "@/lib/upload-request";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { fileTypeFromBuffer } from "file-type";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  //#region authorize user

  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  //#endregion

  const userId = session.user.id;
  const storage = storageFactory.createStorage();
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  //#region verify file

  if (!file)
    return NextResponse.json({ error: "File is required" }, { status: 400 });

  //#endregion

  try {
    // get file metadata
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileSize = buffer.length;

    const fileTypeResult = await fileTypeFromBuffer(buffer);
    const mimeType = fileTypeResult?.mime || "application/octet-stream";

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB max
    if (fileSize > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds limit" },
        { status: 413 }
      );
    }

    const uploadRequest = new UploadRequest(storage);
    const storageId = await uploadRequest.upload(buffer);

    const attachment = await prisma.attachment.create({
      data: {
        storageId,
        name: file.name,
        type: mimeType,
        size: fileSize,
        createdById: userId,
      },
    });
    return NextResponse.json(attachment);
  } catch (error) {
    console.error("Error while uploading a file", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
