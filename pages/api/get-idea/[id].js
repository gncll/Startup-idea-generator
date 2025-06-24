import { getAuth } from '@clerk/nextjs/server';
import { getStartupIdea } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if user is authenticated
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Idea ID is required' });
  }

  try {
    const idea = await getStartupIdea(id);
    
    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    // Check if the idea belongs to the user
    if (idea.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to view this idea' });
    }

    res.status(200).json(idea);
  } catch (error) {
    console.error('Error getting idea:', error);
    res.status(500).json({ error: 'Failed to get idea' });
  }
} 