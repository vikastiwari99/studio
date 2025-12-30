import MathMentor from '@/components/math-mentor';
import { BrainCircuit } from 'lucide-react';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-primary font-headline flex items-center justify-center gap-3 md:gap-4">
          <BrainCircuit className="w-10 h-10 md:w-12 md:h-12" />
          MathMentorAI
        </h1>
        <p className="text-md md:text-lg text-muted-foreground mt-2">
          Your personal AI-powered math tutor
        </p>
      </header>
      <MathMentor />
    </main>
  );
}
