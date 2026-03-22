'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { User, Lock, ShieldCheck, LogOut, Ticket } from 'lucide-react';
import { toast } from 'sonner';

const menuItems = [
  { href: '/dashboard/account', label: 'Profile', icon: User },
  { href: '/dashboard/account/security', label: 'Security', icon: Lock },
  { href: '/dashboard/account/account-type', label: 'Account Type', icon: ShieldCheck },
];

function SidebarLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  const { state } = useSidebar();
  return (
    <span
      className={`transition-all ${className || ''} ${
        state === 'collapsed' ? 'w-0 opacity-0 overflow-hidden' : 'opacity-100'
      }`}
    >
      {children}
    </span>
  );
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  return (
    <div className="min-h-screen w-full">
      <div className="flex flex-1">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader className="border-b px-3 py-4 h-14">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary">
                <Ticket className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <SidebarLabel className="font-bold tracking-tight text-base">Tickale</SidebarLabel>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="px-3">Settings</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={pathname === item.href}
                        onClick={() => router.push(item.href)}
                        tooltip={item.label}
                      >
                        <item.icon className="h-4 w-4" />
                        <SidebarLabel>{item.label}</SidebarLabel>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-3 space-y-1">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={user?.name ?? 'Profile'} className="cursor-default hover:bg-transparent">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {user ? getInitials(user.name) : '?'}
                  </div>
                  <SidebarLabel>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-medium truncate">{user?.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                    </div>
                  </SidebarLabel>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Log Out"
                  onClick={handleLogout}
                  className="text-red-500 hover:bg-red-500/10 data-[active]:bg-red-500/10 data-[active]:text-red-500"
                >
                  <LogOut className="h-4 w-4" />
                  <SidebarLabel>Log Out</SidebarLabel>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <h1 className="text-sm font-semibold">Account Settings</h1>
          </header>
          {children}
        </SidebarInset>
      </div>
    </div>
  );
}
