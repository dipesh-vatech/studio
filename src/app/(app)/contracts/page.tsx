'use client';

import { useState, type ChangeEvent } from 'react';
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
import { type Contract } from '@/lib/types';
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

export default function ContractsPage() {
  const {
    contracts,
    processContract,
    updateContractStatus,
    deleteContract,
    loadingData,
  } = useAppData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
                <Upload className="mr-2 h-4 w-4" /> Upload Contract
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New Contract</DialogTitle>
                <DialogDescription>
                  Select a PDF file to upload. We'll use AI to process it and
                  extract key details.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpload}>
                <div className="grid gap-4 py-4">
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
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
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
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No contracts found. Upload one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
