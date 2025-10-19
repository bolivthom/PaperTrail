import { Sun, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "./ui/navigation-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";

export function Header() {
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-medium">Hello John!</h1>
        <p className=" text-muted-foreground mt-1">Overview & Analytics</p>
      </div>
      
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Button variant="ghost" size="icon" className="">
              <Sun className="w-5 h-5" />
            </Button>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger className="h-auto p-0 hover:bg-transparent data-[state=open]:bg-transparent">
              <Avatar>
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="w-48 p-2">
                <li>
                  <NavigationMenuLink asChild>
                    <a
                      href="#"
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-destructive transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </a>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
}