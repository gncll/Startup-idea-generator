import { getAuth } from '@clerk/nextjs/server';
import { saveMVPImplementation } from '../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if user is authenticated
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { ideaId, mvpImplementations } = req.body;

  if (!ideaId || !mvpImplementations) {
    return res.status(400).json({ error: 'Idea ID and MVP implementations are required' });
  }

  try {
    // Save the approved MVP implementation
    const implementationId = await saveMVPImplementation(ideaId, userId, mvpImplementations);

    res.status(200).json({ 
      message: 'MVP implementation approved and saved successfully',
      implementationId: implementationId 
    });
  } catch (error) {
    console.error('Error approving MVP implementation:', error);
    res.status(500).json({ error: 'Failed to approve MVP implementation' });
  }
} 