// import type { MetaFunction } from "@remix-run/node";

// export const meta: MetaFunction = () => {
//   return [
//     { title: "PaperTrail" },
//     { name: "description", content: "Welcome to PaperTrail!" },
//   ];
// };

// export default function Index() {
//   return (
//     <div className="flex h-screen items-center justify-center">
//         <p>Categories!!</p>
//     </div>
//   );
// }


import { Link, Form, useNavigate } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ArrowLeft, Save, FolderOpen, Trash2, Home } from "lucide-react";
import { FolderX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "~/components/ui/alert-dialog";
import NotFound from "~/components/notFound";

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

export default function EditCategory({ 
  category, 
  backUrl = "/dashboard/categories" 
}: CategoryEditProps) {
  const navigate = useNavigate();

  if (!category) {
    return (
      <NotFound
        icon={FolderX}
        title="Category not found"
        description="This category doesn't exist or has been removed."
        actions={[
          { label: "Back to categories", link: backUrl, icon: ArrowLeft },
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

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <Link to={backUrl}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to categories
          </Button>
        </Link>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Category Details</h1>
        <p className="text-muted-foreground">View and manage category information</p>
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

      {/* Edit Form */}
      <Card className="border border-border shadow-sm rounded-2xl bg-card">
        <CardHeader>
          <CardTitle>Edit Category</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-6">
            <input type="hidden" name="id" value={category.id} />
            <input type="hidden" name="_action" value="update" />
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Category Name
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={category.name}
                placeholder="Enter category name"
                className="bg-background border-border"
                required
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
              <Link to={backUrl}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </Form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50 border border-border shadow-sm rounded-2xl bg-card">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium mb-1">Delete Category</p>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. All receipts will be uncategorized.
              </p>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the category "{category.name}" and uncategorize {category.receiptsCount} {category.receiptsCount === 1 ? 'receipt' : 'receipts'}. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Category
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}