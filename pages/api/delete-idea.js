import { getAuth } from '@clerk/nextjs/server';
import { deleteStartupIdea, getStartupIdea } from '../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
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
    // Check if the idea belongs to the user
    const idea = await getStartupIdea(id);
    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    if (idea.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this idea' });
    }

    await deleteStartupIdea(id);
    res.status(200).json({ message: 'Idea deleted successfully' });
  } catch (error) {
    console.error('Error deleting idea:', error);
    res.status(500).json({ error: 'Failed to delete idea' });
  }
} 