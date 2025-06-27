export default async function handler(req, res) {
  console.log('Webhook called with method:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simple response to test if endpoint works
    console.log('Webhook POST request received');
    return res.status(200).json({ 
      received: true, 
      message: 'Webhook endpoint is working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 