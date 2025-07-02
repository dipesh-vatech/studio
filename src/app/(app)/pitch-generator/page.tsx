'use client';

import { Lightbulb } from "lucide-react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PitchGeneratorFormSkeleton = () => (
  <div className="grid md:grid-cols-2 gap-8">
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
           <Skeleton className="h-4 w-16" />
           <Skeleton className="h-10" />
        </div>
         <div className="space-y-2">
           <Skeleton className="h-4 w-16" />
           <Skeleton className="h-10" />
        </div>
        <div className="space-y-2">
           <Skeleton className="h-4 w-24" />
           <Skeleton className="h-10" />
        </div>
        <div className="space-y-2">
           <Skeleton className="h-4 w-32" />
           <Skeleton className="h-10" />
        </div>
         <div className="space-y-2">
           <Skeleton className="h-4 w-24" />
           <Skeleton className="h-10" />
        </div>
        <div className="space-y-2">
           <Skeleton className="h-4 w-32" />
           <Skeleton className="h-10" />
        </div>
      </div>
       <div className="space-y-2">
           <Skeleton className="h-4 w-24" />
           <Skeleton className="h-24" />
        </div>
      <Skeleton className="h-10 w-full" />
    </div>
     <div className="bg-muted/30 rounded-lg p-4 space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="flex flex-col items-center justify-center h-full min-h-[240px] text-center text-muted-foreground">
            <Skeleton className="h-8 w-8 mb-4 rounded-full" />
            <Skeleton className="h-4 w-48" />
        </div>
    </div>
  </div>
);

const DynamicPitchGeneratorForm = dynamic(
  () => import("@/components/pitch-generator-form").then((mod) => mod.PitchGeneratorForm),
  {
    ssr: false, // The form is client-side heavy and doesn't need to be server-rendered.
    loading: () => <PitchGeneratorFormSkeleton />,
  }
);


export default function PitchGeneratorPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lightbulb className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">AI Pitch Generator</CardTitle>
              <CardDescription>
                Craft the perfect pitch email for your next collaboration.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DynamicPitchGeneratorForm />
        </CardContent>
      </Card>
    </div>
  );
}
