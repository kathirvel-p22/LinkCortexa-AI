const axios = require('axios');
const crypto = require('crypto');

class AdvancedThreatAnalysis {
  constructor() {
    this.threatDatabase = new Map();
    this.ipCache = new Map();
    this.domainSimilarityCache = new Map();
    this.knownPhishingPatterns = [
      /paypal.*verify/i,
      /amazon.*secure/i,
      /bank.*login/i,
      /account.*suspended/i,
      /verify.*identity/i,
      /update.*payment/i,
      /confirm.*account/i,
      /security.*alert/i
    ];
    this.suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work'];
    this.legitimateDomains = ['google.com', 'amazon.com', 'paypal.com', 'microsoft.com', 'apple.com', 'facebook.com', 'github.com'];
  }

  // Main analysis function
  async analyzeURL(url, options = {}) {
    const startTime = Date.now();
    const analysis = {
      url,
      timestamp: new Date().toISOString(),
      riskScore: 0,
      threats: [],
      details: {},
      detectionMethods: [],
      processingTime: 0
    };

    try {
      // Parse URL
      const urlObj = new URL(url);
      analysis.details.domain = urlObj.hostname;
      analysis.details.protocol = urlObj.protocol;
      analysis.details.path = urlObj.pathname;

      // Run all detection methods in parallel
      const [
        domainAnalysis,
        ipAnalysis,
        redirectAnalysis,
        similarityAnalysis,
        patternAnalysis,
        reputationAnalysis
      ] = await Promise.all([
        this.analyzeDomain(urlObj),
        this.analyzeIP(urlObj.hostname),
        this.detectRedirects(url),
        this.detectDomainSimilarity(urlObj.hostname),
        this.detectSuspiciousPatterns(url),
        this.checkReputation(urlObj.hostname)
      ]);

      // Combine results
      this.combineAnalysis(analysis, domainAnalysis, 'Domain Analysis');
      this.combineAnalysis(analysis, ipAnalysis, 'IP Intelligence');
      this.combineAnalysis(analysis, redirectAnalysis, 'Redirect Detection');
      this.combineAnalysis(analysis, similarityAnalysis, 'Domain Similarity');
      this.combineAnalysis(analysis, patternAnalysis, 'Pattern Matching');
      this.combineAnalysis(analysis, reputationAnalysis, 'Reputation Check');

      // Calculate final risk score
      analysis.riskScore = this.calculateRiskScore(analysis);
      analysis.status = this.determineStatus(analysis.riskScore);
      analysis.severity = this.calculateSeverity(analysis.riskScore);
      
      // Add recommendations
      analysis.recommendations = this.generateRecommendations(analysis);

      analysis.processingTime = Date.now() - startTime;

      // Store in threat database
      this.threatDatabase.set(url, analysis);

      return analysis;
    } catch (error) {
      console.error('Analysis error:', error);
      analysis.error = error.message;
      analysis.riskScore = 50; // Default medium risk on error
      analysis.status = 'unknown';
      return analysis;
    }
  }

  // 1. Domain Analysis
  async analyzeDomain(urlObj) {
    const result = { score: 0, threats: [], details: {} };
    const domain = urlObj.hostname;

    // Check domain age (simulated)
    const domainAge = this.estimateDomainAge(domain);
    result.details.domainAge = domainAge;
    
    if (domainAge < 30) {
      result.score += 30;
      result.threats.push('Domain is very new (less than 30 days)');
    }

    // Check suspicious TLD
    const hasSuspiciousTLD = this.suspiciousTLDs.some(tld => domain.endsWith(tld));
    if (hasSuspiciousTLD) {
      result.score += 25;
      result.threats.push('Domain uses suspicious TLD');
    }

    // Check for excessive subdomains
    const subdomainCount = domain.split('.').length - 2;
    if (subdomainCount > 2) {
      result.score += 15;
      result.threats.push('Excessive subdomains detected');
    }

    // Check for IP address in URL
    if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(domain)) {
      result.score += 40;
      result.threats.push('URL uses IP address instead of domain');
    }

    // Check for suspicious characters
    if (/[^a-zA-Z0-9.-]/.test(domain)) {
      result.score += 20;
      result.threats.push('Domain contains suspicious characters');
    }

