import { getAuth } from '@clerk/nextjs/server';
import { getUserStartupIdeas } from '../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if user is authenticated
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const ideas = await getUserStartupIdeas(userId);
    res.status(200).json(ideas);
  } catch (error) {
    console.error('Error getting user ideas:', error);
    res.status(500).json({ error: 'Failed to get ideas' });
  }
} 