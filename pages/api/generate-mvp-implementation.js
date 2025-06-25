import OpenAI from 'openai';
import { getAuth } from '@clerk/nextjs/server';
import { getUserTokens, useTokens } from '../../lib/database';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'fake-key',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if user is authenticated
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { idea } = req.body;

  if (!idea || !idea.mvpFeatures) {
    return res.status(400).json({ error: 'Idea with MVP features is required' });
  }

  // Check if user has enough tokens (MVP Implementation costs 3 tokens)
  const TOKENS_REQUIRED = 3;
  try {
    const userTokens = await getUserTokens(userId);
    if (userTokens < TOKENS_REQUIRED) {
      return res.status(402).json({ 
        error: 'Insufficient tokens', 
        required: TOKENS_REQUIRED,
        available: userTokens 
      });
    }
  } catch (error) {
    console.error('Error checking tokens:', error);
    return res.status(500).json({ error: 'Failed to check token balance' });
  }

  // Only return mock response if OpenAI API key is completely missing
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '') {
    console.log('No OpenAI API key found, returning mock MVP implementation');
    
    const mockImplementations = idea.mvpFeatures.map((feature, index) => ({
      feature: feature,
      implementation: {
        overview: `Implementation guide for ${feature}`,
        aiApproach: `Use AI APIs like OpenAI GPT-4 or Google Vision API to power the ${feature.toLowerCase()} functionality`,
        technicalSteps: [
          "Set up AI API integration with proper authentication",
          "Design data input/output flow for the feature",
          "Implement frontend interface for user interaction",
          "Create backend processing logic with AI API calls",
          "Add error handling and user feedback mechanisms",
          "Test with real user scenarios and edge cases"
        ],
        aiTools: [
          "OpenAI GPT-4 API for text processing and analysis",
          "Google Vision API for image recognition (if applicable)",
          "Anthropic Claude for complex reasoning tasks",
          "Hugging Face models for specialized AI tasks"
        ],
        estimatedTime: `${2 + index} weeks`,
        complexity: index === 0 ? "Medium" : index === 1 ? "High" : "Low",
        prerequisites: [
          "Basic understanding of API integration",
          "Frontend development skills (React/Vue/Angular)",
          "Backend development knowledge (Node.js/Python)",
          "AI API documentation familiarity"
        ]
      }
    }));

    // Consume tokens for mock response
    try {
      await useTokens(userId, TOKENS_REQUIRED);
    } catch (error) {
      console.error('Error consuming tokens:', error);
    }

    return res.status(200).json({ mvpImplementations: mockImplementations });
  }

  try {
    console.log('Using OpenAI API for MVP implementation generation');
    
    const prompt = `Generate detailed AI-powered implementation guides for these MVP features of "${idea.name}":

MVP Features: ${idea.mvpFeatures.join(', ')}

Business Context:
- Sector: ${idea.sector}
- Description: ${idea.description}
- Target Audience: ${idea.inputs?.targetAudience || idea.userInputs?.targetAudience}

For each MVP feature, provide a comprehensive implementation guide focusing on HOW TO USE AI to build it. Return ONLY a valid JSON object with this structure:

{
  "mvpImplementations": [
    {
      "feature": "Feature name exactly as provided",
      "implementation": {
        "overview": "2-3 sentence overview of how this feature works and its purpose",
        "aiApproach": "Specific AI approach/APIs to use for this feature (e.g., 'Use OpenAI Vision API to analyze food photos and extract nutritional data')",
        "technicalSteps": [
          "Step 1: Specific technical implementation step",
          "Step 2: Another concrete step",
          "Step 3: Continue with 4-6 total steps"
        ],
        "aiTools": [
          "Specific AI tool/API name and purpose",
          "Another AI tool recommendation",
          "3-4 total AI tools/APIs"
        ],
        "estimatedTime": "Realistic time estimate (e.g., '2-3 weeks')",
        "complexity": "Low/Medium/High",
        "prerequisites": [
          "Required skill 1",
          "Required skill 2",
          "Required skill 3"
        ]
      }
    }
  ]
}

Focus on practical, AI-powered solutions. Be specific about which AI APIs and tools to use. Make it actionable for developers.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000
    });

    let content = response.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const result = JSON.parse(content);

    // Consume tokens after successful generation
    try {
      await useTokens(userId, TOKENS_REQUIRED);
    } catch (error) {
      console.error('Error consuming tokens:', error);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    return res.status(500).json({ 
      error: 'Failed to generate MVP implementation guide. Please try again.',
      details: error.message 
    });
  }
} 