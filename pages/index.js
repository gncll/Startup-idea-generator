import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import SimpleStartupGenerator from '../components/SimpleStartupGenerator';
import N8nChatWidget from '../components/N8nChatWidget';

export default function Index() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If user is signed in, redirect to home dashboard
    if (isLoaded && isSignedIn) {
      router.push('/home');
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If signed in, don't show anything (will redirect)
  if (isSignedIn) {
    return null;
  }

  // For non-signed-in users, show the simple generator
  return (
    <>
      <SimpleStartupGenerator />
      <N8nChatWidget />
    </>
  );
}
