import { Link, Form } from "@remix-run/react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
// import ReceiptNotFound from "~/components/notFound";
import NoImageAvailable from "~/components/noImageAvailable";
import NotFound from "~/components/notFound";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

// Types
export interface ReceiptData {
  id: string;
  category: string;
  merchant: string;
  totalAmount: string;
  paymentMethod: string;
  aiTag: string;
  date: string;
  imageUrl?: string;
}

interface ReceiptFormFieldProps {
  label: string;
  value?: string;
  name: string;
  disabled?: boolean;
}

// Form Field Component
export function ReceiptFormField({ label, value = "", name, disabled = false }: ReceiptFormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        defaultValue={value}
        disabled={disabled}
        className="bg-muted/30 border-border"
      />
    </div>
  );
}

// Receipt Form Component
interface ReceiptFormProps {
  receipt: ReceiptData;
}

export function ReceiptForm({ receipt }: ReceiptFormProps) {
  return (
    <Form method="post" className="space-y-6">
      <input type="hidden" name="id" value={receipt.id} />
      
      <Card className="border-border">
        <CardContent className="pt-6 space-y-6">
          <ReceiptFormField
            label="Category"
            value={receipt.category}
            name="category"
          />
          <ReceiptFormField
            label="Merchant"
            value={receipt.merchant}
            name="merchant"
          />
          <ReceiptFormField
            label="Total Amount (JMD)"
            value={receipt.totalAmount}
            name="totalAmount"
          />
          <ReceiptFormField
            label="Payment Method"
            value={receipt.paymentMethod}
            name="paymentMethod"
          />
          <ReceiptFormField
            label="AI Tag"
            value={receipt.aiTag}
            name="aiTag"
          />
          <ReceiptFormField
            label="Date"
            value={receipt.date}
            name="date"
          />
        </CardContent>
      </Card>

      <Button type="submit" className="w-full sm:w-auto px-8">
        Save
      </Button>
    </Form>
  );
}

// Receipt Image Component
interface ReceiptImageProps {
  imageUrl?: string;
  altText?: string;
}

export function ReceiptImage({ imageUrl, altText = "Receipt" }: ReceiptImageProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold">Receipt image</h3>
      <p className="text-sm text-muted-foreground">Original scanned document</p>
      
      <Card className="border-border overflow-hidden">
        <CardContent className="p-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={altText}
              className="w-full h-auto object-contain max-h-[800px]"
            />
          ) : (
            <div className="flex items-center justify-center h-64 bg-muted">
              <NoImageAvailable/>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Main Receipt Details Component
interface ReceiptDetailsProps {
  receipt: ReceiptData;
  backUrl?: string;
}

export default function ReceiptDetails({ 
  receipt, 
  backUrl = "/dashboard/receipts"
}: ReceiptDetailsProps) {
  // Guard clause for undefined receipt
  if (!receipt) {
    return (
      <div className="">
       <NotFound icon={FileQuestion} title={"Receipt not found"} description={"The receipt you're looking for doesn't exist or may have been deleted."}/>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to={backUrl}>
        <Button variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to receipts
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Receipt Details</h1>
        <p className="text-muted-foreground">View and manage receipt information</p>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div>
          <ReceiptForm receipt={receipt} />
        </div>

        {/* Right Column - Image */}
        <div>
          <ReceiptImage imageUrl={receipt.imageUrl} />
        </div>
      </div>
    </div>
  );
}