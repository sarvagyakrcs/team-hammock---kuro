// Test script for the Study Buddy API integration
import { studyBuddyAPI } from '../../lib/study-buddy-api'

async function testStudyBuddyAPI() {
  console.log('🧪 Testing Study Buddy API...')
  
  try {
    // Test 1: Health Check
    console.log('\n1️⃣ Testing health check...')
    const health = await studyBuddyAPI.healthCheck()
    console.log('✅ Health check passed:', health.message)
    
    // Test 2: Generate Mind Map
    console.log('\n2️⃣ Testing mind map generation...')
    const mindMap = await studyBuddyAPI.generateTopicMindMap('Artificial Intelligence')
    console.log(`✅ Mind map generated with ${mindMap.length} nodes`)
    console.log('Sample node:', mindMap[0])
    
    // Test 3: Query (will likely fail without uploaded documents)
    console.log('\n3️⃣ Testing query...')
    try {
      const queryResult = await studyBuddyAPI.query('What is machine learning?')
      console.log('✅ Query successful:', queryResult.answer.substring(0, 100) + '...')
    } catch (error) {
      console.log('⚠️ Query failed (expected without uploaded documents):', (error as Error).message)
    }
    
    console.log('\n🎉 API integration test completed!')
    
  } catch (error) {
    console.error('❌ API test failed:', error)
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testStudyBuddyAPI()
}

export default testStudyBuddyAPI
