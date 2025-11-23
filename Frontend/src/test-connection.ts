import { healthCheck, authAPI } from './lib/api';

// Test connection to backend
async function testConnection() {
  console.log('🔍 Testing Backend Connection...\n');
  
  try {
    console.log('1️⃣ Testing Health Check endpoint...');
    const health = await healthCheck();
    console.log('✅ Health Check Success:', health);
    console.log('');
  } catch (error) {
    console.error('❌ Health Check Failed:', error);
    console.log('');
  }

  try {
    console.log('2️⃣ Testing Registration...');
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'TestPass123!',
    };
    const registerResponse = await authAPI.register(testUser);
    console.log('✅ Registration Success:', {
      message: registerResponse.message,
      user: registerResponse.user,
      hasToken: !!registerResponse.token,
    });
    console.log('');

    console.log('3️⃣ Testing Get Current User...');
    const currentUser = await authAPI.getCurrentUser();
    console.log('✅ Get Current User Success:', currentUser);
    console.log('');

    console.log('4️⃣ Testing Logout...');
    authAPI.logout();
    console.log('✅ Logout Success');
    console.log('');

    console.log('5️⃣ Testing Login...');
    const loginResponse = await authAPI.login({
      email: testUser.email,
      password: testUser.password,
    });
    console.log('✅ Login Success:', {
      message: loginResponse.message,
      user: loginResponse.user,
      hasToken: !!loginResponse.token,
    });
    console.log('');

    console.log('🎉 All tests passed! Backend and Frontend are connected properly.');
  } catch (error) {
    console.error('❌ Test Failed:', error);
  }
}

// Run tests when this module is executed
testConnection();
