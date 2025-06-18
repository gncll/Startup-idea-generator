import React, { useState } from 'react';
import { Lightbulb, Target, DollarSign, RefreshCw, ArrowRight, Plus } from 'lucide-react';

const StartupIdeaGenerator = () => {
  const [inputs, setInputs] = useState({
    problem: '',
    solution: '',
    targetAudience: ''
  });
  const [generatedIdea, setGeneratedIdea] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateStartupIdea = async () => {
    if (!inputs.problem || !inputs.solution || !inputs.targetAudience) {
      alert('Please fill in all fields first');
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
          targetAudience: inputs.targetAudience
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
      targetAudience: ''
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
            </div>

            <div className="text-center">
              <button
                onClick={generateStartupIdea}
                disabled={isGenerating || !inputs.problem || !inputs.solution || !inputs.targetAudience}
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
