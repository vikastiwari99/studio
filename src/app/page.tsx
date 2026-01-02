'use client';

import MathMentor from '@/components/math-mentor';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { useUser, FirebaseClientProvider } from '@/firebase';
import Auth from '@/components/auth';

function App() {
  const { isUserLoading } = useUser();

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
        <div className="flex-shrink-0">
          <Auth />
        </div>
      </header>
      <MathMentor />
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
