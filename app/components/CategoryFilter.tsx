// 'use client';

// import { useSearchParams, useNavigate, useLocation } from "@remix-run/react";
// import { PlusIcon, Search } from "lucide-react";
// import { useMemo, useState, useCallback } from "react";
// import { Button } from "./ui/button";
// import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
// import { Checkbox } from "@radix-ui/react-checkbox";

// interface CategoryOption {
//   value: string;
//   label: string;
//   count?: number;
// }

// interface CategoryFilterProps {
//   options: CategoryOption[];
//   title?: string;
//   paramName?: string;
//   className?: string;
// }

// export function CategoryFilter({
//   options,
//   title = 'Categories',
//   paramName = 'categories',
//   className = '',
// }: CategoryFilterProps) {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [searchParams] = useSearchParams();

//   // Get selected categories from URL (memoized)
//   const selectedCategories = useMemo(() =>
//     searchParams.get(paramName)?.split(',').filter(Boolean) || []
//     , [searchParams, paramName]);

//   // State for search input
//   const [searchTerm, setSearchTerm] = useState('');

//   // Filter options based on search term (memoized)
//   const filteredOptions = useMemo(() =>
//     searchTerm
//       ? options.filter(option =>
//         option.label.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//       : options
//     , [options, searchTerm]);

//   // Apply filters to URL (memoized callback)
//   const applyFilters = useCallback((newSelected: string[]) => {
//     const params = new URLSearchParams(searchParams);

//     // Update category param
//     if (newSelected.length > 0) {
//       params.set(paramName, newSelected.join(','));
//     } else {
//       params.delete(paramName);
//     }

//     // Reset to page 1 when filters change
//     params.delete('page');

//     navigate(`${location.pathname}?${params.toString()}`);
//   }, [navigate, location.pathname, searchParams, paramName]);

//   // Handle checkbox change (memoized callback)
//   const handleCheckboxChange = useCallback((category: string, isChecked: boolean) => {
//     if (isChecked) {
//       // Add to selected
//       applyFilters([...selectedCategories, category]);
//     } else {
//       // Remove from selected
//       applyFilters(selectedCategories.filter(c => c !== category));
//     }
//   }, [selectedCategories, applyFilters]);

//   // Clear all filters (memoized callback)
//   const handleClearFilters = useCallback(() => {
//     applyFilters([]);
//   }, [applyFilters]);

//   return (
//     <div className={`flex gap-2 ${className}`}>
//       <Popover>
//         <PopoverTrigger asChild>
//           <Button variant="outline" className="h-10 px-3">
//             <PlusIcon className="h-4 w-4 mr-2" />
//             {title}
//             {selectedCategories.length > 0 && (
//               <span className="ml-2 text-xs bg-muted rounded-full px-2 py-0.5">
//                 {selectedCategories.length} selected
//               </span>
//             )}
//           </Button>
//         </PopoverTrigger>
//         <PopoverContent className="w-[240px] p-0" align="start">
//           <div className="p-2 border-b">
//             <div className="relative">
//               <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
//               <input
//                 className="w-full h-9 rounded px-8 py-2 text-sm focus:outline-none border border-input bg-background"
//                 placeholder="Search categories"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//           </div>

//           <div className="py-1 max-h-[250px] overflow-y-auto">
//             {filteredOptions.length > 0 ? (
//               filteredOptions.map((option) => (
//                 <div
//                   key={option.value}
//                   className="flex items-center px-2 py-1.5 hover:bg-accent cursor-pointer"
//                 >
//                   <Checkbox
//                     id={`category-${option.value}`}
//                     checked={selectedCategories.includes(option.value)}
//                     onCheckedChange={(checked) =>
//                       handleCheckboxChange(option.value, Boolean(checked))
//                     }
//                     className="mr-2"
//                   />
//                   <label
//                     htmlFor={`category-${option.value}`}
//                     className="flex-1 text-sm cursor-pointer flex justify-between"
//                   >
//                     <span>{option.label}</span>
//                     {option.count !== undefined && (
//                       <span className="text-muted-foreground text-xs">{option.count}</span>
//                     )}
//                   </label>
//                 </div>
//               ))
//             ) : (
//               <div className="px-2 py-3 text-center text-sm text-muted-foreground">
//                 No categories found
//               </div>
//             )}
//           </div>

//           {selectedCategories.length > 0 && (
//             <div className="p-2 border-t">
//               <Button
//                 onClick={handleClearFilters}
//                 variant="ghost"
//                 size="sm"
//                 className="w-full"
//               >
//                 Clear filters
//               </Button>
//             </div>
//           )}
//         </PopoverContent>
//       </Popover>

//       {selectedCategories.length > 0 && (
//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={handleClearFilters}
//           className="h-10"
//         >
//           Reset Filters
//         </Button>
//       )}
//     </div>
//   );
// }

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
              <div className="flex items-center justify-between w-full">
                <span>{category.name}</span>
                {selectedCategories.includes(category.id) && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
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