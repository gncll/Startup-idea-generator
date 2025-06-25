import { getAuth } from '@clerk/nextjs/server';
import { saveContentIdeas } from '../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if user is authenticated
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { ideaId, contentIdeas } = req.body;

  if (!ideaId || !contentIdeas) {
    return res.status(400).json({ error: 'Idea ID and content ideas are required' });
  }

  try {
    // Save the approved content ideas
    const contentId = await saveContentIdeas(ideaId, userId, contentIdeas);

    res.status(200).json({ 
      message: 'Content ideas approved and saved successfully',
      contentId: contentId 
    });
  } catch (error) {
    console.error('Error approving content ideas:', error);
    res.status(500).json({ error: 'Failed to approve content ideas' });
  }
} 