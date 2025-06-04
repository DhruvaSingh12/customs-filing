'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import SignInForm from '@/components/auth/SignInForm';
import AuthProviders from '@/components/auth/AuthProviders';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  return (
    <div className="container items-center justify-center">
      <div className='items-center justify-center flex h-screen'>
        <div className="mx-auto flex flex-col justify-center space-y-2 lg:w-[400px] w-[320px]">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {error && (
                <Alert variant="destructive">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {error === 'CredentialsSignin' 
                      ? 'Invalid email or password'
                      : 'An error occurred. Please try again.'}
                  </AlertDescription>
                </Alert>
              )}
              <SignInForm callbackUrl={callbackUrl} />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <AuthProviders callbackUrl={callbackUrl} />
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <div className="text-sm text-center text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="underline underline-offset-4 hover:text-primary">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
