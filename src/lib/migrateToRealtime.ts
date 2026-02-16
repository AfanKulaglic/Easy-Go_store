'use client'

// Run this ONCE in browser to migrate Firestore data to Realtime Database
// After migration, you can delete this file

import { collection, getDocs } from 'firebase/firestore'
import { ref, set } from 'firebase/database'
import { getFirebaseDb, getFirebaseRealtimeDb } from './firebase'

export async function migrateFirestoreToRealtime() {
  console.log('=== MIGRATION STARTED ===')
  console.log('Timestamp:', new Date().toISOString())
  console.log('')
  console.log('Step 1: Getting Firebase instances...')
  
  const firestore = getFirebaseDb()
  const realtimeDb = getFirebaseRealtimeDb()
  
  if (!firestore) {
    console.error('❌ Firestore not initialized!')
    throw new Error('Firestore not initialized')
  }
  console.log('✓ Firestore instance obtained')
  
  if (!realtimeDb) {
    console.error('❌ Realtime Database not initialized!')
    throw new Error('Realtime Database not initialized')
  }
  console.log('✓ Realtime Database instance obtained')
  console.log('')
  console.log('Step 2: Testing connections...')

  const results: Record<string, any> = {}

  try {
    // Test Firestore connection first
    console.log('Testing Firestore read...')
    try {
      const testSnapshot = await getDocs(collection(firestore, 'products'))
      console.log(`✓ Firestore connection OK - found ${testSnapshot.docs.length} products`)
    } catch (firestoreError: any) {
      console.error('❌ Firestore connection FAILED!')
      console.error('Error:', firestoreError?.message || firestoreError)
      console.error('This might be why migration stops - Firestore cannot be read.')
      console.error('Check Firebase Console → Firestore → Rules')
      throw new Error('Cannot read from Firestore: ' + (firestoreError?.message || 'Unknown error'))
    }
    
    // Test Realtime DB connection
    console.log('Testing Realtime DB write...')
    try {
      await set(ref(realtimeDb, '_migration_test'), { timestamp: Date.now() })
      console.log('✓ Realtime DB connection OK')
    } catch (realtimeError: any) {
      console.error('❌ Realtime DB connection FAILED!')
      console.error('Error:', realtimeError?.message || realtimeError)
      console.error('Check Firebase Console → Realtime Database → Rules')
      throw new Error('Cannot write to Realtime DB: ' + (realtimeError?.message || 'Unknown error'))
    }
    
    console.log('')
    console.log('Step 3: Starting data migration...')
    console.log('')
    // 1. Migrate Products
    console.log('\n--- PRODUCTS ---')
    console.log('Fetching products from Firestore...')
    const productsSnapshot = await getDocs(collection(firestore, 'products'))
    console.log(`Found ${productsSnapshot.docs.length} products`)
    
    const products: Record<string, any> = {}
    productsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data()
      // Keep image URLs as strings (don't upload to storage)
      // Videos are already URLs, keep them as-is
      products[doc.id] = {
        ...data,
        // Convert Firestore Timestamps to numbers
        createdAt: data.createdAt?.toMillis?.() || Date.now(),
        updatedAt: data.updatedAt?.toMillis?.() || Date.now(),
      }
      console.log(`  [${index + 1}/${productsSnapshot.docs.length}] ${data.name}`)
    })
    
    if (Object.keys(products).length > 0) {
      console.log('Writing products to Realtime DB...')
      await set(ref(realtimeDb, 'products'), products)
      console.log(`✓ Migrated ${Object.keys(products).length} products`)
    } else {
      console.log('⚠ No products to migrate')
    }
    results.products = products

    // 2. Migrate Categories
    console.log('\n--- CATEGORIES ---')
    console.log('Fetching categories from Firestore...')
    const categoriesSnapshot = await getDocs(collection(firestore, 'categories'))
    console.log(`Found ${categoriesSnapshot.docs.length} categories`)
    
    const categories: Record<string, any> = {}
    categoriesSnapshot.docs.forEach((doc, index) => {
      const data = doc.data()
      categories[doc.id] = data
      console.log(`  [${index + 1}/${categoriesSnapshot.docs.length}] ${data.name}`)
    })
    
    if (Object.keys(categories).length > 0) {
      console.log('Writing categories to Realtime DB...')
      await set(ref(realtimeDb, 'categories'), categories)
      console.log(`✓ Migrated ${Object.keys(categories).length} categories`)
    } else {
      console.log('⚠ No categories to migrate')
    }
    results.categories = categories

    // 3. Migrate Subcategories
    console.log('\n--- SUBCATEGORIES ---')
    console.log('Fetching subcategories from Firestore...')
    const subcategoriesSnapshot = await getDocs(collection(firestore, 'subcategories'))
    console.log(`Found ${subcategoriesSnapshot.docs.length} subcategories`)
    
    const subcategories: Record<string, any> = {}
    subcategoriesSnapshot.docs.forEach((doc, index) => {
      const data = doc.data()
      subcategories[doc.id] = data
      console.log(`  [${index + 1}/${subcategoriesSnapshot.docs.length}] ${data.name}`)
    })
    
    if (Object.keys(subcategories).length > 0) {
      console.log('Writing subcategories to Realtime DB...')
      await set(ref(realtimeDb, 'subcategories'), subcategories)
      console.log(`✓ Migrated ${Object.keys(subcategories).length} subcategories`)
    } else {
      console.log('⚠ No subcategories to migrate')
    }
    results.subcategories = subcategories

    // 4. Migrate Messages
    console.log('\n--- MESSAGES ---')
    console.log('Fetching messages from Firestore...')
    const messagesSnapshot = await getDocs(collection(firestore, 'messages'))
    console.log(`Found ${messagesSnapshot.docs.length} messages`)
    
    const messages: Record<string, any> = {}
    messagesSnapshot.docs.forEach((doc, index) => {
      const data = doc.data()
      messages[doc.id] = {
        ...data,
        createdAt: data.createdAt?.toMillis?.() || Date.now(),
        repliedAt: data.repliedAt?.toMillis?.() || null,
      }
      console.log(`  [${index + 1}/${messagesSnapshot.docs.length}] from ${data.name}`)
    })
    
    if (Object.keys(messages).length > 0) {
      console.log('Writing messages to Realtime DB...')
      await set(ref(realtimeDb, 'messages'), messages)
      console.log(`✓ Migrated ${Object.keys(messages).length} messages`)
    } else {
      console.log('⚠ No messages to migrate')
    }
    results.messages = messages

    // 5. Migrate Orders
    console.log('\n--- ORDERS ---')
    console.log('Fetching orders from Firestore...')
    const ordersSnapshot = await getDocs(collection(firestore, 'orders'))
    console.log(`Found ${ordersSnapshot.docs.length} orders`)
    
    const orders: Record<string, any> = {}
    ordersSnapshot.docs.forEach((doc, index) => {
      const data = doc.data()
      orders[doc.id] = {
        ...data,
        createdAt: data.createdAt?.toMillis?.() || Date.now(),
        updatedAt: data.updatedAt?.toMillis?.() || null,
      }
      console.log(`  [${index + 1}/${ordersSnapshot.docs.length}] Order ${doc.id.slice(0, 8)}...`)
    })
    
    if (Object.keys(orders).length > 0) {
      console.log('Writing orders to Realtime DB...')
      await set(ref(realtimeDb, 'orders'), orders)
      console.log(`✓ Migrated ${Object.keys(orders).length} orders`)
    } else {
      console.log('⚠ No orders to migrate')
    }
    results.orders = orders

    // 6. Migrate Product Views
    console.log('\n--- PRODUCT VIEWS ---')
    console.log('Fetching product views from Firestore...')
    const viewsSnapshot = await getDocs(collection(firestore, 'productViews'))
    console.log(`Found ${viewsSnapshot.docs.length} product views`)
    
    const views: Record<string, any> = {}
    viewsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data()
      views[doc.id] = {
        ...data,
        viewedAt: data.viewedAt?.toMillis?.() || Date.now(),
      }
      if (index % 50 === 0 || index === viewsSnapshot.docs.length - 1) {
        console.log(`  Processing view ${index + 1}/${viewsSnapshot.docs.length}`)
      }
    })
    
    if (Object.keys(views).length > 0) {
      console.log('Writing product views to Realtime DB...')
      await set(ref(realtimeDb, 'productViews'), views)
      console.log(`✓ Migrated ${Object.keys(views).length} product views`)
    } else {
      console.log('⚠ No product views to migrate')
    }
    results.views = views

    console.log('\n=== MIGRATION COMPLETED SUCCESSFULLY ===')
    console.log('Summary:')
    console.log(`  Products: ${Object.keys(results.products || {}).length}`)
    console.log(`  Categories: ${Object.keys(results.categories || {}).length}`)
    console.log(`  Subcategories: ${Object.keys(results.subcategories || {}).length}`)
    console.log(`  Messages: ${Object.keys(results.messages || {}).length}`)
    console.log(`  Orders: ${Object.keys(results.orders || {}).length}`)
    console.log(`  Product Views: ${Object.keys(results.views || {}).length}`)
    
    return results
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED!')
    console.error('Error details:', error)
    throw error
  }
}

// Make it available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).migrateFirestoreToRealtime = migrateFirestoreToRealtime
}
