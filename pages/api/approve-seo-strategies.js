import { getAuth } from '@clerk/nextjs/server';
import { saveSEOStrategies } from '../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if user is authenticated
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { ideaId, seoStrategies } = req.body;

  if (!ideaId || !seoStrategies) {
    return res.status(400).json({ error: 'Idea ID and SEO strategies are required' });
  }

  try {
    // Save the approved SEO strategies
    const seoId = await saveSEOStrategies(ideaId, userId, seoStrategies);

    res.status(200).json({ 
      message: 'SEO strategies approved and saved successfully',
      seoId: seoId 
    });
  } catch (error) {
    console.error('Error approving SEO strategies:', error);
    res.status(500).json({ error: 'Failed to approve SEO strategies' });
  }
} 