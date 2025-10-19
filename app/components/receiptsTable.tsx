import { ArrowUpDown, MoreHorizontal, Eye, Trash2, Receipt } from "lucide-react";
import { CategoryFilter } from "./CategoryFilter";
import SortDropdown from "./SortButton";
import { Searchbar } from "./searchbar";
import { useSearchParams, Link, useFetcher } from "@remix-run/react";
import { Button } from "./ui/button";

import { CustomPagination } from "./CustomPagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { CustomPagination } from "./CustomPagination";
import { EmptyState } from "./EmptyState";


interface ReceiptTableProps {
  receipts: Array<{
    id: string;
    vendor: string;
    totalAmount: string;
    currency: string;
    date: string;
    category: string;
    categoryId: string | null;
  }>;
  categories: Array<{
    id: string;
    name: string;
  }>;
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
}

export default function ReceiptsTable({ 
  receipts, 
  categories, 
  totalCount, 
  currentPage, 
  itemsPerPage 
}: ReceiptTableProps) {
  const [searchParams] = useSearchParams();
  const fetcher = useFetcher();

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this receipt?')) {
      fetcher.submit(
        { intent: 'delete', receiptId: id },
        { method: 'post', action: '/api/receipts/delete' }
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount: string, currency: string) => {
    return `${currency} $${parseFloat(amount).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  
  return (
    <div className="w-full bg-background space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Searchbar />
        <CategoryFilter options={categories} />
        <SortDropdown onSortChange={() => {}} />
      </div>

      {/* Table or Empty State */}
      {receipts.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No receipts found"
          description="Try uploading your first receipt to get started."
          actionLabel="Upload Receipt"
          actionLink="/dashboard"
          actionIcon={Receipt}
        />
      ) : (
        <>
          {/* Table */}
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                      Vendor
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                      Total Amount
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                      Category
                    </th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((receipt) => (
                    <tr
                      key={receipt.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4 text-sm font-medium">{receipt.vendor}</td>
                      <td className="p-4 text-sm">{formatCurrency(receipt.totalAmount, receipt.currency)}</td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDate(receipt.date)}</td>
                      <td className="p-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {receipt.category}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link 
                                to={`/dashboard/receipts/${receipt.id}`}
                                className="flex items-center cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Receipt
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(receipt.id)}
                              className="text-destructive focus:text-destructive cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <CustomPagination
            totalItems={totalCount}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            className="mt-4"
          />
        </>
      )}
    </div>
  );
}