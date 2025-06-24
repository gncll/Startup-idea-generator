import OpenAI from 'openai';
import { getAuth } from '@clerk/nextjs/server';

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

  const { section, currentIdea, inputs } = req.body;

  if (!section || !currentIdea || !inputs) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Mock responses if no valid OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    const mockResponses = {
      mvpFeatures: {
        "mvpFeatures": ["Advanced user dashboard", "Real-time notifications system", "Mobile-first responsive design", "Basic analytics and reporting"]
      },
      tools: {
        "tools": {
          "development": ["Next.js + Vercel $20/month", "Supabase Pro $25/month", "GitHub Pro $4/month", "Cursor AI $20/month"],
          "design": ["Figma Professional $12/month", "Unsplash+ $10/month", "Canva Pro $12/month"],
          "operations": ["Notion Team $8/month", "Slack Pro $7.25/month", "Google Workspace $6/month"]
        }
      },
      validation: {
        "validation": {
          "platforms": inputs.validationPlatforms || ["Twitter", "LinkedIn"],
          "metrics": ["Engagement rate >5%", "Click-through rate >3%", "Sign-up conversion >2%", "User retention >40% week 1"],
          "platformStrategies": [
            {
              "platform": inputs.validationPlatforms?.[0] || "Twitter",
              "frequency": "Daily posts",
              "strategy": "Share insights and build community around your solution",
              "contentIdeas": ["Problem validation posts", "Behind-the-scenes development", "User feedback highlights", "Industry insights"]
            }
          ]
        }
      },
      weeklyPlan: {
        "weeklyPlan": Array.from({length: parseInt(inputs.timeline) || 4}, (_, i) => ({
          "week": i + 1,
          "focus": i === 0 ? "Research & Validation" : i < Math.ceil(inputs.timeline / 2) ? "Development & Testing" : "Launch & Growth",
          "tasks": i === 0 ? ["Customer interviews", "Market research", "Landing page"] : i < Math.ceil(inputs.timeline / 2) ? ["Core feature development", "User testing", "Feedback integration"] : ["Launch preparation", "Marketing campaigns", "User acquisition"],
          "deliverables": i === 0 ? ["Problem validation report", "Basic website"] : i < Math.ceil(inputs.timeline / 2) ? ["Working prototype", "User feedback"] : ["Live product", "First users"],
          "metrics": i === 0 ? "10+ customer interviews completed" : i < Math.ceil(inputs.timeline / 2) ? "MVP with core features ready" : "First 100 users acquired"
        }))
      },
      goToMarket: {
        "goToMarket": `Multi-channel approach focusing on organic growth through content marketing, community building, and strategic partnerships. Phase 1: Build awareness through valuable content. Phase 2: Convert audience through free tools and resources. Phase 3: Scale through referrals and partnerships.`,
        "marketingChannels": [
          {
            "channel": "Content Marketing",
            "strategy": "Create educational content addressing target audience pain points",
            "budget": "40% of marketing budget",
            "timeline": "Week 1-12"
          },
          {
            "channel": "Social Media Marketing",
            "strategy": "Build community and engage with potential customers",
            "budget": "30% of marketing budget",
            "timeline": "Week 2-12"
          }
        ],
        "contentPlan": [
          {
            "type": "Educational Videos",
            "description": "Short-form videos explaining key concepts",
            "frequency": "3 times per week",
            "platforms": ["YouTube", "TikTok"]
          },
          {
            "type": "User Success Stories",
            "description": "Case studies and testimonials",
            "frequency": "2 times per week",
            "platforms": ["LinkedIn", "Twitter"]
          }
        ]
      }
    };

    const mockResponse = mockResponses[section];
    if (mockResponse) {
      return res.status(200).json(mockResponse);
    } else {
      return res.status(400).json({ error: 'Invalid section' });
    }
  }

  try {
    let prompt = '';

    switch(section) {
      case 'mvpFeatures':
        prompt = `Generate 4 new MVP features for "${currentIdea.name}" - ${currentIdea.description}.
        Target: ${inputs.targetAudience}
        Return JSON: {"mvpFeatures": ["feature1", "feature2", "feature3", "feature4"]}`;
        break;

      case 'tools':
        prompt = `Generate new tool recommendations for "${currentIdea.name}" startup.
        Timeline: ${inputs.timeline} weeks
        Return JSON: {
          "tools": {
            "development": ["tool1 + cost", "tool2 + cost", "tool3 + cost"],
            "design": ["tool1 + cost", "tool2 + cost", "tool3 + cost"],
            "operations": ["tool1 + cost", "tool2 + cost", "tool3 + cost"]
          }
        }`;
        break;

      case 'validation':
        prompt = `Generate new validation strategy for "${currentIdea.name}".
        Platforms: ${inputs.validationPlatforms.join(', ')}
        Return JSON: {
          "validation": {
            "platforms": ${JSON.stringify(inputs.validationPlatforms)},
            "metrics": ["metric1", "metric2", "metric3", "metric4"],
            "platformStrategies": [
              {
                "platform": "platform name",
                "frequency": "posting frequency",
                "strategy": "platform strategy",
                "contentIdeas": ["idea1", "idea2", "idea3", "idea4"]
              }
            ]
          }
        }`;
        break;

      case 'weeklyPlan':
        prompt = `Generate complete ${inputs.timeline}-week plan for "${currentIdea.name}".
        Return JSON: {
          "weeklyPlan": [
            ${Array.from({length: parseInt(inputs.timeline)}, (_, i) => `
            {
              "week": ${i + 1},
              "focus": "Week ${i + 1} specific focus area",
              "tasks": ["specific task 1", "specific task 2", "specific task 3"],
              "deliverables": ["concrete deliverable 1", "concrete deliverable 2"],
              "metrics": "measurable success metrics for week ${i + 1}"
            }`).join(',\n            ')}
          ]
        }`;
        break;

      case 'goToMarket':
        prompt = `Generate new go-to-market strategy for "${currentIdea.name}".
        Timeline: ${inputs.timeline} weeks, Platforms: ${inputs.validationPlatforms.join(', ')}
        Return JSON: {
          "goToMarket": "detailed strategy text",
          "marketingChannels": [
            {
              "channel": "channel name",
              "strategy": "channel strategy",
              "budget": "budget allocation",
              "timeline": "implementation timeline"
            }
          ],
          "contentPlan": [
            {
              "type": "content type",
              "description": "content description",
              "frequency": "creation frequency",
              "platforms": ["platform1", "platform2"]
            }
          ]
        }`;
        break;

      default:
        return res.status(400).json({ error: 'Invalid section' });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 2000
    });

    const result = JSON.parse(response.choices[0].message.content);
    res.status(200).json(result);

  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ error: `Failed to rewrite ${section}` });
  }
}