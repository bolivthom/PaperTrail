import { Link, Form, useLoaderData, useNavigation, useActionData } from "@remix-run/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import NoImageAvailable from "~/components/noImageAvailable";
import NotFound from "~/components/notFound";
import { FileQuestion, ArrowLeft, ShoppingCart, CalendarIcon } from "lucide-react";
import { ActionFunctionArgs, LoaderFunctionArgs, redirect, json } from "@remix-run/node";
import prisma from "~/prisma.server";
import { presign } from "~/s3.server";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { getUserFromRequest } from "~/lib/user";
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { cn } from "~/lib/utils";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Notification } from "~/components/Notification";
import { ReceiptImage } from "~/components/receiptImage";

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
  notes?: string;
  items_json?: Array<{
    name: string;
    quantity: string;
    price: string;
  }>;
}

interface ReceiptFormFieldProps {
  label: string;
  value?: string;
  name: string;
  disabled?: boolean;
  type?: string;
}

// Form Field Component
export function ReceiptFormField({ label, value = "", name, disabled = false, type = "text" }: ReceiptFormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={value}
        disabled={disabled}
        className="bg-muted/30 border-border"
      />
    </div>
  );
}

// Date Picker Field Component
interface DatePickerFieldProps {
  label: string;
  value?: string;
  name: string;
  disabled?: boolean;
}

