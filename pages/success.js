import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@clerk/nextjs';
import { CheckCircle, Lightbulb, ArrowRight, Loader } from 'lucide-react';

const SuccessPage = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isVerifying, setIsVerifying] = useState(true);
  const [purchaseDetails, setPurchaseDetails] = useState(null);
  const { session_id } = router.query;

  useEffect(() => {
    if (session_id && isLoaded) {
      verifyPurchase();
    }
  }, [session_id, isLoaded]);

  const verifyPurchase = async () => {
    try {
      const response = await fetch(`/api/verify-purchase?session_id=${session_id}`);
      if (response.ok) {
        const data = await response.json();
        setPurchaseDetails(data);
      }
    } catch (error) {
      console.error('Error verifying purchase:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isLoaded || isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying your purchase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful! 🎉
          </h1>
          <p className="text-xl text-gray-600">
            Your tokens have been added to your account
          </p>
        </div>

        {/* Purchase Details */}
        {purchaseDetails && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Purchase Details</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Package:</span>
                    <span className="font-medium">{purchaseDetails.packageName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tokens:</span>
                    <span className="font-medium text-green-600">
                      +{purchaseDetails.tokens.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">
                      ${purchaseDetails.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account:</span>
                    <span className="font-medium">
                      {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purchase Date:</span>
                    <span className="font-medium">
                      {new Date(purchaseDetails.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600 capitalize">
                      {purchaseDetails.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* What's Next */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Next?</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Ideas</h3>
              <p className="text-gray-600 text-sm mb-4">
                Start creating amazing startup ideas with your new tokens
              </p>
              <a 
                href="/advanced"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Advanced Generator
              </a>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">View Your Ideas</h3>
              <p className="text-gray-600 text-sm mb-4">
                Manage and develop your previously generated ideas
              </p>
              <a 
                href="/my-ideas"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                My Ideas
              </a>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Need More Tokens?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Get more tokens to unlock unlimited possibilities
              </p>
              <a 
                href="/buy-tokens"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Buy More Tokens
              </a>
            </div>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Thank you for your purchase! 🚀
          </h2>
          <p className="text-gray-600 mb-6">
            We're excited to see what amazing startup ideas you'll create with your tokens.
          </p>
          <a 
            href="/home"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage; 