"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  generatePitchEmail,
  GeneratePitchEmailInput,
} from "@/ai/flows/generate-pitch-email";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  brandName: z.string().min(1, "Brand name is required"),
  niche: z.string().min(1, "Niche is required"),
  followerCount: z.coerce.number().min(1, "Follower count is required"),
  engagementRate: z.coerce.number().min(0.01, "Engagement rate is required"),
  averageLikes: z.coerce.number().min(1, "Average likes are required"),
  averageComments: z.coerce.number().min(1, "Average comments are required"),
  pastCollaborationExamples: z
    .string()
    .min(1, "Please provide some examples"),
});

export function PitchGeneratorForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [pitchEmail, setPitchEmail] = useState("");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brandName: "",
      niche: "",
      followerCount: 10000,
      engagementRate: 2.5,
      averageLikes: 500,
      averageComments: 100,
      pastCollaborationExamples: "Worked with @BrandFresh on their summer campaign, resulting in a 15% increase in their profile visits.",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setPitchEmail("");
    try {
      const result = await generatePitchEmail(values as GeneratePitchEmailInput);
      setPitchEmail(result.pitchEmail);
    } catch (error) {
      console.error("Error generating pitch email:", error);
      toast({
        title: "Error",
        description: "Failed to generate pitch email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pitchEmail);
    toast({
      title: "Copied!",
      description: "The pitch email has been copied to your clipboard.",
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="brandName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. BrandFresh" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="niche"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Niche</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Fashion & Lifestyle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="followerCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Follower Count</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 50000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="engagementRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Engagement Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="e.g. 3.2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="averageLikes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Average Likes</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 1500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="averageComments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Average Comments</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 250" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="pastCollaborationExamples"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Past Successes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe successful past collaborations..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate Pitch
          </Button>
        </form>
      </Form>

      <Card className="bg-muted/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Generated Email</CardTitle>
          {pitchEmail && (
            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Generating your email...</p>
            </div>
          ) : pitchEmail ? (
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
              {pitchEmail}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center text-muted-foreground">
                <Sparkles className="h-8 w-8 mb-4" />
                <p>Your generated email will appear here.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
