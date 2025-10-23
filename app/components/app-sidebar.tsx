import { Receipt, Folder, PieChart, LayoutDashboard, Menu, X } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader } from './ui/sidebar';
import { useLocation, Link } from '@remix-run/react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { title: 'All Receipts', icon: Receipt, href: '/dashboard/receipts' },
    { title: 'Categories', icon: Folder, href: '/dashboard/categories' },
    { title: 'Reports', icon: PieChart, href: '/dashboard/reports' },
];

export function AppSidebar() {
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const isActiveRoute = (href: string) => {
        if (href === '/dashboard') {
            return location.pathname === href;
        }
        return location.pathname.startsWith(href);
    };

    const SidebarNav = ({ isMobile = false }: { isMobile?: boolean }) => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-2 px-4 mb-8">
                <img 
                    src="https://cdn.rfitzy.net/3d027a53d02c/files/applogo_63928119579192691.svg" 
                    className="w-32 h-auto" 
                    alt="App Logo" 
                />
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 flex flex-col gap-1 px-2">
                {menuItems.map((item) => {
                    const isActive = isActiveRoute(item.href);
                    return (
                        <Link
                            key={item.title}
                            to={item.href}
                            onClick={() => isMobile && setOpen(false)}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                                ${isActive
                                    ? 'bg-primary/10 text-primary font-medium shadow-sm'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                }
                            `}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                            <span className="text-sm">{item.title}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer - Optional */}
            <div className="px-4 py-4 border-t border-border mt-auto">
                <p className="text-xs text-muted-foreground">
                    © 2025 PaperTrail
                </p>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Sidebar - Sheet */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild className="md:hidden ">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="fixed top-7 left-4 z-50 bg-background border border-border shadow-sm hover:bg-accent"
                    >
                        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                    <div className="h-full py-6">
                        <SidebarNav isMobile={true} />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <Sidebar className="hidden lg:flex border-r border-border">
                <div className="w-64 h-full py-6">
                    <SidebarNav />
                </div>
            </Sidebar>
        </>
    );
}