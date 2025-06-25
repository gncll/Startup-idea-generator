import { getAuth } from '@clerk/nextjs/server';
import { getMVPImplementations, getContentIdeas, getSEOStrategies } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if user is authenticated
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { ideaId } = req.query;

  if (!ideaId) {
    return res.status(400).json({ error: 'Idea ID is required' });
  }

  try {
    // Get all saved data for this idea
    const [mvpImplementations, contentIdeas, seoStrategies] = await Promise.all([
      getMVPImplementations(ideaId),
      getContentIdeas(ideaId),
      getSEOStrategies(ideaId)
    ]);

    res.status(200).json({
      mvpImplementations,
      contentIdeas,
      seoStrategies
    });
  } catch (error) {
    console.error('Error getting saved data:', error);
    res.status(500).json({ error: 'Failed to get saved data' });
  }
} 