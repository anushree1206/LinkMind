// Simple Node.js server starter
process.env.MONGODB_URI = 'mongodb://localhost:27017/relationship-manager';
process.env.JWT_SECRET = 'your-secret-key-here-12345';
process.env.NODE_ENV = 'development';
process.env.PORT = '5000';

console.log('🚀 Starting LinkMind Backend Server...');
console.log('Port: 5000');
console.log('Environment: development');
console.log('MongoDB: localhost:27017/relationship-manager');
console.log('');

// Start the server using ES module import
import('./src/index.js').catch(console.error);
