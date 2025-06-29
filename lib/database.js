import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Startup idea'larını kaydetme
export const saveStartupIdea = async (userId, ideaData) => {
  try {
    const docRef = await addDoc(collection(db, 'startup-ideas'), {
      userId,
      ...ideaData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving startup idea:', error);
    throw error;
  }
};

// Kullanıcının startup idea'larını getirme
export const getUserStartupIdeas = async (userId) => {
  try {
    // Geçici çözüm: orderBy olmadan query (index oluşturulana kadar)
    const q = query(
      collection(db, 'startup-ideas'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const ideas = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Client-side sorting by createdAt
    return ideas.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Error getting user startup ideas:', error);
    throw error;
  }
};

// Tek bir startup idea'yı getirme
export const getStartupIdea = async (ideaId) => {
  try {
    const docRef = doc(db, 'startup-ideas', ideaId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting startup idea:', error);
    throw error;
  }
};

// Startup idea'yı güncelleme
export const updateStartupIdea = async (ideaId, updateData) => {
  try {
    const docRef = doc(db, 'startup-ideas', ideaId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating startup idea:', error);
    throw error;
  }
};

// Startup idea'yı silme
export const deleteStartupIdea = async (ideaId) => {
  try {
    await deleteDoc(doc(db, 'startup-ideas', ideaId));
  } catch (error) {
    console.error('Error deleting startup idea:', error);
    throw error;
  }
};

// MVP Implementation kaydetme
export const saveMVPImplementation = async (ideaId, userId, mvpData) => {
  try {
    const docRef = await addDoc(collection(db, 'mvp-implementations'), {
      ideaId,
      userId,
      mvpImplementations: mvpData,
      approved: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving MVP implementation:', error);
    throw error;
  }
};

// Content Ideas kaydetme
export const saveContentIdeas = async (ideaId, userId, contentData) => {
  try {
    const docRef = await addDoc(collection(db, 'content-ideas'), {
      ideaId,
      userId,
      contentIdeas: contentData,
      approved: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving content ideas:', error);
    throw error;
  }
};

// SEO Strategies kaydetme
export const saveSEOStrategies = async (ideaId, userId, seoData) => {
  try {
    const docRef = await addDoc(collection(db, 'seo-strategies'), {
      ideaId,
      userId,
      seoStrategies: seoData,
      approved: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving SEO strategies:', error);
    throw error;
  }
};

// Idea'ya ait MVP implementations getirme
export const getMVPImplementations = async (ideaId) => {
  try {
    const q = query(
      collection(db, 'mvp-implementations'),
      where('ideaId', '==', ideaId),
      where('approved', '==', true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Error getting MVP implementations:', error);
    throw error;
  }
};

// Idea'ya ait content ideas getirme
export const getContentIdeas = async (ideaId) => {
  try {
    const q = query(
      collection(db, 'content-ideas'),
      where('ideaId', '==', ideaId),
      where('approved', '==', true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Error getting content ideas:', error);
    throw error;
  }
};

// Idea'ya ait SEO strategies getirme
export const getSEOStrategies = async (ideaId) => {
  try {
    const q = query(
      collection(db, 'seo-strategies'),
      where('ideaId', '==', ideaId),
      where('approved', '==', true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Error getting SEO strategies:', error);
    throw error;
  }
};

// Kullanım sayısını kaydetme (simple generator için)
export const saveUsageCount = async (sessionId, count) => {
  try {
    const docRef = doc(db, 'usage-counts', sessionId);
    await updateDoc(docRef, {
      count,
      lastUsed: Timestamp.now()
    }).catch(async () => {
      // Eğer document yoksa oluştur
      await addDoc(collection(db, 'usage-counts'), {
        sessionId,
        count,
        lastUsed: Timestamp.now(),
        createdAt: Timestamp.now()
      });
    });
  } catch (error) {
    console.error('Error saving usage count:', error);
    throw error;
  }
};

// Kullanım sayısını getirme
export const getUsageCount = async (sessionId) => {
  try {
    const q = query(
      collection(db, 'usage-counts'),
      where('sessionId', '==', sessionId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data().count || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting usage count:', error);
    return 0;
  }
};

// Token sistemi fonksiyonları

// Kullanıcının token bakiyesini getirme
export const getUserTokens = async (userId) => {
  try {
    // Önce kullanıcının token'larını ara
    const q = query(
      collection(db, 'user-tokens'),
      where('userId', '==', userId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data().tokens || 0;
    } else {
      // İlk kez kullanıcı için 10 ücretsiz token ver
      await addDoc(collection(db, 'user-tokens'), {
        userId,
        tokens: 10,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return 10;
    }
  } catch (error) {
    console.error('Error getting user tokens:', error);
    return 0;
  }
};

// Token kullanımı (düşürme)
export const useTokens = async (userId, amount) => {
  try {
    // Önce kullanıcının token'larını al
    const q = query(
      collection(db, 'user-tokens'),
      where('userId', '==', userId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      const currentTokens = querySnapshot.docs[0].data().tokens || 0;
      
      if (currentTokens >= amount) {
        await updateDoc(docRef, {
          tokens: currentTokens - amount,
          updatedAt: Timestamp.now()
        });
        return true;
      } else {
        return false; // Yetersiz token
      }
    } else {
      return false; // Kullanıcı bulunamadı
    }
  } catch (error) {
    console.error('Error using tokens:', error);
    return false;
  }
};

// Token ekleme (satın alma sonrası)
export const addTokens = async (userId, amount) => {
  try {
    // Önce kullanıcının mevcut token'larını bul
    const q = query(
      collection(db, 'user-tokens'),
      where('userId', '==', userId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      const currentTokens = querySnapshot.docs[0].data().tokens || 0;
      await updateDoc(docRef, {
        tokens: currentTokens + amount,
        updatedAt: Timestamp.now()
      });
    } else {
      // Kullanıcı yoksa yeni kayıt oluştur
      await addDoc(collection(db, 'user-tokens'), {
        userId,
        tokens: amount,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error adding tokens:', error);
    throw error;
  }
};

// Token satın alma geçmişi kaydetme
export const saveTokenPurchase = async (userId, purchaseData) => {
  try {
    const docRef = await addDoc(collection(db, 'token-purchases'), {
      userId,
      ...purchaseData,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving token purchase:', error);
    throw error;
  }
}; 