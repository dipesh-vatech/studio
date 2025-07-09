
'use client';

import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Handshake,
  Lightbulb,
  BarChart,
  FileText,
  Settings,
  CalendarDays,
  DollarSign,
  Search,
} from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/deals', label: 'Deals', icon: Handshake },
  { href: '/scheduler', label: 'Scheduler', icon: CalendarDays },
  { href: '/financials', label: 'Financials', icon: DollarSign },
  { href: '/performance', label: 'Content Analytics', icon: BarChart },
  { href: '/contracts', label: 'Contracts', icon: FileText },
  { href: '/pitch-generator', label: 'Pitch AI', icon: Lightbulb },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === link.href}
            tooltip={link.label}
          >
            <a href={link.href}>
              <link.icon />
              <span>{link.label}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
