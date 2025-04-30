const express = require('express');
const router = express.Router();

// Mock reports data
const reportsData = [];

// Report types
const reportTypes = [
  'security_incident',
  'compliance',
  'network_activity',
  'system_health',
  'user_activity',
  'vulnerability'
];

// Report formats
const reportFormats = ['pdf', 'csv', 'html', 'json'];

// Generate 20 sample reports
for (let i = 1; i <= 20; i++) {
  // Create random timestamp within the last 30 days
  const timestamp = new Date();
  timestamp.setDate(timestamp.getDate() - Math.floor(Math.random() * 30));
  timestamp.setHours(Math.floor(Math.random() * 24));
  timestamp.setMinutes(Math.floor(Math.random() * 60));
  
  // Random report type
  const reportType = reportTypes[Math.floor(Math.random() * reportTypes.length)];
  
  // Create title based on report type
  let title;
  let description;
  
  switch (reportType) {
    case 'security_incident':
      title = `Security Incident Report - ${timestamp.toISOString().split('T')[0]}`;
      description = 'Summary of security incidents with severity breakdown and resolution status';
      break;
    case 'compliance':
      title = `Compliance Status Report - ${timestamp.toISOString().split('T')[0]}`;
      description = 'Compliance status across various regulatory frameworks and standards';
      break;
    case 'network_activity':
      title = `Network Activity Report - ${timestamp.toISOString().split('T')[0]}`;
      description = 'Analysis of network traffic patterns, anomalies, and bandwidth usage';
      break;
    case 'system_health':
      title = `System Health Report - ${timestamp.toISOString().split('T')[0]}`;
      description = 'Overview of system performance, uptime, and resource utilization';
      break;
    case 'user_activity':
      title = `User Activity Report - ${timestamp.toISOString().split('T')[0]}`;
      description = 'Summary of user login activity, resource access, and potential policy violations';
      break;
    case 'vulnerability':
      title = `Vulnerability Assessment Report - ${timestamp.toISOString().split('T')[0]}`;
      description = 'Comprehensive analysis of system vulnerabilities with risk assessment';
      break;
    default:
      title = `General Report - ${timestamp.toISOString().split('T')[0]}`;
      description = 'General system overview and activity summary';
  }
  
  // Create the report object
  const report = {
    id: i.toString(),
    title: title,
    description: description,
    type: reportType,
    format: reportFormats[Math.floor(Math.random() * reportFormats.length)],
    createdAt: timestamp,
    createdBy: ['admin', 'user', 'system'][Math.floor(Math.random() * 3)],
    fileSize: Math.floor(Math.random() * 5000000) + 100000, // Random size between 100KB and 5MB
    scheduleId: Math.random() > 0.7 ? Math.floor(Math.random() * 5 + 1).toString() : null,
    parameters: {
      startDate: new Date(timestamp.getTime() - (7 * 24 * 60 * 60 * 1000)),
      endDate: timestamp,
      filters: {}
    }
  };
  
  // Add type-specific parameters
  switch (reportType) {
    case 'security_incident':
      report.parameters.filters = {
        severity: ['critical', 'high', 'medium', 'low'],
        status: ['resolved', 'active', 'acknowledged']
      };
      break;
    case 'compliance':
      report.parameters.filters = {
        frameworks: ['PCI-DSS', 'HIPAA', 'GDPR', 'ISO27001'].slice(0, Math.floor(Math.random() * 4) + 1)
      };
      break;
    case 'network_activity':
      report.parameters.filters = {
        interfaces: ['WAN', 'LAN', 'DMZ'].slice(0, Math.floor(Math.random() * 3) + 1),
        protocols: ['TCP', 'UDP', 'HTTP', 'HTTPS'].slice(0, Math.floor(Math.random() * 4) + 1)
      };
      break;
    case 'user_activity':
      report.parameters.filters = {
        users: ['all'],
        activities: ['login', 'resource_access', 'configuration_change'].slice(0, Math.floor(Math.random() * 3) + 1)
      };
      break;
    case 'vulnerability':
      report.parameters.filters = {
        severity: ['critical', 'high', 'medium', 'low'].slice(0, Math.floor(Math.random() * 4) + 1),
        status: ['open', 'in-progress', 'remediated'].slice(0, Math.floor(Math.random() * 3) + 1)
      };
      break;
  }
  
  reportsData.push(report);
}

// Sort reports by timestamp (newest first)
reportsData.sort((a, b) => b.createdAt - a.createdAt);

