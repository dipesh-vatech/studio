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
import {
  Activity,
  CircleDollarSign,
  Clock,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useAppData } from '@/components/app-provider';
import { formatDistanceToNow, isPast, parseISO } from 'date-fns';

export default function Dashboard() {
  const { deals, loadingData } = useAppData();

  if (loadingData) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const recentDeals = deals.slice(0, 4);

  const stats = {
    active: deals.filter((d) => d.status === 'In Progress').length,
    overdue: deals.filter((d) => d.status === 'Overdue').length,
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
    .filter((deal) => deal.status === 'Upcoming' || deal.status === 'Overdue')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3)
    .map((deal) => {
      const dueDate = parseISO(deal.dueDate);
      const isOverdue = deal.status === 'Overdue' || isPast(dueDate);
      return {
        text: `Check on: ${deal.campaignName}`,
        brand: deal.brandName,
        due: isOverdue
          ? 'OVERDUE'
          : formatDistanceToNow(dueDate, { addSuffix: true }),
        isOverdue: isOverdue,
      };
    });

  return (
    <div className="flex flex-col gap-6">
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
                        <Badge variant="outline">{deal.status}</Badge>
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
                {reminders.map((reminder, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                      <Clock className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {reminder.text}
                      </p>
                      <p
                        className={`text-sm ${
                          reminder.isOverdue
                            ? 'font-semibold text-destructive'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {reminder.due}
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
