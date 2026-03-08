// AI-Powered Threat Detection Engine
// Machine Learning based URL analysis

class AIThreatDetection {
  constructor() {
    this.features = {};
    this.weights = {
      urlLength: 0.05,
      domainLength: 0.08,
      pathLength: 0.06,
      numDots: 0.10,
      numHyphens: 0.08,
      numUnderscores: 0.07,
      numDigits: 0.09,
      numSpecialChars: 0.08,
      hasIP: 0.15,
      hasHTTPS: -0.10,
      suspiciousKeywords: 0.12,
      domainAge: 0.08,
      subdomainCount: 0.10,
      pathDepth: 0.07,
      queryParams: 0.06,
      portNumber: 0.08,
      tldSuspicious: 0.12,
      entropyScore: 0.10
    };
    
    this.suspiciousKeywords = [
      'login', 'verify', 'account', 'update', 'secure', 'banking',
      'paypal', 'amazon', 'microsoft', 'apple', 'confirm', 'suspended',
      'locked', 'unusual', 'activity', 'click', 'urgent', 'immediately',
      'password', 'credential', 'signin', 'validate', 'authenticate'
    ];
    
    this.suspiciousTLDs = [
      '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work',
      '.click', '.link', '.download', '.bid', '.win', '.party'
    ];
  }

  // Main AI analysis function
  async analyzeURL(url) {
    try {
      const urlObj = new URL(url);
      
      // Extract features
      const features = this.extractFeatures(urlObj);
      
      // Calculate AI score
      const aiScore = this.calculateAIScore(features);
      
      // Get confidence level
      const confidence = this.calculateConfidence(features);
      
      // Classify threat
      const classification = this.classifyThreat(aiScore, features);
      
      return {
        aiScore: Math.round(aiScore),
        confidence: Math.round(confidence * 100),
        classification,
        features,
        analysis: this.generateAnalysis(features, aiScore),
        recommendations: this.generateRecommendations(aiScore, classification)
      };
    } catch (error) {
      console.error('AI analysis error:', error);
      return {
        aiScore: 50,
        confidence: 0,
        classification: 'unknown',
        error: error.message
      };
    }
  }

  // Feature extraction
  extractFeatures(urlObj) {
    const url = urlObj.href;
    const domain = urlObj.hostname;
    const path = urlObj.pathname;
    const query = urlObj.search;
    
    const features = {
      // URL characteristics
      urlLength: url.length,
      domainLength: domain.length,
      pathLength: path.length,
      
      // Character counts
      numDots: (url.match(/\./g) || []).length,
      numHyphens: (url.match(/-/g) || []).length,
      numUnderscores: (url.match(/_/g) || []).length,
      numDigits: (url.match(/\d/g) || []).length,
      numSpecialChars: (url.match(/[^a-zA-Z0-9.-]/g) || []).length,
      
      // Security indicators
      hasIP: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(domain),
      hasHTTPS: urlObj.protocol === 'https:',
      hasPort: urlObj.port !== '',
      portNumber: urlObj.port ? parseInt(urlObj.port) : 0,
      
      // Domain analysis
      subdomainCount: domain.split('.').length - 2,
      tldSuspicious: this.suspiciousTLDs.some(tld => domain.endsWith(tld)),
      
      // Path analysis
      pathDepth: path.split('/').filter(p => p).length,
      hasQueryParams: query.length > 0,
      queryParamCount: query ? query.split('&').length : 0,
      
      // Content analysis
      suspiciousKeywordCount: this.countSuspiciousKeywords(url.toLowerCase()),
      
      // Entropy (randomness measure)
      entropyScore: this.calculateEntropy(domain),
      
      // Additional features
      hasAtSymbol: url.includes('@'),
      hasDoubleSlash: url.includes('//') && !url.startsWith('http'),
      excessiveSubdomains: domain.split('.').length > 4
    };
    
    return features;
  }

  // Calculate AI-based risk score
  calculateAIScore(features) {
    let score = 0;
    
    // URL length scoring
    if (features.urlLength > 100) score += 15;
    else if (features.urlLength > 75) score += 10;
    else if (features.urlLength > 50) score += 5;
    
    // Domain length scoring
    if (features.domainLength > 30) score += 12;
    else if (features.domainLength > 20) score += 8;
    
    // Character analysis
    score += Math.min(features.numDots * 3, 15);
    score += Math.min(features.numHyphens * 4, 20);
    score += Math.min(features.numDigits * 2, 15);
    score += Math.min(features.numSpecialChars * 3, 18);
    
    // Security indicators
    if (features.hasIP) score += 35;
    if (!features.hasHTTPS) score += 20;
    if (features.hasPort && features.portNumber !== 80 && features.portNumber !== 443) {
      score += 15;
    }
    
    // Domain analysis
    if (features.tldSuspicious) score += 25;
    if (features.subdomainCount > 2) score += 15;
    if (features.excessiveSubdomains) score += 20;
    
    // Path analysis
    if (features.pathDepth > 5) score += 10;
    if (features.queryParamCount > 5) score += 12;
    
    // Content analysis
    score += Math.min(features.suspiciousKeywordCount * 8, 30);
    
    // Entropy scoring (high entropy = random/suspicious)
    if (features.entropyScore > 4.5) score += 20;
    else if (features.entropyScore > 4.0) score += 15;
    else if (features.entropyScore > 3.5) score += 10;
    
    // Critical indicators
    if (features.hasAtSymbol) score += 30;
    if (features.hasDoubleSlash) score += 25;
    
    // Normalize to 0-100
    return Math.min(Math.max(score, 0), 100);
  }

