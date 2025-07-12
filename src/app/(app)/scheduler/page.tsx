
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
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
  X,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Deal, DealStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { generateContentIdeas } from '@/ai/flows/generate-content-ideas';
import { suggestPostTime } from '@/ai/flows/suggest-post-time';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';


type AiTask = 'ideas' | 'timing' | null;

const statusColors: Record<DealStatus, string> = {
  Upcoming: 'bg-blue-500 hover:bg-blue-600',
  'In Progress': 'bg-yellow-500 hover:bg-yellow-600',
  'Awaiting Payment': 'bg-orange-500 hover:bg-orange-600',
  Completed: 'bg-green-500 hover:bg-green-600',
  Overdue: 'bg-red-500 hover:bg-red-600',
};

const statusBorderColors: Record<DealStatus, string> = {
    Upcoming: 'border-blue-500',
    'In Progress': 'border-yellow-500',
    'Awaiting Payment': 'border-orange-500',
    Completed: 'border-green-500',
    Overdue: 'border-red-500',
};

function AiAssistant({
  deal,
  onIdeasGenerated,
}: {
  deal: Deal;
  onIdeasGenerated: (ideas: string[]) => void;
}) {
  const { userProfile, isAdmin } = useAppData();
  const { toast } = useToast();
  const [loadingAi, setLoadingAi] = useState<AiTask>(null);
  const [contentIdeas, setContentIdeas] = useState<string[]>(
    deal.aiContentIdeas || []
  );
  const [postTimeSuggestion, setPostTimeSuggestion] = useState<string>('');

  const isProPlan = userProfile?.plan === 'Pro' || isAdmin;

  const handleGenerateIdeas = async () => {
    if (!deal || !userProfile) return;

    if (contentIdeas.length > 0) {
      toast({ title: 'Ideas already generated for this deal.' });
      return;
    }

    setLoadingAi('ideas');
    try {
      const result = await generateContentIdeas({
        brandName: deal.brandName,
        campaignName: deal.campaignName,
        deliverables: deal.deliverables,
        niche: userProfile.niche || 'General',
      });
      setContentIdeas(result.ideas);
      onIdeasGenerated(result.ideas); // Propagate change up to save
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
        platform: 'General',
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
  
  const renderUpgradePrompt = () => (
    <div className="text-center p-4 border border-dashed rounded-lg mt-4">
      <h4 className="font-semibold text-sm">Upgrade for Advanced AI</h4>
      <p className="text-xs text-muted-foreground mt-1 mb-3">
        This feature is only available on the Pro plan.
      </p>
      <Button size="sm" asChild>
        <Link href="/settings?tab=billing">Upgrade Plan</Link>
      </Button>
    </div>
  );

  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <WandSparkles className="h-5 w-5 text-primary" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
         <Tabs defaultValue="ideas">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ideas">
              <Lightbulb className="mr-2 h-4 w-4" /> Ideas
            </TabsTrigger>
            <TabsTrigger value="timing">
              <Clock className="mr-2 h-4 w-4" /> Timing
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ideas" className="mt-4">
            {isProPlan ? (
              <>
                <Button
                  onClick={handleGenerateIdeas}
                  disabled={loadingAi !== null || contentIdeas.length > 0}
                  className="w-full"
                >
                  {loadingAi === 'ideas' ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <Lightbulb className="mr-2 h-4 w-4" /> )}
                  {contentIdeas.length > 0 ? 'Ideas Generated' : 'Generate Content Ideas'}
                </Button>
                <div className="h-40 overflow-y-auto pr-2 pt-4">
                  {loadingAi === 'ideas' ? (
                     <div className="flex h-full items-center justify-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
                  ) : contentIdeas.length > 0 ? (
                    <div>
                      <ul className="space-y-2 text-sm list-disc list-inside bg-background/50 p-3 rounded-md">
                        {contentIdeas.map((idea, i) => (<li key={i}>{idea}</li>))}
                      </ul>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-lg border border-dashed text-center text-muted-foreground">
                      <p className="text-sm p-4">Your AI-generated content ideas will appear here.</p>
                    </div>
                  )}
                </div>
              </>
            ) : renderUpgradePrompt()}
          </TabsContent>
          <TabsContent value="timing" className="mt-4">
            {isProPlan ? (
              <>
                <Button
                  onClick={handleSuggestTime}
                  disabled={loadingAi !== null}
                  className="w-full"
                >
                  {loadingAi === 'timing' ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<Clock className="mr-2 h-4 w-4" />)}
                  Suggest Best Post Times
                </Button>
                 <div className="h-40 overflow-y-auto pr-2 pt-4">
                  {loadingAi === 'timing' ? (
                     <div className="flex h-full items-center justify-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
                  ) : postTimeSuggestion ? (
                     <p className="text-sm bg-background/50 p-3 rounded-md">{postTimeSuggestion}</p>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-lg border border-dashed text-center text-muted-foreground">
                       <p className="text-sm p-4">Your AI-generated time suggestions will appear here.</p>
                    </div>
                  )}
                </div>
              </>
            ) : renderUpgradePrompt()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function DealSheet({
  dealId,
  open,
  onOpenChange,
}: {
  dealId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { deals, updateTaskStatus, addTaskToDeal, saveContentIdeasToDeal } =
    useAppData();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const deal = useMemo(() => deals.find(d => d.id === dealId), [deals, dealId]);

  if (!deal) return null;

  const completedTasks = deal.tasks.filter((t) => t.completed).length;
  const totalTasks = deal.tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTaskToDeal(deal.id, newTaskTitle.trim());
      setNewTaskTitle('');
    }
  };

  const handleIdeasGenerated = (ideas: string[]) => {
    saveContentIdeasToDeal(deal.id, ideas);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0">
        <div className="flex h-full flex-col">
          <SheetHeader
            className={`p-6 pb-4 border-l-4 ${
              statusBorderColors[deal.status]
            }`}
          >
            <SheetTitle className="text-2xl">{deal.campaignName}</SheetTitle>
            <SheetDescription className="space-y-1">
              <p>For {deal.brandName}</p>
              <div className="flex items-center gap-4 text-sm">
                <span>
                  Due:{' '}
                  <span className="font-medium text-foreground">
                    {format(parseISO(deal.dueDate), 'MMM d, yyyy')}
                  </span>
                </span>
                <span>
                  Payment:{' '}
                  <span className="font-medium text-foreground">
                    ${deal.payment.toLocaleString()}
                  </span>
                </span>
              </div>
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Checklist</CardTitle>
                <div className="text-sm text-muted-foreground flex justify-between items-center">
                  <span>
                    {completedTasks} of {totalTasks} completed
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {deal.tasks.length > 0 ? (
                    deal.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-2 rounded-md bg-muted/50"
                      >
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={task.completed}
                          onCheckedChange={(checked) =>
                            updateTaskStatus(deal.id, task.id, !!checked)
                          }
                        />
                        <Label
                          htmlFor={`task-${task.id}`}
                          className={cn(
                            'flex-1 cursor-pointer text-sm',
                            task.completed && 'line-through text-muted-foreground'
                          )}
                        >
                          {task.title}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-center text-muted-foreground py-4">
                      No tasks added yet.
                    </p>
                  )}
                </div>
                <form onSubmit={handleAddTask} className="flex gap-2 pt-4">
                  <Input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Add a new task..."
                    className="h-9"
                  />
                  <Button type="submit" size="sm">
                    Add Task
                  </Button>
                </form>
              </CardContent>
            </Card>

            <AiAssistant
              deal={deal}
              onIdeasGenerated={handleIdeasGenerated}
            />
          </div>
          <SheetFooter className="p-6 pt-2">
            <Button asChild className="w-full">
              <Link href="/deals">Go to Full Deal Details</Link>
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function SchedulerPage() {
  const { deals } = useAppData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

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
    setSelectedDealId(deal.id);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Content Scheduler</CardTitle>
          <CardDescription>
            A visual calendar of your posts and deliverables. Click a deal for
            AI assistance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
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
              <div
                key={day}
                className="py-2 text-center text-sm font-semibold text-muted-foreground border-b border-r"
              >
                <span className="hidden md:inline">{day}</span>
                <span className="md:hidden">{day.charAt(0)}</span>
              </div>
            ))}
            {daysInMonth.map((day) => {
              const dealsForDay =
                dealsByDate.get(format(day, 'yyyy-MM-dd')) || [];
              return (
                <div
                  key={day.toString()}
                  className={cn(
                    'h-24 md:h-32 p-1.5 border-b border-r flex flex-col gap-1 overflow-hidden',
                    !isSameMonth(day, currentDate) && 'bg-muted/50'
                  )}
                >
                  <time
                    dateTime={format(day, 'yyyy-MM-dd')}
                    className={cn(
                      'text-xs md:text-sm font-medium h-6 w-6 flex items-center justify-center',
                      isSameDay(day, new Date()) &&
                        'bg-primary text-primary-foreground rounded-full'
                    )}
                  >
                    {format(day, 'd')}
                  </time>
                  <div className="flex-1 space-y-1 overflow-y-auto">
                    {dealsForDay.map((deal) => (
                      <button
                        key={deal.id}
                        onClick={() => handleDealClick(deal)}
                        className={cn(
                          'w-full p-1 rounded-md text-left text-xs text-white',
                          statusColors[deal.status]
                        )}
                      >
                        <p className="font-semibold truncate">
                          {deal.campaignName}
                        </p>
                        <p className="truncate hidden md:block opacity-80">
                          {deal.brandName}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <DealSheet
        dealId={selectedDealId}
        open={!!selectedDealId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDealId(null);
          }
        }}
      />
    </>
  );
}
