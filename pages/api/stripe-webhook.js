import Stripe from 'stripe';
import { addTokens, saveTokenPurchase, getUserTokens } from '../../lib/database';
import { notifyTokenUpdate } from './token-updates';

// Helper function to get raw body
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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Get raw body as buffer
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      try {
        // Extract metadata
        const { userId, packageType, tokens, packageName } = session.metadata;
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
        
        console.log(`Successfully added ${tokensToAdd} tokens to user ${userId}. New total: ${updatedTokens}`);
        
      } catch (error) {
        console.error('Error processing payment:', error);
        // You might want to implement retry logic here
      }
      break;
      
    case 'checkout.session.expired':
      // Handle expired sessions if needed
      console.log('Checkout session expired:', event.data.object.id);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
}

// Important: Disable body parsing for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
} 