import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { Card, CardContent } from "~/components/ui/card";
import SortDropdown from "~/components/SortButton";
import { Searchbar } from "~/components/searchbar";
import { EmptyState } from "~/components/EmptyState";
import { FolderOpen, Plus, ChevronRight, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { useSearchParams } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import prisma from "~/prisma.server";
import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { getUserFromRequest } from "~/lib/user";
import { CustomPagination } from "~/components/customPagination";

// Types
interface Category {
    id: string;
    name: string;
    receiptsCount: number;
    totalAmount: string;
}

interface CategoryCardProps {
    category: Category;
}

export async function loader({ request}: LoaderFunctionArgs) {
  const fetcher = useFetcher();

    const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this receipt?')) {
      fetcher.submit(
        { intent: 'delete', receiptId: id },
        { method: 'post', action: '/api/receipts/delete' }
      );
    }
  };

    try {
        const { user } = await getUserFromRequest(request);
        if (!user) return {};

        const categories = await prisma.category.findMany({
            where: { user_id: user.id }, 
            select: {
                id: true,
                name: true,
                _count: {
                    select: { 
                        receipts: true 
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        const categoryTotals = await prisma.receipt.groupBy({
            by: ['category_id'],
            _sum: {
                total_amount: true
            },
            where: {
                user_id: user.id,
                category_id: {
                    not: null
                }
            }
        });

        const totalsMap = new Map(
            categoryTotals.map(item => [
                item.category_id, 
                Number(item._sum.total_amount || 0)
            ])
        );

        const processedCategories = categories.map(category => ({
            id: category.id,
            name: category.name,
            receiptsCount: category._count.receipts,
            totalAmount: (totalsMap.get(category.id) || 0).toFixed(2),
        }));
        console.log('Processed Categories:', processedCategories);

        return ({ categories: processedCategories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return ({ categories: [] });
    }
}

// Category Card Component
function CategoryCard({ category }: CategoryCardProps) {
    return (
        <Link to={`/dashboard/categories/${category.id}`}>
            <Card className="border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group h-full">
                <CardContent className="pt-6 pb-6">
                    {/* Header with Icon */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <FolderOpen className="w-6 h-6 text-primary" />
                        </div>
                        {/* <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" /> */}
                        <div>
                            <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link 
                                to={`/dashboard/receipts/${category.id}`}
                                className="flex items-center cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Receipt
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(category.id)}
                              className="text-destructive focus:text-destructive cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        </div>
                    </div>

                    {/* Category Name */}
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors line-clamp-1">
                        {category.name}
                    </h3>

                    {/* Receipts Count */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        <p className="text-sm text-muted-foreground">
                            {category.receiptsCount} {category.receiptsCount === 1 ? 'Receipt' : 'Receipts'}
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-border my-4"></div>

                    {/* Total Amount */}
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                        <p className="text-xl font-medium text-foreground">
                            ${category.totalAmount}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

// Main Categories Page
interface CategoriesPageProps {
    categories?: Category[];
}

export default function CategoriesPage(props: CategoriesPageProps) {
    const [searchParams] = useSearchParams();
    const loaderData = useLoaderData<typeof loader>()
    console.log('Loader Data:', loaderData);    
    const fetcher = useFetcher();
    const [categories, setCategories] = useState<Category[]>(loaderData.categories || []);
    const ITEMS_PER_PAGE = 8;
    const currentPage = Number(searchParams.get('page')) || 1;

    // Get current page items - AFTER defining allCategories
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentCategories = categories.slice(startIndex, endIndex);

    const onSortChange = (sortType: string) => {
        const sortedCategories = [...categories];
        fetcher.load(`?sort=${sortType}`);
        if (sortType === 'asc') {
            sortedCategories.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortType === 'desc') {
            sortedCategories.sort((a, b) => b.name.localeCompare(a.name));
        } else if (sortType === 'createdAt') {
        }
        setCategories(sortedCategories);
    }

    useEffect(() => {
        if(fetcher.data?.categories) {
            setCategories(fetcher.data.categories);
        }
    }, [fetcher.data]);

    return (
        <div className="space-y-6">
            {/* Search and Sort Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <Searchbar />

                {/* Sort */}
                <SortDropdown onSortChange={onSortChange} />
            </div>

            {/* Categories Grid or Empty State */}
            {categories.length === 0 ? (
                <EmptyState
                    icon={FolderOpen}
                    title="No categories found"
                    description="Categories will appear here as you add receipts. Start uploading receipts to organize them automatically."
                    actionLabel="Upload Receipt"
                    actionLink="/dashboard"
                    actionIcon={Plus}
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {currentCategories.map((category) => (
                        <CategoryCard key={category.id} category={category} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {categories.length > 0 && (
                <CustomPagination
                    totalItems={categories.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    currentPage={currentPage}
                    className="mt-4"
                />
            )}
        </div>
    );
}