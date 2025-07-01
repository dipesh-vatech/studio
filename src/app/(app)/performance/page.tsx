'use client';

import { useState, useMemo } from 'react';
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Star, WandSparkles, Trash2 } from 'lucide-react';
import type { PerformancePost } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useToast } from '@/hooks/use-toast';
import { extractPostData } from '@/ai/flows/extract-post-data';
import { useAppData } from '@/components/app-provider';
import { subMonths, format, parseISO } from 'date-fns';

export default function PerformancePage() {
  const {
    performancePosts,
    addPerformancePost,
    loadingData,
    deletePerformancePost,
  } = useAppData();
  const [isImporting, setIsImporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [postUrl, setPostUrl] = useState('');
  const { toast } = useToast();

  const chartConfig = {
    likes: {
      label: 'Likes',
      color: 'hsl(var(--primary))',
    },
    comments: {
      label: 'Comments',
      color: 'hsl(var(--accent))',
    },
  };

  const engagementChartData = useMemo(() => {
    const monthLabels = Array.from({ length: 6 }).map((_, i) => {
      return format(subMonths(new Date(), 5 - i), 'MMM');
    });

    const chartData = monthLabels.map((label) => ({
      date: label,
      likes: 0,
      comments: 0,
    }));

    if (!performancePosts) return chartData;

    performancePosts.forEach((post) => {
      try {
        const postDate = parseISO(post.date);
        const postMonth = format(postDate, 'MMM');
        const monthData = chartData.find((d) => d.date === postMonth);
        if (monthData) {
          monthData.likes += post.likes;
          monthData.comments += post.comments;
        }
      } catch (e) {
        // Ignore posts with invalid dates
      }
    });

    return chartData;
  }, [performancePosts]);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postUrl) return;
    setIsImporting(true);

    try {
      const result = await extractPostData({ postUrl });
      await addPerformancePost(result);
      setIsDialogOpen(false);
      setPostUrl('');
    } catch (error) {
      console.error('Error importing post data:', error);
      toast({
        title: 'Error',
        description:
          'Failed to import post data. Please check the URL and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Engagement Overview</CardTitle>
          <CardDescription>
            Monthly likes and comments trend for the last 6 months.
          </CardDescription>
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
              <CardDescription>
                Detailed metrics for your recent posts.
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <Button onClick={() => setIsDialogOpen(true)}>
                <WandSparkles className="mr-2 h-4 w-4" /> Import Post Data
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Post Performance</DialogTitle>
                  <DialogDescription>
                    Enter the URL of a social media post and we'll use AI to
                    generate its performance data.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleImport}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="post-url" className="text-right">
                        URL
                      </Label>
                      <Input
                        id="post-url"
                        value={postUrl}
                        onChange={(e) => setPostUrl(e.target.value)}
                        className="col-span-3"
                        placeholder="https://www.instagram.com/p/..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isImporting || !postUrl}>
                      {isImporting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Import
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
                <TableHead>Post</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Shares</TableHead>
                <TableHead>Saves</TableHead>
                <TableHead>Conversion</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performancePosts.length > 0 ? (
                performancePosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">
                      {post.postTitle}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{post.platform}</Badge>
                    </TableCell>
                    <TableCell>{post.likes.toLocaleString()}</TableCell>
                    <TableCell>{post.comments.toLocaleString()}</TableCell>
                    <TableCell>{post.shares.toLocaleString()}</TableCell>
                    <TableCell>{post.saves.toLocaleString()}</TableCell>
                    <TableCell>
                      {post.conversion ? (
                        <Badge className="bg-green-100 text-green-800 border-none hover:bg-green-200">
                          <Star className="mr-2 h-3 w-3" />
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
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
                              This will permanently delete the post performance data. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deletePerformancePost(post.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No posts to display. Import one to get started!
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
