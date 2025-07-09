'use client';

import { useState } from 'react';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Check, ThumbsUp, Lightbulb, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppData } from '@/components/app-provider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  analyzePostPerformance,
  AnalyzePostPerformanceOutput,
} from '@/ai/flows/analyze-post-performance';

const analyzerFormSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  postDescription: z
    .string()
    .min(10, 'Please provide a more detailed description.')
    .max(500, 'Description cannot exceed 500 characters.'),
  likes: z.coerce.number().min(0, 'Likes cannot be negative.'),
  comments: z.coerce.number().min(0, 'Comments cannot be negative.'),
  shares: z.coerce.number().min(0, 'Shares cannot be negative.'),
  saves: z.coerce.number().min(0, 'Saves cannot be negative.'),
});

function AnalysisResult({
  result,
}: {
  result: AnalyzePostPerformanceOutput;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Performance Rating: {result.rating}/10
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
          <p className="text-muted-foreground">{result.analysis}</p>
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
            {result.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                <span className="text-muted-foreground">{suggestion}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PostAnalyzerPage() {
  const { userProfile } = useAppData();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<AnalyzePostPerformanceOutput | null>(null);

  const form = useForm<z.infer<typeof analyzerFormSchema>>({
    resolver: zodResolver(analyzerFormSchema),
    defaultValues: {
      platform: 'Instagram',
      postDescription: '',
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof analyzerFormSchema>) {
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const result = await analyzePostPerformance({
        platform: values.platform,
        postDescription: values.postDescription,
        metrics: {
          likes: values.likes,
          comments: values.comments,
          shares: values.shares,
          saves: values.saves,
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
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">AI Post Analyzer</CardTitle>
          <CardDescription>
            Get expert feedback on your content performance. Describe your post,
            enter the metrics, and let our AI do the rest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="postDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your post. What was the format (e.g., Reel, Carousel, Story)? What was the call to action?"
                          className="min-h-[120px]"
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
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Instagram">Instagram</SelectItem>
                            <SelectItem value="TikTok">TikTok</SelectItem>
                            <SelectItem value="YouTube">YouTube</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="likes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Likes</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comments</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shares"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shares</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="saves"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Saves</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Analyze Performance
                </Button>
              </form>
            </Form>

            <div className="bg-muted/30 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-lg">Analysis Result</h3>
              <div className="h-full min-h-[300px]">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p>Analyzing your data...</p>
                  </div>
                ) : analysisResult ? (
                  <AnalysisResult result={analysisResult} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Sparkles className="h-8 w-8 mb-4" />
                    <p>Your performance analysis will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
