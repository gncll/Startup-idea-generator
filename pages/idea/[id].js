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
  DollarSign,
  Code,
  Heart,
  ChevronDown,
  ChevronUp
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
  const [mvpImplementations, setMvpImplementations] = useState([]);
  const [savedData, setSavedData] = useState({
    mvpImplementations: [],
    contentIdeas: [],
    seoStrategies: []
  });
  const [expandedSavedItems, setExpandedSavedItems] = useState({});
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [isGeneratingMVP, setIsGeneratingMVP] = useState(false);
  const [isApprovingMVP, setIsApprovingMVP] = useState(false);
  const [isApprovingContent, setIsApprovingContent] = useState(false);
  const [isApprovingSEO, setIsApprovingSEO] = useState(false);

  useEffect(() => {
    if (id && isLoaded && isSignedIn) {
      fetchIdea();
      fetchSavedData();
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

  const fetchSavedData = async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/get-saved-data/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSavedData(data);
      }
    } catch (error) {
      console.error('Error fetching saved data:', error);
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

  const generateMVPImplementation = async () => {
    if (!idea) return;
    
    setIsGeneratingMVP(true);
    try {
      const response = await fetch('/api/generate-mvp-implementation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea })
      });

      if (response.ok) {
        const data = await response.json();
        setMvpImplementations(data.mvpImplementations);
      } else {
        const errorData = await response.json();
        if (response.status === 402) {
          alert(`Insufficient tokens. You need ${errorData.required} tokens but only have ${errorData.available}.`);
        } else {
          alert('Failed to generate MVP implementation guide. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error generating MVP implementation:', error);
      alert('Failed to generate MVP implementation guide. Please try again.');
    } finally {
      setIsGeneratingMVP(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const approveMVPImplementation = async () => {
    if (!mvpImplementations.length || !id) return;
    
    setIsApprovingMVP(true);
    try {
      const response = await fetch('/api/approve-mvp-implementation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ideaId: id,
          mvpImplementations: mvpImplementations
        })
      });

      if (response.ok) {
        alert('🎉 MVP Implementation approved and saved!');
        fetchSavedData(); // Refresh saved data
      } else {
        alert('Failed to approve MVP implementation. Please try again.');
      }
    } catch (error) {
      console.error('Error approving MVP implementation:', error);
      alert('Failed to approve MVP implementation. Please try again.');
    } finally {
      setIsApprovingMVP(false);
    }
  };

  const approveContentIdeas = async () => {
    if (!contentIdeas.length || !id) return;
    
    setIsApprovingContent(true);
    try {
      const response = await fetch('/api/approve-content-ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ideaId: id,
          contentIdeas: contentIdeas
        })
      });

      if (response.ok) {
        alert('🎉 Content Ideas approved and saved!');
        fetchSavedData(); // Refresh saved data
      } else {
        alert('Failed to approve content ideas. Please try again.');
      }
    } catch (error) {
      console.error('Error approving content ideas:', error);
      alert('Failed to approve content ideas. Please try again.');
    } finally {
      setIsApprovingContent(false);
    }
  };

  const approveSEOStrategies = async () => {
    if (!seoStrategies.length || !id) return;
    
    setIsApprovingSEO(true);
    try {
      const response = await fetch('/api/approve-seo-strategies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ideaId: id,
          seoStrategies: seoStrategies
        })
      });

      if (response.ok) {
        alert('🎉 SEO Strategies approved and saved!');
        fetchSavedData(); // Refresh saved data
      } else {
        alert('Failed to approve SEO strategies. Please try again.');
      }
    } catch (error) {
      console.error('Error approving SEO strategies:', error);
      alert('Failed to approve SEO strategies. Please try again.');
    } finally {
      setIsApprovingSEO(false);
    }
  };

  const toggleSavedItem = (type, index) => {
    const key = `${type}-${index}`;
    setExpandedSavedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
    { id: 'mvp', label: 'MVP Implementation', icon: Code },
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

                {/* Recommended Tools */}
                {idea.tools && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Recommended Tools</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      {Object.entries(idea.tools).map(([category, tools]) => (
                        <div key={category}>
                          <h4 className="font-medium text-gray-700 mb-3 capitalize">{category}</h4>
                          <div className="space-y-2">
                            {tools.map((tool, index) => (
                              <div key={index} className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                                {tool}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Validation Strategy */}
                {idea.validation && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Validation Strategy</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Platforms</h4>
                          <div className="flex flex-wrap gap-2">
                            {idea.validation.platforms?.map((platform, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                {platform}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Success Metrics</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {idea.validation.metrics?.map((metric, index) => (
                              <li key={index}>• {metric}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {idea.validation.platformStrategies && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Platform Strategies</h4>
                          {idea.validation.platformStrategies.map((strategy, index) => (
                            <div key={index} className="border-l-4 border-blue-200 pl-4 mb-3">
                              <div className="font-medium text-sm">{strategy.platform} - {strategy.frequency}</div>
                              <div className="text-sm text-gray-600 mb-1">{strategy.strategy}</div>
                              <div className="text-xs text-gray-500">
                                Content ideas: {strategy.contentIdeas?.join(', ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Weekly Development Plan */}
                {idea.weeklyPlan && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Weekly Development Plan</h3>
                    <div className="space-y-4">
                      {idea.weeklyPlan.map((week, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Week {week.week}: {week.focus}</h4>
                            <span className="text-sm text-gray-500">{week.metrics}</span>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Tasks:</span>
                              <ul className="text-gray-600 mt-1">
                                {week.tasks?.map((task, taskIndex) => (
                                  <li key={taskIndex}>• {task}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Deliverables:</span>
                              <ul className="text-gray-600 mt-1">
                                {week.deliverables?.map((deliverable, delIndex) => (
                                  <li key={delIndex}>• {deliverable}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Launch Roadmap */}
                {idea.roadmap && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Launch Roadmap</h3>
                    <div className="space-y-4">
                      {idea.roadmap.map((phase, index) => (
                        <div key={index} className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">{phase.phase}</h4>
                          <p className="text-gray-600 text-sm mb-3">{phase.description}</p>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Focus:</span>
                              <span className="text-gray-600 ml-2">{phase.focus}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Budget:</span>
                              <span className="text-gray-600 ml-2">{phase.budget}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Go-to-Market Strategy */}
                {idea.goToMarket && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Go-to-Market Strategy</h3>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-gray-700">{idea.goToMarket}</p>
                    </div>
                  </div>
                )}

                {/* Marketing Channels */}
                {idea.marketingChannels && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Marketing Channels</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {idea.marketingChannels.map((channel, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">{channel.channel}</h4>
                          <p className="text-gray-600 text-sm mb-3">{channel.strategy}</p>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Budget: {channel.budget}</span>
                            <span>Timeline: {channel.timeline}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Plan */}
                {idea.contentPlan && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Content Plan</h3>
                    <div className="space-y-4">
                      {idea.contentPlan.map((content, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{content.type}</h4>
                            <span className="text-sm text-gray-500">{content.frequency}</span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{content.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {content.platforms?.map((platform, platformIndex) => (
                              <span key={platformIndex} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                {platform}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Funding Needs */}
                {idea.fundingNeeds && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Funding Requirements</h3>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-gray-700">{idea.fundingNeeds}</p>
                    </div>
                  </div>
                )}

                {/* Competition Analysis */}
                {idea.competition && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Competition Analysis</h3>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-gray-700">{idea.competition}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'mvp' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">MVP Feature Implementation</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={generateMVPImplementation}
                      disabled={isGeneratingMVP}
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      {isGeneratingMVP ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Code className="w-4 h-4 mr-2" />
                          Generate Implementation Guide
                        </>
                      )}
                    </button>
                    {mvpImplementations.length > 0 && (
                      <button
                        onClick={approveMVPImplementation}
                        disabled={isApprovingMVP}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {isApprovingMVP ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <Heart className="w-4 h-4 mr-2" />
                            Approve & Save
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Saved MVP Implementations */}
                {savedData.mvpImplementations.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4 text-green-700">💾 Saved MVP Implementations</h3>
                    <div className="space-y-3">
                      {savedData.mvpImplementations.map((saved, index) => (
                        <div key={saved.id} className="border border-green-200 rounded-lg">
                          <div 
                            className="p-4 bg-green-50 cursor-pointer flex items-center justify-between hover:bg-green-100 transition-colors"
                            onClick={() => toggleSavedItem('mvp', index)}
                          >
                            <div>
                              <span className="font-medium text-green-800">
                                MVP Implementation #{index + 1}
                              </span>
                              <span className="text-sm text-green-600 ml-2">
                                ({saved.mvpImplementations.length} features) - {new Date(saved.createdAt?.seconds * 1000).toLocaleDateString()}
                              </span>
                            </div>
                            {expandedSavedItems[`mvp-${index}`] ? 
                              <ChevronUp className="w-4 h-4 text-green-600" /> : 
                              <ChevronDown className="w-4 h-4 text-green-600" />
                            }
                          </div>
                          {expandedSavedItems[`mvp-${index}`] && (
                            <div className="p-4 border-t border-green-200 bg-white">
                              <div className="space-y-4">
                                {saved.mvpImplementations.map((item, itemIndex) => (
                                  <div key={itemIndex} className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">{item.feature}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{item.implementation.overview}</p>
                                    <div className="text-xs text-gray-500">
                                      <span className="bg-gray-100 px-2 py-1 rounded mr-2">{item.implementation.complexity}</span>
                                      <span className="bg-gray-100 px-2 py-1 rounded">{item.implementation.estimatedTime}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mvpImplementations.length > 0 ? (
                  <div className="space-y-6">
                    {mvpImplementations.map((item, index) => (
                      <div key={index} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{item.feature}</h3>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              item.implementation.complexity === 'Low' ? 'bg-green-100 text-green-800' :
                              item.implementation.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.implementation.complexity}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {item.implementation.estimatedTime}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {/* Overview */}
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Overview</h4>
                            <p className="text-gray-600 text-sm">{item.implementation.overview}</p>
                          </div>

                          {/* AI Approach */}
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">AI-Powered Approach</h4>
                            <div className="bg-white rounded-lg p-3 border border-purple-200">
                              <p className="text-gray-700 text-sm font-medium">{item.implementation.aiApproach}</p>
                            </div>
                          </div>

                          {/* Technical Steps */}
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Implementation Steps</h4>
                            <ol className="space-y-2">
                              {item.implementation.technicalSteps.map((step, stepIndex) => (
                                <li key={stepIndex} className="flex items-start text-sm text-gray-600">
                                  <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">
                                    {stepIndex + 1}
                                  </span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>

                          {/* AI Tools */}
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Recommended AI Tools</h4>
                            <div className="grid md:grid-cols-2 gap-2">
                              {item.implementation.aiTools.map((tool, toolIndex) => (
                                <div key={toolIndex} className="bg-white rounded-lg p-2 border border-gray-200">
                                  <span className="text-sm text-gray-700">• {tool}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Prerequisites */}
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Prerequisites</h4>
                            <div className="flex flex-wrap gap-2">
                              {item.implementation.prerequisites.map((prereq, prereqIndex) => (
                                <span key={prereqIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                  {prereq}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Copy Button */}
                          <div className="pt-2 border-t border-purple-200">
                            <button
                              onClick={() => copyToClipboard(`${item.feature}\n\nOverview: ${item.implementation.overview}\n\nAI Approach: ${item.implementation.aiApproach}\n\nSteps:\n${item.implementation.technicalSteps.map((step, i) => `${i+1}. ${step}`).join('\n')}\n\nAI Tools:\n${item.implementation.aiTools.map(tool => `• ${tool}`).join('\n')}`)}
                              className="inline-flex items-center px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy Implementation Guide
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Code className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Generate AI-powered implementation guides for your MVP features</p>
                    <p className="text-gray-500 text-sm">Learn exactly how to build each feature using modern AI tools and APIs</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'content' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Content Ideas</h2>
                  <div className="flex gap-2">
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
                    {contentIdeas.length > 0 && (
                      <button
                        onClick={approveContentIdeas}
                        disabled={isApprovingContent}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {isApprovingContent ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <Heart className="w-4 h-4 mr-2" />
                            Approve & Save
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Saved Content Ideas */}
                {savedData.contentIdeas.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4 text-green-700">💾 Saved Content Ideas</h3>
                    <div className="space-y-3">
                      {savedData.contentIdeas.map((saved, index) => (
                        <div key={saved.id} className="border border-green-200 rounded-lg">
                          <div 
                            className="p-4 bg-green-50 cursor-pointer flex items-center justify-between hover:bg-green-100 transition-colors"
                            onClick={() => toggleSavedItem('content', index)}
                          >
                            <div>
                              <span className="font-medium text-green-800">
                                Content Ideas Set #{index + 1}
                              </span>
                              <span className="text-sm text-green-600 ml-2">
                                ({saved.contentIdeas.length} ideas) - {new Date(saved.createdAt?.seconds * 1000).toLocaleDateString()}
                              </span>
                            </div>
                            {expandedSavedItems[`content-${index}`] ? 
                              <ChevronUp className="w-4 h-4 text-green-600" /> : 
                              <ChevronDown className="w-4 h-4 text-green-600" />
                            }
                          </div>
                          {expandedSavedItems[`content-${index}`] && (
                            <div className="p-4 border-t border-green-200 bg-white">
                              <div className="space-y-4">
                                {saved.contentIdeas.map((content, contentIndex) => (
                                  <div key={contentIndex} className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">{content.title}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{content.description}</p>
                                    <div className="text-xs text-gray-500">
                                      <span className="bg-gray-100 px-2 py-1 rounded mr-2">{content.platform}</span>
                                      <span className="bg-gray-100 px-2 py-1 rounded mr-2">{content.type}</span>
                                      <span className="bg-gray-100 px-2 py-1 rounded">{content.reach}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                  <div className="flex gap-2">
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
                    {seoStrategies.length > 0 && (
                      <button
                        onClick={approveSEOStrategies}
                        disabled={isApprovingSEO}
                        className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 transition-colors"
                      >
                        {isApprovingSEO ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <Heart className="w-4 h-4 mr-2" />
                            Approve & Save
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Saved SEO Strategies */}
                {savedData.seoStrategies.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4 text-green-700">💾 Saved SEO Strategies</h3>
                    <div className="space-y-3">
                      {savedData.seoStrategies.map((saved, index) => (
                        <div key={saved.id} className="border border-green-200 rounded-lg">
                          <div 
                            className="p-4 bg-green-50 cursor-pointer flex items-center justify-between hover:bg-green-100 transition-colors"
                            onClick={() => toggleSavedItem('seo', index)}
                          >
                            <div>
                              <span className="font-medium text-green-800">
                                SEO Strategy Set #{index + 1}
                              </span>
                              <span className="text-sm text-green-600 ml-2">
                                ({saved.seoStrategies.length} strategies) - {new Date(saved.createdAt?.seconds * 1000).toLocaleDateString()}
                              </span>
                            </div>
                            {expandedSavedItems[`seo-${index}`] ? 
                              <ChevronUp className="w-4 h-4 text-green-600" /> : 
                              <ChevronDown className="w-4 h-4 text-green-600" />
                            }
                          </div>
                          {expandedSavedItems[`seo-${index}`] && (
                            <div className="p-4 border-t border-green-200 bg-white">
                              <div className="space-y-4">
                                {saved.seoStrategies.map((strategy, strategyIndex) => (
                                  <div key={strategyIndex} className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">{strategy.category}</h4>
                                    <div className="text-sm text-gray-600 mb-2">
                                      Keywords: {strategy.keywords?.join(', ')}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      <span className="bg-gray-100 px-2 py-1 rounded mr-2">Difficulty: {strategy.difficulty}</span>
                                      <span className="bg-gray-100 px-2 py-1 rounded">Volume: {strategy.volume}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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