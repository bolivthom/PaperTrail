"use client";

import { useState } from "react";
import { MoreHorizontal, Eye, Trash2, Receipt, X } from "lucide-react";
import { CategoryFilter } from "./CategoryFilter";
import SortDropdown from "./SortButton";
import { Searchbar } from "./searchbar";
import { useSearchParams, Link } from "@remix-run/react";
import { Button } from "./ui/button";
import { CustomPagination } from "./CustomPagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { EmptyState } from "./EmptyState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Notification } from "~/components/notification";
import { Checkbox } from "./ui/checkbox";

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
  categories: Array<{ id: string; name: string }>;
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
}

export default function ReceiptsTable({
  receipts,
  categories,
  totalCount,
  currentPage,
  itemsPerPage,
}: ReceiptTableProps) {
  const [searchParams] = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const showNotification = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ show: true, message, type });

    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(receipts.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    setIsDeleting(true);

    try {
      const deletePromises = selectedIds.map(id =>
        fetch(`/api/receipt/delete/${id}`, { method: "DELETE" })
      );

      const results = await Promise.all(deletePromises);
      const failedCount = results.filter(r => !r.ok).length;

      if (failedCount === 0) {
        showNotification(
          `Successfully deleted ${selectedIds.length} receipt${selectedIds.length > 1 ? 's' : ''}!`,
          "success"
        );
      } else {
        showNotification(
          `Deleted ${selectedIds.length - failedCount} receipt(s), but ${failedCount} failed.`,
          "error"
        );
      }

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Delete error:", error);
      showNotification("Network error. Please try again.", "error");
    } finally {
      setIsDeleting(false);
      setOpenDialog(false);
      setSelectedIds([]);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const formatCurrency = (amount: string, currency: string) =>
    `${currency} $${parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const allSelected = receipts.length > 0 && selectedIds.length === receipts.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < receipts.length;

  return (
    <div className="w-full bg-background space-y-4">
      {/* Notification */}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
        />
      )}

      {/* Action Bar - Shows when items are selected */}
      {selectedIds.length > 0 && (
        // <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">{selectedIds.length}</span>
                </div>
                <span className="text-sm font-medium">
                   { selectedIds.length === 1
                    ? 'receipt selected'
                    : `receipts selected`}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds([])}
                className="h-8 text-muted-foreground hover:text-foreground"
              >
                Clear selection
              </Button>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setOpenDialog(true)}
              disabled={isDeleting}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete {selectedIds.length > 1 ? `(${selectedIds.length})` : ''}
            </Button>
          </div>
        // </div>
      )}
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Searchbar />
        <CategoryFilter options={categories} />
        <SortDropdown onSortChange={() => { }} />
      </div>

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
          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden md:block border border-border rounded-lg bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="border-b border-border">
                    <th className="text-left p-4 w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                        className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
                      />
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground whitespace-nowrap">Vendor</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground whitespace-nowrap">Total Amount</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground whitespace-nowrap">Date</th>
                    <th className="text-left p-4 font-medium text-sm text-muted-foreground whitespace-nowrap">Category</th>
                    <th className="text-right p-4 font-medium text-sm text-muted-foreground whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((receipt) => (
                    <tr
                      key={receipt.id}
                      className={`border-b border-border hover:bg-muted/50 transition-colors ${selectedIds.includes(receipt.id) ? 'bg-primary/5' : ''
                        }`}
                    >
                      <td className="p-4">
                        <Checkbox
                          checked={selectedIds.includes(receipt.id)}
                          onCheckedChange={(checked) => handleSelectOne(receipt.id, checked as boolean)}
                          aria-label={`Select ${receipt.vendor}`}
                        />
                      </td>
                      <td className="p-4 text-sm font-medium whitespace-nowrap">{receipt.vendor}</td>
                      <td className="p-4 text-sm whitespace-nowrap">{formatCurrency(receipt.totalAmount, receipt.currency)}</td>
                      <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">{formatDate(receipt.date)}</td>
                      <td className="p-4 text-sm whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {receipt.category}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-right whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/dashboard/receipts/${receipt.id}`} className="flex items-center cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                View Receipt
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onClick={() => {
                                setSelectedIds([receipt.id]);
                                setOpenDialog(true);
                              }}
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

          {/* Mobile Card View - Visible only on mobile */}
          <div className="md:hidden space-y-3">
            {receipts.map((receipt) => (
              <div
                key={receipt.id}
                className={`border border-border rounded-lg bg-card p-4 space-y-3 ${selectedIds.includes(receipt.id) ? 'ring-2 ring-primary/50 bg-primary/5' : ''
                  }`}
              >
                {/* Header Row with Checkbox */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedIds.includes(receipt.id)}
                    onCheckedChange={(checked) => handleSelectOne(receipt.id, checked as boolean)}
                    aria-label={`Select ${receipt.vendor}`}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base truncate">{receipt.vendor}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{formatDate(receipt.date)}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -mr-2"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/dashboard/receipts/${receipt.id}`} className="flex items-center cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          View Receipt
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => {
                          setSelectedIds([receipt.id]);
                          setOpenDialog(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Amount and Category Row */}
                <div className="flex items-center justify-between gap-4 pl-8">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Amount</p>
                    <p className="text-lg font-semibold">{formatCurrency(receipt.totalAmount, receipt.currency)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {receipt.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <CustomPagination totalItems={totalCount} itemsPerPage={itemsPerPage} currentPage={currentPage} className="mt-4" />

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
            <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md rounded-lg">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Receipt{selectedIds.length > 1 ? 's' : ''}</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {selectedIds.length} receipt{selectedIds.length > 1 ? 's' : ''}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                <AlertDialogCancel className="w-full sm:w-auto" disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : `Delete ${selectedIds.length > 1 ? `${selectedIds.length} Receipts` : 'Receipt'}`}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}