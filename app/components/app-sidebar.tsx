import { Receipt, Folder, PieChart, Sun, Upload, User, Settings, LogOut, DollarSign, LayoutDashboard } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader } from './ui/sidebar';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from '@radix-ui/react-navigation-menu';
import AppLogo from "/AppLogo.svg";


// App Sidebar Component
export function AppSidebar() {
    const menuItems = [
        { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', isActive: true },
        { title: 'All Receipts', icon: Receipt, href: '/dashboard/receipts', isActive: false },
        { title: 'Categories', icon: Folder, href: '/dashboard/categories', isActive: false },
        { title: 'Reports', icon: PieChart, href: '#', isActive: false },
    ];

    return (
        <Sidebar className='p-8'>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 mb-12">
                    <img src={AppLogo} className="w-32 h-auto" />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <NavigationMenu orientation="vertical" className="max-w-none">
                            <NavigationMenuList className="flex-col space-x-0 space-y-8">
                                {menuItems.map((item) => (
                                    <NavigationMenuItem key={item.title} className="w-full">
                                        <NavigationMenuLink
                                            href={item.href}
                                            className={`
                        flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors
                        ${item.isActive
                                                    ? 'bg-[#EFEFFF] text-secondary-foreground font-medium'
                                                    : 'text-muted-foreground hover:bg-[#EFEFFF] hover:text-accent-foreground'
                                                }
                      `}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span>{item.title}</span>
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}