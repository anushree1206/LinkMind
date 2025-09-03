import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Contact from './src/models/Contact.js';

// Load environment variables
dotenv.config();

const sampleUsers = [
  {
    fullName: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    jobTitle: 'Software Engineer',
    company: 'TechCorp',
    location: 'San Francisco, CA'
  },
  {
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    jobTitle: 'Product Manager',
    company: 'StartupXYZ',
    location: 'New York, NY'
  }
];

const sampleContacts = [
  {
    fullName: 'Sarah Chen',
    jobTitle: 'Product Manager',
    company: 'TechCorp',
    email: 'sarah.chen@techcorp.com',
    phone: '+1 (555) 123-4567',
    relationshipStrength: 'Strong',
    tags: ['Work', 'Mentor', 'AI'],
    notes: [{
      content: 'Met at the AI conference. Very knowledgeable about product strategy and AI implementation.',
      isImportant: true
    }],
    location: 'San Francisco, CA',
    linkedin: 'https://linkedin.com/in/sarahchen',
    lastContacted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    interactions: [
      {
        type: 'Email',
        content: 'Discussed AI implementation strategies for our new product',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        outcome: 'Positive'
      }
    ]
  },
  {
    fullName: 'Marcus Johnson',
    jobTitle: 'CEO',
    company: 'StartupXYZ',
    email: 'marcus@startupxyz.com',
    phone: '+1 (555) 987-6543',
    relationshipStrength: 'Medium',
    tags: ['Business', 'Networking', 'Startup'],
    notes: [{
      content: 'Founder of a promising AI startup. Interested in potential partnerships.',
      isImportant: false
    }],
    location: 'Austin, TX',
    linkedin: 'https://linkedin.com/in/marcusjohnson',
    lastContacted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    interactions: [
      {
        type: 'Call',
        content: 'Discussed potential partnership opportunities',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        outcome: 'Neutral'
      }
    ]
  },
  {
    fullName: 'Emily Rodriguez',
    jobTitle: 'Marketing Director',
    company: 'GrowthCo',
    email: 'emily@growthco.com',
    phone: '+1 (555) 456-7890',
    relationshipStrength: 'Strong',
    tags: ['Work', 'Friend', 'Marketing'],
    notes: [{
      content: 'Great at growth marketing strategies. Always willing to share insights and collaborate.',
      isImportant: true
    }],
    location: 'New York, NY',
    linkedin: 'https://linkedin.com/in/emilyrodriguez',
    lastContacted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    interactions: [
      {
        type: 'Message',
        content: 'Shared marketing insights and discussed collaboration opportunities',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        outcome: 'Positive'
      }
    ]
  },
  {
    fullName: 'David Kim',
    jobTitle: 'Software Engineer',
    company: 'DevTech',
    email: 'david@devtech.com',
    phone: '+1 (555) 321-0987',
    relationshipStrength: 'Weak',
    tags: ['Work', 'Technical', 'Backend'],
    notes: [{
      content: 'Excellent backend developer. Worked together on the API integration project.',
      isImportant: false
    }],
    location: 'Seattle, WA',
    linkedin: 'https://linkedin.com/in/davidkim',
    lastContacted: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    interactions: [
      {
        type: 'Email',
        content: 'Discussed API integration project requirements',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        outcome: 'Neutral'
      }
    ]
  },
  {
    fullName: 'Lisa Wang',
    jobTitle: 'UX Designer',
    company: 'Creative Studio',
    email: 'lisa@creativestudio.com',
    phone: '+1 (555) 654-3210',
    relationshipStrength: 'Medium',
    tags: ['Creative', 'Friend', 'Design'],
    notes: [{
      content: 'Talented UX designer with a great eye for user experience. Always up for design discussions.',
      isImportant: false
    }],
    location: 'Los Angeles, CA',
    linkedin: 'https://linkedin.com/in/lisawang',
    lastContacted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    interactions: [
      {
        type: 'Meeting',
        content: 'Coffee meeting to discuss design trends and user experience',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        outcome: 'Positive'
      }
    ]
  },
  {
    fullName: 'Alex Thompson',
    jobTitle: 'Data Scientist',
    company: 'Analytics Inc',
    email: 'alex@analytics.com',
    phone: '+1 (555) 111-2222',
    relationshipStrength: 'Weak',
    tags: ['Technical', 'Data', 'AI'],
    notes: [{
      content: 'Met at a data science conference. Very knowledgeable about machine learning.',
      isImportant: false
    }],
    location: 'Boston, MA',
    linkedin: 'https://linkedin.com/in/alexthompson',
    lastContacted: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
    interactions: [
      {
        type: 'Email',
        content: 'Initial contact after conference, shared ML resources',
        date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        outcome: 'Neutral'
      }
    ]
  },
  {
    fullName: 'Maria Garcia',
    jobTitle: 'Sales Director',
    company: 'Enterprise Solutions',
    email: 'maria@enterprise.com',
    phone: '+1 (555) 333-4444',
    relationshipStrength: 'Strong',
    tags: ['Business', 'Sales', 'Enterprise'],
    notes: [{
      content: 'Excellent sales professional. Helped us close a major enterprise deal.',
      isImportant: true
    }],
    location: 'Chicago, IL',
    linkedin: 'https://linkedin.com/in/mariagarcia',
    lastContacted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    interactions: [
      {
        type: 'Call',
        content: 'Follow-up on enterprise deal and discussed future opportunities',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        outcome: 'Positive'
      }
    ]
  },
  {
    fullName: 'Robert Chen',
    jobTitle: 'CTO',
    company: 'Innovation Labs',
    email: 'robert@innovation.com',
    phone: '+1 (555) 555-6666',
    relationshipStrength: 'Medium',
    tags: ['Leadership', 'Technology', 'Innovation'],
    notes: [{
      content: 'Tech leader with innovative ideas. Interested in emerging technologies.',
      isImportant: false
    }],
    location: 'Denver, CO',
    linkedin: 'https://linkedin.com/in/robertchen',
    lastContacted: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
    interactions: [
      {
        type: 'Meeting',
        content: 'Discussed emerging technologies and potential collaboration',
        date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        outcome: 'Neutral'
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/relationship-manager');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Contact.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.fullName}`);
    }

    // Create sample contacts for each user
    for (const user of createdUsers) {
      for (const contactData of sampleContacts) {
        const contact = new Contact({
          ...contactData,
          user: user._id
        });
        await contact.save();
        console.log(`Created contact: ${contact.fullName} for user: ${user.fullName}`);
      }
    }

    console.log('Database seeded successfully!');
    console.log(`Created ${createdUsers.length} users and ${createdUsers.length * sampleContacts.length} contacts`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seeder
seedDatabase();
