import React, { useState } from 'react';
import { Lightbulb, Target, DollarSign, RefreshCw, ArrowRight, Plus } from 'lucide-react';

const StartupIdeaGenerator = () => {
  const [inputs, setInputs] = useState({
    problem: '',
    solution: '',
    targetAudience: '',
    validationPlatforms: [],
    timeline: ''
  });
  const [generatedIdea, setGeneratedIdea] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlatformChange = (platform) => {
    setInputs(prev => ({
      ...prev,
      validationPlatforms: prev.validationPlatforms.includes(platform)
        ? prev.validationPlatforms.filter(p => p !== platform)
        : [...prev.validationPlatforms, platform]
    }));
  };

  const platforms = ['Twitter', 'Instagram', 'TikTok', 'YouTube', 'Facebook', 'Reddit', 'Discord'];
  const timelineOptions = [
    { value: '4', label: '4 weeks (MVP Sprint)' },
    { value: '8', label: '8 weeks (Quick Launch)' },
    { value: '12', label: '12 weeks (Standard)' },
    { value: '16', label: '16 weeks (Comprehensive)' },
    { value: '20', label: '20 weeks (Enterprise-ready)' },
    { value: '24', label: '24 weeks (Full Platform)' }
  ];

  const generateStartupIdea = async () => {
  if (!inputs.problem || !inputs.solution || !inputs.targetAudience || inputs.validationPlatforms.length === 0 || !inputs.timeline) {
    alert('Please fill in all fields and select at least one validation platform');
    return;
  }

  setIsGenerating(true);

  try {
    const response = await fetch('/api/generate-idea', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        problem: inputs.problem,
        solution: inputs.solution,
        targetAudience: inputs.targetAudience,
        validationPlatforms: inputs.validationPlatforms,
        timeline: inputs.timeline
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate idea');
    }

    const idea = await response.json();

    setGeneratedIdea({
      ...idea,
      userInputs: { ...inputs }
    });
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
      solution: '',
      targetAudience: '',
      validationPlatforms: [],
      timeline: ''
    });
    setGeneratedIdea(null);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Lightbulb className="w-8 h-8 text-black mr-3" />
            <h1 className="text-4xl font-bold">Startup Idea Generator</h1>
          </div>
          <p className="text-gray-600 text-lg">Define your problem, solution, and audience to generate your startup idea</p>
        </div>

        {!generatedIdea ? (
          /* Input Form */
          <div className="space-y-8">
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium mb-3">
                  What problem are you solving?
                </label>
                <textarea
                  value={inputs.problem}
                  onChange={(e) => handleInputChange('problem', e.target.value)}
                  placeholder="e.g., People struggle to track their daily water intake..."
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none resize-none h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  What's your solution?
                </label>
                <textarea
                  value={inputs.solution}
                  onChange={(e) => handleInputChange('solution', e.target.value)}
                  placeholder="e.g., A smart water bottle that automatically tracks consumption..."
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none resize-none h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Who is your target audience?
                </label>
                <textarea
                  value={inputs.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  placeholder="e.g., Health-conscious professionals aged 25-40..."
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none resize-none h-24"
                />
              </div>

              {/* Validation Platforms */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Which platforms do you want to use for validation?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {platforms.map((platform) => (
                    <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inputs.validationPlatforms.includes(platform)}
                        onChange={() => handlePlatformChange(platform)}
                        className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                      />
                      <span className="text-sm">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  How many weeks do you want to develop this?
                </label>
                <select
                  value={inputs.timeline}
                  onChange={(e) => handleInputChange('timeline', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none"
                >
                  <option value="">Select development timeline...</option>
                  {timelineOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={generateStartupIdea}
                disabled={isGenerating || !inputs.problem || !inputs.solution || !inputs.targetAudience || inputs.validationPlatforms.length === 0 || !inputs.timeline}
                className="inline-flex items-center px-8 py-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Generating Your Startup Idea...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Generate Startup Idea
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Generated Idea */
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm font-medium mb-4">
                #{generatedIdea.sector}
              </div>
              <h2 className="text-3xl font-bold mb-2">{generatedIdea.name}</h2>
              <p className="text-gray-600 text-lg leading-relaxed">{generatedIdea.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* User Inputs */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Your Foundation</h3>

                <div className="border-l-4 border-gray-200 pl-4">
                  <h4 className="font-medium text-gray-700 mb-1">Problem</h4>
                  <p className="text-gray-600">{generatedIdea.userInputs.problem}</p>
                </div>

                <div className="border-l-4 border-gray-200 pl-4">
                  <h4 className="font-medium text-gray-700 mb-1">Solution</h4>
                  <p className="text-gray-600">{generatedIdea.userInputs.solution}</p>
                </div>

                <div className="border-l-4 border-gray-200 pl-4">
                  <h4 className="font-medium text-gray-700 mb-1">Target Audience</h4>
                  <p className="text-gray-600">{generatedIdea.userInputs.targetAudience}</p>
                </div>
              </div>

              {/* Generated Insights */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Business Model</h3>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium flex items-center mb-1">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Revenue Model
                    </h4>
                    <p className="text-gray-600 text-sm">{generatedIdea.revenueModel}</p>
                  </div>

                  <div>
                    <h4 className="font-medium flex items-center mb-1">
                      <Target className="w-4 h-4 mr-1" />
                      Market Size
                    </h4>
                    <p className="text-gray-600 text-sm">{generatedIdea.marketSize}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-1">Competition Level</h4>
                    <p className="text-gray-600 text-sm">{generatedIdea.competition}</p>
                  </div>

                  {generatedIdea.fundingNeeds && (
                    <div>
                      <h4 className="font-medium mb-1">Funding Needs</h4>
                      <p className="text-gray-600 text-sm">{generatedIdea.fundingNeeds}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MVP Features */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Suggested MVP Features</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {generatedIdea.mvpFeatures?.map((feature, index) => (
                  <div key={index} className="flex items-center text-gray-600">
                    <ArrowRight className="w-4 h-4 mr-2 text-gray-400" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Tools */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Recommended Tools</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Development</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    {generatedIdea.tools?.development?.map((tool, index) => (
                      <div key={index}>{tool}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Design & Analytics</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    {generatedIdea.tools?.design?.map((tool, index) => (
                      <div key={index}>{tool}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Operations</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    {generatedIdea.tools?.operations?.map((tool, index) => (
                      <div key={index}>{tool}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Strategy */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Validation Strategy</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Recommended Platforms</h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedIdea.validation?.platforms?.map((platform, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Success Metrics</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    {generatedIdea.validation?.metrics?.map((metric, index) => (
                      <div key={index}>• {metric}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <h4 className="font-medium text-gray-700 mb-2">Content Strategy</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{generatedIdea.validation?.strategy}</p>
              </div>
            </div>

            {/* 12-Week Roadmap */}
            <div>
              <h3 className="text-xl font-semibold mb-3">12-Week Launch Roadmap</h3>
              <div className="grid gap-3">
                {generatedIdea.roadmap?.map((phase, index) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4">
                    <h4 className="font-medium text-gray-700">{phase.phase}</h4>
                    <p className="text-sm text-gray-600 mb-2">{phase.description}</p>
                    <div className="text-xs text-gray-500">
                      <strong>Focus:</strong> {phase.focus} | <strong>Budget:</strong> {phase.budget}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Go-to-Market Strategy */}
            {generatedIdea.goToMarket && (
              <div>
                <h3 className="text-xl font-semibold mb-3">Go-to-Market Strategy</h3>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{generatedIdea.goToMarket}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-center space-x-4 pt-6 border-t">
              <button
                onClick={generateStartupIdea}
                className="px-6 py-2 border-2 border-black text-black font-medium rounded-lg hover:bg-black hover:text-white transition-colors duration-200"
              >
                Generate Another
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StartupIdeaGenerator;
