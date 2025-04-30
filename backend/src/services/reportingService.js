/**
 * Reporting Service
 * Generates and manages security reports
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// Define Report schema
const ReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ['security', 'compliance', 'vulnerability', 'audit', 'custom'],
    required: true
  },
  format: {
    type: String,
    enum: ['pdf', 'excel', 'json'],
    required: true
  },
  dateRange: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  parameters: {
    type: Object,
    default: {}
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  filePath: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'generating', 'completed', 'failed'],
    default: 'pending'
  },
  error: {
    type: String
  }
});

// Create Report model if it doesn't exist
let Report;
try {
  Report = mongoose.model('Report');
} catch (error) {
  Report = mongoose.model('Report', ReportSchema);
}

class ReportingService {
  constructor() {
    // Create reports directory if it doesn't exist
    this.reportsDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
    
    logger.info('Reporting service initialized');
  }
  
  /**
   * Generate a security report
   * @param {Object} reportData - Report data
   * @returns {Promise<Object>} - Generated report
   */
  async generateReport(reportData) {
    try {
      const { title, description, type, format, dateRange, parameters, createdBy } = reportData;
      
      // Create report record
      const report = new Report({
        title,
        description,
        type,
        format,
        dateRange,
        parameters,
        createdBy,
        status: 'generating'
      });
      
      await report.save();
      
      // Start report generation
      try {
        let filePath;
        
        switch (type) {
          case 'security':
            filePath = await this.generateSecurityReport(report);
            break;
          case 'compliance':
            filePath = await this.generateComplianceReport(report);
            break;
          case 'vulnerability':
            filePath = await this.generateVulnerabilityReport(report);
            break;
          case 'audit':
            filePath = await this.generateAuditReport(report);
            break;
          case 'custom':
            filePath = await this.generateCustomReport(report);
            break;
          default:
            throw new Error(`Unsupported report type: ${type}`);
        }
        
        // Update report record with file path and status
        report.filePath = filePath;
        report.status = 'completed';
        await report.save();
        
        logger.info(`Report ${report._id} generated successfully: ${filePath}`);
        return report;
      } catch (error) {
        // Update report record with error
        report.status = 'failed';
        report.error = error.message;
        await report.save();
        
        logger.error(`Error generating report ${report._id}:`, error);
        throw error;
      }
    } catch (error) {
      logger.error('Error creating report:', error);
      throw error;
    }
  }
  
  /**
   * Generate a security metrics report
   * @param {Object} report - Report record
   * @returns {Promise<String>} - File path of the generated report
   */
  async generateSecurityReport(report) {
    const { format, dateRange, parameters } = report;
    
    // Generate file name
    const fileName = `security_report_${dateRange.startDate.toISOString().split('T')[0]}_to_${dateRange.endDate.toISOString().split('T')[0]}`;
    const fileDir = path.join(this.reportsDir, report.createdBy.toString());
    
    // Create user directory if it doesn't exist
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }
    
    // Generate mock security data
    // In a real implementation, this would fetch data from databases
    const securityData = await this.getMockSecurityData(dateRange, parameters);
    
    // Generate report based on format
    if (format === 'pdf') {
      const filePath = path.join(fileDir, `${fileName}.pdf`);
      await this.generatePDFReport(filePath, report.title, securityData);
      return filePath;
    } else if (format === 'excel') {
      const filePath = path.join(fileDir, `${fileName}.xlsx`);
      await this.generateExcelReport(filePath, report.title, securityData);
      return filePath;
    } else if (format === 'json') {
      const filePath = path.join(fileDir, `${fileName}.json`);
      await this.generateJSONReport(filePath, securityData);
      return filePath;
    } else {
      throw new Error(`Unsupported report format: ${format}`);
    }
  }
  
  /**
   * Generate a compliance report
   * @param {Object} report - Report record
   * @returns {Promise<String>} - File path of the generated report
   */
  async generateComplianceReport(report) {
    // Similar implementation to generateSecurityReport
    // For brevity, we'll just call that method
    return this.generateSecurityReport(report);
  }
  
  /**
   * Generate a vulnerability report
   * @param {Object} report - Report record
   * @returns {Promise<String>} - File path of the generated report
   */
  async generateVulnerabilityReport(report) {
    // Similar implementation to generateSecurityReport
    // For brevity, we'll just call that method
    return this.generateSecurityReport(report);
  }
  
  /**
   * Generate an audit report
   * @param {Object} report - Report record
   * @returns {Promise<String>} - File path of the generated report
   */
  async generateAuditReport(report) {
    // Similar implementation to generateSecurityReport
    // For brevity, we'll just call that method
    return this.generateSecurityReport(report);
  }
  
  /**
   * Generate a custom report
   * @param {Object} report - Report record
   * @returns {Promise<String>} - File path of the generated report
   */
  async generateCustomReport(report) {
    // Similar implementation to generateSecurityReport
    // For brevity, we'll just call that method
    return this.generateSecurityReport(report);
  }
  
  /**
   * Generate a PDF report
   * @param {String} filePath - File path to save the report
   * @param {String} title - Report title
   * @param {Object} data - Report data
   * @returns {Promise<void>}
   */
  async generatePDFReport(filePath, title, data) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const writeStream = fs.createWriteStream(filePath);
        
        doc.pipe(writeStream);
        
        // Title
        doc.fontSize(20).text(title, { align: 'center' });
        doc.moveDown();
        
        // Date range
        doc.fontSize(12).text(`Report Period: ${data.dateRange.startDate.toLocaleDateString()} to ${data.dateRange.endDate.toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(2);
        
        // Executive summary
        doc.fontSize(16).text('Executive Summary', { underline: true });
        doc.moveDown();
        doc.fontSize(12).text(data.executiveSummary);
        doc.moveDown(2);
        
        // Key metrics
        doc.fontSize(16).text('Key Security Metrics', { underline: true });
        doc.moveDown();
        
        Object.entries(data.metrics).forEach(([key, value]) => {
          doc.fontSize(12).text(`${key}: ${value}`);
        });
        doc.moveDown(2);
        
        // Alert summary
        doc.fontSize(16).text('Security Alert Summary', { underline: true });
        doc.moveDown();
        
        // Create a simple table for alerts
        let y = doc.y;
        const alertTable = {
          headers: ['Severity', 'Count', '% Change'],
          rows: Object.entries(data.alerts).map(([severity, details]) => {
            return [severity, details.count.toString(), `${details.percentChange}%`];
          })
        };
        
        // Draw table headers
        const columnWidth = 150;
        alertTable.headers.forEach((header, i) => {
          doc.fontSize(12).text(header, 50 + (i * columnWidth), y, { width: columnWidth, align: 'left' });
        });
        
        doc.moveDown();
        y = doc.y;
        
        // Draw table rows
        alertTable.rows.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
            doc.fontSize(12).text(cell, 50 + (colIndex * columnWidth), y + (rowIndex * 20), { width: columnWidth, align: 'left' });
          });
        });
        
        // Move past the table
        doc.moveDown(alertTable.rows.length + 2);
        
        // Add more sections as needed...
        
        // Finish the document
        doc.end();
        
        writeStream.on('finish', () => {
          resolve();
        });
        
        writeStream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Generate an Excel report
   * @param {String} filePath - File path to save the report
   * @param {String} title - Report title
   * @param {Object} data - Report data
   * @returns {Promise<void>}
   */
  async generateExcelReport(filePath, title, data) {
    const workbook = new ExcelJS.Workbook();
    
    // Overview sheet
    const overviewSheet = workbook.addWorksheet('Overview');
    
    // Title
    overviewSheet.mergeCells('A1:D1');
    overviewSheet.getCell('A1').value = title;
    overviewSheet.getCell('A1').font = { size: 16, bold: true };
    overviewSheet.getCell('A1').alignment = { horizontal: 'center' };
    
    // Date range
    overviewSheet.mergeCells('A2:D2');
    overviewSheet.getCell('A2').value = `Report Period: ${data.dateRange.startDate.toLocaleDateString()} to ${data.dateRange.endDate.toLocaleDateString()}`;
    overviewSheet.getCell('A2').alignment = { horizontal: 'center' };
    
    // Executive summary
    overviewSheet.getCell('A4').value = 'Executive Summary';
    overviewSheet.getCell('A4').font = { size: 14, bold: true };
    overviewSheet.mergeCells('A5:D8');
    overviewSheet.getCell('A5').value = data.executiveSummary;
    overviewSheet.getCell('A5').alignment = { wrapText: true };
    
    // Key metrics
    overviewSheet.getCell('A10').value = 'Key Security Metrics';
    overviewSheet.getCell('A10').font = { size: 14, bold: true };
    
    let row = 11;
    Object.entries(data.metrics).forEach(([key, value]) => {
      overviewSheet.getCell(`A${row}`).value = key;
      overviewSheet.getCell(`B${row}`).value = value;
      row++;
    });
    
    // Alerts sheet
    const alertsSheet = workbook.addWorksheet('Security Alerts');
    
    // Headers
    alertsSheet.columns = [
      { header: 'Severity', key: 'severity', width: 15 },
      { header: 'Count', key: 'count', width: 10 },
      { header: '% Change', key: 'percentChange', width: 15 }
    ];
    
    // Data
    Object.entries(data.alerts).forEach(([severity, details]) => {
      alertsSheet.addRow({
        severity,
        count: details.count,
        percentChange: `${details.percentChange}%`
      });
    });
    
    // Format headers
    alertsSheet.getRow(1).font = { bold: true };
    
    // Add more sheets as needed...
    
    // Save the workbook
    await workbook.xlsx.writeFile(filePath);
  }
  
  /**
   * Generate a JSON report
   * @param {String} filePath - File path to save the report
   * @param {Object} data - Report data
   * @returns {Promise<void>}
   */
  async generateJSONReport(filePath, data) {
    return new Promise((resolve, reject) => {
      try {
        fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Get mock security data for reports
   * @param {Object} dateRange - Date range
   * @param {Object} parameters - Additional parameters
   * @returns {Promise<Object>} - Mock security data
   */
  async getMockSecurityData(dateRange, parameters) {
    // In a real implementation, this would fetch data from the database
    // For this example, we'll generate some mock data
    
    return {
      dateRange,
      executiveSummary: 'This security report provides an overview of security events and metrics for the specified time period. Overall, there has been a 15% reduction in critical security incidents compared to the previous period.',
      metrics: {
        'Security Score': '84/100',
        'Total Alerts': 157,
        'Critical Alerts': 12,
        'High Alerts': 45,
        'Mean Time to Detect': '12.5 minutes',
        'Mean Time to Resolve': '74.2 minutes'
      },
      alerts: {
        'Critical': { count: 12, percentChange: -15 },
        'High': { count: 45, percentChange: -5 },
        'Medium': { count: 78, percentChange: +3 },
        'Low': { count: 22, percentChange: -8 }
      },
      topThreats: [
        {
          name: 'Brute Force Attacks',
          count: 42,
          trend: 'decreasing'
        },
        {
          name: 'SQL Injection Attempts',
          count: 28,
          trend: 'stable'
        },
        {
          name: 'Malware Infections',
          count: 17,
          trend: 'increasing'
        }
      ],
      complianceStatus: {
        'PCI-DSS': { status: 'Compliant', score: 98 },
        'HIPAA': { status: 'Compliant', score: 95 },
        'GDPR': { status: 'Partially Compliant', score: 87 },
        'ISO 27001': { status: 'Compliant', score: 92 }
      }
    };
  }
  
  /**
   * Get a report by ID
   * @param {String} reportId - Report ID
   * @returns {Promise<Object>} - Report object
   */
  async getReportById(reportId) {
    try {
      const report = await Report.findById(reportId).populate('createdBy', 'username email');
      
      if (!report) {
        throw new Error('Report not found');
      }
      
      return report;
    } catch (error) {
      logger.error(`Error getting report ${reportId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get reports by user
   * @param {String} userId - User ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} - List of reports
   */
  async getReportsByUser(userId, filters = {}) {
    try {
      const query = { createdBy: userId };
      
      // Apply filters
      if (filters.type) {
        query.type = filters.type;
      }
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.startDate) {
        query.createdAt = { $gte: new Date(filters.startDate) };
      }
      
      if (filters.endDate) {
        if (query.createdAt) {
          query.createdAt.$lte = new Date(filters.endDate);
        } else {
          query.createdAt = { $lte: new Date(filters.endDate) };
        }
      }
      
      return await Report.find(query)
        .sort({ createdAt: -1 })
        .populate('createdBy', 'username email');
    } catch (error) {
      logger.error(`Error getting reports for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a report
   * @param {String} reportId - Report ID
   * @returns {Promise<Boolean>} - Whether the deletion was successful
   */
  async deleteReport(reportId) {
    try {
      const report = await Report.findById(reportId);
      
      if (!report) {
        throw new Error('Report not found');
      }
      
      // Delete report file if it exists
      if (report.filePath && fs.existsSync(report.filePath)) {
        fs.unlinkSync(report.filePath);
      }
      
      // Delete report record
      await Report.deleteOne({ _id: reportId });
      
      logger.info(`Deleted report ${reportId}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting report ${reportId}:`, error);
      throw error;
    }
  }
}

module.exports = new ReportingService();
