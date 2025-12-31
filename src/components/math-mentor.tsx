'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from '@/hooks/use-toast';
import { generateProblemAction, getHintsAction } from '@/app/actions';
import { GRADE_LEVELS, TOPICS, DIFFICULTY_LEVELS } from '@/lib/constants';
import { getTopicIcon } from '@/lib/icons';
import { Skeleton } from './ui/skeleton';
import { useUser } from '@/firebase';
import { Input } from './ui/input';

const formSchema = z.object({
  gradeLevel: z.string().min(1, 'Please select a grade level.'),
  topic: z.string().min(1, 'Please select a topic.'),
  difficulty: z.string().min(1, 'Please select a difficulty.'),
});

type FormValues = z.infer<typeof formSchema>;

export interface MathProblem {
  id: string;
  statement: string;
  gradeLevel: string;
  topic: string;
  difficulty: string;
  answer: string;
}

export default function MathMentor() {
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [revealedHintsCount, setRevealedHintsCount] = useState(0);
  const [isLoadingProblem, setIsLoadingProblem] = useState(false);
  const [isLoadingHints, setIsLoadingHints] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showDifficultyUpgrade, setShowDifficultyUpgrade] = useState(false);

  const { toast } = useToast();
  const { user } = useUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gradeLevel: '5th Grade',
      topic: 'Multiplication',
      difficulty: 'Basic',
    },
  });

  useEffect(() => {
    if (totalQuestions >= 10 && correctAnswers >= 9) {
      setShowDifficultyUpgrade(true);
      // Reset counters after showing suggestion
      setTotalQuestions(0);
      setCorrectAnswers(0);
    }
  }, [totalQuestions, correctAnswers]);

  const resetProblemState = () => {
    setProblem(null);
    setHints([]);
    setRevealedHintsCount(0);
    setUserAnswer('');
    setIsAnswerCorrect(null);
    setShowAnswer(false);
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoadingProblem(true);
    resetProblemState();
    try {
      const result = await generateProblemAction({ ...values, seed: Math.random() });
      setProblem({
        id: new Date().toISOString(),
        ...values,
        statement: result.problemStatement,
        answer: result.answer,
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

  const handleCheckAnswer = () => {
    if (!problem) return;
    const correct = userAnswer.trim().toLowerCase() === problem.answer.trim().toLowerCase();
    setIsAnswerCorrect(correct);
    if (correct) {
      setCorrectAnswers(count => count + 1);
    }
    setTotalQuestions(count => count + 1);
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
            <CardFooter className="flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Button type="submit" disabled={isLoadingProblem} className="w-full sm:w-auto">
                {isLoadingProblem && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Problem
              </Button>
               {user && (
                <div className="text-sm font-medium text-muted-foreground">
                  Score: {correctAnswers} / {totalQuestions}
                </div>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>

      {showDifficultyUpgrade && (
        <Alert className="mt-8">
          <AlertTitle>Great work!</AlertTitle>
          <AlertDescription>
            You've answered 9 out of 10 questions correctly. How about trying the next difficulty level?
          </AlertDescription>
        </Alert>
      )}

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
            
            { user &&
              <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Input 
                      type="text" 
                      placeholder="Your answer" 
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      disabled={isAnswerCorrect !== null}
                      aria-label="Your Answer"
                    />
                    <Button onClick={handleCheckAnswer} disabled={!userAnswer || isAnswerCorrect !== null}>Check Answer</Button>
                  </div>

                  {isAnswerCorrect !== null && (
                    <div className={`flex items-center gap-2 p-3 rounded-md ${isAnswerCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                      {isAnswerCorrect ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                      <p className={`text-sm font-medium ${isAnswerCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                        {isAnswerCorrect ? "Correct!" : "Not quite. Try the next one!"}
                      </p>
                    </div>
                  )}
              </div>
            }

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
            {user && (
              <>
                <Button
                  onClick={handleGetHintClick}
                  disabled={isLoadingHints || (hints.length > 0 && revealedHintsCount >= hints.length) || showAnswer}
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
                  onClick={() => setShowAnswer(true)}
                  disabled={isAnswerCorrect === null || showAnswer}
                >
                  Reveal Answer
                </Button>
              </>
            )}
          </CardFooter>
          {showAnswer && (
              <CardContent>
                <div className="mt-4 p-4 bg-muted rounded-md">
                    <h4 className="font-semibold text-md mb-2">The correct answer is:</h4>
                    <p className="text-lg font-bold text-primary">{problem.answer}</p>
                </div>
              </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
