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
import { mockDeals } from "@/lib/mock-data";
import { Activity, CircleDollarSign, Clock, AlertTriangle } from "lucide-react";

export default function Dashboard() {
  const recentDeals = mockDeals.slice(0, 4);

  const stats = [
    { title: "Active Deals", value: "3", icon: Activity, color: "text-primary" },
    { title: "Overdue Tasks", value: "1", icon: AlertTriangle, color: "text-destructive" },
    { title: "Unpaid Invoices", value: "2", icon: CircleDollarSign, color: "text-amber-500" },
    { title: "Upcoming Deadlines", value: "5", icon: Clock, color: "text-blue-500" },
  ];

  const reminders = [
    { text: "Follow up with BrandFresh", due: "in 2 days" },
    { text: "Post TechGizmo review", due: "in 5 days" },
    { text: "Invoice FitFuel", due: "OVERDUE" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
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
                {recentDeals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell className="font-medium">{deal.brandName}</TableCell>
                    <TableCell>{deal.campaignName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{deal.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">${deal.payment.toLocaleString()}</TableCell>
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
          <CardContent>
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
                    <p className={`text-sm ${reminder.due === 'OVERDUE' ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {reminder.due}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