// Mock report schedules
const scheduleData = [
  {
    id: '1',
    name: 'Daily Security Incidents',
    description: 'Daily summary of security incidents',
    type: 'security_incident',
    format: 'pdf',
    frequency: 'daily',
    time: '08:00',
    recipients: ['security@example.com', 'admin@example.com'],
    parameters: {
      daysToInclude: 1,
      filters: {
        severity: ['critical', 'high']
      }
    },
    lastRun: new Date(new Date().setDate(new Date().getDate() - 1)),
    nextRun: new Date(new Date().setDate(new Date().getDate() + 1)),
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 2)),
    createdBy: 'admin'
  },
  {
    id: '2',
    name: 'Weekly Compliance Report',
    description: 'Weekly overview of compliance status',
    type: 'compliance',
    format: 'pdf',
    frequency: 'weekly',
    dayOfWeek: 'monday',
    time: '09:00',
    recipients: ['compliance@example.com', 'admin@example.com'],
    parameters: {
      frameworks: ['PCI-DSS', 'HIPAA', 'GDPR', 'ISO27001']
    },
    lastRun: new Date(new Date().setDate(new Date().getDate() - 7)),
    nextRun: new Date(new Date().setDate(new Date().getDate() + 7)),
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    createdBy: 'admin'
  },
  {
    id: '3',
    name: 'Monthly Network Activity',
    description: 'Monthly analysis of network activity',
    type: 'network_activity',
    format: 'pdf',
    frequency: 'monthly',
    dayOfMonth: '1',
    time: '10:00',
    recipients: ['network@example.com', 'admin@example.com'],
    parameters: {
      interfaces: ['WAN', 'LAN', 'DMZ'],
      protocols: ['TCP', 'UDP', 'HTTP', 'HTTPS']
    },
    lastRun: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    nextRun: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 4)),
    createdBy: 'admin'
  },
  {
    id: '4',
    name: 'Weekly Vulnerability Report',
    description: 'Weekly overview of security vulnerabilities',
    type: 'vulnerability',
    format: 'pdf',
    frequency: 'weekly',
    dayOfWeek: 'friday',
    time: '16:00',
    recipients: ['security@example.com', 'admin@example.com'],
    parameters: {
      severity: ['critical', 'high', 'medium', 'low'],
      status: ['open', 'in-progress', 'remediated']
    },
    lastRun: new Date(new Date().setDate(new Date().getDate() - 7)),
    nextRun: new Date(new Date().setDate(new Date().getDate() + 7)),
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 2)),
    createdBy: 'admin'
  },
  {
    id: '5',
    name: 'Daily User Activity',
    description: 'Daily summary of user activities',
    type: 'user_activity',
    format: 'csv',
    frequency: 'daily',
    time: '23:59',
    recipients: ['audit@example.com', 'admin@example.com'],
    parameters: {
      users: ['all'],
      activities: ['login', 'resource_access', 'configuration_change']
    },
    lastRun: new Date(new Date().setDate(new Date().getDate() - 1)),
    nextRun: new Date(new Date().setDate(new Date().getDate() + 1)),
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    createdBy: 'admin'
  }
];

// Mock report templates
const templateData = [
  {
    id: '1',
    name: 'Security Incident Summary',
    description: 'Summary of security incidents with severity breakdown',
    type: 'security_incident',
    format: 'pdf',
    parameters: {
      filters: {
        severity: ['critical', 'high', 'medium', 'low'],
        status: ['resolved', 'active', 'acknowledged']
      }
    },
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    createdBy: 'admin'
  },
  {
    id: '2',
    name: 'Compliance Status Overview',
    description: 'Overview of compliance status across various frameworks',
    type: 'compliance',
    format: 'pdf',
    parameters: {
      frameworks: ['PCI-DSS', 'HIPAA', 'GDPR', 'ISO27001']
    },
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 5)),
    createdBy: 'admin'
  },
  {
    id: '3',
    name: 'Network Traffic Analysis',
    description: 'Detailed analysis of network traffic patterns',
    type: 'network_activity',
    format: 'pdf',
    parameters: {
      interfaces: ['WAN', 'LAN', 'DMZ'],
      protocols: ['TCP', 'UDP', 'HTTP', 'HTTPS']
    },
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 4)),
    createdBy: 'admin'
  },
  {
    id: '4',
    name: 'Vulnerability Assessment',
    description: 'Comprehensive assessment of system vulnerabilities',
    type: 'vulnerability',
    format: 'pdf',
    parameters: {
      severity: ['critical', 'high', 'medium', 'low'],
      status: ['open', 'in-progress', 'remediated']
    },
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    createdBy: 'admin'
  },
  {
    id: '5',
    name: 'User Activity Audit',
    description: 'Detailed audit of user activities',
    type: 'user_activity',
    format: 'csv',
    parameters: {
      users: ['all'],
      activities: ['login', 'resource_access', 'configuration_change']
    },
    createdAt: new Date(new Date().setMonth(new Date().getMonth() - 2)),
    createdBy: 'admin'
  }
];

