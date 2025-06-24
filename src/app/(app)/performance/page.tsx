'use client';

import { useState } from 'react';
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
import { Loader2, Star, WandSparkles } from 'lucide-react';
import { mockPerformancePosts, engagementChartData } from '@/lib/mock-data';
import type { PerformancePost } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { extractPostData } from '@/ai/flows/extract-post-data';

export default function PerformancePage() {
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

  const [posts, setPosts] = useState<PerformancePost[]>(mockPerformancePosts);
  const [isImporting, setIsImporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [postUrl, setPostUrl] = useState('');
  const { toast } = useToast();

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postUrl) return;
    setIsImporting(true);

    try {
      const result = await extractPostData({ postUrl });
      const newPost: PerformancePost = {
        ...result,
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
      };
      setPosts([newPost, ...posts]);
      setIsDialogOpen(false);
      setPostUrl('');
      toast({
        title: 'Success!',
        description: 'Post data imported.',
      });
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
