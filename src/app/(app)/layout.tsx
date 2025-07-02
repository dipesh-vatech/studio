'use client';

import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { Button } from '@/components/ui/button';
import { Bell, BriefcaseBusiness, Loader2, Clock } from 'lucide-react';
import { AppProvider, useAppData } from '@/components/app-provider';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { formatDistanceToNow, isPast, parseISO } from 'date-fns';

function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, loadingAuth, deals, dismissDealNotification } = useAppData();

  useEffect(() => {
    if (!loadingAuth && !user) {
      redirect('/login');
    }
  }, [user, loadingAuth]);

  const notifications = deals
    .filter(
      (deal) =>
        (deal.status === 'Upcoming' || deal.status === 'Overdue') &&
        !deal.notificationDismissed
    )
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )
    .slice(0, 5)
    .map((deal) => {
      const dueDate = parseISO(deal.dueDate);
      const isOverdue = deal.status === 'Overdue' || isPast(dueDate);
      return {
        id: deal.id,
        text: `Check on: ${deal.campaignName}`,
        brand: deal.brandName,
        due: isOverdue
          ? 'OVERDUE'
          : formatDistanceToNow(dueDate, { addSuffix: true }),
        isOverdue: isOverdue,
      };
    });

  if (loadingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Or a redirect, but useEffect handles it
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-primary"
            >
              <BriefcaseBusiness className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">
              CollabFlow
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarFooter>
          {/* Footer content can go here */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <SidebarTrigger className="md:peer-data-[state=expanded]:hidden" />
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <Card className="border-none shadow-none">
                  <CardHeader className="p-4">
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                      You have {notifications.length} unread notifications.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {notifications.length > 0 ? (
                      <div className="space-y-2">
                        {notifications.map((notification) => (
                          <Button
                            key={notification.id}
                            variant="ghost"
                            className="h-auto w-full justify-start rounded-md p-0 hover:bg-accent whitespace-normal"
                            onClick={() =>
                              dismissDealNotification(notification.id)
                            }
                          >
                            <div className="flex w-full items-start p-2">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                                <Clock className="h-4 w-4 text-secondary-foreground" />
                              </div>
                              <div className="ml-3 flex-1 space-y-1 text-left">
                                <p className="text-sm font-medium leading-none break-words">
                                  {notification.text}
                                </p>
                                <p
                                  className={`text-sm ${
                                    notification.isOverdue
                                      ? 'font-semibold text-destructive'
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  Due {notification.due}
                                </p>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-muted-foreground">
                        <p>No new notifications.</p>
                        <p className="text-sm">You're all caught up!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </PopoverContent>
            </Popover>
            <UserNav />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <ProtectedLayout>{children}</ProtectedLayout>
    </AppProvider>
  );
}
