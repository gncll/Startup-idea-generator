import { getAuth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { addTokens, saveTokenPurchase, getUserTokens } from '../../lib/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { session_id } = req.body;
    if (!session_id) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    console.log(`🔍 Checking Stripe session: ${session_id}`);

    // Get session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    if (session.metadata.userId !== userId) {
      return res.status(403).json({ error: 'Session does not belong to user' });
    }

    // Extract metadata
    const { packageType, tokens, packageName } = session.metadata;
    const tokensToAdd = parseInt(tokens);
    
    console.log(`💰 Processing payment: ${tokensToAdd} tokens for user ${userId}`);

    // Add tokens to user account
    await addTokens(userId, tokensToAdd);
    
    // Save purchase record
    await saveTokenPurchase(userId, {
      packageType,
      packageName,
      tokens: tokensToAdd,
      amount: session.amount_total / 100,
      currency: session.currency,
      stripeSessionId: session.id,
      status: 'completed'
    });
    
    // Get updated token count
    const updatedTokens = await getUserTokens(userId);
    
    console.log(`✅ Tokens added successfully. New total: ${updatedTokens}`);
    
    res.status(200).json({
      success: true,
      tokensAdded: tokensToAdd,
      newTotal: updatedTokens
    });

  } catch (error) {
    console.error('Error syncing tokens:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 