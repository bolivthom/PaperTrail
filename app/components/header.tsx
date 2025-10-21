// import { Sun, LogOut } from "lucide-react";
// import { Button } from "./ui/button";
// import {
//     NavigationMenu,
//     NavigationMenuContent,
//     NavigationMenuItem,
//     NavigationMenuList,
//     NavigationMenuTrigger
// } from "./ui/navigation-menu";
// import { Avatar, AvatarFallback } from "./ui/avatar";
// import { authClient } from "~/auth-client";
// import { useEffect, useState } from "react";
// import { useLocation } from "@remix-run/react";

// interface User {
//     first_name?: string;
//     last_name?: string;
// }

// interface PageInfo {
//     title: string;
//     subtitle: string;
// }

// const extractInitials = (firstName?: string, lastName?: string): string => {
//     if (!firstName && !lastName) return 'U';
//     const firstInitial = firstName?.charAt(0).toUpperCase() || '';
//     const lastInitial = lastName?.charAt(0).toUpperCase() || '';
//     return `${firstInitial}${lastInitial}` || 'U';
// }

// const pageInfo: Record<string, PageInfo> = {
//     '/dashboard': {
//         title: 'Hello {name}!',
//         subtitle: 'Overview & Analytics'
//     },
//     '/dashboard/receipts': {
//         title: 'All Receipts',
//         subtitle: 'View and manage your receipts'
//     },
//     '/dashboard/categories': {
//         title: 'Categories',
//         subtitle: 'Organize your expenses'
//     },
//     '/dashboard/reports': {
//         title: 'Reports',
//         subtitle: 'Financial insights and analytics'
//     }
// };

// export function Header() {
//     const location = useLocation();
//     const [user, setUser] = useState<User | null>(null);
//     const [isLoading, setIsLoading] = useState(true);

//     useEffect(() => {
//         const fetchUser = async () => {
//             try {
//                 const response = await authClient.getSession();
//                 if (response?.data?.user) {
//                     setUser(response.data.user);
//                 }
//             } catch (error) {
//                 console.error('Error fetching user session:', error);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchUser();
//     }, []);

//     const currentPage = pageInfo[location.pathname] || pageInfo['/dashboard'];
//     const isDashboard = location.pathname === '/dashboard';
//     const userName = user?.first_name && user?.last_name 
//         ? `${user.first_name} ${user.last_name}` 
//         : user?.first_name || 'there';

//     const displayTitle = isDashboard 
//         ? `Hello ${userName}!` 
//         : currentPage.title;

//     return (
//         <header className="flex items-center justify-between mb-8">
//             <div className="hidden lg:block">
//                 <h1 className="text-3xl font-medium">
//                     {isLoading ? 'Loading...' : displayTitle}
//                 </h1>
//                 <p className="text-muted-foreground mt-1">{currentPage.subtitle}</p>
//             </div>

//             <div className="flex-1 lg:hidden"></div>

//             <NavigationMenu>
//                 <NavigationMenuList>
//                     {/* optional */}
//                     {/* <Button variant="ghost" size="icon">
//                         <Sun className="w-5 h-5" />
//                     </Button> */}

//                     <NavigationMenuItem className="lg:pl-8">
//                         <NavigationMenuTrigger className="h-auto p-0 hover:bg-transparent data-[state=open]:bg-transparent focus:bg-transparent">
//                             <Avatar className="transition-all cursor-pointer hover:opacity-80">
//                                 <AvatarFallback>
//                                     {isLoading ? '...' : extractInitials(user?.first_name, user?.last_name)}
//                                 </AvatarFallback>
//                             </Avatar>
//                         </NavigationMenuTrigger>
//                         <NavigationMenuContent className="mr-4">
//                             <ul className="w-48 p-2">
//                                 <li>
//                                     <form method="post" action="/api/logout">
//                                         <button
//                                             type="submit"
//                                             className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
//                                         >
//                                             <LogOut className="w-4 h-4" />
//                                             <span>Log out</span>
//                                         </button>
//                                     </form>
//                                 </li>
//                             </ul>
//                         </NavigationMenuContent>
//                     </NavigationMenuItem>
//                 </NavigationMenuList>
//             </NavigationMenu>
//         </header>
//     );
// }
import { Sun, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger
} from "./ui/navigation-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { authClient } from "~/auth-client";
import { useEffect, useState } from "react";
import { useLocation } from "@remix-run/react";

interface User {
    first_name?: string;
    last_name?: string;
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
        <header className="flex items-center justify-between mb-8">
            <div className="hidden lg:block">
                <h1 className="text-3xl font-medium">
                    {isLoading ? 'Loading...' : displayTitle}
                </h1>
                <p className="text-muted-foreground mt-1">{currentPage.subtitle}</p>
            </div>

            <div className="flex-1 lg:hidden"></div>

            <NavigationMenu>
                <NavigationMenuList>
                    {/* optional */}
                    {/* <Button variant="ghost" size="icon">
                        <Sun className="w-5 h-5" />
                    </Button> */}

                    <NavigationMenuItem className="lg:pl-8">
                        <NavigationMenuTrigger className="h-auto p-0 hover:bg-transparent data-[state=open]:bg-transparent focus:bg-transparent">
                            <Avatar className="transition-all cursor-pointer hover:opacity-80">
                                <AvatarFallback>
                                    {isLoading ? '...' : extractInitials(user?.first_name, user?.last_name)}
                                </AvatarFallback>
                            </Avatar>
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="mr-4">
                            <ul className="w-48 p-2">
                                <li>
                                    <form method="post" action="/api/logout">
                                        <button
                                            type="submit"
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Log out</span>
                                        </button>
                                    </form>
                                </li>
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </header>
    );
}