export function DatePickerField({ label, value, name, disabled = false }: DatePickerFieldProps) {
  const [date, setDate] = useState<Date | undefined>(
    value ? parseISO(value) : undefined
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
      </Label>
      <input type="hidden" name={name} value={date ? format(date, "yyyy-MM-dd") : ""} />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={name}
            variant={"outline"}
            disabled={disabled}
            className="group w-full justify-between border-input bg-muted/30 px-3 font-normal outline-offset-0 outline-none hover:bg-muted/30 focus-visible:outline-[3px] disabled:opacity-50"
          >
            <span
              className={cn("truncate", !date && "text-muted-foreground")}
            >
              {date ? format(date, "PPP") : "Pick a date"}
            </span>
            <CalendarIcon
              size={16}
              className="shrink-0 text-muted-foreground/80 transition-colors group-hover:text-foreground"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <Calendar mode="single" selected={date} onSelect={setDate} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Textarea Field Component
interface ReceiptTextareaFieldProps {
  label: string;
  value?: string;
  name: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

export function ReceiptTextareaField({ label, value = "", name, placeholder, rows = 4, disabled = false }: ReceiptTextareaFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
      </Label>
      <Textarea
        id={name}
        name={name}
        defaultValue={value}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="bg-muted/30 border-border resize-none"
      />
    </div>
  );
}

// Receipt Items Component
interface ReceiptItemsProps {
  items?: Array<{
    name: string;
    quantity: string;
    price: string;
  }>;
  currency?: string;
}

export function ReceiptItems({ items, currency = "JMD" }: ReceiptItemsProps) {
  if (!items || items.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No items found for this receipt</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? price : numPrice.toFixed(2);
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Items ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-sm text-muted-foreground">Item</th>
                <th className="text-center p-3 font-medium text-sm text-muted-foreground">Quantity</th>
                <th className="text-right p-3 font-medium text-sm text-muted-foreground">Price</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-border last:border-0">
                  <td className="p-3 text-sm font-medium">{item.name}</td>
                  <td className="p-3 text-sm text-center text-muted-foreground">
                    {item.quantity || '-'}
                  </td>
                  <td className="p-3 text-sm text-right font-medium">
                    {currency} ${formatPrice(item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="p-3 rounded-lg bg-muted/30 border border-border space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm flex-1">{item.name}</p>
                <p className="font-semibold text-sm whitespace-nowrap">
                  {currency} ${formatPrice(item.price)}
                </p>
              </div>
              {item.quantity && (
                <p className="text-xs text-muted-foreground">
                  Quantity: {item.quantity}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Receipt Form Component
interface ReceiptFormProps {
  receipt: ReceiptData;
  categories: Array<{ id: string; name: string }>;
  isSubmitting: boolean;
}

export function ReceiptForm({ receipt, categories, isSubmitting }: ReceiptFormProps) {
  return (
    <Form method="post" className="space-y-6">
      <input type="hidden" name="id" value={receipt.id} />

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Receipt Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor={'category_id'} className="text-sm font-medium">
              Category
            </Label>
            <Select name='category_id' defaultValue={`${receipt.category?.id}`} disabled={isSubmitting}>
              <SelectTrigger className="w-full bg-muted/30">
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
            disabled={isSubmitting}
          />
          
          <ReceiptFormField
            label="Total Amount (JMD)"
            value={receipt.total_amount}
            name="totalAmount"
            type="number"
            disabled={isSubmitting}
          />
          
          <DatePickerField
            label="Date"
            value={receipt.purchase_date}
            name="date"
            disabled={isSubmitting}
          />

          <ReceiptTextareaField
            label="Notes"
            value={receipt.notes || ""}
            name="notes"
            placeholder="Add any additional notes about this receipt..."
            rows={4}
            disabled={isSubmitting}
          />
        </CardContent>
      </Card>

      <Button type="submit" className="w-full sm:w-auto px-8" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </Form>
  );
}

// Receipt Image Component
interface ReceiptImageProps {
  imageUrl?: string;
  altText?: string;
}

// Loader
export async function loader({ request, params }: LoaderFunctionArgs) {
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

  // Format date as ISO string (no timezone conversion)
  receipt.purchase_date = format(new Date(receipt.purchase_date), "yyyy-MM-dd");

  return json({ receipt, categories });
}

// Action - WITH SUCCESS FLAG
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
    date,
    notes
  } = Object.fromEntries(formData) as Record<string, string>

  // Parse the date string and create a Date object at midnight UTC
  const [year, month, day] = date.split('-').map(Number);
  const purchaseDate = new Date(Date.UTC(year, month - 1, day));

  try {
    await prisma.receipt.update({
      where: { id: receipt.id },
      data: {
        category: { connect: { id: category_id } },
        company_name,
        total_amount,
        purchase_date: purchaseDate,
        notes: notes || null
      }
    });

    // Return success flag - this will be available via useActionData
    return json({ success: true });
  } catch (err) {
    console.log('ERR', err);
    return json({ success: false, error: "Failed to update receipt" }, { status: 500 });
  }
}

// Main Component
export default function ReceiptDetails() {
  const { receipt, categories } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // Show success notification after form submission
  useEffect(() => {
    if (actionData?.success) {
      setNotification({
        show: true,
        message: "Receipt updated successfully!",
        type: "success",
      });

      // Redirect after showing notification
      const timer = setTimeout(() => {
        window.location.href = "/dashboard/receipts";
      }, 1500);

      return () => clearTimeout(timer);
    } else if (actionData?.success === false) {
      setNotification({
        show: true,
        message: actionData.error || "Failed to update receipt",
        type: "error",
      });
    }
  }, [actionData]);

  if (!receipt) {
    return (
      <div className="">
        <NotFound 
          icon={FileQuestion} 
          title={"Receipt not found"} 
          description={"The receipt you're looking for doesn't exist or may have been deleted."} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
        />
      )}

      {/* Back Button */}
      <Link to={"/dashboard/receipts"}>
        <Button variant="outline" className="gap-2" disabled={isSubmitting}>
          <ArrowLeft className="w-4 h-4" />
          Back to receipts
        </Button>
      </Link>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form and Items */}
        <div className="space-y-6">
          <ReceiptForm receipt={receipt} categories={categories} isSubmitting={isSubmitting} />
          <ReceiptItems items={receipt.items_json as any} currency={receipt.currency} />
        </div>

        {/* Right Column - Image */}
        <div>
          <ReceiptImage imageUrl={receipt.image_s3_url} />
        </div>
      </div>
    </div>
  );
}