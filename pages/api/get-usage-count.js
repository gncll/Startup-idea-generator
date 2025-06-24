import { getUsageCount } from '../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  try {
    const usageCount = await getUsageCount(sessionId);
    res.status(200).json({ usageCount });
  } catch (error) {
    console.error('Error getting usage count:', error);
    res.status(500).json({ error: 'Failed to get usage count' });
  }
} 