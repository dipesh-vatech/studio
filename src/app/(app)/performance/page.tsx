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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Star } from "lucide-react";
import { mockPerformancePosts, engagementChartData } from "@/lib/mock-data";

export default function PerformancePage() {
  const chartConfig = {
    likes: {
      label: "Likes",
      color: "hsl(var(--primary))",
    },
    comments: {
      label: "Comments",
      color: "hsl(var(--accent))",
    },
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Engagement Overview</CardTitle>
          <CardDescription>Monthly likes and comments trend.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={engagementChartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="likes" fill="var(--color-likes)" radius={4} />
              <Bar dataKey="comments" fill="var(--color-comments)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Post Performance</CardTitle>
              <CardDescription>Detailed metrics for your recent posts.</CardDescription>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Post Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Saves</TableHead>
                <TableHead>Conversion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPerformancePosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.postTitle}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{post.platform}</Badge>
                  </TableCell>
                  <TableCell>{post.likes.toLocaleString()}</TableCell>
                  <TableCell>{post.comments.toLocaleString()}</TableCell>
                  <TableCell>{post.saves.toLocaleString()}</TableCell>
                  <TableCell>
                    {post.conversion && (
                      <Badge className="bg-green-100 text-green-800 border-none hover:bg-green-200">
                        <Star className="mr-2 h-3 w-3" />
                        Yes
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
