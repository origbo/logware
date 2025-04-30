/**
 * Test Event Generator for Security Analytics System
 * This script generates test security events to demonstrate the behavioral analytics features
 */
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const moment = require('moment');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/logware', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Import models
require('../src/models/SecurityEvent');
require('../src/models/User');
const SecurityEvent = mongoose.model('SecurityEvent');
const User = mongoose.model('User');

// Configuration
const NUM_USERS = 5;
const DAYS_OF_DATA = 30;
const EVENTS_PER_DAY_MIN = 5;
const EVENTS_PER_DAY_MAX = 20;

// Event types
const EVENT_TYPES = {
  AUTHENTICATION: ['login', 'logout', 'password_change', 'mfa', 'failed_login'],
  NETWORK: ['connection', 'firewall_block', 'data_transfer', 'vpn_connect'],
  FILE: ['file_access', 'file_create', 'file_delete', 'file_modify'],
  ADMIN: ['user_create', 'permission_change', 'system_config', 'privilege_escalation']
};

// User profiles - each with their normal behavioral pattern
const USER_PROFILES = [
  {
    name: 'John Developer',
    username: 'jdeveloper',
    role: 'developer',
    workHours: { start: 8, end: 17 },
    typicalIPs: ['192.168.1.100', '10.0.0.45'],
    typicalLocations: ['US', 'UK'],
    commonResources: ['codebase', 'jira', 'gitlab']
  },
  {
    name: 'Sarah Admin',
    username: 'sadmin',
    role: 'sysadmin',
    workHours: { start: 7, end: 16 },
    typicalIPs: ['192.168.1.101', '10.0.0.50'],
    typicalLocations: ['US'],
    commonResources: ['servers', 'admin-panel', 'network-config']
  },
  {
    name: 'Mike Analyst',
    username: 'manalyst',
    role: 'analyst',
    workHours: { start: 9, end: 18 },
    typicalIPs: ['192.168.1.102', '10.0.0.55'],
    typicalLocations: ['US', 'Canada'],
    commonResources: ['data-warehouse', 'reports', 'dashboards']
  },
  {
    name: 'Lisa Manager',
    username: 'lmanager',
    role: 'manager',
    workHours: { start: 8, end: 19 },
    typicalIPs: ['192.168.1.103', '10.0.0.60'],
    typicalLocations: ['US', 'Germany'],
    commonResources: ['reports', 'hr-system', 'budget-tool']
  },
  {
    name: 'David Guest',
    username: 'dguest',
    role: 'guest',
    workHours: { start: 10, end: 15 },
    typicalIPs: ['192.168.1.104'],
    typicalLocations: ['US'],
    commonResources: ['public-docs']
  }
];

// Utility functions
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomElement = (array) => array[Math.floor(Math.random() * array.length)];
const randomBool = (probability = 0.5) => Math.random() < probability;
const randomIP = () => `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 255)}`;

const countries = ['US', 'UK', 'Canada', 'Germany', 'France', 'Japan', 'Australia', 'India', 'Brazil', 'China'];
const randomCountry = () => randomElement(countries);

// Function to generate normal event for a user based on their profile
const generateNormalEvent = (user, date) => {
  const hour = randomInt(user.workHours.start, user.workHours.end);
  const minute = randomInt(0, 59);
  const timestamp = moment(date).hour(hour).minute(minute).second(randomInt(0, 59)).toDate();
  
  const eventCategory = randomElement(Object.keys(EVENT_TYPES));
  const eventType = randomElement(EVENT_TYPES[eventCategory]);
  
  // Base event
  const event = {
    category: eventCategory.toLowerCase(),
    eventType,
    timestamp,
    severity: randomElement(['low', 'medium', 'high']),
    source: randomElement(['firewall', 'webapp', 'vpn', 'endpoint', 'server']),
    status: 'new',
    user: {
      id: user.username,
      name: user.name,
      role: user.role
    },
    host: {
      hostname: `host-${randomInt(1, 5)}`,
      ip: randomElement(user.typicalIPs)
    },
    geo: {
      country: randomElement(user.typicalLocations),
      city: randomElement(['New York', 'London', 'Toronto', 'Berlin', 'San Francisco'])
    }
  };
  
  // Add category-specific data
  switch (eventCategory) {
    case 'AUTHENTICATION':
      event.auth = {
        success: eventType !== 'failed_login',
        method: randomElement(['password', 'sso', 'mfa', 'api_key']),
        failedAttempts: eventType === 'failed_login' ? randomInt(1, 3) : 0
      };
      break;
    case 'NETWORK':
      event.network = {
        srcIp: randomElement(user.typicalIPs),
        dstIp: randomIP(),
        protocol: randomElement(['TCP', 'UDP', 'HTTP', 'HTTPS']),
        destinationPort: randomInt(1, 65535),
        bytes: randomInt(100, 10000000)
      };
      break;
    case 'FILE':
      event.file = {
        path: `/path/to/${randomElement(user.commonResources)}/${randomInt(1, 100)}.txt`,
        action: eventType.split('_')[1], // extract action from eventType
        size: randomInt(1, 10000000),
        type: randomElement(['document', 'image', 'executable', 'archive'])
      };
      break;
    case 'ADMIN':
      event.admin = {
        action: eventType,
        target: randomElement(['user', 'system', 'permission', 'config']),
        success: randomBool(0.95)
      };
      break;
  }
  
  // Add resource information
  event.resource = {
    id: randomElement(user.commonResources),
    type: eventCategory.toLowerCase(),
    name: `${user.role}-resource-${randomInt(1, 10)}`
  };
  
  return event;
};

