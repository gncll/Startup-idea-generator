export default async function handler(req, res) {
  console.log('Test webhook called with method:', req.method);
  console.log('Headers:', req.headers);
  
  if (req.method === 'POST') {
    return res.status(200).json({ 
      message: 'POST request received successfully',
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }
  
  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'GET request received successfully',
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed', method: req.method });
} 