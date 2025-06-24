import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Get Started</h1>
          <p className="text-gray-600">Create your account to start generating amazing startup ideas</p>
        </div>
        <SignUp />
      </div>
    </div>
  );
} 