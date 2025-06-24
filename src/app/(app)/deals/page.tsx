import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { mockDeals } from "@/lib/mock-data";
import { type DealStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const statusColors: Record<DealStatus, string> = {
  "Upcoming": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "In Progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  "Awaiting Payment": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  "Completed": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "Overdue": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const DealTable = ({ status }: { status?: DealStatus }) => {
  const deals = status ? mockDeals.filter((deal) => deal.status === status) : mockDeals;

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
              <Badge className={`${statusColors[deal.status]} border-none`}>{deal.status}</Badge>
            </TableCell>
            <TableCell>{deal.deliverables}</TableCell>
            <TableCell>{deal.dueDate}</TableCell>
            <TableCell className="text-right">${deal.payment.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default function DealsPage() {
  const tabs: { value: DealStatus | "all", label: string }[] = [
    { value: "all", label: "All" },
    { value: "Upcoming", label: "Upcoming" },
    { value: "In Progress", label: "In Progress" },
    { value: "Awaiting Payment", label: "Awaiting Payment" },
    { value: "Overdue", label: "Overdue" },
    { value: "Completed", label: "Completed" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Deal Tracker</CardTitle>
            <CardDescription>Manage your brand collaborations.</CardDescription>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Deal
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList>
            {tabs.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="all">
            <DealTable />
          </TabsContent>
          {tabs.filter(t => t.value !== 'all').map(tab => (
             <TabsContent key={tab.value} value={tab.value}>
               <DealTable status={tab.value as DealStatus} />
             </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
