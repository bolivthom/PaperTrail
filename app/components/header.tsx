import { LogOut } from "lucide-react";
import {
    NavigationMenu,
    NavigationMenuList,
} from "./ui/navigation-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { authClient } from "~/auth-client";
import { useEffect, useState } from "react";
import { useLocation } from "@remix-run/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "./ui/dropdown-menu";

interface User {
    first_name?: string;
    last_name?: string;
    email?: string;
}

interface PageInfo {
    title: string;
    subtitle: string;
}

const extractInitials = (firstName?: string, lastName?: string): string => {
    if (!firstName && !lastName) return 'U';
    const firstInitial = firstName?.charAt(0).toUpperCase() || '';
    const lastInitial = lastName?.charAt(0).toUpperCase() || '';
    return `${firstInitial}${lastInitial}` || 'U';
}

// Define page information for all routes
const pageInfo: Record<string, PageInfo> = {
    '/dashboard': {
        title: 'Hello {name}!',
        subtitle: 'Overview & Analytics'
    },
    '/dashboard/receipts': {
        title: 'All Receipts',
        subtitle: 'View and manage your receipts'
    },
    '/dashboard/categories': {
        title: 'Categories',
        subtitle: 'Organize your expenses'
    },
    '/dashboard/reports': {
        title: 'Reports',
        subtitle: 'Financial insights and analytics'
    }
};

// Function to get page info for current route, including subroutes
const getPageInfo = (pathname: string): PageInfo => {
    // Check for exact match first
    if (pageInfo[pathname]) {
        return pageInfo[pathname];
    }

    // Check for subroutes
    if (pathname.startsWith('/dashboard/receipts/')) {
        return {
            title: 'Receipt Details',
            subtitle: 'View and edit receipt information'
        };
    }

    if (pathname.startsWith('/dashboard/categories/')) {
        return {
            title: 'Category Details',
            subtitle: 'View and manage category'
        };
    }

    if (pathname.startsWith('/dashboard/reports/')) {
        return {
            title: 'Report Details',
            subtitle: 'Detailed financial analysis'
        };
    }

    // Default fallback
    return pageInfo['/dashboard'];
};

export function Header() {
    const location = useLocation();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await authClient.getSession();
                if (response?.data?.user) {
                    setUser(response.data.user);
                }
            } catch (error) {
                console.error('Error fetching user session:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    const currentPage = getPageInfo(location.pathname);
    const isDashboard = location.pathname === '/dashboard';
    const userName = user?.first_name && user?.last_name
        ? `${user.first_name} ${user.last_name}`
        : user?.first_name || 'there';

    const displayTitle = isDashboard
        ? `Hello ${userName}!`
        : currentPage.title;

    return (
        <header className="mb-8 sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-border">
            <div className="flex items-center justify-between h-16 px-4 md:px-6 lg:px-8">
                {/* Left Section - Page Title */}
                <div className="flex items-center gap-4 flex-1 min-w-0 lg:ml-0">
                    <div className="hidden md:block min-w-0">
                        <h1 className="text-xl lg:text-2xl font-semibold truncate">
                            {isLoading ? 'Loading...' : displayTitle}
                        </h1>
                        <p className="text-sm text-muted-foreground truncate">
                            {currentPage.subtitle}
                        </p>
                    </div>

                    {/* Mobile Title - Simplified */}
                    <div className="md:hidden">
                        <h1 className="text-lg font-semibold truncate ml-12">
                            {isLoading ? 'Loading...' : displayTitle}
                        </h1>
                    </div>
                </div>

                {/* Right Section - User Menu */}
                <NavigationMenu>
                    <NavigationMenuList className="gap-2">
                        {/* User Avatar Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                    <Avatar className="h-9 w-9 border-2 border-border">
                                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                            {isLoading ? "..." : extractInitials(user?.first_name, user?.last_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {/* Show name on larger screens */}
                                    <div className="hidden lg:block text-left">
                                        <p className="text-sm font-medium leading-none">
                                            {isLoading ? "Loading..." : userName}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {user?.email || ""}
                                        </p>
                                    </div>
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {userName}
                                        </p>
                                        {user?.email && (
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
                                            </p>
                                        )}
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <form method="post" action="/api/logout">
                                    <DropdownMenuItem asChild>
                                        <button
                                            type="submit"
                                            className="w-full flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Log out</span>
                                        </button>
                                    </DropdownMenuItem>
                                </form>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
        </header>
    );
}