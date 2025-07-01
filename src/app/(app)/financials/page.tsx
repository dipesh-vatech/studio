
'use client';

import { useMemo } from 'react';
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { useAppData } from '@/components/app-provider';
import { DollarSign, Banknote, FileCheck2, AlertTriangle, Loader2 } from 'lucide-react';
import { subMonths, format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function FinancialsPage() {
  const { deals, loadingData } = useAppData();

  const financialStats = useMemo(() => {
    if (!deals) {
      return {
        totalRevenue: 0,
        outstandingPayments: 0,
        completedDeals: 0,
        averageDealValue: 0,
        pendingPaymentDeals: [],
      };
    }

    const completedDeals = deals.filter(d => d.status === 'Completed');
    const awaitingPaymentDeals = deals.filter(d => d.status === 'Awaiting Payment');

    const totalRevenue = completedDeals.reduce((sum, deal) => sum + deal.payment, 0);
    const outstandingPayments = awaitingPaymentDeals.reduce((sum, deal) => sum + deal.payment, 0);
    const allDealsWithPayment = deals.filter(d => d.payment > 0);
    const averageDealValue = allDealsWithPayment.length > 0
      ? deals.reduce((sum, deal) => sum + deal.payment, 0) / allDealsWithPayment.length
      : 0;

    return {
      totalRevenue,
      outstandingPayments,
      completedDeals: completedDeals.length,
      averageDealValue,
      pendingPaymentDeals: awaitingPaymentDeals,
    };
  }, [deals]);

  const incomeChartData = useMemo(() => {
    const monthLabels = Array.from({ length: 6 }).map((_, i) => {
      return format(subMonths(new Date(), 5 - i), 'MMM');
    });

    const chartData = monthLabels.map((label) => ({
      month: label,
      revenue: 0,
    }));
    
    if (!deals) return chartData;

    deals.filter(d => d.status === 'Completed').forEach((deal) => {
      try {
        const dealDate = parseISO(deal.dueDate);
        const dealMonth = format(dealDate, 'MMM');
        const monthData = chartData.find((d) => d.month === dealMonth);
        if (monthData) {
          monthData.revenue += deal.payment;
        }
      } catch (e) {
        // Ignore posts with invalid dates
      }
    });

    return chartData;
  }, [deals]);
  
  const revenueByBrandData = useMemo(() => {
    if (!deals) return [];
    
    const brandRevenue = new Map<string, number>();

    deals.filter(d => d.status === 'Completed').forEach(deal => {
      brandRevenue.set(deal.brandName, (brandRevenue.get(deal.brandName) || 0) + deal.payment);
    });

    return Array.from(brandRevenue.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // top 5 brands

  }, [deals]);
  
  if (loadingData) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Revenue', value: `$${financialStats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-500" },
    { title: 'Outstanding Payments', value: `$${financialStats.outstandingPayments.toLocaleString()}`, icon: AlertTriangle, color: "text-amber-500" },
    { title: 'Completed Deals', value: financialStats.completedDeals, icon: FileCheck2, color: "text-blue-500" },
    { title: 'Average Deal Value', value: `$${financialStats.averageDealValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: Banknote, color: "text-primary" },
  ];
  
  const incomeChartConfig = {
    revenue: {
      label: 'Revenue',
      color: 'hsl(var(--primary))',
    },
  };
  
  const brandChartConfig = {
    revenue: {
      label: 'Revenue',
    },
    ...revenueByBrandData.reduce((acc, brand, index) => {
      acc[brand.name] = {
        label: brand.name,
        color: COLORS[index % COLORS.length],
      };
      return acc;
    }, {} as any),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Income Over Time</CardTitle>
            <CardDescription>Revenue from completed deals in the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={incomeChartConfig} className="h-[300px] w-full">
              <BarChart data={incomeChartData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Brand</CardTitle>
            <CardDescription>Top 5 brands by revenue from completed deals.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {revenueByBrandData.length > 0 ? (
              <ChartContainer config={brandChartConfig} className="h-[300px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <Pie data={revenueByBrandData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110}>
                    {revenueByBrandData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ChartContainer>
            ) : (
                <div className="flex h-[300px] items-center justify-center text-center text-muted-foreground">
                    <p>No revenue data yet.<br/>Complete a deal to see it here.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Pending Payments</CardTitle>
          <CardDescription>A list of all deals that are currently awaiting payment.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financialStats.pendingPaymentDeals.length > 0 ? (
                financialStats.pendingPaymentDeals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell className="font-medium">{deal.brandName}</TableCell>
                    <TableCell>{deal.campaignName}</TableCell>
                    <TableCell>{deal.dueDate}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{deal.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">${deal.payment.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    All caught up! No pending payments.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
