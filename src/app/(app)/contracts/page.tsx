import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, XCircle, Loader } from "lucide-react";
import { mockContracts } from "@/lib/mock-data";
import { type Contract } from "@/lib/types";

const statusIcons: Record<Contract["status"], React.ElementType> = {
  Done: CheckCircle,
  Processing: Loader,
  Error: XCircle,
};

const statusColors: Record<Contract["status"], string> = {
  Done: "text-green-500",
  Processing: "text-blue-500 animate-spin",
  Error: "text-destructive",
};

export default function ContractsPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Contract Management</CardTitle>
            <CardDescription>Upload and track your agreements.</CardDescription>
          </div>
          <Button>
            <Upload className="mr-2 h-4 w-4" /> Upload Contract
          </Button>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockContracts.map((contract) => {
              const Icon = statusIcons[contract.status];
              return (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.fileName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${statusColors[contract.status]}`} />
                      <span>{contract.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>{contract.brandName || "N/A"}</TableCell>
                  <TableCell>
                    {contract.startDate && contract.endDate
                      ? `${contract.startDate} - ${contract.endDate}`
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    {contract.payment ? `$${contract.payment.toLocaleString()}` : "N/A"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
