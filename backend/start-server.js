// Simple server starter with environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/relationship-manager';
process.env.JWT_SECRET = 'your-secret-key-here-12345';
process.env.NODE_ENV = 'development';
process.env.PORT = '5000';

console.log('🚀 Starting LinkMind Backend Server...');
console.log('Environment variables set:');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('');

// Import and start the main server
import('./src/index.js').catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
