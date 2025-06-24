import OpenAI from 'openai';
import { getAuth } from '@clerk/nextjs/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'fake-key',
});

// Mock content ideas for when OpenAI API key is not available
const generateMockContentIdeas = (idea) => {
  return [
    {
      title: `"How ${idea.name} Solves Your Daily Problems"`,
      description: `Create a blog post explaining how your solution addresses common pain points. Include real user scenarios and before/after comparisons.`,
      platform: 'Blog/LinkedIn',
      type: 'Educational',
      reach: '1K-5K views'
    },
    {
      title: `"Behind the Scenes: Building ${idea.name}"`,
      description: `Share your startup journey, challenges faced, and lessons learned. People love authentic founder stories.`,
      platform: 'Instagram/TikTok',
      type: 'Story',
      reach: '500-2K views'
    },
    {
      title: `"5 Tips for ${idea.inputs?.targetAudience || 'Your Target Audience'}"`,
      description: `Create actionable tips related to your industry. Position yourself as an expert while subtly promoting your solution.`,
      platform: 'YouTube/Twitter',
      type: 'Tips & Tricks',
      reach: '2K-10K views'
    },
    {
      title: `"Customer Success Story: How ${idea.name} Changed Everything"`,
      description: `Feature a customer testimonial or case study showing real results and impact of your solution.`,
      platform: 'Website/LinkedIn',
      type: 'Case Study',
      reach: '800-3K views'
    },
    {
      title: `"The Future of ${idea.sector}"`,
      description: `Share industry insights and trends. Position your startup as a forward-thinking leader in the space.`,
      platform: 'Medium/LinkedIn',
      type: 'Thought Leadership',
      reach: '1.5K-7K views'
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
    console.log('No OpenAI API key found, returning mock content ideas');
    const mockContentIdeas = generateMockContentIdeas(idea);
    return res.status(200).json({ contentIdeas: mockContentIdeas });
  }

  try {
    console.log('Using OpenAI API to generate content ideas');
    
    const prompt = `Based on this startup idea, generate 5 creative content ideas for marketing:

Startup: ${idea.name}
Description: ${idea.description}
Sector: ${idea.sector}
Target Audience: ${idea.inputs?.targetAudience || idea.userInputs?.targetAudience || 'General audience'}
Problem: ${idea.inputs?.problem || idea.userInputs?.problem || 'Not specified'}
Solution: ${idea.inputs?.solution || idea.userInputs?.solution || 'Not specified'}

Return ONLY a valid JSON object with this exact structure:
{
  "contentIdeas": [
    {
      "title": "Catchy content title with quotes",
      "description": "Detailed description of the content idea and how to execute it",
      "platform": "Best platform for this content (e.g., Instagram, LinkedIn, YouTube, TikTok, Blog)",
      "type": "Content type (e.g., Educational, Story, Tips & Tricks, Case Study, Behind the Scenes)",
      "reach": "Estimated reach (e.g., 1K-5K views, 500-2K views)"
    }
  ]
}

Focus on:
- Authentic storytelling
- Educational value
- Platform-specific content
- Audience engagement
- Brand awareness
- Lead generation

Make each idea unique and actionable.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500
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
    console.log('Falling back to mock content ideas due to error');
    const mockContentIdeas = generateMockContentIdeas(idea);
    return res.status(200).json({ contentIdeas: mockContentIdeas });
  }
} 