// Function to generate anomalous events
const generateAnomalousEvent = (user, date, anomalyType) => {
  // Start with a normal event
  const event = generateNormalEvent(user, date);
  
  // Apply the specific anomaly
  switch (anomalyType) {
    case 'unusual_time':
      // Set time outside normal working hours
      const isLateNight = randomBool();
      const hour = isLateNight 
        ? randomInt(22, 4) % 24  // Late night (10 PM - 4 AM)
        : (user.workHours.end + randomInt(2, 5)) % 24; // After hours
      event.timestamp = moment(event.timestamp).hour(hour).toDate();
      break;
      
    case 'unusual_location':
      // Set unusual location
      let unusualCountry;
      do {
        unusualCountry = randomCountry();
      } while (user.typicalLocations.includes(unusualCountry));
      
      event.geo.country = unusualCountry;
      event.geo.city = randomElement(['Moscow', 'Beijing', 'Seoul', 'Bangkok', 'Cairo']);
      break;
      
    case 'unusual_ip':
      // Set unusual IP
      event.host.ip = randomIP();
      if (event.network) {
        event.network.srcIp = event.host.ip;
      }
      break;
      
    case 'unusual_resource':
      // Access unusual resource
      const unusualResources = ['admin-config', 'password-vault', 'user-database', 'financial-records'];
      event.resource.id = randomElement(unusualResources);
      event.resource.name = `restricted-${event.resource.id}`;
      break;
      
    case 'multiple_failures':
      // Multiple failed authentications
      event.category = 'authentication';
      event.eventType = 'failed_login';
      event.auth = {
        success: false,
        method: 'password',
        failedAttempts: randomInt(5, 15)
      };
      break;
      
    case 'data_exfiltration':
      // Large data transfer
      event.category = 'network';
      event.eventType = 'data_transfer';
      event.network = {
        srcIp: randomElement(user.typicalIPs),
        dstIp: randomIP(),
        protocol: 'HTTP',
        destinationPort: 443,
        bytes: randomInt(500000000, 2000000000) // Very large data transfer
      };
      break;
      
    case 'privilege_escalation':
      // Privilege escalation attempt
      event.category = 'admin';
      event.eventType = 'privilege_escalation';
      event.admin = {
        action: 'privilege_escalation',
        target: 'system',
        success: randomBool(0.3) // Usually fails
      };
      break;
      
    case 'unusual_file_access':
      // Access to sensitive files
      event.category = 'file';
      event.eventType = 'file_access';
      event.file = {
        path: '/restricted/confidential/sensitive-data.db',
        action: 'access',
        size: randomInt(10000000, 50000000),
        type: 'database'
      };
      break;
  }
  
  // Mark as explicitly suspicious for testing
  event.status = 'suspicious';
  
  return event;
};

