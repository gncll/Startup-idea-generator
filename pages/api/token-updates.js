// In-memory store for active connections (in production, use Redis)
const connections = new Map();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  // Set up Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Store connection
  if (!connections.has(userId)) {
    connections.set(userId, new Set());
  }
  connections.get(userId).add(res);

  // Send initial heartbeat
  const welcomeMessage = JSON.stringify({ type: 'connected', timestamp: Date.now() });
  console.log(`📤 Sending welcome message to ${userId}:`, welcomeMessage);
  res.write(`data: ${welcomeMessage}\n\n`);

  // Clean up on disconnect
  req.on('close', () => {
    const userConnections = connections.get(userId);
    if (userConnections) {
      userConnections.delete(res);
      if (userConnections.size === 0) {
        connections.delete(userId);
      }
    }
  });

  // Keep connection alive
  const heartbeat = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
  });
}

// Function to notify user of token update (called from webhook)
export function notifyTokenUpdate(userId, newTokenCount) {
  console.log(`🔔 Attempting to notify user ${userId} of token update: ${newTokenCount}`);
  
  const userConnections = connections.get(userId);
  console.log(`📡 Active connections for user ${userId}:`, userConnections ? userConnections.size : 0);
  
  if (userConnections && userConnections.size > 0) {
    const message = JSON.stringify({
      type: 'token_update',
      tokens: newTokenCount,
      timestamp: Date.now()
    });
    
    console.log(`📤 Sending SSE message:`, message);
    
    userConnections.forEach(res => {
      try {
        res.write(`data: ${message}\n\n`);
        console.log(`✅ SSE message sent successfully`);
      } catch (error) {
        console.error('❌ Error sending SSE message:', error);
        userConnections.delete(res);
      }
    });
  } else {
    console.log(`⚠️ No active connections found for user ${userId}`);
  }
} 