// Middleware to simulate authentication
const authenticate = (req, res, next) => {
  // In a real app, this would verify the JWT token
  req.user = { id: '1', role: 'admin' };
  next();
};

// Get all reports with filtering and pagination
router.get('/', authenticate, (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      startDate,
      endDate,
      search
    } = req.query;
    
    // Convert page and limit to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    // Apply filters
    let filteredReports = [...reportsData];
    
    if (type) {
      filteredReports = filteredReports.filter(report => report.type === type);
    }
    
    if (startDate) {
      const start = new Date(startDate);
      filteredReports = filteredReports.filter(report => new Date(report.createdAt) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      filteredReports = filteredReports.filter(report => new Date(report.createdAt) <= end);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredReports = filteredReports.filter(report => 
        report.title.toLowerCase().includes(searchLower) ||
        report.description.toLowerCase().includes(searchLower) ||
        report.type.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply pagination
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedReports = filteredReports.slice(startIndex, endIndex);
    
    // Prepare response
    const response = {
      reports: paginatedReports,
      page: pageNum,
      limit: limitNum,
      totalReports: filteredReports.length,
      totalPages: Math.ceil(filteredReports.length / limitNum)
    };
    
    res.json(response);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'An error occurred while fetching reports' });
  }
});

// Get report by ID
router.get('/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    
    const report = reportsData.find(report => report.id === id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json(report);
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ message: 'An error occurred while fetching report' });
  }
});

// Get report schedules
router.get('/schedules/all', authenticate, (req, res) => {
  try {
    res.json(scheduleData);
  } catch (error) {
    console.error('Get report schedules error:', error);
    res.status(500).json({ message: 'An error occurred while fetching report schedules' });
  }
});

// Get report schedule by ID
router.get('/schedules/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    
    const schedule = scheduleData.find(schedule => schedule.id === id);
    
    if (!schedule) {
      return res.status(404).json({ message: 'Report schedule not found' });
    }
    
    res.json(schedule);
  } catch (error) {
    console.error('Get report schedule error:', error);
    res.status(500).json({ message: 'An error occurred while fetching report schedule' });
  }
});

