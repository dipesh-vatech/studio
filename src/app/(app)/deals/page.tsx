
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
import { type Deal, type DealStatus, type Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  PlusCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

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

const DealTasks = ({ deal }: { deal: Deal }) => {
  const { addTaskToDeal, updateTaskStatus, deleteTask } = useAppData();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const completedTasks = deal.tasks.filter((t) => t.completed).length;
  const totalTasks = deal.tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTaskToDeal(deal.id, newTaskTitle.trim());
      setNewTaskTitle('');
    }
  };

  return (
    <div className="p-4 space-y-4 bg-muted/50">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-lg">Tasks</h4>
        <div className="text-sm text-muted-foreground">
          {completedTasks} of {totalTasks} completed
        </div>
      </div>

      <Progress value={progress} />

      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
        {deal.tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-2 rounded-md bg-background"
          >
            <Checkbox
              id={`task-${task.id}`}
              checked={task.completed}
              onCheckedChange={(checked) =>
                updateTaskStatus(deal.id, task.id, !!checked)
              }
            />
            <Label
              htmlFor={`task-${task.id}`}
              className={cn(
                'flex-1 cursor-pointer',
                task.completed && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </Label>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => deleteTask(deal.id, task.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddTask} className="flex gap-2 pt-2">
        <Input
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task..."
        />
        <Button type="submit">Add Task</Button>
      </form>
    </div>
  );
};

const DealTable = ({
  deals,
  onStatusChange,
}: {
  deals: Deal[];
  onStatusChange: (dealId: string, newStatus: DealStatus) => void;
}) => {
  const [expandedDealId, setExpandedDealId] = useState<string | null>(null);

  const toggleRow = (dealId: string) => {
    setExpandedDealId((prevId) => (prevId === dealId ? null : dealId));
  };

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
          <TableHead className="w-[40px]"></TableHead>
          <TableHead>Brand</TableHead>
          <TableHead>Campaign</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead className="text-right">Payment</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deals.map((deal) => {
          const totalTasks = deal.tasks.length;
          const completedTasks = deal.tasks.filter((t) => t.completed).length;
          const progress =
            totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
          return (
            <React.Fragment key={deal.id}>
              <TableRow
                onClick={() => toggleRow(deal.id)}
                className="cursor-pointer"
              >
                <TableCell className="pl-4">
                  {expandedDealId === deal.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{deal.brandName}</TableCell>
                <TableCell>{deal.campaignName}</TableCell>
                <TableCell>
                  <Select
                    value={deal.status}
                    onValueChange={(value) => {
                      onStatusChange(deal.id, value as DealStatus)
                    }}
                  >
                    <SelectTrigger
                      onClick={(e) => e.stopPropagation()}
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
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="w-24" />
                    <span className="text-xs text-muted-foreground">{`${Math.round(
                      progress
                    )}%`}</span>
                  </div>
                </TableCell>
                <TableCell>{deal.dueDate}</TableCell>
                <TableCell className="text-right">
                  ${deal.payment.toLocaleString()}
                </TableCell>
              </TableRow>
              {expandedDealId === deal.id && (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <DealTasks deal={deal} />
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default function DealsPage() {
  const { deals, addDeal, updateDealStatus, userProfile } = useAppData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dealLimitReached = userProfile?.plan === 'Free' && deals.length >= 10;

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

  async function onSubmit(values: z.infer<typeof newDealSchema>) {
    setIsSubmitting(true);
    try {
      await addDeal(values);
      form.reset();
      setIsDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
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
              Manage your brand collaborations and their tasks.
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Deal
              </Button>
            </DialogTrigger>
            <DialogContent>
              {dealLimitReached ? (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <AlertCircle className="text-destructive" />
                      Free Plan Limit Reached
                    </DialogTitle>
                    <DialogDescription>
                      You've reached the 10-deal limit for the Free plan. To add
                      more deals, please upgrade to our Pro plan.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="!mt-4 sm:justify-start">
                    <Button asChild>
                      <Link href="/settings?tab=billing">Upgrade to Pro</Link>
                    </Button>
                    <DialogClose asChild>
                      <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                  </DialogFooter>
                </>
              ) : (
                <>
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
                                <Input
                                  placeholder="e.g. BrandFresh"
                                  {...field}
                                />
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
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Add Deal
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </>
              )}
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
