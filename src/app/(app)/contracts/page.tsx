'use client';

import { useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, CheckCircle, XCircle, Loader, Trash2 } from 'lucide-react';
import { type Contract, type ManualContract } from '@/lib/types';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAppData } from '@/components/app-provider';

const statusIcons: Record<Contract['status'], React.ElementType> = {
  Done: CheckCircle,
  Processing: Loader,
  Error: XCircle,
};

const statusColors: Record<Contract['status'], string> = {
  Done: 'text-green-500',
  Processing: 'text-blue-500 animate-spin',
  Error: 'text-destructive',
};

const statusBadgeColors: Record<Contract['status'], string> = {
  Done: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const manualContractSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  brandName: z.string().min(1, 'Brand name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  deliverables: z.string().min(1, 'Deliverables are required'),
  payment: z.coerce
    .number({ invalid_type_error: 'Please enter a valid number.' })
    .min(0, 'Payment must be a positive number'),
});

function MobileContractSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-7 w-28 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ContractsPage() {
  const {
    contracts,
    processContract,
    updateContractStatus,
    deleteContract,
    loadingData,
    addManualContract,
  } = useAppData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const form = useForm<z.infer<typeof manualContractSchema>>({
    resolver: zodResolver(manualContractSchema),
    defaultValues: {
      fileName: '',
      brandName: '',
      startDate: '',
      endDate: '',
      deliverables: '',
      payment: 0,
    },
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    await processContract(selectedFile);
    setIsUploading(false);
    setIsDialogOpen(false);
    setSelectedFile(null);
  };

  const onManualSubmit = async (values: z.infer<typeof manualContractSchema>) => {
    setIsSubmittingManual(true);
    try {
      await addManualContract(values);
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      // Error is handled by a toast in the provider
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const renderEmptyState = () => (
    <div className="text-center h-48 flex flex-col justify-center items-center">
      <p className="text-muted-foreground">No contracts found.</p>
      <p className="text-sm text-muted-foreground">
        Add one to get started.
      </p>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Contract Management</CardTitle>
            <CardDescription>Upload and track your agreements.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" /> Add Contract
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Add New Contract</DialogTitle>
                <DialogDescription>
                  Upload a PDF for automatic processing or enter the details
                  manually.
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload PDF</TabsTrigger>
                  <TabsTrigger value="manual">Add Manually</TabsTrigger>
                </TabsList>
                <TabsContent value="upload">
                  <form onSubmit={handleUpload}>
                    <div className="grid gap-4 py-4">
                      <p className="text-sm text-muted-foreground">
                        Select a PDF file to upload. We'll use AI to process it
                        and extract key details.
                      </p>
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="contract-file">Contract PDF</Label>
                        <Input
                          id="contract-file"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={isUploading || !selectedFile}
                      >
                        {isUploading && (
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Upload & Process
                      </Button>
                    </DialogFooter>
                  </form>
                </TabsContent>
                <TabsContent value="manual">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onManualSubmit)}
                      className="space-y-4 pt-4"
                    >
                      <FormField
                        control={form.control}
                        name="fileName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>File/Contract Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Acme Corp Q3" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="brandName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Brand Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Acme Corp" {...field} />
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
                                <Input type="number" placeholder="1500" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
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
                                placeholder="e.g. 2 Instagram posts, 1 Story"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit" disabled={isSubmittingManual}>
                          {isSubmittingManual && (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Save Contract
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="text-right">Payment</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingData ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell>
                      <Skeleton className="h-4 w-[200px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-[120px] rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-[60px] ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : contracts.length > 0 ? (
                contracts.map((contract) => {
                  const Icon = statusIcons[contract.status];
                  return (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">
                        {contract.fileName}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={contract.status}
                          onValueChange={(value) =>
                            updateContractStatus(
                              contract.id,
                              value as Contract['status']
                            )
                          }
                        >
                          <SelectTrigger
                            className={cn(
                              'w-[120px] border-none focus:ring-0 focus:ring-offset-0 rounded-full px-2.5 py-1 text-xs font-semibold',
                              statusBadgeColors[contract.status]
                            )}
                          >
                            <div className="flex items-center gap-1.5">
                              <Icon
                                className={`h-4 w-4 ${
                                  statusColors[contract.status]
                                }`}
                              />
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {(
                              Object.keys(statusIcons) as Array<
                                keyof typeof statusIcons
                              >
                            ).map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{contract.brandName || 'N/A'}</TableCell>
                      <TableCell>
                        {contract.startDate && contract.endDate
                          ? `${contract.startDate} - ${contract.endDate}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        {contract.payment
                          ? `$${contract.payment.toLocaleString()}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the contract
                                record. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteContract(contract.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>{renderEmptyState()}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="space-y-4 md:hidden">
          {loadingData ? (
            <MobileContractSkeleton />
          ) : contracts.length > 0 ? (
            contracts.map((contract) => {
              const Icon = statusIcons[contract.status];
              return (
                <Card key={contract.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-semibold text-base leading-tight truncate">
                        {contract.fileName}
                      </h3>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the contract record.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteContract(contract.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    <div className="text-sm space-y-3 mt-3">
                      <div className="flex items-center justify-between">
                        <Label>Status</Label>
                        <Select
                          value={contract.status}
                          onValueChange={(value) =>
                            updateContractStatus(
                              contract.id,
                              value as Contract['status']
                            )
                          }
                        >
                          <SelectTrigger
                            className={cn(
                              'w-auto h-7 border-none focus:ring-0 focus:ring-offset-0 rounded-full px-2.5 py-1 text-xs font-semibold',
                              statusBadgeColors[contract.status]
                            )}
                          >
                            <div className="flex items-center gap-1.5">
                              <Icon
                                className={`h-3 w-3 ${
                                  statusColors[contract.status]
                                }`}
                              />
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {(
                              Object.keys(statusIcons) as Array<
                                keyof typeof statusIcons
                              >
                            ).map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Brand</Label>
                        <p className="font-medium">
                          {contract.brandName || 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Dates</Label>
                        <p className="font-medium">
                          {contract.startDate && contract.endDate
                            ? `${contract.startDate} to ${contract.endDate}`
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Payment</Label>
                        <p className="font-semibold text-primary">
                          {contract.payment
                            ? `$${contract.payment.toLocaleString()}`
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            renderEmptyState()
          )}
        </div>
      </CardContent>
    </Card>
  );
}
