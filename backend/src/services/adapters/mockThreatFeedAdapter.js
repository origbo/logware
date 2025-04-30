/**
 * Mock Threat Feed Adapter
 * Simulates connections to various threat intelligence feeds for demonstration
 */
const axios = require('axios');
const crypto = require('crypto');

class MockThreatFeedAdapter {
  /**
   * Fetch indicators from a mock threat intelligence source
   * @param {Object} source - The threat source configuration
   * @returns {Array} - Array of threat indicators
   */
  async fetchIndicators(source) {
    console.log(`Fetching indicators from mock ${source.type} feed: ${source.name}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate appropriate indicators based on source type
    switch (source.type) {
      case 'misp':
        return this.generateMispIndicators(source);
      case 'otx':
        return this.generateOtxIndicators(source);
      case 'virustotal':
        return this.generateVirusTotalIndicators(source);
      case 'threatfox':
        return this.generateThreatFoxIndicators(source);
      default:
        return this.generateGenericIndicators(source);
    }
  }
  
  /**
   * Generate MISP-style threat indicators
   */
  generateMispIndicators(source) {
    const indicators = [];
    const categories = ['Malware', 'Ransomware', 'APT', 'Phishing', 'Botnet'];
    const count = Math.floor(Math.random() * 20) + 5; // 5-25 indicators
    
    for (let i = 0; i < count; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      indicators.push(this.createIndicator({
        source,
        type: this.getRandomIndicatorType(),
        threat: {
          category,
          family: `${category}-${this.getRandomString(4).toUpperCase()}`,
          actor: Math.random() > 0.7 ? `APT-${Math.floor(Math.random() * 40)}` : null
        },
        confidence: 70 + Math.floor(Math.random() * 30), // 70-100
        severity: Math.random() > 0.8 ? 'critical' : (Math.random() > 0.5 ? 'high' : 'medium')
      }));
    }
    
    return indicators;
  }
  
  /**
   * Generate AlienVault OTX style indicators
   */
  generateOtxIndicators(source) {
    const indicators = [];
    const pulseNames = ['Emotet Campaign', 'Cobalt Strike C2', 'Log4j Exploitation', 'Ransomware Distribution'];
    const count = Math.floor(Math.random() * 15) + 10; // 10-25 indicators
    
    for (let i = 0; i < count; i++) {
      const pulseName = pulseNames[Math.floor(Math.random() * pulseNames.length)];
      indicators.push(this.createIndicator({
        source,
        type: this.getRandomIndicatorType(),
        threat: {
          category: 'Malware',
          family: pulseName.split(' ')[0],
          campaign: pulseName
        },
        confidence: 60 + Math.floor(Math.random() * 40), // 60-100
        severity: Math.random() > 0.7 ? 'high' : (Math.random() > 0.4 ? 'medium' : 'low'),
        tags: [pulseName.replace(' ', '-').toLowerCase(), 'otx-pulse']
      }));
    }
    
    return indicators;
  }
  
  /**
   * Generate VirusTotal style indicators
   */
  generateVirusTotalIndicators(source) {
    const indicators = [];
    const count = Math.floor(Math.random() * 10) + 5; // 5-15 indicators
    
    for (let i = 0; i < count; i++) {
      indicators.push(this.createIndicator({
        source,
        type: Math.random() > 0.7 ? 'file_hash_sha256' : (Math.random() > 0.5 ? 'file_hash_md5' : 'url'),
        threat: {
          category: 'Malware',
          family: ['Trojan', 'Backdoor', 'Dropper', 'Ransomware'][Math.floor(Math.random() * 4)]
        },
        confidence: 75 + Math.floor(Math.random() * 25), // 75-100
        severity: Math.random() > 0.6 ? 'high' : 'medium',
        attributes: {
          detections: 5 + Math.floor(Math.random() * 50),
          firstSeen: this.getRandomDate(60, 10) // Between 10-60 days ago
        }
      }));
    }
    
    return indicators;
  }
  
  /**
   * Generate ThreatFox style indicators
   */
  generateThreatFoxIndicators(source) {
    const indicators = [];
    const malwareFamilies = ['AgentTesla', 'Qakbot', 'Formbook', 'BazarLoader', 'IcedID'];
    const count = Math.floor(Math.random() * 15) + 8; // 8-23 indicators
    
    for (let i = 0; i < count; i++) {
      const family = malwareFamilies[Math.floor(Math.random() * malwareFamilies.length)];
      indicators.push(this.createIndicator({
        source,
        type: this.getRandomIndicatorType(),
        threat: {
          category: 'Malware',
          family: family
        },
        confidence: 65 + Math.floor(Math.random() * 35), // 65-100
        severity: Math.random() > 0.7 ? 'critical' : (Math.random() > 0.4 ? 'high' : 'medium'),
        tags: [family.toLowerCase(), 'threatfox', 'malware']
      }));
    }
    
    return indicators;
  }
  
  /**
   * Generate generic indicators for other source types
   */
  generateGenericIndicators(source) {
    const indicators = [];
    const count = Math.floor(Math.random() * 15) + 5; // 5-20 indicators
    
    for (let i = 0; i < count; i++) {
      indicators.push(this.createIndicator({
        source,
        type: this.getRandomIndicatorType(),
        threat: {
          category: ['Malware', 'Phishing', 'C2', 'Scanner', 'Spam'][Math.floor(Math.random() * 5)]
        },
        confidence: 50 + Math.floor(Math.random() * 50), // 50-100
        severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
      }));
    }
    
    return indicators;
  }
  
  /**
   * Create a single indicator with consistent format
   */
  createIndicator({ source, type, threat, confidence, severity, tags = [], attributes = {} }) {
    // Generate appropriate value based on type
    let value;
    switch (type) {
      case 'ip':
        value = this.generateRandomIP();
        break;
      case 'domain':
        value = this.generateRandomDomain();
        break;
      case 'url':
        value = this.generateRandomURL();
        break;
      case 'file_hash_md5':
        value = this.generateRandomHash(32);
        break;
      case 'file_hash_sha1':
        value = this.generateRandomHash(40);
        break;
      case 'file_hash_sha256':
        value = this.generateRandomHash(64);
        break;
      default:
        value = this.generateRandomHash(32);
    }
    
    // Current date and random past date
    const now = new Date();
    const firstSeen = attributes.firstSeen || this.getRandomDate(90, 1);
    const expirationDate = new Date(now);
    expirationDate.setDate(expirationDate.getDate() + (source.configuration?.defaultExpirationInDays || 90));
    
    return {
      value,
      type,
      source: {
        id: source._id,
        name: source.name,
        type: source.type
      },
      status: 'active',
      firstSeenAt: firstSeen,
      lastSeenAt: this.getRandomDate(
        (now - firstSeen) / (1000 * 60 * 60 * 24), // Days between firstSeen and now
        0 // Up to now
      ),
      expiresAt: expirationDate,
      confidenceScore: confidence,
      severity,
      threat: {
        category: threat.category || 'unknown',
        family: threat.family || null,
        actor: threat.actor || null,
        campaign: threat.campaign || null
      },
      tags: [...tags, source.type, threat.category.toLowerCase()].filter(Boolean),
      attributes: {
        ...attributes,
        reportedBy: [source.name, ...(Math.random() > 0.7 ? ['OtherSource'] : [])],
        sourceURL: `https://example.com/${source.type}/indicators/${this.getRandomString(8)}`
      },
      description: `${threat.category} indicator${threat.family ? ` related to ${threat.family}` : ''} reported by ${source.name}`,
      matchCount: Math.floor(Math.random() * 10) // 0-9 matches
    };
  }
  
  /**
   * Utility function to get a random indicator type
   */
  getRandomIndicatorType() {
    const types = ['ip', 'domain', 'url', 'file_hash_md5', 'file_hash_sha1', 'file_hash_sha256'];
    return types[Math.floor(Math.random() * types.length)];
  }
  
  /**
   * Generate a random IP address
   */
  generateRandomIP() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }
  
  /**
   * Generate a random domain
   */
  generateRandomDomain() {
    const prefixes = ['secure', 'mail', 'login', 'account', 'update', 'service', 'cdn', 'api', 'app', 'static', 'docs'];
    const domains = ['example', 'service', 'security', 'network', 'cloud', 'tech', 'system', 'data', 'info', 'connect'];
    const tlds = ['com', 'net', 'org', 'io', 'co', 'tech', 'xyz', 'info', 'online'];
    
    const prefix = Math.random() > 0.5 ? `${prefixes[Math.floor(Math.random() * prefixes.length)]}-` : '';
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const tld = tlds[Math.floor(Math.random() * tlds.length)];
    
    return `${prefix}${domain}${Math.random() > 0.7 ? this.getRandomString(4) : ''}.${tld}`;
  }
  
  /**
   * Generate a random URL
   */
  generateRandomURL() {
    const domain = this.generateRandomDomain();
    const paths = ['login', 'admin', 'update', 'download', 'file', 'document', 'invoice', 'account', 'payment', 'verify'];
    const extensions = ['html', 'php', 'aspx', 'jsp', 'exe', 'zip', 'pdf', 'doc'];
    
    const path = paths[Math.floor(Math.random() * paths.length)];
    const extension = extensions[Math.floor(Math.random() * extensions.length)];
    const randomParam = Math.random() > 0.5 ? `?id=${this.getRandomString(8)}` : '';
    
    return `https://${domain}/${path}.${extension}${randomParam}`;
  }
  
  /**
   * Generate a random hash of specified length
   */
  generateRandomHash(length) {
    return crypto.randomBytes(length / 2).toString('hex');
  }
  
  /**
   * Generate a random string
   */
  getRandomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  /**
   * Get a random date between minDaysAgo and maxDaysAgo
   */
  getRandomDate(maxDaysAgo, minDaysAgo = 0) {
    const now = new Date();
    const minDate = new Date(now);
    minDate.setDate(now.getDate() - maxDaysAgo);
    
    const maxDate = new Date(now);
    maxDate.setDate(now.getDate() - minDaysAgo);
    
    return new Date(minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime()));
  }
}

module.exports = new MockThreatFeedAdapter();
