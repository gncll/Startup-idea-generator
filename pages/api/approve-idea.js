import { getAuth } from '@clerk/nextjs/server';
import { saveStartupIdea } from '../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if user is authenticated
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { idea, inputs } = req.body;

  if (!idea) {
    return res.status(400).json({ error: 'Idea data is required' });
  }

  try {
    // Save the approved idea to user's collection
    const ideaId = await saveStartupIdea(userId, {
      ...idea,
      inputs: inputs,
      approved: true,
      approvedAt: new Date()
    });

    res.status(200).json({ 
      message: 'Idea approved and saved successfully',
      ideaId: ideaId 
    });
  } catch (error) {
    console.error('Error approving idea:', error);
    res.status(500).json({ error: 'Failed to approve idea' });
  }
} 