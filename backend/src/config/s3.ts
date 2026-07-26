import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env.js";

let s3Client: S3Client | null = null;

if (env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    endpoint: env.S3_ENDPOINT || undefined,
    region: env.S3_REGION || "us-east-1",
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true, // often required for custom S3 compatible backends like MinIO or DigitalOcean Spaces
  });
}

export { s3Client };
