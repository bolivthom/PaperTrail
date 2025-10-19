import {
  unstable_parseMultipartFormData,
  unstable_createMemoryUploadHandler,
} from "@remix-run/node";
import { Readable } from "node:stream";
import { Upload } from "@aws-sdk/lib-storage";
import { s3 } from "~/s3.server";

export async function action({ request }) {
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

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.S3_BUCKET!,
      Key: `uploads/${Date.now()}-${file.name}`,
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
