// Test utility to verify API integration
import * as API from '../services/api';

export async function testApiConnection(): Promise<void> {
  console.log('🧪 Testing API connection...');
  
  try {
    // Test connection by fetching all data
    const isConnected = await API.testApiConnection();
    
    if (isConnected) {
      console.log('✅ API connection successful');
      
      // Test fetching all data
      const allData = await API.fetchAllData();
      console.log('📊 API Data fetched:');
      console.log(`- Sleep logs: ${allData.sleep.length}`);
      console.log(`- Diet logs: ${allData.diet.length}`);
      console.log(`- Menstrual logs: ${allData.menstrual.length}`);
      console.log(`- Symptom logs: ${allData.symptoms.length}`);
      
    } else {
      console.log('❌ API connection failed');
    }
  } catch (error) {
    console.error('🚨 API test failed:', error);
  }
}

export async function testApiInsert(): Promise<void> {
  console.log('🧪 Testing API insert operations...');
  
  try {
    // Test inserting a sleep log
    const sleepResult = await API.insertSleep({
      date: new Date().toISOString(),
      duration: 8.0,
      quality: 7,
      disruptions: 'Test disruption',
      notes: 'Test sleep log from app'
    });
    console.log('✅ Sleep insert successful:', sleepResult.id);
    
    // Test inserting a symptom log
    const symptomResult = await API.insertSymptoms({
      date: new Date().toISOString(),
      nausea: 3,
      fatigue: 4,
      pain: 2,
      notes: 'Test symptom log from app'
    });
    console.log('✅ Symptom insert successful:', symptomResult.id);
    
    // Test inserting a diet log
    const dietResult = await API.insertDiet({
      meal: 'breakfast',
      date: new Date().toISOString(),
      items: ['test food', 'test ingredient'],
      notes: 'Test diet log from app'
    });
    console.log('✅ Diet insert successful:', dietResult.id);
    
    // Test inserting a menstrual log
    const menstrualResult = await API.insertMenstrual({
      period_event: 'start',
      date: new Date().toISOString(),
      flow_level: 'moderate',
      notes: 'Test menstrual log from app'
    });
    console.log('✅ Menstrual insert successful:', menstrualResult.id);
    
  } catch (error) {
    console.error('🚨 API insert test failed:', error);
  }
}

// Usage: Call this in development to test API integration
// import { testApiConnection, testApiInsert } from './src/utils/testApi';
// testApiConnection();
// testApiInsert();