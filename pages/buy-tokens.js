import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Coins, CreditCard, Check, Star, Loader } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function BuyTokens() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [userTokens, setUserTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingPackage, setLoadingPackage] = useState(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchUserTokens();
    }
  }, [isLoaded, isSignedIn]);

  // Refresh tokens when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isSignedIn) {
        fetchUserTokens();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isSignedIn]);

  const fetchUserTokens = async () => {
    try {
      const response = await fetch('/api/get-user-tokens');
      if (response.ok) {
        const data = await response.json();
        setUserTokens(data.tokens);
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  const tokenPackages = [
    {
      id: 'starter',
      name: 'Starter Pack',
      tokens: 100,
      price: 1,
      popular: false,
      description: 'Perfect for trying out our services',
      features: [
        '20 Simple Ideas',
        '20 Advanced Ideas', 
        '50 Section Rewrites',
        '33 Content Ideas'
      ]
    },
    {
      id: 'popular',
      name: 'Popular Pack',
      tokens: 1000,
      price: 10,
      popular: true,
      description: 'Best value for regular users',
      features: [
        '200 Simple Ideas',
        '200 Advanced Ideas',
        '500 Section Rewrites', 
        '333 Content Ideas'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Pack',
      tokens: 5000,
      price: 45,
      popular: false,
      description: 'For power users and teams',
      features: [
        '1000 Simple Ideas',
        '1000 Advanced Ideas',
        '2500 Section Rewrites',
        '1666 Content Ideas'
      ]
    }
  ];

  const handlePurchase = async (packageData) => {
    setLoadingPackage(packageData.id);
    
    try {
      // Create Stripe Checkout Session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageType: packageData.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      if (error) {
        console.error('Stripe redirect error:', error);
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoadingPackage(null);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Coins className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Buy Tokens</h1>
          </div>
          <p className="text-gray-600 text-lg mb-6">
            Purchase tokens to unlock unlimited access to our AI-powered startup tools
          </p>
          
          {/* Current Balance */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-lg">
            <Coins className="w-5 h-5 text-indigo-600" />
            <span className="text-lg font-semibold text-gray-900">
              Current Balance: {userTokens.toLocaleString()} tokens
            </span>
          </div>
        </div>

        {/* Token Usage Guide */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How Tokens Work</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Simple Ideas</h3>
              <p className="text-gray-600 text-sm">1 token per idea</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">5</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Advanced Ideas</h3>
              <p className="text-gray-600 text-sm">5 tokens per idea</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Section Rewrite</h3>
              <p className="text-gray-600 text-sm">2 tokens per rewrite</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Content Ideas</h3>
              <p className="text-gray-600 text-sm">3 tokens per generation</p>
            </div>
          </div>
        </div>

        {/* Token Packages */}
        <div className="grid md:grid-cols-3 gap-8">
          {tokenPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-2xl shadow-lg p-8 ${
                pkg.popular ? 'ring-2 ring-indigo-600 scale-105' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                <p className="text-gray-600 mb-4">{pkg.description}</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">${pkg.price}</span>
                  <span className="text-gray-600 ml-2">USD</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full">
                  <Coins className="w-5 h-5 text-indigo-600" />
                  <span className="font-semibold text-indigo-600">
                    {pkg.tokens.toLocaleString()} tokens
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {pkg.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePurchase(pkg)}
                disabled={loadingPackage === pkg.id}
                className={`w-full py-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  pkg.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {loadingPackage === pkg.id ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Purchase Now
                    </>
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Security Notice & Coupon Info */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800">
              <Check className="w-5 h-5" />
              <span className="font-medium">Secure Payment</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              All payments are processed securely through Stripe. Your card information is never stored on our servers.
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <CreditCard className="w-5 h-5" />
              <span className="font-medium">Coupon Codes</span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              Have a coupon code? You can enter it during checkout to get a discount on your purchase.
            </p>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-12">
          <button
            onClick={() => router.push('/home')}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
} 