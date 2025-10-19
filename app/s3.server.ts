import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
    secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
  },
});

export async function presign(key: string, ttlSeconds = 60) {
  const cmd = new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn: ttlSeconds });
}

export async function uploadToS3(params: {
  key: string;
  body: Buffer;
  contentType: string;
  metadata: Record<string, string>;
}) {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      Metadata: params.metadata,
    })
  );
}

export async function generatePresignedUrl(
  key: string,
  expiresIn: number = 15 * 60
) {
  const getObjectCommand = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
  });
}
