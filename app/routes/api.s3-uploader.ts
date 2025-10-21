import {
  unstable_parseMultipartFormData,
  unstable_createMemoryUploadHandler,
  ActionFunctionArgs,
} from "@remix-run/node";
import { Readable } from "node:stream";
import { Upload } from "@aws-sdk/lib-storage";
import { s3 } from "~/s3.server";


const sanitizeFileName = (fileName: string): string => {
  return fileName
    .normalize('NFD') // Handle unicode characters like non-breaking spaces
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[\s\u00A0]/g, '_') // Replace all spaces AND non-breaking spaces with underscores
    .replace(/[()]/g, '') // Remove parentheses completely
    .replace(/[:]/g, '-') // Replace colons with hyphens (better for time)
    .replace(/[^a-zA-Z0-9.\-_]/g, '_') // Replace any other special chars
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .replace(/(\..*)\./g, '$1_'); // Replace dots in filename (not extension) with underscores
};

export async function action({ request }:ActionFunctionArgs) {
  const formData = await unstable_parseMultipartFormData(
    request,
    unstable_createMemoryUploadHandler({ maxPartSize: 3200 * 1024 })
  );

  const file = formData.get("image");
  if (!file || typeof file === "string") {
    return new Response("No file", { status: 400 });
  }

  const nodeStream =
    typeof Readable.fromWeb === "function"
      ? Readable.fromWeb(file.stream())
      : Readable.from((file.stream() as any)[Symbol.asyncIterator]());

  
  console.log("sanitized file name", sanitizeFileName(file.name));

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.S3_BUCKET!,
      Key: `uploads/${Date.now()}-${sanitizeFileName(file.name)}`,
      Body: nodeStream,
      ContentType: file.type || "application/octet-stream",
    },
    partSize: 5 * 1024 * 1024,
    queueSize: 4,
  });

  const response = await upload.done();
  console.log("Upload complete:", response);
  return new Response("ok");
}
