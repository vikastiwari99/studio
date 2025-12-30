'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useToast } from '@/hooks/use-toast';
import { generateProblemAction, getHintsAction } from '@/app/actions';
import { GRADE_LEVELS, TOPICS, DIFFICULTY_LEVELS } from '@/lib/constants';
import { getTopicIcon } from '@/lib/icons';
import { Skeleton } from './ui/skeleton';

const formSchema = z.object({
  gradeLevel: z.string().min(1, 'Please select a grade level.'),
  topic: z.string().min(1, 'Please select a topic.'),
  difficulty: z.string().min(1, 'Please select a difficulty.'),
});

type FormValues = z.infer<typeof formSchema>;

interface MathProblem {
  statement: string;
  gradeLevel: string;
  topic: string;
  difficulty: string;
}

export default function MathMentor() {
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [revealedHintsCount, setRevealedHintsCount] = useState(0);
  const [isLoadingProblem, setIsLoadingProblem] = useState(false);
  const [isLoadingHints, setIsLoadingHints] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gradeLevel: '',
      topic: '',
      difficulty: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoadingProblem(true);
    setProblem(null);
    setHints([]);
    setRevealedHintsCount(0);
    try {
      const result = await generateProblemAction(values);
      setProblem({
        statement: result.problemStatement,
        ...values,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsLoadingProblem(false);
    }
  };

  const fetchAndSetHints = async () => {
    if (!problem) return;
    setIsLoadingHints(true);
    try {
      const result = await getHintsAction({
        gradeLevel: problem.gradeLevel,
        topic: problem.topic,
        difficultyLevel: problem.difficulty,
        problemStatement: problem.statement,
      });
      setHints(result.hints);
      return result.hints;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      return [];
    } finally {
      setIsLoadingHints(false);
    }
  };

  const handleGetHintClick = async () => {
    if (hints.length === 0) {
      const newHints = await fetchAndSetHints();
      if (newHints.length > 0) {
        setRevealedHintsCount(1);
      }
    } else if (revealedHintsCount < hints.length) {
      setRevealedHintsCount((count) => count + 1);
    }
  };

  const handleShowSolutionClick = async () => {
    if (hints.length === 0) {
      const newHints = await fetchAndSetHints();
      setRevealedHintsCount(newHints.length);
    } else {
      setRevealedHintsCount(hints.length);
    }
  };

  const ProblemIcon = problem ? getTopicIcon(problem.topic) : null;

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Create Your Challenge</CardTitle>
          <CardDescription>
            Select your grade, topic, and difficulty to generate a math problem.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="gradeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingProblem}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GRADE_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingProblem}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select topic" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TOPICS.map((topic) => {
                          const Icon = getTopicIcon(topic);
                          return (
                            <SelectItem key={topic} value={topic}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <span>{topic}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingProblem}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DIFFICULTY_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoadingProblem} className="w-full sm:w-auto">
                {isLoadingProblem && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Problem
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isLoadingProblem && (
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      )}

      {problem && !isLoadingProblem && (
        <Card className="mt-8 shadow-lg animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              {ProblemIcon && <ProblemIcon className="h-6 w-6 text-primary" />}
              Here is Your Problem
            </CardTitle>
            <CardDescription>
              {problem.gradeLevel} &middot; {problem.topic} &middot; {problem.difficulty}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed bg-secondary/50 p-4 rounded-md">
              {problem.statement}
            </p>
            {hints.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2 text-lg">Hints</h3>
                <Accordion type="multiple" value={Array.from({length: revealedHintsCount}, (_, i) => `item-${i}`)} className="w-full">
                  {hints.slice(0, revealedHintsCount).map((hint, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger>Hint #{index + 1}</AccordionTrigger>
                      <AccordionContent className="text-base">
                        {hint}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Button
              onClick={handleGetHintClick}
              disabled={isLoadingHints || (hints.length > 0 && revealedHintsCount >= hints.length)}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isLoadingHints ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="mr-2 h-4 w-4" />
              )}
              {hints.length === 0
                ? 'Get First Hint'
                : revealedHintsCount < hints.length
                ? 'Get Next Hint'
                : 'All Hints Revealed'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleShowSolutionClick}
              disabled={isLoadingHints || (hints.length > 0 && revealedHintsCount === hints.length)}
            >
              Show Full Solution
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
