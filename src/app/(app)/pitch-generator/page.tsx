import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PitchGeneratorForm } from "@/components/pitch-generator-form";
import { Lightbulb } from "lucide-react";

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
          <PitchGeneratorForm />
        </CardContent>
      </Card>
    </div>
  );
}
