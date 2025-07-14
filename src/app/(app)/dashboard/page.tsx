
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Activity,
  CircleDollarSign,
  Clock,
  AlertTriangle,
  WandSparkles,
  Check,
  Loader2,
} from 'lucide-react';
import { useAppData } from '@/components/app-provider';
import { formatDistanceToNow, isPast, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DealStatus } from '@/lib/types';
import {
  generateWeeklyBriefing,
  GenerateWeeklyBriefingOutput,
} from '@/ai/flows/generate-weekly-briefing';
import { useState } from 'react';
import Link from 'next/link';

const statusColors: Record<DealStatus, string> = {
  Upcoming:
    'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
  'In Progress':
    'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
  'Awaiting Payment':
    'border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
  Completed:
    'border-transparent bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
  Overdue:
    'border-transparent bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
};

function AiBriefingCard() {
  const { deals, user, userProfile, isAdmin } = useAppData();
  const [briefing, setBriefing] = useState<GenerateWeeklyBriefingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isProPlan = userProfile?.plan === 'Pro' || isAdmin;

  const getBriefing = async () => {
    if (!user || !deals) return;
    setIsLoading(true);
    try {
      // Serialize deals to plain objects before sending to the server action
      const plainDeals = deals.map(deal => ({
        id: deal.id,
        campaignName: deal.campaignName,
        brandName: deal.brandName,
        status: deal.status,
        dueDate: deal.dueDate,
        payment: deal.payment,
        tasks: deal.tasks.map(task => ({
          id: task.id,
          title: task.title,
          completed: task.completed,
        })),
      }));

      const result = await generateWeeklyBriefing({
        deals: plainDeals,
        userName: user.displayName || 'Creator',
      });
      setBriefing(result);
    } catch (error) {
      console.error('Error getting weekly briefing:', error);
      // You could optionally set an error state here
    } finally {
      setIsLoading(false);
    }
  };

  if (!isProPlan) {
    return (
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
           <CardTitle className="flex items-center gap-2">
            <WandSparkles />
            Unlock Your AI Weekly Briefing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Upgrade to the Pro plan to get a personalized summary of your weekly priorities, powered by AI.
          </p>
          <Button asChild>
            <Link href="/settings?tab=billing">Upgrade to Pro</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WandSparkles className="text-primary" />
          AI Weekly Briefing
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!briefing && !isLoading && (
          <div className="text-center p-4">
            <p className="text-muted-foreground mb-4">
              Click the button to generate your personalized weekly plan.
            </p>
            <Button onClick={getBriefing}>
              Generate Briefing
            </Button>
          </div>
        )}
        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        {briefing && (
          <div className="space-y-4">
            <p className="font-semibold text-lg">{briefing.greeting}</p>
            <ul className="space-y-3">
              {briefing.summaryPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                  <span className="text-muted-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Collaborations</CardTitle>
            <CardDescription>
              An overview of your most recent deals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-[80px] rounded-full" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-[60px] ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Reminders</CardTitle>
            <CardDescription>
              Action items that need your attention.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="ml-4 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { deals, loadingData } = useAppData();

  if (loadingData) {
    return <DashboardSkeleton />;
  }

  const recentDeals = deals.slice(0, 5);

  const stats = {
    active: deals.filter((d) => d.status === 'In Progress').length,
    overdue: deals.filter(
      (d) => d.status === 'Overdue' || (d.status !== 'Completed' && d.dueDate && isPast(parseISO(d.dueDate)))
    ).length,
    unpaid: deals.filter((d) => d.status === 'Awaiting Payment').length,
    upcoming: deals.filter((d) => d.status === 'Upcoming').length,
  };

  const statCards = [
    {
      title: 'Active Deals',
      value: stats.active.toString(),
      icon: Activity,
      color: 'text-primary',
    },
    {
      title: 'Overdue Tasks',
      value: stats.overdue.toString(),
      icon: AlertTriangle,
      color: 'text-destructive',
    },
    {
      title: 'Awaiting Payment',
      value: stats.unpaid.toString(),
      icon: CircleDollarSign,
      color: 'text-amber-500',
    },
    {
      title: 'Upcoming Deadlines',
      value: stats.upcoming.toString(),
      icon: Clock,
      color: 'text-blue-500',
    },
  ];

  const reminders = deals
    .filter(
      (deal) => deal.dueDate && (deal.status === 'Upcoming' || deal.status === 'Overdue')
    )
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )
    .slice(0, 5)
    .map((deal) => {
      const dueDate = parseISO(deal.dueDate);
      const isOverdue = deal.status === 'Overdue' || isPast(dueDate);
      return {
        ...deal,
        dueText: isOverdue
          ? `Overdue by ${formatDistanceToNow(dueDate)}`
          : `Due ${formatDistanceToNow(dueDate, { addSuffix: true })}`,
        isOverdue: isOverdue,
      };
    });

  return (
    <div className="flex flex-col gap-6">
      <AiBriefingCard />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon
                className={`h-4 w-4 text-muted-foreground ${stat.color}`}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Collaborations</CardTitle>
            <CardDescription>
              An overview of your most recent deals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentDeals.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentDeals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell className="font-medium">
                        {deal.brandName}
                      </TableCell>
                      <TableCell>{deal.campaignName}</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            'capitalize',
                            statusColors[deal.status]
                          )}
                        >
                          {deal.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ${deal.payment.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <p>No recent collaborations to display.</p>
                <p className="text-sm">Add a new deal to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Reminders</CardTitle>
            <CardDescription>
              Action items that need your attention.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reminders.length > 0 ? (
              <div className="space-y-4">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-start">
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                        reminder.isOverdue
                          ? 'bg-destructive/10'
                          : 'bg-secondary'
                      )}
                    >
                      {reminder.isOverdue ? (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      ) : (
                        <Clock className="h-4 w-4 text-secondary-foreground" />
                      )}
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {reminder.campaignName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        For {reminder.brandName}
                      </p>
                      <p
                        className={cn(
                          'text-xs',
                          reminder.isOverdue
                            ? 'font-medium text-destructive'
                            : 'text-muted-foreground'
                        )}
                      >
                        {reminder.dueText}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <p>No active reminders.</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
