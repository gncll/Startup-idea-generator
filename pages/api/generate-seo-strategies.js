import OpenAI from 'openai';
import { getAuth } from '@clerk/nextjs/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'fake-key',
});

// Mock SEO strategies for when OpenAI API key is not available
const generateMockSEOStrategies = (idea) => {
  const sector = idea.sector?.toLowerCase() || 'startup';
  const name = idea.name || 'startup';
  
  return [
    {
      category: 'Primary Keywords',
      keywords: [
        `${sector} solution`,
        `${sector} app`,
        `best ${sector} tool`,
        `${sector} software`,
        `${name.toLowerCase()} alternative`
      ],
      strategy: 'Target high-volume, medium-competition keywords related to your core product. Create pillar content around these terms.'
    },
    {
      category: 'Long-tail Keywords',
      keywords: [
        `how to solve ${idea.inputs?.problem?.split(' ').slice(0, 3).join(' ') || 'common problems'}`,
        `best way to ${idea.inputs?.solution?.split(' ').slice(0, 4).join(' ') || 'improve productivity'}`,
        `${sector} tools for small business`,
        `${sector} solution comparison`,
        `${name.toLowerCase()} vs competitors`
      ],
      strategy: 'Focus on specific user intent and problems. These convert better and are easier to rank for initially.'
    },
    {
      category: 'Content SEO',
      keywords: [
        `${sector} tips`,
        `${sector} best practices`,
        `${sector} guide`,
        `${sector} tutorial`,
        `${sector} trends 2024`
      ],
      strategy: 'Create educational content that positions you as an industry expert. Build topical authority in your niche.'
    },
    {
      category: 'Local/Niche SEO',
      keywords: [
        `${sector} for ${idea.inputs?.targetAudience || 'professionals'}`,
        `${sector} ${new Date().getFullYear()}`,
        `affordable ${sector} solution`,
        `${sector} startup`,
        `new ${sector} technology`
      ],
      strategy: 'Target specific audience segments and trending terms. Capitalize on being new and innovative.'
    }
  ];
};

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

  if (!idea) {
    return res.status(400).json({ error: 'Idea data is required' });
  }

  // Return mock response if OpenAI API key is not available
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '') {
    console.log('No OpenAI API key found, returning mock SEO strategies');
    const mockSEOStrategies = generateMockSEOStrategies(idea);
    return res.status(200).json({ seoStrategies: mockSEOStrategies });
  }

  try {
    console.log('Using OpenAI API to generate SEO strategies');
    
    const prompt = `Based on this startup idea, generate 4 SEO strategy categories with specific keywords and tactics:

Startup: ${idea.name}
Description: ${idea.description}
Sector: ${idea.sector}
Target Audience: ${idea.inputs?.targetAudience || idea.userInputs?.targetAudience || 'General audience'}
Problem: ${idea.inputs?.problem || idea.userInputs?.problem || 'Not specified'}
Solution: ${idea.inputs?.solution || idea.userInputs?.solution || 'Not specified'}

Return ONLY a valid JSON object with this exact structure:
{
  "seoStrategies": [
    {
      "category": "Strategy category name (e.g., Primary Keywords, Long-tail Keywords, Content SEO, Local SEO)",
      "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
      "strategy": "Detailed explanation of how to implement this SEO strategy category"
    }
  ]
}

Focus on:
- Realistic, achievable keywords
- Mix of high and low competition terms
- User intent-based keywords
- Industry-specific terminology
- Actionable SEO tactics
- Current SEO best practices

Generate 4 different strategy categories with 5 keywords each.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1200
    });

    let content = response.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const result = JSON.parse(content);

    res.status(200).json(result);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Return mock response on error
    console.log('Falling back to mock SEO strategies due to error');
    const mockSEOStrategies = generateMockSEOStrategies(idea);
    return res.status(200).json({ seoStrategies: mockSEOStrategies });
  }
} 