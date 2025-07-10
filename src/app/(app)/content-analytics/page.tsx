
'use client';

import { useState, useMemo, useEffect, type ChangeEvent } from 'react';
import Link from 'next/link';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Star, Trash2, ThumbsUp, MessageSquare, Share, Bookmark, PlusCircle, Check, Lightbulb, TrendingUp, Search, Pencil, WandSparkles, Upload } from 'lucide-react';
import type { PerformancePost } from '@/lib/types';
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAppData } from '@/components/app-provider';
import { subDays, subMonths, format, parseISO, startOfWeek, eachDayOfInterval } from 'date-fns';
import {
  analyzePostPerformance,
  AnalyzePostPerformanceOutput,
} from '@/ai/flows/analyze-post-performance';
import {
  extractPostMetrics,
} from '@/ai/flows/extract-post-metrics';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

const postFormSchema = z.object({
  id: z.string().optional(),
  postTitle: z.string().min(1, 'Post title is required'),
  platform: z.enum(['Instagram', 'TikTok', 'YouTube']),
  likes: z.coerce.number().min(0),
  comments: z.coerce.number().min(0),
  shares: z.coerce.number().min(0),
  saves: z.coerce.number().min(0),
  conversion: z.boolean().default(false),
  postDescription: z.string().optional(),
});

type TimeRange = '7d' | '30d' | '6m';

function MobilePostSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-start">
               <div className='space-y-2'>
                 <Skeleton className="h-5 w-40" />
                 <Skeleton className="h-6 w-24 rounded-full" />
               </div>
               <div className='flex gap-2'>
                 <Skeleton className="h-8 w-8 rounded-md" />
                 <Skeleton className="h-8 w-8 rounded-md" />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PerformanceSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64 mt-2" />
            </div>
            <Skeleton className="h-10 w-44" />
          </div>
        </CardHeader>
        <CardContent>
          <div className='hidden md:block'>
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
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[90px] rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[70px] rounded-full" /></TableCell>
                    <TableCell className="text-right">
                       <div className="flex gap-2 justify-end">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className='md:hidden'>
            <MobilePostSkeleton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