// Main function to generate all test data
const generateTestData = async () => {
  try {
    console.log('Starting test data generation...');
    
    // Clear existing test events
    await SecurityEvent.deleteMany({ 'user.name': { $in: USER_PROFILES.map(u => u.name) } });
    console.log('Cleared existing test events');
    
    const startDate = moment().subtract(DAYS_OF_DATA, 'days');
    let totalEvents = 0;
    const events = [];
    
    // Generate normal events for each user over the time period
    for (let userIndex = 0; userIndex < USER_PROFILES.length; userIndex++) {
      const user = USER_PROFILES[userIndex];
      console.log(`Generating events for ${user.name}...`);
      
      // Generate events for each day
      for (let day = 0; day < DAYS_OF_DATA; day++) {
        const date = moment(startDate).add(day, 'days');
        const numEvents = randomInt(EVENTS_PER_DAY_MIN, EVENTS_PER_DAY_MAX);
        
        // Generate normal events
        for (let i = 0; i < numEvents; i++) {
          events.push(generateNormalEvent(user, date));
        }
        
        // Occasionally generate anomalous events (more frequently for recent days)
        const daysSinceStart = DAYS_OF_DATA - day;
        const anomalyProbability = day > (DAYS_OF_DATA - 5) ? 0.3 : 0.05; // Higher probability in recent days
        
        if (randomBool(anomalyProbability)) {
          const anomalyTypes = [
            'unusual_time', 'unusual_location', 'unusual_ip', 'unusual_resource',
            'multiple_failures', 'data_exfiltration', 'privilege_escalation', 'unusual_file_access'
          ];
          
          // Generate 1-3 anomalous events
          const numAnomalies = randomInt(1, 3);
          for (let j = 0; j < numAnomalies; j++) {
            const anomalyType = randomElement(anomalyTypes);
            events.push(generateAnomalousEvent(user, date, anomalyType));
            console.log(`  Generated ${anomalyType} anomaly for ${user.name} on day ${day + 1}`);
          }
        }
      }
    }
    
    // Save all events to the database
    await SecurityEvent.insertMany(events);
    console.log(`Successfully generated ${events.length} test events`);
    
    // Generate a series of suspicious events for one user to create a clear behavior pattern
    // This simulates an account compromise scenario
    const compromisedUser = USER_PROFILES[1]; // Sarah Admin
    console.log(`Generating compromise scenario for ${compromisedUser.name}...`);
    
    const compromiseEvents = [];
    const compromiseDate = moment().subtract(1, 'days');
    
    // 1. Initial access from unusual location and IP
    compromiseEvents.push(generateAnomalousEvent(compromisedUser, compromiseDate, 'unusual_location'));
    compromiseEvents.push(generateAnomalousEvent(compromisedUser, compromiseDate, 'unusual_ip'));
    
    // 2. Multiple failed logins followed by success (brute force)
    for (let i = 0; i < 8; i++) {
      const event = generateAnomalousEvent(compromisedUser, compromiseDate, 'multiple_failures');
      event.timestamp = moment(compromiseDate).hour(3).minute(i * 2).second(0).toDate();
      compromiseEvents.push(event);
    }
    
    // 3. Successful login at unusual hour
    const successLogin = generateNormalEvent(compromisedUser, compromiseDate);
    successLogin.timestamp = moment(compromiseDate).hour(3).minute(20).second(0).toDate();
    successLogin.category = 'authentication';
    successLogin.eventType = 'login';
    successLogin.host.ip = randomIP(); // Unusual IP
    successLogin.geo.country = 'Russia'; // Unusual location
    successLogin.status = 'suspicious';
    compromiseEvents.push(successLogin);
    
    // 4. Access to unusual resources
    for (let i = 0; i < 3; i++) {
      const event = generateAnomalousEvent(compromisedUser, compromiseDate, 'unusual_resource');
      event.timestamp = moment(compromiseDate).hour(3).minute(25 + i * 5).second(0).toDate();
      event.host.ip = successLogin.host.ip; // Same unusual IP
      event.geo.country = successLogin.geo.country; // Same unusual location
      compromiseEvents.push(event);
    }
    
    // 5. Privilege escalation attempt
    const privEscEvent = generateAnomalousEvent(compromisedUser, compromiseDate, 'privilege_escalation');
    privEscEvent.timestamp = moment(compromiseDate).hour(3).minute(45).second(0).toDate();
    privEscEvent.host.ip = successLogin.host.ip;
    privEscEvent.geo.country = successLogin.geo.country;
    compromiseEvents.push(privEscEvent);
    
    // 6. Data exfiltration
    const exfilEvent = generateAnomalousEvent(compromisedUser, compromiseDate, 'data_exfiltration');
    exfilEvent.timestamp = moment(compromiseDate).hour(4).minute(0).second(0).toDate();
    exfilEvent.host.ip = successLogin.host.ip;
    exfilEvent.geo.country = successLogin.geo.country;
    exfilEvent.status = 'threat';
    compromiseEvents.push(exfilEvent);
    
    // Save compromise events
    await SecurityEvent.insertMany(compromiseEvents);
    console.log(`Added ${compromiseEvents.length} compromise scenario events`);
    
    console.log('Test data generation complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error generating test data:', error);
    process.exit(1);
  }
};

// Run the generator
generateTestData();
