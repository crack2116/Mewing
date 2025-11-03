'use client';
import { Search, Bell, Home, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import Link from "next/link";
import Sidebar from "./sidebar";
import { useTheme } from "next-themes";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Header() {
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');
  const { theme, setTheme } = useTheme();
  const [searchVisible, setSearchVisible] = useState(false);

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>

        <div className="w-full flex-1">
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/"><Home className="h-4 w-4" /></Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Panel de Control</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-2">
            <div className={cn(
                "relative flex items-center transition-all duration-300",
                searchVisible ? "w-[200px] lg:w-[320px]" : "w-0"
            )}>
                <Input
                    type="search"
                    placeholder="Buscar..."
                    className={cn(
                        "w-full appearance-none bg-transparent pl-8 shadow-none transition-opacity duration-300",
                        searchVisible ? "opacity-100" : "opacity-0"
                    )}
                />
                 <Search className={cn(
                     "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground transition-opacity duration-300",
                     searchVisible ? "opacity-100" : "opacity-0"
                     )} />
            </div>
          <Button variant="ghost" size="icon" onClick={() => setSearchVisible(!searchVisible)}>
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-primary ring-2 ring-background"></span>
            <span className="sr-only">Notifications</span>
          </Button>
          <Avatar className="h-9 w-9">
            {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" data-ai-hint={userAvatar.imageHint} />}
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
    </header>
  );
}