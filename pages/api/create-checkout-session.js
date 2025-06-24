import Stripe from 'stripe';
import { getAuth } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Token packages configuration
const TOKEN_PACKAGES = {
  starter: {
    priceId: process.env.STRIPE_STARTER_PACK_PRICE_ID,
    tokens: 100,
    name: 'Starter Pack',
    price: '$1'
  },
  popular: {
    priceId: process.env.STRIPE_POPULAR_PACK_PRICE_ID,
    tokens: 1000,
    name: 'Popular Pack',
    price: '$10'
  },
  pro: {
    priceId: process.env.STRIPE_PRO_PACK_PRICE_ID,
    tokens: 5000,
    name: 'Pro Pack',
    price: '$45'
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { packageType } = req.body;

    if (!packageType || !TOKEN_PACKAGES[packageType]) {
      return res.status(400).json({ error: 'Invalid package type' });
    }

    const selectedPackage = TOKEN_PACKAGES[packageType];

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPackage.priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/buy-tokens`,
      metadata: {
        userId: userId,
        packageType: packageType,
        tokens: selectedPackage.tokens.toString(),
        packageName: selectedPackage.name
      },
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 