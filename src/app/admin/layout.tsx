'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { SiteHeader } from '@/components/app/site-header';
import { Footer } from '@/components/app/footer';
import { LayoutDashboardIcon, UsersIcon, ActivityIcon, FileTextIcon } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { ScrollArea } from '@/components/ui/scroll-area';

const NAV = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboardIcon, exact: true },
  { label: 'Users', href: '/admin/users', icon: UsersIcon },
  { label: 'Activity', href: '/admin/activity', icon: ActivityIcon },
  { label: 'Posts', href: '/admin/posts', icon: FileTextIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && (!isAuthenticated || user?.role !== 'admin')) router.push('/');
  }, [hasHydrated, isAuthenticated, user, router]);

  if (!hasHydrated || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  const activeNav = NAV.find(({ href, exact }) =>
    exact ? pathname === href : pathname.startsWith(href)
  );

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <SiteHeader />
      <div className='p-6 flex h-full w-full overflow-hidden'>
        <div className="flex flex-col min-h-0 max-w-6xl w-full flex-1 mx-auto rounded-lg overflow-hidden border">
          <SidebarProvider className="h-full flex-1 min-h-0">
            <Sidebar collapsible="none" className="hidden md:flex">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Admin</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu className='gap-1'>
                      {NAV.map(({ label, href, icon: Icon, exact }) => {
                        const active = exact ? pathname === href : pathname.startsWith(href);
                        return (
                          <SidebarMenuItem key={href}>
                            <SidebarMenuButton asChild isActive={active}>
                              <Link href={href}>
                                <Icon />
                                <span>{label}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>

            <div className="flex h-full min-h-0 overflow-hidden max-w-full w-full flex-col">
              <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink asChild>
                        <Link href="/admin">Admin</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {activeNav && activeNav.href !== '/admin' && (
                      <>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                          <BreadcrumbPage>{activeNav.label}</BreadcrumbPage>
                        </BreadcrumbItem>
                      </>
                    )}
                  </BreadcrumbList>
                </Breadcrumb>
              </header>
              <div className='flex flex-1 h-full min-h-0 overflow-hidden'>
                <ScrollArea className="flex-1 min-h-0 overflow-hidden h-full">
                  <div className="p-6">{children}</div>
                </ScrollArea>
              </div>
            </div>
          </SidebarProvider>
        </div>
      </div>
    </div>
  );
}
