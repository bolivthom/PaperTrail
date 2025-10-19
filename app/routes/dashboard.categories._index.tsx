import { Link } from "@remix-run/react";
import { Card, CardContent } from "~/components/ui/card";
import SortDropdown from "~/components/SortButton";
import { Searchbar } from "~/components/searchbar";
import { EmptyState } from "~/components/EmptyState";
import { FolderOpen, Plus, ChevronRight } from "lucide-react";
import { CustomPagination } from "~/components/customPagination";
import { useSearchParams } from "@remix-run/react";

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
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
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

export default function CategoriesPage({ categories = [] }: CategoriesPageProps) {
    const [searchParams] = useSearchParams();

    const ITEMS_PER_PAGE = 8;
    const currentPage = Number(searchParams.get('page')) || 1;

    // Sample data - define BEFORE using it
    const allCategories: Category[] = categories.length > 0 ? categories : [
        { id: "1", name: "Travel", receiptsCount: 12, totalAmount: "1200.00" },
        { id: "2", name: "Food", receiptsCount: 4, totalAmount: "1200.00" },
        { id: "3", name: "Office", receiptsCount: 5, totalAmount: "1200.00" },
        { id: "4", name: "Utilities", receiptsCount: 4, totalAmount: "1200.00" },
    ];

    // Get current page items - AFTER defining allCategories
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentCategories = allCategories.slice(startIndex, endIndex);

    return (
        <div className="space-y-6">
            {/* Search and Sort Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <Searchbar />

                {/* Sort */}
                <SortDropdown onSortChange={() => { }} />
            </div>

            {/* Categories Grid or Empty State */}
            {allCategories.length === 0 ? (
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
            {allCategories.length > 0 && (
                <CustomPagination
                    totalItems={allCategories.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    currentPage={currentPage}
                    className="mt-4"
                />
            )}
        </div>
    );
}