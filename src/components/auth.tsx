'use client';

import { useState } from 'react';
import { useUser, useAuth } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

interface AuthProps {
  onBeforeSignOut?: () => Promise<void>;
}

export default function Auth({ onBeforeSignOut }: AuthProps) {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      if (onBeforeSignOut) {
        await onBeforeSignOut();
      }
      await signOut(auth);
      toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign Out Error',
        description: error.message,
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
        <Button onClick={handleSignOut} variant="outline" disabled={isSigningOut}>
          {isSigningOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Login / Sign Up</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Guardian Access</DialogTitle>
        </DialogHeader>
        <AuthTabs onAuthSuccess={() => {}} />
      </DialogContent>
    </Dialog>
  );
}

function AuthTabs({ onAuthSuccess }: { onAuthSuccess: () => void }) {
    const auth = useAuth();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAuth = async (isSignUp: boolean) => {
        setIsLoading(true);
        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
                toast({ title: 'Sign Up Successful', description: "You're now logged in." });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                toast({ title: 'Login Successful', description: "Welcome back!" });
            }
            onAuthSuccess();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Authentication Error',
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
                <AuthForm onSubmit={() => handleAuth(false)} buttonText="Login" isLoading={isLoading} setEmail={setEmail} setPassword={setPassword} email={email} password={password}/>
            </TabsContent>
            <TabsContent value="signup">
                <AuthForm onSubmit={() => handleAuth(true)} buttonText="Sign Up" isLoading={isLoading} setEmail={setEmail} setPassword={setPassword} email={email} password={password}/>
            </TabsContent>
        </Tabs>
    )
}

interface AuthFormProps {
    onSubmit: () => void;
    buttonText: string;
    isLoading: boolean;
    email: string;
    setEmail: (email: string) => void;
    password: string;
    setPassword: (password: string) => void;
}

function AuthForm({ onSubmit, buttonText, isLoading, email, setEmail, password, setPassword }: AuthFormProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="guardian@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {buttonText}
            </Button>
        </form>
    )
}
