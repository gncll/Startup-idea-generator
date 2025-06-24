import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@clerk/nextjs';
import { 
  ArrowLeft, 
  Lightbulb, 
  FileText, 
  Search, 
  RefreshCw, 
  Copy,
  ExternalLink,
  Target,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

const IdeaDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { isLoaded, isSignedIn } = useAuth();
  
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [contentIdeas, setContentIdeas] = useState([]);
  const [seoStrategies, setSeoStrategies] = useState([]);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);

  useEffect(() => {
    if (id && isLoaded && isSignedIn) {
      fetchIdea();
    }
  }, [id, isLoaded, isSignedIn]);

  const fetchIdea = async () => {
    try {
      const response = await fetch(`/api/get-idea/${id}`);
      if (response.ok) {
        const data = await response.json();
        setIdea(data);
      } else {
        router.push('/my-ideas');
      }
    } catch (error) {
      console.error('Error fetching idea:', error);
      router.push('/my-ideas');
    } finally {
      setLoading(false);
    }
  };

  const generateContentIdeas = async () => {
    if (!idea) return;
    
    setIsGeneratingContent(true);
    try {
      const response = await fetch('/api/generate-content-ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea })
      });

      if (response.ok) {
        const data = await response.json();
        setContentIdeas(data.contentIdeas);
      }
    } catch (error) {
      console.error('Error generating content ideas:', error);
      alert('Failed to generate content ideas. Please try again.');
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const generateSEOStrategies = async () => {
    if (!idea) return;
    
    setIsGeneratingSEO(true);
    try {
      const response = await fetch('/api/generate-seo-strategies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea })
      });

      if (response.ok) {
        const data = await response.json();
        setSeoStrategies(data.seoStrategies);
      }
    } catch (error) {
      console.error('Error generating SEO strategies:', error);
      alert('Failed to generate SEO strategies. Please try again.');
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading idea...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    router.push('/sign-in');
    return null;
  }

  if (!idea) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Idea not found</h1>
          <Link href="/my-ideas" className="text-indigo-600 hover:underline">
            Back to My Ideas
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Lightbulb },
    { id: 'content', label: 'Content Ideas', icon: FileText },
    { id: 'seo', label: 'SEO Strategy', icon: Search }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/my-ideas" className="mr-4 p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{idea.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                  {idea.sector}
                </span>
                {idea.approved && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approved
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            Created: {new Date(idea.createdAt?.seconds * 1000).toLocaleDateString()}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Description */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Description</h2>
                  <p className="text-gray-600 text-lg leading-relaxed">{idea.description}</p>
                </div>

                {/* Key Metrics */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Business Model</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium flex items-center mb-2">
                          <DollarSign className="w-4 h-4 mr-1" />
                          Revenue Model
                        </h4>
                        <p className="text-gray-600 text-sm">{idea.revenueModel}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium flex items-center mb-2">
                          <Target className="w-4 h-4 mr-1" />
                          Market Size
                        </h4>
                        <p className="text-gray-600 text-sm">{idea.marketSize}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Your Foundation</h3>
                    <div className="space-y-3">
                      <div className="border-l-4 border-gray-200 pl-4">
                        <h4 className="font-medium text-gray-700 mb-1">Problem</h4>
                        <p className="text-gray-600 text-sm">{idea.inputs?.problem || idea.userInputs?.problem}</p>
                      </div>
                      
                      <div className="border-l-4 border-gray-200 pl-4">
                        <h4 className="font-medium text-gray-700 mb-1">Solution</h4>
                        <p className="text-gray-600 text-sm">{idea.inputs?.solution || idea.userInputs?.solution}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MVP Features */}
                {idea.mvpFeatures && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">MVP Features</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {idea.mvpFeatures.map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'content' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Content Ideas</h2>
                  <button
                    onClick={generateContentIdeas}
                    disabled={isGeneratingContent}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {isGeneratingContent ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Content Ideas
                      </>
                    )}
                  </button>
                </div>

                {contentIdeas.length > 0 ? (
                  <div className="space-y-4">
                    {contentIdeas.map((content, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">{content.title}</h3>
                            <p className="text-gray-600 mb-3">{content.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Platform: {content.platform}</span>
                              <span>Type: {content.type}</span>
                              <span>Estimated reach: {content.reach}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(`${content.title}\n\n${content.description}`)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Click "Generate Content Ideas" to create content strategies for your startup</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'seo' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">SEO Strategy</h2>
                  <button
                    onClick={generateSEOStrategies}
                    disabled={isGeneratingSEO}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {isGeneratingSEO ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Generate SEO Strategy
                      </>
                    )}
                  </button>
                </div>

                {seoStrategies.length > 0 ? (
                  <div className="space-y-6">
                    {seoStrategies.map((strategy, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-gray-900">{strategy.category}</h3>
                          <button
                            onClick={() => copyToClipboard(strategy.keywords.join(', '))}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Keywords</h4>
                            <div className="flex flex-wrap gap-2">
                              {strategy.keywords.map((keyword, idx) => (
                                <span key={idx} className="bg-white px-2 py-1 rounded text-sm text-gray-600">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Strategy</h4>
                            <p className="text-gray-600 text-sm">{strategy.strategy}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Click "Generate SEO Strategy" to create SEO plans for your startup</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaDetail; 