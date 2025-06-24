import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to continue generating startup ideas</p>
        </div>
        <SignIn redirectUrl="/home" />
      </div>
    </div>
  );
} 