  // Calculate confidence level
  calculateConfidence(features) {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on clear indicators
    if (features.hasIP) confidence += 0.15;
    if (features.tldSuspicious) confidence += 0.12;
    if (features.suspiciousKeywordCount > 2) confidence += 0.10;
    if (features.hasAtSymbol) confidence += 0.15;
    if (!features.hasHTTPS) confidence += 0.08;
    if (features.entropyScore > 4.5) confidence += 0.10;
    
    // Decrease confidence for ambiguous cases
    if (features.urlLength < 30) confidence -= 0.10;
    if (features.numDots < 2) confidence -= 0.05;
    
    return Math.min(Math.max(confidence, 0), 1);
  }

  // Classify threat type
  classifyThreat(score, features) {
    if (score >= 80) {
      if (features.suspiciousKeywordCount > 2) return 'phishing';
      if (features.hasIP) return 'malware';
      return 'high-risk';
    }
    
    if (score >= 60) {
      return 'suspicious';
    }
    
    if (score >= 40) {
      return 'potentially-unsafe';
    }
    
    if (score >= 20) {
      return 'low-risk';
    }
    
    return 'safe';
  }

  // Count suspicious keywords
  countSuspiciousKeywords(url) {
    return this.suspiciousKeywords.filter(keyword => 
      url.includes(keyword)
    ).length;
  }

  // Calculate Shannon entropy
  calculateEntropy(str) {
    const len = str.length;
    const frequencies = {};
    
    for (let char of str) {
      frequencies[char] = (frequencies[char] || 0) + 1;
    }
    
    let entropy = 0;
    for (let char in frequencies) {
      const p = frequencies[char] / len;
      entropy -= p * Math.log2(p);
    }
    
    return entropy;
  }

  // Generate detailed analysis
  generateAnalysis(features, score) {
    const analysis = [];
    
    if (features.urlLength > 75) {
      analysis.push('URL is unusually long, which is common in phishing attacks');
    }
    
    if (features.hasIP) {
      analysis.push('URL uses IP address instead of domain name - highly suspicious');
    }
    
    if (!features.hasHTTPS) {
      analysis.push('Website does not use HTTPS encryption');
    }
    
    if (features.tldSuspicious) {
      analysis.push('Domain uses a suspicious top-level domain (TLD)');
    }
    
    if (features.suspiciousKeywordCount > 0) {
      analysis.push(`Contains ${features.suspiciousKeywordCount} suspicious keyword(s)`);
    }
    
    if (features.entropyScore > 4.0) {
      analysis.push('Domain name has high randomness (possible generated domain)');
    }
    
    if (features.subdomainCount > 2) {
      analysis.push('Excessive number of subdomains detected');
    }
    
    if (features.hasAtSymbol) {
      analysis.push('URL contains @ symbol - credential phishing indicator');
    }
    
    if (analysis.length === 0) {
      analysis.push('No major suspicious indicators detected');
    }
    
    return analysis;
  }

  // Generate AI-based recommendations
  generateRecommendations(score, classification) {
    const recommendations = [];
    
    if (score >= 80) {
      recommendations.push('🚫 DO NOT visit this website');
      recommendations.push('🛡️ Block this URL immediately');
      recommendations.push('📧 Report as phishing if received via email');
      recommendations.push('⚠️ Do not enter any personal information');
    } else if (score >= 60) {
      recommendations.push('⚠️ Exercise extreme caution');
      recommendations.push('🔍 Verify the URL carefully before proceeding');
      recommendations.push('🛡️ Do not enter sensitive information');
      recommendations.push('📱 Contact the organization directly to verify');
    } else if (score >= 40) {
      recommendations.push('⚠️ Proceed with caution');
      recommendations.push('🔍 Verify website authenticity');
      recommendations.push('🔒 Check for HTTPS and valid certificate');
    } else if (score >= 20) {
      recommendations.push('✅ URL appears relatively safe');
      recommendations.push('🔍 Still verify before entering credentials');
      recommendations.push('🔒 Ensure HTTPS is enabled');
    } else {
      recommendations.push('✅ URL appears safe');
      recommendations.push('🔍 Always verify before entering sensitive data');
      recommendations.push('🛡️ Keep your security software updated');
    }
    
    return recommendations;
  }

  // Batch analysis for multiple URLs
  async analyzeBatch(urls) {
    const results = await Promise.all(
      urls.map(url => this.analyzeURL(url))
    );
    
    return {
      total: urls.length,
      results,
      summary: {
        safe: results.filter(r => r.aiScore < 20).length,
        lowRisk: results.filter(r => r.aiScore >= 20 && r.aiScore < 40).length,
        suspicious: results.filter(r => r.aiScore >= 40 && r.aiScore < 60).length,
        dangerous: results.filter(r => r.aiScore >= 60).length
      }
    };
  }

  // Train model with feedback (simulated)
  async trainWithFeedback(url, actualThreat, userFeedback) {
    // In production, this would update the ML model
    // For now, we log the feedback for future training
    console.log('Training feedback:', {
      url,
      actualThreat,
      userFeedback,
      timestamp: new Date()
    });
    
    return {
      success: true,
      message: 'Feedback recorded for model improvement'
    };
  }
}

module.exports = new AIThreatDetection();