function AnalysisResultDialog({ post, open, onOpenChange }: { post: PerformancePost, open: boolean, onOpenChange: (open: boolean) => void }) {
  const { userProfile, isAdmin } = useAppData();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzePostPerformanceOutput | null>(null);

  const isProPlan = userProfile?.plan === 'Pro' || isAdmin;

  async function getAnalysis() {
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const result = await analyzePostPerformance({
        platform: post.platform,
        postDescription: post.postDescription || 'No description provided.',
        metrics: {
          likes: post.likes,
          comments: post.comments,
          shares: post.shares,
          saves: post.saves,
        },
        niche: userProfile?.niche || 'General',
      });
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing post performance:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze the post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI Analysis for "{post.postTitle}"</DialogTitle>
          <DialogDescription>
            Get expert feedback on your content performance.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto p-1">
          {!analysisResult && !isLoading && (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
             {isProPlan ? (
                <>
                  <Search className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">Ready to Analyze?</h3>
                  <p className="text-muted-foreground text-sm mb-4">Click the button below to get AI-powered insights on this post.</p>
                  <Button onClick={getAnalysis}>
                    Analyze Post
                  </Button>
                </>
              ) : (
                <>
                  <WandSparkles className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">Upgrade to Pro for AI Analysis</h3>
                  <p className="text-muted-foreground text-sm mb-4">Unlock expert-level analysis by upgrading your plan.</p>
                  <Button asChild>
                    <Link href="/settings?tab=billing">Upgrade Your Plan</Link>
                  </Button>
                </>
              )}
            </div>
          )}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Analyzing your data...</p>
            </div>
          ) : analysisResult ? (
            <div className="space-y-6 pr-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Performance Rating: {analysisResult.rating}/10
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5" />
                    What Went Well
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{analysisResult.analysis}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Suggestions for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysisResult.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-muted-foreground">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ContentAnalyticsPage() {
  const {
    performancePosts,
    addPerformancePost,
    updatePerformancePost,
    loadingData,
    deletePerformancePost,
    userProfile, 
    isAdmin
  } = useAppData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PerformancePost | null>(null);
  const [analyzingPost, setAnalyzingPost] = useState<PerformancePost | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('6m');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();
  
  const isProPlan = userProfile?.plan === 'Pro' || isAdmin;

  const form = useForm<z.infer<typeof postFormSchema>>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      postTitle: '',
      platform: 'Instagram',
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      conversion: false,
      postDescription: '',
    },
  });

  useEffect(() => {
    if (editingPost) {
      form.reset(editingPost);
    } else {
      form.reset({
        postTitle: '',
        platform: 'Instagram',
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        conversion: false,
        postDescription: '',
      });
    }
    setSelectedFile(null);
  }, [editingPost, isPostDialogOpen, form]);
  
  const handleEditClick = (post: PerformancePost) => {
    setEditingPost(post);
    setIsPostDialogOpen(true);
  };

  const handleAddClick = () => {
    setEditingPost(null);
    setIsPostDialogOpen(true);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleExtractMetrics = async () => {
    if (!selectedFile) return;
    setIsExtracting(true);
    try {
      const screenshotDataUri = await fileToDataUri(selectedFile);
      const result = await extractPostMetrics({ screenshotDataUri });
      
      // Update form values with extracted data
      if (result.postTitle) form.setValue('postTitle', result.postTitle, { shouldValidate: true });
      if (result.likes) form.setValue('likes', result.likes, { shouldValidate: true });
      if (result.comments) form.setValue('comments', result.comments, { shouldValidate: true });
      if (result.shares) form.setValue('shares', result.shares, { shouldValidate: true });
      if (result.saves) form.setValue('saves', result.saves, { shouldValidate: true });
      
      toast({
        title: 'Metrics Extracted!',
        description: 'Please review and confirm the extracted data.',
      });
    } catch (error) {
      console.error('Error extracting metrics:', error);
      toast({
        title: 'Extraction Failed',
        description: 'Could not extract metrics from the image. Please enter them manually.',
        variant: 'destructive',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const chartConfig = {
    likes: { label: 'Likes', color: 'hsl(var(--primary))' },
    comments: { label: 'Comments', color: 'hsl(var(--accent))' },
  };

  const engagementChartData = useMemo(() => {
    if (!performancePosts) return [];
    
    const now = new Date();
    let startDate: Date;
    let dateFormat: string;
    let labels: { date: string, likes: number, comments: number }[];

    switch (timeRange) {
      case '7d':
        startDate = subDays(now, 6);
        dateFormat = 'EEE'; // e.g., Mon
        labels = eachDayOfInterval({ start: startDate, end: now }).map(day => ({
          date: format(day, dateFormat),
          likes: 0,
          comments: 0
        }));
        break;
      case '30d':
        startDate = subDays(now, 29);
        dateFormat = 'MMM d'; // e.g., Jul 15
        labels = eachDayOfInterval({ start: startDate, end: now }).map(day => ({
          date: format(day, dateFormat),
          likes: 0,
          comments: 0
        }));
        break;
      case '6m':
      default:
        startDate = subMonths(now, 5);
        dateFormat = 'MMM'; // e.g., Jul
        labels = Array.from({ length: 6 }).map((_, i) => ({
          date: format(subMonths(now, 5 - i), dateFormat),
          likes: 0,
          comments: 0,
        }));
        break;
    }

    const relevantPosts = performancePosts.filter(post => {
      try {
        return parseISO(post.date) >= startDate;
      } catch (e) {
        return false;
      }
    });

    relevantPosts.forEach((post) => {
      try {
        const postDate = parseISO(post.date);
        let key: string;
        if (timeRange === '7d') {
          key = format(postDate, 'EEE');
        } else if (timeRange === '30d') {
          key = format(postDate, 'MMM d');
        } else { // 6m
          key = format(postDate, 'MMM');
        }

        const dataPoint = labels.find(l => l.date === key);
        if (dataPoint) {
          dataPoint.likes += post.likes;
          dataPoint.comments += post.comments;
        }
      } catch (e) {
        // Ignore posts with invalid dates
      }
    });
    
    return labels;
  }, [performancePosts, timeRange]);

  async function onPostSubmit(values: z.infer<typeof postFormSchema>) {
    setIsSubmitting(true);
    try {
      if (editingPost) {
        await updatePerformancePost(editingPost.id, values);
      } else {
        await addPerformancePost(values);
      }
      setIsPostDialogOpen(false);
      setEditingPost(null);
    } catch (error) {
      console.error('Error saving post data:', error);
      toast({
        title: 'Error',
        description: 'Failed to save post data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderEmptyState = () => (
     <div className="text-center h-48 flex flex-col justify-center items-center">
      <p className="text-muted-foreground">No posts to display.</p>
      <p className="text-sm text-muted-foreground">
        Add one to get started!
      </p>
    </div>
  );

  if (loadingData) {
    return <PerformanceSkeleton />;
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Engagement Overview</CardTitle>
              <CardDescription>
                View trends in your post engagement over different time periods.
              </CardDescription>
            </div>
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={engagementChartData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
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
                  Track, analyze, and get AI insights for each post.
                </CardDescription>
              </div>
              <Dialog open={isPostDialogOpen} onOpenChange={(isOpen) => {
                  if (!isOpen) {
                    setEditingPost(null);
                  }
                  setIsPostDialogOpen(isOpen);
                }}>
                <DialogTrigger asChild>
                  <Button onClick={handleAddClick}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Post
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingPost ? 'Edit' : 'Add'} Post Performance</DialogTitle>
                    <DialogDescription>
                      Upload a screenshot to extract metrics with AI, or enter them manually.
                    </DialogDescription>
                  </DialogHeader>
                   <div className="border rounded-lg p-4 space-y-4">
                      <h4 className="font-semibold text-center text-sm">Extract Metrics with AI (Pro)</h4>
                      {isProPlan ? (
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                           <div className="grid w-full max-w-sm items-center gap-1.5 flex-1">
                            <Label htmlFor="post-screenshot">Post Screenshot</Label>
                            <Input id="post-screenshot" type="file" accept="image/*" onChange={handleFileChange} />
                          </div>
                          <Button onClick={handleExtractMetrics} disabled={!selectedFile || isExtracting} className="w-full sm:w-auto mt-4 sm:mt-0 self-end">
                            {isExtracting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4" />}
                            Extract
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center text-sm text-muted-foreground p-4 bg-muted/50 rounded-md">
                          <p className="mb-2">Upgrade to Pro to unlock AI metric extraction from screenshots.</p>
                          <Button size="sm" asChild>
                            <Link href="/settings?tab=billing">Upgrade Your Plan</Link>
                          </Button>
                        </div>
                      )}
                  </div>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onPostSubmit)}>
                      <ScrollArea className="h-[40vh]">
                        <div className="space-y-4 p-1">
                          <FormField control={form.control} name="postTitle" render={({ field }) => (
                            <FormItem><FormLabel>Post Title</FormLabel><FormControl><Input placeholder="e.g. My new summer look!" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="platform" render={({ field }) => (
                            <FormItem><FormLabel>Platform</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="Instagram">Instagram</SelectItem>
                                  <SelectItem value="TikTok">TikTok</SelectItem>
                                  <SelectItem value="YouTube">YouTube</SelectItem>
                                </SelectContent>
                              </Select><FormMessage /></FormItem>
                          )} />
                          <FormField
                            control={form.control}
                            name="postDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Post Description (for AI)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="e.g. A Reel showing a new outfit, with a call to action to shop the look."
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Provide context for the AI analysis. Describe the post's content, format (e.g. Reel, Story), and goal to get more accurate feedback.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="likes" render={({ field }) => (<FormItem><FormLabel>Likes</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="comments" render={({ field }) => (<FormItem><FormLabel>Comments</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="shares" render={({ field }) => (<FormItem><FormLabel>Shares</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="saves" render={({ field }) => (<FormItem><FormLabel>Saves</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                          </div>
                          <FormField control={form.control} name="conversion" render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                  <FormLabel>Conversion</FormLabel>
                                  <FormDescription>
                                    Did this post lead to a direct conversion (e.g., a sale or sign-up)?
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )} />
                        </div>
                      </ScrollArea>
                      <DialogFooter className="pt-4">
                        <Button type="submit" disabled={isSubmitting || isExtracting}>
                          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {editingPost ? 'Save Changes' : 'Save Post'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="hidden md:block">
              <Table>
                <TableHeader><TableRow><TableHead>Post</TableHead><TableHead>Platform</TableHead><TableHead>Likes</TableHead><TableHead>Comments</TableHead><TableHead>Shares</TableHead><TableHead>Saves</TableHead><TableHead>Conversion</TableHead><TableHead className="w-[120px] text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {performancePosts.length > 0 ? (
                    performancePosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.postTitle}</TableCell>
                        <TableCell><Badge variant="secondary">{post.platform}</Badge></TableCell>
                        <TableCell>{post.likes.toLocaleString()}</TableCell>
                        <TableCell>{post.comments.toLocaleString()}</TableCell>
                        <TableCell>{post.shares.toLocaleString()}</TableCell>
                        <TableCell>{post.saves.toLocaleString()}</TableCell>
                        <TableCell>{post.conversion ? <Badge className="bg-green-100 text-green-800 border-none hover:bg-green-200"><Star className="mr-2 h-3 w-3" />Yes</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(post)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setAnalyzingPost(post)}><Search className="h-4 w-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deletePerformancePost(post.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : ( <TableRow><TableCell colSpan={8}>{renderEmptyState()}</TableCell></TableRow> )}
                </TableBody>
              </Table>
            </div>
            <div className="space-y-4 md:hidden">
              {performancePosts.length > 0 ? (
                performancePosts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1"><h3 className="font-semibold text-base leading-tight">{post.postTitle}</h3><div className="flex items-center gap-2 mt-2"><Badge variant="secondary">{post.platform}</Badge>{post.conversion ? <Badge className="bg-green-100 text-green-800 border-none hover:bg-green-200 text-xs"><Star className="mr-1.5 h-3 w-3" />Conversion</Badge> : <Badge variant="outline" className="text-xs">No Conversion</Badge>}</div></div>
                        <div className="flex">
                           <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => handleEditClick(post)}><Pencil className="h-4 w-4" /></Button>
                           <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => setAnalyzingPost(post)}><Search className="h-4 w-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="shrink-0 h-8 w-8"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deletePerformancePost(post.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm mt-4">
                        <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2"><ThumbsUp className="h-4 w-4 text-muted-foreground" /><div><p className="font-semibold">{post.likes.toLocaleString()}</p><p className="text-xs text-muted-foreground">Likes</p></div></div>
                        <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2"><MessageSquare className="h-4 w-4 text-muted-foreground" /><div><p className="font-semibold">{post.comments.toLocaleString()}</p><p className="text-xs text-muted-foreground">Comments</p></div></div>
                        <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2"><Share className="h-4 w-4 text-muted-foreground" /><div><p className="font-semibold">{post.shares.toLocaleString()}</p><p className="text-xs text-muted-foreground">Shares</p></div></div>
                        <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2"><Bookmark className="h-4 w-4 text-muted-foreground" /><div><p className="font-semibold">{post.saves.toLocaleString()}</p><p className="text-xs text-muted-foreground">Saves</p></div></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : ( renderEmptyState() )}
            </div>
          </CardContent>
        </Card>
      </div>

      {analyzingPost && (
        <AnalysisResultDialog 
          post={analyzingPost}
          open={!!analyzingPost}
          onOpenChange={(open) => {
            if (!open) {
              setAnalyzingPost(null);
            }
          }}
        />
      )}
    </>
  );
}
