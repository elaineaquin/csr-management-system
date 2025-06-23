import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";
import { fileTypeFromBuffer } from "file-type";
import { Readable } from "stream";

export type LocalAttachment = {
  name: string; // filename
  type: string; // mime_type
  localPath: string; // original path
};

export interface Storage {
  /**
   * Store a LocalAttachment
   * @param fileBuffer The file buffer to store
   */
  upload(fileBuffer: Buffer): Promise<string>;

  /**
   * Retrieve the local attachment from the storage server
   * @param storageId The storage ID
   */
  download(storageId: string): Promise<LocalAttachment>;
}

export type StorageConfigs = {
  cloudinaryStorage: {
    cloudinaryCloudName: string;
    cloudinaryApiKey: string;
    cloudinaryApiSecret: string;
    cloudinaryFolderName?: string;
  };
};

export class StorageFactory {
  private readonly storageConfigs: StorageConfigs;
  constructor(storageConfigs: StorageConfigs) {
    this.storageConfigs = storageConfigs;
  }

  createStorage(): Storage {
    const {
      cloudinaryApiKey,
      cloudinaryApiSecret,
      cloudinaryCloudName,
      cloudinaryFolderName,
    } = this.storageConfigs["cloudinaryStorage"];

    return new CloudinaryStorage(
      cloudinaryCloudName,
      cloudinaryApiKey,
      cloudinaryApiSecret,
      cloudinaryFolderName
    );
  }
}

export class CloudinaryStorage implements Storage {
  private readonly v2: typeof cloudinary;
  private readonly folderName?: string;

  public constructor(
    cloudinaryCloudName: string,
    cloudinaryApiKey: string,
    cloudinaryApiSecret: string,
    cloudinaryFolderName?: string
  ) {
    this.v2 = cloudinary;
    this.v2.config({
      cloud_name: cloudinaryCloudName,
      api_key: cloudinaryApiKey,
      api_secret: cloudinaryApiSecret,
    });
    this.folderName = cloudinaryFolderName;
  }

  async upload(fileBuffer: Buffer): Promise<string> {
    try {
      const storageId = uuidv4();
      await this.uploadToCloudinary(fileBuffer, storageId);
      return storageId;
    } catch (error) {
      throw new Error(`Error uploading attachment: ${error}`);
    }
  }

  async download(attachmentId: string): Promise<LocalAttachment> {
    try {
      const url = this.v2.url(`${this.folderName}/${attachmentId}`, {
        resource_type: "raw",
      });
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Failed to fetch: ${response.statusText}`);

      const buffer = Buffer.from(await response.arrayBuffer());
      const fileTypeResult = await fileTypeFromBuffer(buffer);
      const filetype = fileTypeResult?.mime || "application/octet-stream";

      return {
        name: attachmentId,
        type: filetype,
        localPath: url,
      };
    } catch (error) {
      throw new Error(`Error downloading attachment: ${error}`);
    }
  }

  private uploadToCloudinary(
    buffer: Buffer,
    publicId: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.v2.uploader.upload_stream(
        {
          folder: this.folderName,
          public_id: publicId,
          resource_type: "raw",
        },
        (error, result) => {
          if (error || !result)
            return reject(error || new Error("Upload failed"));
          resolve(result.public_id);
        }
      );
      Readable.from(buffer).pipe(uploadStream);
    });
  }
}
