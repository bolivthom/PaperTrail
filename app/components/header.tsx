// import { Sun, LogOut } from "lucide-react";
// import { Button } from "./ui/button";
// import { 
//     NavigationMenu, 
//     NavigationMenuContent, 
//     NavigationMenuItem, 
//     NavigationMenuLink, 
//     NavigationMenuList, 
//     NavigationMenuTrigger 
// } from "./ui/navigation-menu";
// import { Avatar, AvatarFallback } from "./ui/avatar";
// import { useLocation } from "@remix-run/react";

// const pageInfo = {
//     '/dashboard': {
//         title: 'Hello John!',
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
//     const currentPage = pageInfo[location.pathname as keyof typeof pageInfo] || pageInfo['/dashboard'];

//     return (
//         <header className="flex items-center justify-between mb-8">
//             <div>
//                 <h1 className="text-3xl font-medium">{currentPage.title}</h1>
//                 <p className="text-muted-foreground mt-1">{currentPage.subtitle}</p>
//             </div>

//             <NavigationMenu>
//                 <NavigationMenuList>
//                     {/* optional */}
//                     {/* <Button variant="ghost" size="icon">
//                         <Sun className="w-5 h-5" />
//                     </Button> */}

//                     <NavigationMenuItem className="pl-8">
//                         <NavigationMenuTrigger className="h-auto p-0 hover:bg-transparent data-[state=open]:bg-transparent focus:bg-transparent">
//                             <Avatar className="transition-all cursor-pointer">
//                                 <AvatarFallback>JS</AvatarFallback>
//                             </Avatar>
//                         </NavigationMenuTrigger>
//                         <NavigationMenuContent className="mr-4">
//                             <ul className="w-48 p-2">
//                                 <li>
//                                     <NavigationMenuLink asChild>
//                                         <a href="#"
//                                             className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-destructive transition-colors"
//                                         >
//                                             <LogOut className="w-4 h-4" />
//                                             <span>Log out</span>
//                                         </a>
//                                     </NavigationMenuLink>
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
    NavigationMenuLink, 
    NavigationMenuList, 
    NavigationMenuTrigger 
} from "./ui/navigation-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { authClient } from "~/auth-client";
import { useEffect, useState } from "react";

export function Header() {
    const [user, setUser] = useState({});

    useEffect(() => {
         authClient.getSession().then((response) => {
            console.log('response', response)
            setUser(response?.data?.user);
         });
    }, []);

    return (
        <header className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-medium">Hello {user?.first_name} {user?.last_name}!</h1>
                <p className=" text-muted-foreground mt-1">Overview & Analytics</p>
            </div>

            {/* Spacer to push avatar to the right on mobile */}
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
                                <AvatarFallback>JS</AvatarFallback>
                            </Avatar>
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="mr-4">
                            <ul className="w-48 p-2">
                                <li>
                                    <a 
                                        href="#"
                                        className="flex items-center gap-3 px-3 py-2 rounded-md text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Log out</span>
                                    </a>
                                </li>
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </header>
    );
}