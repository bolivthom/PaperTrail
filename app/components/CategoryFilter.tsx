import { Badge, Check, ChevronDown, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useSearchParams, useNavigate } from "@remix-run/react";

interface CategoryFilterProps {
  options: Array<{
    id: string;
    name: string;
  }>;
}

export function CategoryFilter({ options }: CategoryFilterProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedCategories = searchParams.get('categories')?.split(',').filter(Boolean) || [];

  const handleCategoryToggle = (categoryId: string) => {
    const params = new URLSearchParams(searchParams);

    let newCategories: string[];
    if (selectedCategories.includes(categoryId)) {
      // Remove category
      newCategories = selectedCategories.filter(id => id !== categoryId);
    } else {
      // Add category
      newCategories = [...selectedCategories, categoryId];
    }

    if (newCategories.length === 0) {
      params.delete('categories');
    } else {
      params.set('categories', newCategories.join(','));
    }

    // Reset to page 1 when filter changes
    params.set('page', '1');

    navigate(`?${params.toString()}`);
  };

  const clearAllCategories = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('categories');
    params.set('page', '1');
    navigate(`?${params.toString()}`);
  };

  const selectedCount = selectedCategories.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto justify-between min-w-[180px]">
          <span className="truncate">
            {selectedCount === 0
              ? 'All Categories'
              : `${selectedCount} ${selectedCount === 1 ? 'Category' : 'Categories'}`
            }
          </span>
          <div className="flex items-center gap-1">
            {selectedCount > 0 && (
              <Badge className="ml-2 rounded-full px-1.5 h-5 min-w-5">
                {selectedCount}
              </Badge>
            )}
            <ChevronDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[250px]">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Filter by Category</DropdownMenuLabel>
          {selectedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllCategories}
              className="h-auto p-1 text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        {/* Category Options */}
        <div className="max-h-[300px] overflow-y-auto">
          {options.map((category) => (
            <DropdownMenuCheckboxItem
              key={category.id}
              checked={selectedCategories.includes(category.id)}
              onCheckedChange={() => handleCategoryToggle(category.id)}
              className="cursor-pointer"
            >
              {category.name}
            </DropdownMenuCheckboxItem>
          ))}

        </div>

        {options.length === 0 && (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            No categories found
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}