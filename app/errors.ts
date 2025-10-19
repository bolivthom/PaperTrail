import { ReceiptDataExtract } from "./openai.server"; 


// Create a new file for custom errors, e.g., app/errors.ts
export class NoReceiptError extends Error {
  public extractedData: ReceiptDataExtract;
  public s3Url: string;

  constructor(extractedData: ReceiptDataExtract, s3Url: string) {
    super("No receipt found in image");
    this.name = "NoReceiptError";
    this.extractedData = extractedData;
    this.s3Url = s3Url;
  }
}

export class ReceiptExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReceiptExtractionError";
  }
}