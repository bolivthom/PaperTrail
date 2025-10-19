// app/routes/upload-stream.tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import {
  json,
  unstable_parseMultipartFormData,
  type UploadHandlerPart,
} from "@remix-run/node";
import { Upload } from "@aws-sdk/lib-storage";
import { s3 } from "~/s3.server";
import crypto from "node:crypto";
import mime from "mime";

// A custom streaming upload handler for a *single* "image" field
async function s3StreamUploadHandler(part: UploadHandlerPart) {
  if (part.name !== "image" || part.filename == null) {
    // Let Remix store non-file fields normally by reading them here
    // Returning undefined tells Remix to store this part as text (it will
    // handle it outside this function), while we only intercept the "image".
    return undefined;
  }

  // Guess content-type by filename if part.contentType is missing
  const contentType =
    part.contentType || mime.getType(part.filename) || "application/octet-stream";

  const ext = mime.getExtension(contentType) || "bin";
  const key = `uploads/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  // part.data is an async iterable<Uint8Array> (node Readable-like)
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: part.data, // stream straight in
      ContentType: contentType,
      // ACL: "public-read",
    },
    queueSize: 4, // concurrency (tune as needed)
    partSize: 5 * 1024 * 1024, // 5MB chunk size (S3 minimum for multipart)
    leavePartsOnError: false,
  });

  await upload.done();

  const url = process.env.S3_PUBLIC_BASE
    ? `${process.env.S3_PUBLIC_BASE}/${key}`
    : `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  // Returning a string sets the value of formData.get("image")
  return JSON.stringify({ key, url, contentType });
}

export async function action({ request }: ActionFunctionArgs) {
  // Parse with our custom streaming handler
  const formData = await unstable_parseMultipartFormData(request, s3StreamUploadHandler);

  const imageResult = formData.get("image");
  if (typeof imageResult !== "string") {
    return json({ error: "No image uploaded." }, { status: 400 });
  }

  const { key, url } = JSON.parse(imageResult);
  return json({ ok: true, key, url });
}

// Optional <Form> UI identical to the first example.