    return result;
  }

  // 2. IP Intelligence Analysis
  async analyzeIP(hostname) {
    const result = { score: 0, threats: [], details: {} };

    try {
      // Simulate IP lookup (in production, use real IP geolocation API)
      const ipInfo = await this.getIPInfo(hostname);
      result.details = ipInfo;

      // Check if IP is in blacklist
      if (ipInfo.blacklisted) {
        result.score += 50;
        result.threats.push('IP address is blacklisted');
      }

      // Check geolocation mismatch
      if (ipInfo.country && this.isGeolocationSuspicious(hostname, ipInfo.country)) {
        result.score += 25;
        result.threats.push('Geolocation mismatch detected');
      }

      // Check hosting provider
      if (ipInfo.isp && this.isSuspiciousHosting(ipInfo.isp)) {
        result.score += 20;
        result.threats.push('Suspicious hosting provider');
      }

    } catch (error) {
      console.error('IP analysis error:', error);
    }

    return result;
  }

  // 3. Malicious Redirect Detection
  async detectRedirects(url) {
    const result = { score: 0, threats: [], details: { redirectChain: [] } };

    try {
      // Simulate redirect detection (in production, follow redirects)
      const redirectChain = await this.followRedirects(url);
      result.details.redirectChain = redirectChain;
      result.details.redirectCount = redirectChain.length;

      if (redirectChain.length > 3) {
        result.score += 35;
        result.threats.push(`Suspicious redirect chain (${redirectChain.length} redirects)`);
      }

      // Check for domain changes in redirect
      const domains = redirectChain.map(r => new URL(r).hostname);
      const uniqueDomains = [...new Set(domains)];
      
      if (uniqueDomains.length > 2) {
        result.score += 25;
        result.threats.push('Multiple domain changes in redirect chain');
      }

    } catch (error) {
      console.error('Redirect detection error:', error);
    }

    return result;
  }

  // 4. Domain Similarity Detection
  async detectDomainSimilarity(domain) {
    const result = { score: 0, threats: [], details: {} };

    for (const legitDomain of this.legitimateDomains) {
      const similarity = this.calculateSimilarity(domain, legitDomain);
      
      if (similarity > 0.7 && domain !== legitDomain) {
        result.score += 40;
        result.threats.push(`Domain similar to ${legitDomain} (${Math.round(similarity * 100)}% match)`);
        result.details.similarTo = legitDomain;
        result.details.similarityScore = similarity;
        break;
      }
    }

    // Check for common typosquatting patterns
    const typosquatting = this.detectTyposquatting(domain);
    if (typosquatting.detected) {
      result.score += 35;
      result.threats.push(`Possible typosquatting: ${typosquatting.pattern}`);
    }

    return result;
  }

  // 5. Suspicious Pattern Detection
  async detectSuspiciousPatterns(url) {
    const result = { score: 0, threats: [], details: {} };

    // Check against known phishing patterns
    for (const pattern of this.knownPhishingPatterns) {
      if (pattern.test(url)) {
        result.score += 30;
        result.threats.push('URL matches known phishing pattern');
        break;
      }
    }

    // Check for excessive hyphens
    const hyphenCount = (url.match(/-/g) || []).length;
    if (hyphenCount > 3) {
      result.score += 15;
      result.threats.push('Excessive hyphens in URL');
    }

    // Check for @ symbol (credential phishing)
    if (url.includes('@')) {
      result.score += 45;
      result.threats.push('URL contains @ symbol (credential phishing indicator)');
    }

    // Check URL length
    if (url.length > 100) {
      result.score += 10;
      result.threats.push('Unusually long URL');
    }

    return result;
  }

  // 6. Reputation Check
  async checkReputation(domain) {
    const result = { score: 0, threats: [], details: {} };

    // Check local threat database
    const cachedThreat = this.threatDatabase.get(domain);
    if (cachedThreat && cachedThreat.riskScore > 70) {
      result.score += 40;
      result.threats.push('Domain previously flagged as malicious');
    }

    // Simulate external reputation check
    const reputation = await this.getReputationScore(domain);
    result.details.reputation = reputation;

    if (reputation < 30) {
      result.score += 35;
      result.threats.push('Poor domain reputation');
    }

    return result;
  }

  // Helper methods
  combineAnalysis(analysis, result, method) {
    if (result.score > 0) {
      analysis.riskScore += result.score;
      analysis.threats.push(...result.threats);
      analysis.detectionMethods.push(method);
      analysis.details[method] = result.details;
    }
  }

  calculateRiskScore(analysis) {
    // Normalize score to 0-100
    let score = Math.min(analysis.riskScore, 100);
    
    // Apply weights based on threat count
    if (analysis.threats.length > 5) {
      score = Math.min(score * 1.2, 100);
    }

    return Math.round(score);
  }

  determineStatus(riskScore) {
    if (riskScore >= 80) return 'phishing';
    if (riskScore >= 60) return 'suspicious';
    if (riskScore >= 40) return 'warning';
    if (riskScore >= 20) return 'caution';
    return 'safe';
  }

  calculateSeverity(riskScore) {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.riskScore >= 80) {
      recommendations.push('🚫 DO NOT visit this website');
      recommendations.push('⚠️ Block this URL immediately');
      recommendations.push('📧 Report as phishing if received via email');
    } else if (analysis.riskScore >= 60) {
      recommendations.push('⚠️ Exercise extreme caution');
      recommendations.push('🔍 Verify the URL carefully');
      recommendations.push('🛡️ Do not enter sensitive information');
    } else if (analysis.riskScore >= 40) {
      recommendations.push('⚠️ Proceed with caution');
      recommendations.push('🔍 Verify website authenticity');
    } else {
      recommendations.push('✅ URL appears safe');
      recommendations.push('🔍 Always verify before entering credentials');
    }

    return recommendations;
  }

  // Utility methods
  estimateDomainAge(domain) {
    // Simulate domain age (in production, use WHOIS API)
    const hash = crypto.createHash('md5').update(domain).digest('hex');
    const age = parseInt(hash.substring(0, 4), 16) % 365;
    return age;
  }

  async getIPInfo(hostname) {
    // Simulate IP info (in production, use IPinfo.io or similar)
    return {
      ip: '185.203.116.45',
      country: 'Unknown',
      isp: 'Unknown Hosting',
      blacklisted: Math.random() > 0.8,
      reputation: Math.floor(Math.random() * 100)
    };
  }

  isGeolocationSuspicious(domain, country) {
    // Check if domain claims to be from one country but hosted in another
    const domainCountryHints = {
      '.us': 'US',
      '.uk': 'GB',
      '.ca': 'CA',
      '.au': 'AU'
    };

    for (const [tld, expectedCountry] of Object.entries(domainCountryHints)) {
      if (domain.endsWith(tld) && country !== expectedCountry) {
        return true;
      }
    }

    return false;
  }

  isSuspiciousHosting(isp) {
    const suspiciousProviders = ['bulletproof', 'offshore', 'anonymous'];
    return suspiciousProviders.some(provider => 
      isp.toLowerCase().includes(provider)
    );
  }

  async followRedirects(url) {
    // Simulate redirect chain (in production, actually follow redirects)
    const redirectCount = Math.floor(Math.random() * 5);
    const chain = [url];
    
    for (let i = 0; i < redirectCount; i++) {
      chain.push(`${url}/redirect${i}`);
    }
    
    return chain;
  }

  calculateSimilarity(str1, str2) {
    // Levenshtein distance for similarity
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  detectTyposquatting(domain) {
    const patterns = {
      'character_substitution': /[0o1il]/i,
      'character_omission': this.legitimateDomains.some(d => 
        domain.replace(/[a-z]/i, '') === d.replace(/[a-z]/i, '')
      ),
      'character_addition': this.legitimateDomains.some(d => 
        domain.length === d.length + 1
      )
    };

    for (const [pattern, detected] of Object.entries(patterns)) {
      if (detected) {
        return { detected: true, pattern };
      }
    }

    return { detected: false };
  }

  async getReputationScore(domain) {
    // Simulate reputation score (in production, use VirusTotal, etc.)
    return Math.floor(Math.random() * 100);
  }

  // Get threat statistics
  getStatistics() {
    const threats = Array.from(this.threatDatabase.values());
    return {
      totalAnalyzed: threats.length,
      phishing: threats.filter(t => t.status === 'phishing').length,
      suspicious: threats.filter(t => t.status === 'suspicious').length,
      safe: threats.filter(t => t.status === 'safe').length,
      averageRiskScore: threats.reduce((sum, t) => sum + t.riskScore, 0) / threats.length || 0
    };
  }

  // Clear old entries
  clearOldEntries(maxAge = 24 * 60 * 60 * 1000) {
    const now = Date.now();
    for (const [url, analysis] of this.threatDatabase.entries()) {
      const age = now - new Date(analysis.timestamp).getTime();
      if (age > maxAge) {
        this.threatDatabase.delete(url);
      }
    }
  }
}

module.exports = new AdvancedThreatAnalysis();
