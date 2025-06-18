import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { section, currentIdea, inputs } = req.body;

  if (!section || !currentIdea || !inputs) {
    return res.status(400).json({ error: 'Missing required fields' });
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
