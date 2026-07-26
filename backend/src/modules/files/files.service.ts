import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../config/s3.js";
import { env } from "../../config/env.js";
import { FilesRepository } from "./files.repository.js";
import { type IFile } from "../../models/file.model.js";

export const PURPOSES = [
  "avatar",
  "document",
  "certificate",
  "id_document",
  "selfie",
  "booking_photo",
  "review_image",
  "cms_banner",
] as const;

export type UploadPurpose = (typeof PURPOSES)[number];

export interface ValidationRule {
  allowedMimeTypes: string[];
  maxSize: number;
}

export const VALIDATION_RULES: Record<UploadPurpose, ValidationRule> = {
  avatar: {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSize: 2 * 1024 * 1024,
  },
  selfie: {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSize: 2 * 1024 * 1024,
  },
  booking_photo: {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSize: 5 * 1024 * 1024,
  },
  review_image: {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSize: 5 * 1024 * 1024,
  },
  cms_banner: {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSize: 5 * 1024 * 1024,
  },
  document: {
    allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
    maxSize: 10 * 1024 * 1024,
  },
  id_document: {
    allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
    maxSize: 10 * 1024 * 1024,
  },
  certificate: {
    allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
    maxSize: 10 * 1024 * 1024,
  },
};

export class FilesService {
  static async uploadFile(
    file: Express.Multer.File,
    purpose: UploadPurpose,
    ownerId: string,
  ): Promise<IFile> {
    const fileExtension = path.extname(file.originalname);
    const randomName = crypto.randomUUID() + fileExtension;
    const key = `${purpose}/${randomName}`;

    let url: string;
    if (s3Client && env.S3_BUCKET) {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      url = `${env.S3_ENDPOINT || `https://${env.S3_BUCKET}.s3.amazonaws.com`}/${key}`;
    } else {
      const uploadDir = path.join(process.cwd(), "public", "uploads", purpose);
      fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, randomName), file.buffer);
      url = `/uploads/${purpose}/${randomName}`;
    }

    const fileId = "FL-" + crypto.randomBytes(8).toString("hex").toUpperCase();

    return await FilesRepository.create({
      fileId,
      url,
      mimeType: file.mimetype,
      size: file.size,
      purpose,
      owner: ownerId as any,
    });
  }

  static async getFile(fileId: string): Promise<IFile | null> {
    return await FilesRepository.findByFileId(fileId);
  }

  static async deleteFile(fileId: string): Promise<boolean> {
    const file = await FilesRepository.findByFileId(fileId);
    if (!file) return false;

    if (file.url.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", file.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await FilesRepository.delete(fileId);
    return true;
  }
}
