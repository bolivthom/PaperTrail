// import { Receipt, Folder, PieChart, LayoutDashboard, Menu, X } from 'lucide-react';
// import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader } from './ui/sidebar';
// import { useLocation, Link } from '@remix-run/react';
// import { useState } from 'react';
// import { Button } from './ui/button';
// import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
// import AppLogo from "/AppLogo.svg";

// export function AppSidebar() {
//     const location = useLocation();
//     const [open, setOpen] = useState(false);

//     const menuItems = [
//         { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
//         { title: 'All Receipts', icon: Receipt, href: '/dashboard/receipts' },
//         { title: 'Categories', icon: Folder, href: '/dashboard/categories' },
//         { title: 'Reports', icon: PieChart, href: '/dashboard/reports' },
//     ];

//     const SidebarNav = () => (
//         <>
//             <div className="flex items-center gap-2 px-2 mb-12">
//                 <img src={AppLogo} className="w-32 h-auto" alt="App Logo" />
//             </div>
//             <nav className="flex flex-col space-y-8">
//                 {menuItems.map((item) => {
//                     const isActive = location.pathname === item.href;
                    
//                     return (
//                         <Link
//                             key={item.title}
//                             to={item.href}
//                             onClick={() => setOpen(false)}
//                             className={`
//                                 flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors
//                                 ${isActive
//                                     ? 'bg-[#EFEFFF] text-secondary-foreground font-medium'
//                                     : 'text-muted-foreground hover:bg-[#EFEFFF] hover:text-accent-foreground'
//                                 }
//                             `}
//                         >
//                             <item.icon className="w-5 h-5" />
//                             <span>{item.title}</span>
//                         </Link>
//                     );
//                 })}
//             </nav>
//         </>
//     );

//     return (
//         <>
//             {/* Mobile Menu Button */}
//             <div className="lg:hidden fixed top-4 left-4 z-50">
//                 <Sheet open={open} onOpenChange={setOpen}>
//                     <SheetTrigger asChild>
//                         <Button variant="outline" size="icon">
//                             <Menu className="h-5 w-5" />
//                         </Button>
//                     </SheetTrigger>
//                     <SheetContent side="left" className="w-64 p-8">
//                         <SidebarNav />
//                     </SheetContent>
//                 </Sheet>
//             </div>

//             {/* Desktop Sidebar */}
//             <Sidebar className="hidden lg:flex p-8 bg-white border-r border-border">
//                 <SidebarHeader>
//                     <SidebarNav />
//                 </SidebarHeader>
//             </Sidebar>
//         </>
//     );
// }

import { Receipt, Folder, PieChart, LayoutDashboard, Menu, X } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader } from './ui/sidebar';
import { useLocation, Link } from '@remix-run/react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export function AppSidebar() {
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const menuItems = [
        { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { title: 'All Receipts', icon: Receipt, href: '/dashboard/receipts' },
        { title: 'Categories', icon: Folder, href: '/dashboard/categories' },
        { title: 'Reports', icon: PieChart, href: '/dashboard/reports' },
    ];

    const SidebarNav = () => (
        <>
            <div className="flex items-center gap-2 px-2 mb-12">
                <img src={'https://cdn.rfitzy.net/3d027a53d02c/files/applogo_63928119579192691.svg'} className="w-32 h-auto" alt="App Logo" />
            </div>
            <nav className="flex flex-col space-y-8">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    
                    return (
                        <Link
                            key={item.title}
                            to={item.href}
                            onClick={() => setOpen(false)}
                            className={`
                                flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors
                                ${isActive
                                    ? 'bg-[#EFEFFF] text-secondary-foreground font-medium'
                                    : 'text-muted-foreground hover:bg-[#EFEFFF] hover:text-accent-foreground'
                                }
                            `}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.title}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-white">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-8 bg-white">
                        <SidebarNav />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <Sidebar className="hidden lg:flex p-8 bg-white border-r border-border">
                <SidebarHeader className="bg-white">
                    <SidebarNav />
                </SidebarHeader>
                <SidebarContent className="bg-white">
                    <SidebarGroup className="bg-white">
                        <SidebarGroupContent className="bg-white" />
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </>
    );
}