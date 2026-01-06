'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { useUser, FirebaseClientProvider } from '@/firebase';
import Auth from '@/components/auth';
import MathMentor from '@/components/math-mentor';
import { useToast } from '@/hooks/use-toast';
import { sendSummaryEmailAction } from '@/app/actions';
import { formatDistance } from 'date-fns';
import { User } from 'firebase/auth';

const formSchema = z.object({
  gradeLevel: z.string().min(1, 'Please select a grade level.'),
  topic: z.string().min(1, 'Please select a topic.'),
  difficulty: z.string().min(1, 'Please select a difficulty.'),
});

type FormValues = z.infer<typeof formSchema>;

function App() {
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [isSummarySent, setIsSummarySent] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gradeLevel: '5th Grade',
      topic: 'Multiplication',
      difficulty: 'Basic',
    },
  });

  const handleSendSummary = async (currentUser: User | null) => {
    if (!sessionStartTime || !currentUser || !currentUser.email || totalQuestions === 0) return;

    const { topic, difficulty } = form.getValues();
    const timeSpent = formatDistance(new Date(), sessionStartTime, { includeSeconds: true });

    try {
      await sendSummaryEmailAction({
        email: currentUser.email,
        topic,
        difficulty,
        score: correctAnswers,
        totalProblems: totalQuestions,
        timeSpent,
      });
      toast({
        title: 'Summary Sent!',
        description: `Your practice session summary has been sent to ${currentUser.email}.`,
      });
      setIsSummarySent(true);
      return true; // Indicate success
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Could not send summary.',
      });
      return false; // Indicate failure
    }
  };

  const endSessionAndReset = () => {
    setCorrectAnswers(0);
    setTotalQuestions(0);
    setSessionStartTime(null);
    setIsSummarySent(false);
  };
  
  // Effect to reset session when user logs out
  useEffect(() => {
    if (!user && !isUserLoading) {
      endSessionAndReset();
    }
  }, [user, isUserLoading]);


  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <header className="flex justify-between items-center mb-10">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold text-primary font-headline flex items-center justify-center gap-3 md:gap-4">
            <BrainCircuit className="w-10 h-10 md:w-12 md:h-12" />
            MathMentorAI
          </h1>
          <p className="text-md md:text-lg text-muted-foreground mt-2 text-center">
            Your personal AI-powered math tutor
          </p>
        </div>
        {user && (
          <div className="flex-shrink-0">
             <Auth 
               onBeforeSignOut={async () => {
                  if (totalQuestions > 0 && !isSummarySent) {
                    await handleSendSummary(user);
                  }
               }}
             />
          </div>
        )}
      </header>
      {user ? (
        <MathMentor
          form={form}
          correctAnswers={correctAnswers}
          setCorrectAnswers={setCorrectAnswers}
          totalQuestions={totalQuestions}
          setTotalQuestions={setTotalQuestions}
          sessionStartTime={sessionStartTime}
          setSessionStartTime={setSessionStartTime}
          endSessionAndReset={endSessionAndReset}
          handleSendSummary={() => handleSendSummary(user)}
          isSummarySent={isSummarySent}
        />
      ) : (
        <Auth />
      )}
    </main>
  );
}

export default function Home() {
  return (
    <FirebaseClientProvider>
      <App />
    </FirebaseClientProvider>
  )
}
