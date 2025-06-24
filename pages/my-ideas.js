import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Lightbulb, Calendar, Eye, Trash2, ArrowLeft, Coins, Home } from 'lucide-react';
import Link from 'next/link';

const MyIdeas = () => {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [userTokens, setUserTokens] = useState(0);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchMyIdeas();
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

  const fetchMyIdeas = async () => {
    try {
      const response = await fetch('/api/get-my-ideas');
      if (response.ok) {
        const data = await response.json();
        setIdeas(data);
      }
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setLoading(false);
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

  const deleteIdea = async (ideaId) => {
    if (!confirm('Are you sure you want to delete this idea?')) return;

    try {
      const response = await fetch(`/api/delete-idea?id=${ideaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIdeas(ideas.filter(idea => idea.id !== ideaId));
        setSelectedIdea(null);
      }
    } catch (error) {
      console.error('Error deleting idea:', error);
    }
  };

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your ideas</h1>
          <Link href="/sign-in" className="text-indigo-600 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your ideas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/home" className="mr-4 p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <Home className="w-5 h-5 text-gray-600" />
            </Link>
            <Lightbulb className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">My Startup Ideas</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-lg border border-indigo-200">
              <Coins className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">
                {userTokens.toLocaleString()} tokens
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {ideas.length} {ideas.length === 1 ? 'idea' : 'ideas'} saved
            </div>
          </div>
        </div>

        {ideas.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No ideas yet</h2>
            <p className="text-gray-600 mb-6">Generate your first startup idea to see it here!</p>
            <Link 
              href="/advanced" 
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Lightbulb className="w-5 h-5 mr-2" />
              Generate Ideas
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Ideas List */}
            <div className="space-y-4">
              {ideas.map((idea) => (
                <div 
                  key={idea.id}
                  className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all hover:shadow-lg ${
                    selectedIdea?.id === idea.id ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  onClick={() => setSelectedIdea(idea)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {idea.name}
                    </h3>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIdea(idea);
                        }}
                        className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Quick view"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link 
                        href={`/idea/${idea.id}`}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Expand & develop this idea"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteIdea(idea.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete idea"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {idea.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {idea.sector}
                      </span>
                      {idea.approved && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approved
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(idea.createdAt?.seconds * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Idea Detail */}
            <div className="lg:sticky lg:top-8">
              {selectedIdea ? (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedIdea.name}
                    </h2>
                    <button
                      onClick={() => deleteIdea(selectedIdea.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600">{selectedIdea.description}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Sector</h3>
                      <span className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                        {selectedIdea.sector}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Revenue Model</h3>
                      <p className="text-gray-600">{selectedIdea.revenueModel}</p>
                    </div>

                    {selectedIdea.mvpFeatures && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">MVP Features</h3>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          {selectedIdea.mvpFeatures.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        Created: {new Date(selectedIdea.createdAt?.seconds * 1000).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Select an idea to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyIdeas; 