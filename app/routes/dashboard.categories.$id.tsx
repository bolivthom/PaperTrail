import { Link, Form, useNavigate, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ArrowLeft, Save, FolderOpen, Trash2, Home } from "lucide-react";
import { FolderX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "~/components/ui/alert-dialog";
import NotFound from "~/components/notFound";
import { getUserFromRequest } from "~/lib/user";
import prisma from "~/prisma.server";
import { LoaderFunctionArgs } from "@remix-run/node";

// Types
export interface CategoryDetails {
  id: string;
  name: string;
  receiptsCount: number;
  totalAmount: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryEditProps {
  category: CategoryDetails;
  backUrl?: string;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { id } = params;

  if (!id) {
    throw new Error("Missing receipt ID");
  }

  const { user } = await getUserFromRequest(request);
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const category = await prisma.category.findFirst({ 
    where: { id, user_id: user.id },
    select: {
        id: true,
        name: true,
        _count: {
            select: { 
                receipts: true 
            }
        }
    }
  });

  if (!category) {
    throw new Error("Category not found");
  }

  const categoryTotals = await prisma.receipt.groupBy({
    by: ['category_id'],
    _sum: {
      total_amount: true
    },
    where: {
      user_id: user.id,
      category_id: category.id
    }
  });

  const totalsMap = new Map(
    categoryTotals.map(item => [
      item.category_id, 
      Number(item._sum.total_amount || 0)
    ])
  );

  // Create a new object with the additional properties
  const categoryWithDetails: CategoryDetails = {
    id: category.id,
    name: category.name,
    receiptsCount: category._count.receipts,
    totalAmount: (totalsMap.get(category.id) || 0).toFixed(2)
  };
  
  return { category: categoryWithDetails };
}


export default function EditCategory(props: CategoryEditProps) {
  const { category } = useLoaderData<typeof loader>();

  if (!category) {
    return (
      <NotFound
        icon={FolderX}
        title="Category not found"
        description="This category doesn't exist or has been removed."
        actions={[
          { label: "Back to categories", link: "/dashboard/categories", icon: ArrowLeft },
          { label: "Go to dashboard", link: "/dashboard", icon: Home }
        ]}
      />
    );
  }

  const handleDelete = () => {
    // Add delete logic here
    // console.log('Delete category:', category.id);
    // navigate(backUrl);
  };

  const backUrl = "/dashboard/categories";

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <Link to={"/dashboard/categories" }>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to categories
          </Button>
        </Link>
      </div>

      {/* Category Info Card */}
      <Card className="border border-border shadow-sm rounded-2xl bg-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{category.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {category.receiptsCount} {category.receiptsCount === 1 ? 'Receipt' : 'Receipts'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
              <p className="text-2xl font-bold">${category.totalAmount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Receipts Count</p>
              <p className="text-2xl font-bold">{category.receiptsCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}