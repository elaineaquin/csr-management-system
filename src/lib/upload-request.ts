import {
  LocalAttachment,
  Storage,
  StorageFactory,
} from "./services/attachment-service/storage";

export const storageFactory = new StorageFactory({
  cloudinaryStorage: {
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUDNAME,
    cloudinaryFolderName: `${process.env.PROJECT_NAME}/${
      process.env.NODE_ENV === "development" ? "dev" : "prod"
    }`,
  },
});

export class UploadRequest {
  private readonly storage: Storage;
  constructor(storage: Storage) {
    this.storage = storage;
  }

  async upload(fileBuffer: Buffer) {
    return await this.storage.upload(fileBuffer);
  }

  async download(attachmentId: string): Promise<LocalAttachment> {
    return await this.storage.download(attachmentId);
  }
}

export type { LocalAttachment };
