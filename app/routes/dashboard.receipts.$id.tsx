import { Link, Form, useLoaderData } from "@remix-run/react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
// import ReceiptNotFound from "~/components/notFound";
import NoImageAvailable from "~/components/noImageAvailable";
import NotFound from "~/components/notFound";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import prisma from "~/prisma.server";
import { presign } from "~/s3.server";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { getUserFromRequest } from "~/lib/user";

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


export function ReceiptForm({ receipt, categories }: ReceiptFormProps) {
  console.log('Rendering ReceiptForm with receipt:', receipt);
  return (
    <Form method="post" className="space-y-6">
      <input type="hidden" name="id" value={receipt.id} />
      
      <Card className="border-border">
        <CardContent className="pt-6 space-y-6">

    <div className="space-y-2">
      <Label htmlFor={'category_id'} className="text-sm font-medium">
        Category
      </Label>
          <Select name='category_id' defaultValue={`${receipt.category?.id}`}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={`${category.id}`}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
          <ReceiptFormField
            label="Merchant"
            value={receipt.company_name}
            name="merchant"
          />
          <ReceiptFormField
            label="Total Amount (JMD)"
            value={receipt.total_amount}
            name="totalAmount"
          />
          {/* <ReceiptFormField
            label="Payment Method"
            value={receipt.paymentMethod}
            name="paymentMethod"
          />
          <ReceiptFormField
            label="AI Tag"
            value={receipt.aiTag}
            name="aiTag"
          /> */}
          <ReceiptFormField
            label="Date"
            value={receipt.purchase_date}
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

export async function loader({ request,params }: LoaderFunctionArgs) {
  const { id } = params;

  if (!id) {
    throw new Error("Missing receipt ID");
  }

  const { user } = await getUserFromRequest(request);
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const receipt = await prisma.receipt.findFirst({ 
    where: { id, user_id: user.id },
    include: { category: true }
  });

  if (!receipt) {
    throw new Error("Receipt not found");
  }

  const categories = await prisma.category.findMany({
    where: { user_id: receipt.user_id },
    select: { id: true, name: true }
  });
  receipt.total_amount = receipt.total_amount.toNumber();
  receipt.tax_amount = receipt.tax_amount.toNumber();
  receipt.sub_total = receipt.sub_total.toNumber();
  const s3_key_parts = receipt.image_s3_url?.split('/')
  const s3_key = s3_key_parts?.slice(3, s3_key_parts.length).join('/');
  receipt.image_s3_url = await presign(s3_key);
  return { receipt, categories };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;

  if (!id) {
    return redirect(`/dashboard/receipts`)
  }

  const { user } = await getUserFromRequest(request);
  
  if (!user) {
    return redirect(`/`)
  }

  const receipt = await prisma.receipt.findFirst({ 
    where: { id, user_id: user.id },
    include: { category: true }
  });

  if (!receipt) {
    return redirect(`/dashboard/receipts`)
  }

  const formData = await request.formData();

  const { 
    category_id,
    company_name,
    total_amount,
    purchase_date
  } = Object.fromEntries(formData) as Record<string, string>
  
  const updatedReceipt = await prisma.receipt.update({
    where: { id: receipt.id },
    data: {
      category: { connect: { id: category_id }},
      company_name,
      total_amount,
      purchase_date
    }
  }).then((resp)=> resp).catch((err)=>{
    console.log('ERR', err)
  } );

  if (updatedReceipt?.id) {
    return redirect('/dashboard/receipts')
  }
   
  return redirect(`/dashboard/receipts/${id}?error=Failed to Update`)
}


export default function ReceiptDetails() {

  const { receipt, categories } = useLoaderData<typeof loader>(); 
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
      <Link to={"/dashboard/receipts"}>
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
          <ReceiptForm receipt={receipt} categories={categories} />
        </div>

        {/* Right Column - Image */}
        <div>
          <ReceiptImage imageUrl={receipt.image_s3_url} />
        </div>
      </div>
    </div>
  );
}