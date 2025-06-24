import Stripe from 'stripe';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authentication
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Get session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.metadata.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to session' });
    }

    // Get purchase details from database (simplified query to avoid index issues)
    const purchasesRef = collection(db, 'token-purchases');
    const q = query(
      purchasesRef,
      where('stripeSessionId', '==', session_id)
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    const purchaseDoc = snapshot.docs[0];
    const purchaseData = purchaseDoc.data();

    // Return purchase details
    res.status(200).json({
      ...purchaseData,
      createdAt: purchaseData.createdAt.toDate().toISOString()
    });

  } catch (error) {
    console.error('Error verifying purchase:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 