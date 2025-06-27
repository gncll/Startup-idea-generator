import Stripe from 'stripe';
import { addTokens, saveTokenPurchase, getUserTokens } from '../../lib/database';
import { notifyTokenUpdate } from './token-updates';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Helper function to get raw body as recommended by Stripe docs
const buffer = (req) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    req.on('error', reject);
  });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Ensure we have the signing secret
    if (!endpointSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Get raw body using the buffer helper function (Stripe recommended approach)
    const rawBody = await buffer(req);
    
    // Debug logging
    console.log('Raw body length:', rawBody.length);
    console.log('Signature header present:', !!sig);
    console.log('Endpoint secret configured:', !!endpointSecret);

    // Construct the event with proper error handling
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    
    console.log('✅ Webhook signature verified successfully for event:', event.type);
    
  } catch (err) {
    console.error('❌ Webhook signature verification failed:');
    console.error('Error message:', err.message);
    console.error('Signature header:', sig ? 'Present' : 'Missing');
    console.error('Raw body type:', typeof rawBody);
    console.error('Raw body length:', rawBody ? rawBody.length : 'undefined');
    console.error('Endpoint secret exists:', !!endpointSecret);
    
    return res.status(400).json({ 
      error: `Webhook Error: ${err.message}`,
      details: 'Signature verification failed'
    });
  }

  console.log('🔄 Processing webhook event:', event.type, 'ID:', event.id);

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      try {
        console.log('💳 Processing checkout.session.completed for session:', session.id);
        
        // Extract metadata
        const { userId, packageType, tokens, packageName } = session.metadata || {};
        
        if (!userId || !tokens) {
          console.error('❌ Missing required metadata in session:', session.metadata);
          // Return 200 to acknowledge webhook receipt even with missing metadata
          return res.status(200).json({ 
            received: true, 
            error: 'Missing required metadata',
            sessionId: session.id
          });
        }
        
        const tokensToAdd = parseInt(tokens);
        
        // Add tokens to user account
        await addTokens(userId, tokensToAdd);
        
        // Save purchase record
        await saveTokenPurchase(userId, {
          packageType,
          packageName,
          tokens: tokensToAdd,
          amount: session.amount_total / 100, // Convert from cents
          currency: session.currency,
          stripeSessionId: session.id,
          status: 'completed'
        });
        
        // Get updated token count and notify user in real-time
        const updatedTokens = await getUserTokens(userId);
        notifyTokenUpdate(userId, updatedTokens);
        
        console.log(`✅ Successfully added ${tokensToAdd} tokens to user ${userId}. New total: ${updatedTokens}`);
        
      } catch (error) {
        console.error('❌ Error processing payment:', error);
        // Return 200 to acknowledge webhook receipt even if processing fails
        return res.status(200).json({ 
          received: true, 
          error: 'Processing failed but webhook acknowledged',
          sessionId: session.id
        });
      }
      break;
      
    case 'checkout.session.expired':
      console.log('⏰ Checkout session expired:', event.data.object.id);
      break;
      
    default:
      console.log(`ℹ️ Unhandled event type ${event.type}`);
  }

  console.log('✅ Webhook processed successfully');
  res.status(200).json({ received: true, eventId: event.id });
}

// Disable Next.js body parsing - CRITICAL for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}; 