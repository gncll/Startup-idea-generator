import React, { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw, Zap, ArrowRight, User, LogIn, HelpCircle, MessageCircle, BookOpen, FileText, Coins } from 'lucide-react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import FAQ from './FAQ';
import Contact from './Contact';

const SimpleStartupGenerator = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [inputs, setInputs] = useState({
    problem: '',
    solution: ''
  });
  const [generatedIdea, setGeneratedIdea] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [maxUsage] = useState(10);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [lastIdea, setLastIdea] = useState(null);
  const [isLoadingLastIdea, setIsLoadingLastIdea] = useState(false);
  const [userTokens, setUserTokens] = useState(0);

  // Load usage count from localStorage
  useEffect(() => {
    const savedUsage = localStorage.getItem('simpleGeneratorUsage');
    if (savedUsage) {
      setUsageCount(parseInt(savedUsage));
    }
  }, []);

  // Load last idea and tokens for signed-in users
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchLastIdea();
      fetchUserTokens();
    }
  }, [isLoaded, isSignedIn]);

  // Check for refresh parameter from success page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('refresh') === 'tokens' && isSignedIn) {
        console.log('🔄 Refreshing tokens after purchase...');
        setTimeout(() => {
          fetchUserTokens();
        }, 1000);
        // Clean URL
        window.history.replaceState({}, document.title, '/home');
      }
    }
  }, [isSignedIn]);

  // Refresh tokens when page becomes visible (after purchase)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isSignedIn) {
        fetchUserTokens();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isSignedIn]);

  // Real-time token updates via Server-Sent Events
  useEffect(() => {
    if (!isSignedIn || !user?.id) return;

    console.log(`🔌 Setting up SSE connection for user: ${user.id}`);
    const eventSource = new EventSource(`/api/token-updates?userId=${user.id}`);
    
    eventSource.onopen = () => {
      console.log(`✅ SSE connection opened`);
    };
    
    eventSource.onmessage = (event) => {
      console.log(`📨 SSE message received:`, event.data);
      
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'token_update') {
          console.log(`🎉 Tokens updated! Old: ${userTokens}, New: ${data.tokens}`);
          setUserTokens(data.tokens);
        } else if (data.type === 'connected') {
          console.log(`🔗 SSE connected successfully`);
        } else if (data.type === 'heartbeat') {
          console.log(`💓 SSE heartbeat`);
        }
      } catch (error) {
        console.error('❌ Error parsing SSE message:', error, 'Raw data:', event.data);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ SSE connection error:', error);
      eventSource.close();
    };

    return () => {
      console.log(`🔌 Closing SSE connection`);
      eventSource.close();
    };
  }, [isSignedIn, user?.id]);

  // Fallback: Poll for token updates every 60 seconds
  useEffect(() => {
    if (!isSignedIn) return;

    const interval = setInterval(() => {
      fetchUserTokens();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [isSignedIn]);

  const fetchLastIdea = async () => {
    setIsLoadingLastIdea(true);
    try {
      const response = await fetch('/api/get-my-ideas');
      if (response.ok) {
        const ideas = await response.json();
        if (ideas && ideas.length > 0) {
          // Get the most recent idea (first in array since they're sorted by date)
          setLastIdea(ideas[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching last idea:', error);
    } finally {
      setIsLoadingLastIdea(false);
    }
  };

  const fetchUserTokens = async () => {
    try {
      const response = await fetch('/api/get-user-tokens');
      if (response.ok) {
        const data = await response.json();
        setUserTokens(data.tokens);
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  // Clean up just signed in flag
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const justSignedIn = localStorage.getItem('justSignedIn');
      if (justSignedIn) {
        localStorage.removeItem('justSignedIn');
      }
    }
  }, [isLoaded, isSignedIn]);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateSimpleIdea = async () => {
    if (!inputs.problem || !inputs.solution) {
      alert('Please fill in both fields');
      return;
    }

    if (usageCount >= maxUsage) {
      alert('You have reached the maximum usage limit. Please sign up for unlimited access!');
      return;
    }

    setIsGenerating(true);

    try {
      // Get or create session ID
      let sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        localStorage.setItem('sessionId', sessionId);
      }

      const response = await fetch('/api/generate-simple-idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problem: inputs.problem,
          solution: inputs.solution,
          sessionId: sessionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate idea');
      }

      const idea = await response.json();
      setGeneratedIdea(idea);
      
      // Update usage count
      const newUsageCount = usageCount + 1;
      setUsageCount(newUsageCount);
      localStorage.setItem('simpleGeneratorUsage', newUsageCount.toString());

    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate idea. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setInputs({
      problem: '',
      solution: ''
    });
    setGeneratedIdea(null);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSignUpClick = () => {
    localStorage.setItem('justSignedIn', 'true');
    window.location.href = '/sign-up';
  };

  const handleSignInClick = () => {
    localStorage.setItem('justSignedIn', 'true');
    window.location.href = '/sign-in';
  };

  // If user is signed in, show the dashboard instead of simple generator
  if (isLoaded && isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Lightbulb className="w-7 h-7 text-indigo-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Startup Idea Generator</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
                <Coins className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">
                  {userTokens.toLocaleString()} tokens
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {user.firstName || user.emailAddresses[0].emailAddress.split('@')[0]}
                </span>
              </div>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
                afterSignOutUrl="/"
              />
            </div>
          </div>

          {/* Welcome Message */}
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome back, {user.firstName || 'there'}! 👋
            </h2>
            <p className="text-gray-600 text-lg">
              Choose what you would like to do today
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Continue Last Project Card */}
            {lastIdea && !isLoadingLastIdea && (
              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-indigo-600">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-indigo-600" />
                    </div>
                    <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded-full">
                      Recent
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{lastIdea.name}</h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                    {lastIdea.description}
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      #{lastIdea.sector}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(lastIdea.createdAt).toLocaleDateString('en-US')}
                    </span>
                  </div>
                  <a 
                    href={`/idea/${lastIdea.id}`}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Continue
                  </a>
                </div>
              </div>
            )}

            {/* Advanced Generator Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Advanced Generator</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Generate comprehensive startup ideas with detailed business plans and roadmaps.
                </p>
                <a 
                  href="/advanced"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Start Generator
                </a>
              </div>
            </div>

            {/* My Ideas Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">My Ideas</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  View, manage, and develop your previously generated startup ideas.
                </p>
                <a 
                  href="/my-ideas"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  View Ideas
                </a>
              </div>
            </div>
          </div>

          {/* Buy Tokens Section */}
          <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 text-center text-white">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Need More Power? 🚀</h2>
              <p className="text-indigo-100 mb-6">
                Unlock unlimited access to all features with our token system. Generate as many ideas as you want!
              </p>
              <a 
                href="/buy-tokens"
                className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Lightbulb className="w-5 h-5 mr-2" />
                Buy Tokens
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For non-signed-in users, show the original simple generator with FAQ and Contact
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-8">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Lightbulb className="w-7 h-7 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Simple Startup Generator</h1>
          </div>
          
          {/* Navigation & Auth Section */}
          <div className="flex items-center gap-3">
            {/* FAQ and Contact Links */}
            <button 
              onClick={() => scrollToSection('faq')}
              className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-sm font-medium"
            >
              <HelpCircle className="w-4 h-4" />
              FAQ
            </button>
            
            <button 
              onClick={() => scrollToSection('contact')}
              className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-sm font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              Contact
            </button>

            {/* Auth Section */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handleSignInClick}
                className="flex items-center gap-1 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-sm font-medium"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
              <button 
                onClick={handleSignUpClick}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
        
        {/* Subtitle and Usage Counter */}
        <div className="text-center mb-8">
          <p className="text-gray-600 text-lg mb-4">Generate startup ideas quickly with just 2 simple questions</p>
          
          {/* Usage Counter */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">
              {maxUsage - usageCount} uses left
            </span>
          </div>
        </div>

        {!generatedIdea ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                🤔 What problem are you solving?
              </label>
              <textarea
                value={inputs.problem}
                onChange={(e) => handleInputChange('problem', e.target.value)}
                placeholder="e.g., People struggle to find healthy meal options during busy workdays..."
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none h-24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                💡 What is your solution idea?
              </label>
              <textarea
                value={inputs.solution}
                onChange={(e) => handleInputChange('solution', e.target.value)}
                placeholder="e.g., An AI-powered meal planning app that creates personalized healthy meal plans..."
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none h-24"
              />
            </div>

            <div className="text-center pt-4">
              <button
                onClick={generateSimpleIdea}
                disabled={isGenerating || !inputs.problem || !inputs.solution || usageCount >= maxUsage}
                className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Generating Startup Idea...
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-5 h-5 mr-2" />
                    Generate Startup Idea
                  </>
                )}
              </button>
              
              {usageCount >= maxUsage && (
                <p className="mt-4 text-red-600 text-sm">
                  Usage limit reached! <button onClick={handleSignUpClick} className="text-indigo-600 hover:underline">Sign up</button> for unlimited access.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <div className="text-center border-b pb-6">
              <div className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium mb-4">
                #{generatedIdea.sector}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{generatedIdea.name}</h2>
              <p className="text-gray-600 text-lg leading-relaxed">{generatedIdea.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Foundation</h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-indigo-200 pl-4">
                    <h4 className="font-medium text-gray-700 mb-1">Problem</h4>
                    <p className="text-gray-600 text-sm">{inputs.problem}</p>
                  </div>
                  <div className="border-l-4 border-indigo-200 pl-4">
                    <h4 className="font-medium text-gray-700 mb-1">Solution</h4>
                    <p className="text-gray-600 text-sm">{inputs.solution}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Insights</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Revenue Model</h4>
                    <p className="text-gray-600 text-sm">{generatedIdea.revenueModel}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Target Market</h4>
                    <p className="text-gray-600 text-sm">{generatedIdea.targetMarket}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Next Steps</h4>
                    <p className="text-gray-600 text-sm">{generatedIdea.nextSteps}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Want More Detailed Analysis?</h3>
              <p className="text-gray-600 mb-4">Get comprehensive business plans, MVP features, market analysis, and weekly roadmaps</p>
              <div className="flex justify-center gap-3">
                <button 
                  onClick={handleSignUpClick}
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Sign Up for Advanced Features
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  Generate Another
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div id="faq" className="bg-white py-16">
        <FAQ />
      </div>

      {/* Contact Section */}
      <div id="contact" className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <Contact />
      </div>
    </div>
  );
};

export default SimpleStartupGenerator; 