// Create a new report schedule
router.post('/schedules', authenticate, (req, res) => {
  try {
    const {
      name,
      description,
      type,
      format,
      frequency,
      dayOfWeek,
      dayOfMonth,
      time,
      recipients,
      parameters
    } = req.body;
    
    // Validate required fields
    if (!name || !type || !format || !frequency || !time || !recipients || !parameters) {
      return res.status(400).json({ message: 'Required fields missing' });
    }
    
    // Validate frequency-specific fields
    if (frequency === 'weekly' && !dayOfWeek) {
      return res.status(400).json({ message: 'Day of week is required for weekly frequency' });
    }
    
    if (frequency === 'monthly' && !dayOfMonth) {
      return res.status(400).json({ message: 'Day of month is required for monthly frequency' });
    }
    
    // Calculate next run time
    const nextRun = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    
    nextRun.setHours(hours, minutes, 0, 0);
    
    if (nextRun <= new Date()) {
      // If the time is in the past for today, schedule for tomorrow
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    // Adjust for weekly or monthly
    if (frequency === 'weekly') {
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDay = daysOfWeek.indexOf(dayOfWeek.toLowerCase());
      
      if (targetDay === -1) {
        return res.status(400).json({ message: 'Invalid day of week' });
      }
      
      const currentDay = nextRun.getDay();
      const daysToAdd = (targetDay - currentDay + 7) % 7;
      
      if (daysToAdd > 0 || (daysToAdd === 0 && nextRun <= new Date())) {
        nextRun.setDate(nextRun.getDate() + daysToAdd);
      }
    } else if (frequency === 'monthly') {
      const targetDay = parseInt(dayOfMonth);
      
      if (isNaN(targetDay) || targetDay < 1 || targetDay > 31) {
        return res.status(400).json({ message: 'Invalid day of month' });
      }
      
      nextRun.setDate(targetDay);
      
      if (nextRun <= new Date()) {
        // If the day has passed for this month, schedule for next month
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
    }
    
    // Create new schedule
    const newSchedule = {
      id: (scheduleData.length + 1).toString(),
      name,
      description: description || '',
      type,
      format,
      frequency,
      time,
      recipients: Array.isArray(recipients) ? recipients : [recipients],
      parameters,
      lastRun: null,
      nextRun,
      createdAt: new Date(),
      createdBy: req.user.id
    };
    
    // Add frequency-specific fields
    if (frequency === 'weekly') {
      newSchedule.dayOfWeek = dayOfWeek.toLowerCase();
    }
    
    if (frequency === 'monthly') {
      newSchedule.dayOfMonth = dayOfMonth;
    }
    
    // Add to mock database
    scheduleData.push(newSchedule);
    
    res.status(201).json(newSchedule);
  } catch (error) {
    console.error('Create report schedule error:', error);
    res.status(500).json({ message: 'An error occurred while creating report schedule' });
  }
});

// Get report templates
router.get('/templates/all', authenticate, (req, res) => {
  try {
    res.json(templateData);
  } catch (error) {
    console.error('Get report templates error:', error);
    res.status(500).json({ message: 'An error occurred while fetching report templates' });
  }
});

// Generate a report based on template or parameters
router.post('/generate', authenticate, (req, res) => {
  try {
    const { templateId, type, format, parameters } = req.body;
    
    // Validate input
    if (!type && !templateId) {
      return res.status(400).json({ message: 'Either template ID or report type is required' });
    }
    
    let reportTemplate;
    let reportType;
    let reportFormat;
    let reportParameters;
    
    // If using a template
    if (templateId) {
      reportTemplate = templateData.find(template => template.id === templateId);
      
      if (!reportTemplate) {
        return res.status(404).json({ message: 'Report template not found' });
      }
      
      reportType = reportTemplate.type;
      reportFormat = reportTemplate.format;
      reportParameters = { ...reportTemplate.parameters };
      
      // Override template parameters if provided
      if (parameters) {
        reportParameters = { ...reportParameters, ...parameters };
      }
    } else {
      // If creating ad-hoc report
      reportType = type;
      reportFormat = format || 'pdf';
      reportParameters = parameters || {};
    }
    
    // In a real application, this would send the report generation request to a background job
    // For now, we'll simulate successful generation with a brief delay
    
    setTimeout(() => {
      // Create report entry
      const newReport = {
        id: (reportsData.length + 1).toString(),
        title: `${reportType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Report - ${new Date().toISOString().split('T')[0]}`,
        description: `Generated ${reportType} report`,
        type: reportType,
        format: reportFormat,
        createdAt: new Date(),
        createdBy: req.user.id,
        fileSize: Math.floor(Math.random() * 5000000) + 100000,
        parameters: reportParameters
      };
      
      // Add to mock database
      reportsData.push(newReport);
      
      // Re-sort the array
      reportsData.sort((a, b) => b.createdAt - a.createdAt);
    }, 500);
    
    // Return immediate response indicating the report is being generated
    res.status(202).json({
      message: 'Report generation started',
      estimatedCompletion: new Date(Date.now() + 5000)
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ message: 'An error occurred while generating report' });
  }
});

// Get report statistics
router.get('/stats/summary', authenticate, (req, res) => {
  try {
    // Count by type
    const typeCount = {};
    reportTypes.forEach(type => {
      typeCount[type] = reportsData.filter(report => report.type === type).length;
    });
    
    // Count by format
    const formatCount = {};
    reportFormats.forEach(format => {
      formatCount[format] = reportsData.filter(report => report.format === format).length;
    });
    
    // Reports by month (last 6 months)
    const now = new Date();
    const last6Months = [];
    const monthlyCounts = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      last6Months.push(monthYear);
      
      const nextMonth = new Date(date);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      const count = reportsData.filter(report => {
        const reportDate = new Date(report.createdAt);
        return reportDate >= date && reportDate < nextMonth;
      }).length;
      
      monthlyCounts.push(count);
    }
    
    // Total file size
    const totalSize = reportsData.reduce((sum, report) => sum + report.fileSize, 0);
    
    // Prepare response
    const response = {
      total: reportsData.length,
      byType: typeCount,
      byFormat: formatCount,
      byMonth: {
        labels: last6Months,
        data: monthlyCounts
      },
      totalSizeBytes: totalSize,
      schedules: scheduleData.length,
      templates: templateData.length
    };
    
    res.json(response);
  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({ message: 'An error occurred while fetching report stats' });
  }
});

module.exports = router;
