
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { type Deal, type DealStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppData } from '@/components/app-provider';

const statusColors: Record<DealStatus, string> = {
  Upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'In Progress':
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Awaiting Payment':
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  Completed:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const newDealSchema = z.object({
  brandName: z.string().min(1, 'Brand name is required'),
  campaignName: z.string().min(1, 'Campaign name is required'),
  deliverables: z.string().min(1, 'Deliverables are required'),
  dueDate: z.string().min(1, 'Due date is required'),
  payment: z.coerce
    .number({ invalid_type_error: 'Please enter a valid number.' })
    .min(0, 'Payment must be a positive number'),
});

const DealTable = ({
  deals,
  onStatusChange,
}: {
  deals: Deal[];
  onStatusChange: (dealId: string, newStatus: DealStatus) => void;
}) => {
  if (deals.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No deals to display.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Brand</TableHead>
          <TableHead>Campaign</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Deliverables</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead className="text-right">Payment</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deals.map((deal) => (
          <TableRow key={deal.id}>
            <TableCell className="font-medium">{deal.brandName}</TableCell>
            <TableCell>{deal.campaignName}</TableCell>
            <TableCell>
              <Select
                value={deal.status}
                onValueChange={(value) =>
                  onStatusChange(deal.id, value as DealStatus)
                }
              >
                <SelectTrigger
                  className={cn(
                    'w-[160px] border-none focus:ring-0 focus:ring-offset-0 rounded-full px-2.5 py-1 text-xs font-semibold',
                    statusColors[deal.status]
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(statusColors).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>{deal.deliverables}</TableCell>
            <TableCell>{deal.dueDate}</TableCell>
            <TableCell className="text-right">
              ${deal.payment.toLocaleString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default function DealsPage() {
  const { deals, addDeal, updateDealStatus } = useAppData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof newDealSchema>>({
    resolver: zodResolver(newDealSchema),
    defaultValues: {
      brandName: '',
      campaignName: '',
      deliverables: '',
      dueDate: '',
      payment: 0,
    },
  });

  function onSubmit(values: z.infer<typeof newDealSchema>) {
    addDeal(values);
    form.reset();
    setIsDialogOpen(false);
  }

  const tabs: { value: DealStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'Upcoming', label: 'Upcoming' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Awaiting Payment', label: 'Awaiting Payment' },
    { value: 'Overdue', label: 'Overdue' },
    { value: 'Completed', label: 'Completed' },
  ];

  const getDealsByStatus = (status: DealStatus | 'all') => {
    if (status === 'all') return deals;
    return deals.filter((deal) => deal.status === status);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Deal Tracker</CardTitle>
            <CardDescription>
              Manage your brand collaborations.
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Deal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a New Deal</DialogTitle>
                <DialogDescription>
                  Enter the details of your new collaboration.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="brandName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. BrandFresh" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="campaignName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campaign Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Summer Launch"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="deliverables"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deliverables</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g. 2 posts, 3 stories"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="payment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g. 1500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Add Deal</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <DealTable
                deals={getDealsByStatus(tab.value)}
                onStatusChange={updateDealStatus}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
