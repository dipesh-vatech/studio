'use client';

import { useState, useMemo } from 'react';
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  add,
  sub,
  parseISO,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Clock,
  Loader2,
  WandSparkles,
} from 'lucide-react';
import { useAppData } from '@/components/app-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Deal } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { generateContentIdeas } from '@/ai/flows/generate-content-ideas';
import { suggestPostTime } from '@/ai/flows/suggest-post-time';

type AiTask = 'ideas' | 'timing' | null;

export default function SchedulerPage() {
  const { deals, userProfile } = useAppData();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loadingAi, setLoadingAi] = useState<AiTask>(null);
  const [contentIdeas, setContentIdeas] = useState<string[]>([]);
  const [postTimeSuggestion, setPostTimeSuggestion] = useState<string>('');

  const firstDayOfCurrentMonth = startOfMonth(currentDate);

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(firstDayOfCurrentMonth),
      end: endOfWeek(endOfMonth(firstDayOfCurrentMonth)),
    });
  }, [firstDayOfCurrentMonth]);

  const dealsByDate = useMemo(() => {
    const map = new Map<string, Deal[]>();
    deals.forEach((deal) => {
      try {
        const dealDate = parseISO(deal.dueDate);
        const key = format(dealDate, 'yyyy-MM-dd');
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)?.push(deal);
      } catch (e) {
        // ignore invalid dates
      }
    });
    return map;
  }, [deals]);

  const nextMonth = () => {
    setCurrentDate(add(currentDate, { months: 1 }));
  };

  const prevMonth = () => {
    setCurrentDate(sub(currentDate, { months: 1 }));
  };
  
  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setContentIdeas([]);
    setPostTimeSuggestion('');
    setIsDialogOpen(true);
  };

  const handleGenerateIdeas = async () => {
    if (!selectedDeal || !userProfile) return;
    setLoadingAi('ideas');
    try {
      const result = await generateContentIdeas({
        brandName: selectedDeal.brandName,
        campaignName: selectedDeal.campaignName,
        deliverables: selectedDeal.deliverables,
        niche: userProfile.niche || 'General',
      });
      setContentIdeas(result.ideas);
    } catch (error) {
      toast({
        title: 'Error generating ideas',
        description: 'Could not generate content ideas. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingAi(null);
    }
  };

  const handleSuggestTime = async () => {
    if (!userProfile) return;
    setLoadingAi('timing');
    try {
      const result = await suggestPostTime({
        niche: userProfile.niche || 'General',
        platform: 'General', // Simplified for this example
      });
      setPostTimeSuggestion(result.suggestion);
    } catch (error) {
      toast({
        title: 'Error suggesting time',
        description: 'Could not suggest a posting time. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingAi(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Content Scheduler</CardTitle>
          <CardDescription>
            A visual calendar of your posts and deliverables. Click a deal for AI assistance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-t border-l">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-2 text-center text-sm font-medium text-muted-foreground border-b border-r">
                {day}
              </div>
            ))}
            {daysInMonth.map((day) => {
              const dealsForDay = dealsByDate.get(format(day, 'yyyy-MM-dd')) || [];
              return (
                <div
                  key={day.toString()}
                  className={cn(
                    'h-32 p-2 border-b border-r flex flex-col gap-1 overflow-y-auto',
                    !isSameMonth(day, currentDate) && 'bg-muted/50'
                  )}
                >
                  <span
                    className={cn(
                      'font-medium',
                      isSameDay(day, new Date()) &&
                        'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  <div className="flex-1 space-y-1">
                    {dealsForDay.map((deal) => (
                      <button
                        key={deal.id}
                        onClick={() => handleDealClick(deal)}
                        className="w-full p-1.5 rounded-md text-left text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <p className="font-semibold truncate">{deal.campaignName}</p>
                        <p className="truncate">{deal.brandName}</p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedDeal && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedDeal.campaignName}</DialogTitle>
                <DialogDescription>
                  Due by {selectedDeal.dueDate} for {selectedDeal.brandName}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                {/* AI Suggestions */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2"><WandSparkles className="h-5 w-5 text-primary" /> AI Assistant</h3>
                  <Button onClick={handleGenerateIdeas} disabled={loadingAi !== null} className="w-full">
                    {loadingAi === 'ideas' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                    Generate Content Ideas
                  </Button>
                  <Button onClick={handleSuggestTime} disabled={loadingAi !== null} className="w-full">
                    {loadingAi === 'timing' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
                    Suggest Best Post Times
                  </Button>
                </div>
                {/* AI Results */}
                <div className="space-y-4">
                  {contentIdeas.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Content Ideas</h4>
                      <ul className="space-y-2 text-sm list-disc list-inside bg-muted/50 p-3 rounded-md">
                        {contentIdeas.map((idea, i) => <li key={i}>{idea}</li>)}
                      </ul>
                    </div>
                  )}
                  {postTimeSuggestion && (
                     <div>
                      <h4 className="font-semibold mb-2">Posting Time Suggestion</h4>
                      <p className="text-sm bg-muted/50 p-3 rounded-md">{postTimeSuggestion}</p>
                    </div>
                  )}
                  {(loadingAi) && (
                     <div className="flex items-center justify-center h-full text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin" />
                     </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
