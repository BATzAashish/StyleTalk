import { API_URL } from './lib/api';

console.log('=================================');
console.log('🔧 Frontend Configuration Check');
console.log('=================================');
console.log('API URL:', API_URL);
console.log('Expected:', 'http://localhost:5000');
console.log('Match:', API_URL === 'http://localhost:5000' ? '✅' : '❌');
console.log('=================================');

if (API_URL !== 'http://localhost:5000') {
  console.warn('⚠️  WARNING: API_URL does not match expected value!');
  console.warn('Make sure .env file exists with: VITE_API_URL=http://localhost:5000');
  console.warn('Restart the Vite dev server after creating/updating .env');
}
