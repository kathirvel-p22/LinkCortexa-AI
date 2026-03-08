const axios = require('axios');
const dns = require('dns').promises;
const { URL } = require('url');

// ─── Feature Extraction for ML ───────────────────────────────────────────────
function extractURLFeatures(url) {
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname;
    const fullUrl = url.toLowerCase();
    return {
      url_length: url.length,
      domain_length: domain.length,
      has_ip: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(domain) ? 1 : 0,
      num_dots: (url.match(/\./g) || []).length,
      num_hyphens: (url.match(/-/g) || []).length,
      num_at: (url.match(/@/g) || []).length,
      num_question: (url.match(/\?/g) || []).length,
      num_ampersand: (url.match(/&/g) || []).length,
      num_slash: (url.match(/\//g) || []).length,
      num_digits: (url.match(/\d/g) || []).length,
      has_https: parsed.protocol === 'https:' ? 1 : 0,
      has_http: parsed.protocol === 'http:' ? 1 : 0,
      subdomain_count: domain.split('.').length - 2,
      has_suspicious_keywords: ['login','verify','secure','update','confirm','bank','paypal',
        'account','password','signin','credential','suspended','unusual','activity',
        'validate','click','free','prize','winner','urgent'].some(kw => fullUrl.includes(kw)) ? 1 : 0,
      path_length: parsed.pathname.length,
      has_port: parsed.port ? 1 : 0,
      double_slash: url.includes('//') ? 1 : 0,
      hex_chars: (url.match(/%[0-9a-f]{2}/gi) || []).length,
      tld_suspicious: ['.xyz','.tk','.ml','.ga','.cf','.click','.top','.work','.date',
        '.loan','.review','.men','.download'].some(t => domain.endsWith(t)) ? 1 : 0
    };
  } catch {
    return null;
  }
}

// ─── ML Risk Score (Rule-based since no Python server) ───────────────────────
function calculateMLScore(features) {
  if (!features) return { score: 50, label: 'unknown', confidence: 0.5 };
  let score = 0;
  const weights = {
    has_ip: 25, has_suspicious_keywords: 20, tld_suspicious: 18,
    num_at: 15, double_slash: 8, has_http: 10, hex_chars: 5,
    subdomain_count: 3, num_hyphens: 2, has_port: 5
  };
  for (const [feature, weight] of Object.entries(weights)) {
    const val = features[feature] || 0;
    if (feature === 'subdomain_count') score += Math.min(val * weight, 12);
    else if (feature === 'hex_chars') score += Math.min(val * weight, 15);
    else if (feature === 'num_at') score += Math.min(val * 15, 20);
    else score += val > 0 ? weight : 0;
  }
  if (features.url_length > 100) score += 10;
  if (features.url_length > 150) score += 10;
  if (features.num_dots > 5) score += 8;
  score = Math.min(100, Math.max(0, score));
  const label = score >= 70 ? 'phishing' : score >= 40 ? 'suspicious' : 'safe';
  return { score, label, confidence: 0.75, features };
}

// ─── Domain/IP Extraction ─────────────────────────────────────────────────────
async function getDomainInfo(url) {
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname;
    let ip = null;
    try {
      const result = await dns.lookup(domain);
      ip = result.address;
    } catch {}
    return { domain, ip };
  } catch {
    return { domain: url, ip: null };
  }
}

// ─── VirusTotal API ───────────────────────────────────────────────────────────
async function checkVirusTotal(url) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey || apiKey === 'your_virustotal_free_api_key') {
    return { available: false, message: 'API key not configured' };
  }
  try {
    const encoded = Buffer.from(url).toString('base64').replace(/=/g, '');
    const res = await axios.get(`https://www.virustotal.com/api/v3/urls/${encoded}`, {
      headers: { 'x-apikey': apiKey }, timeout: 8000
    });
    const stats = res.data.data.attributes.last_analysis_stats;
    return {
      available: true,
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      harmless: stats.harmless || 0,
      total: Object.values(stats).reduce((a, b) => a + b, 0),
      riskContribution: Math.min(((stats.malicious * 10) + (stats.suspicious * 5)), 40)
    };
  } catch (e) {
    return { available: false, error: e.message };
  }
}

// ─── AbuseIPDB API ────────────────────────────────────────────────────────────
async function checkAbuseIPDB(ip) {
  const apiKey = process.env.ABUSEIPDB_API_KEY;
  if (!apiKey || apiKey === 'your_abuseipdb_free_api_key' || !ip) {
    return { available: false, message: 'API key not configured or no IP' };
  }
  try {
    const res = await axios.get('https://api.abuseipdb.com/api/v2/check', {
      headers: { Key: apiKey, Accept: 'application/json' },
      params: { ipAddress: ip, maxAgeInDays: 90 },
      timeout: 8000
    });
    const data = res.data.data;
    return {
      available: true,
      abuseScore: data.abuseConfidenceScore,
      totalReports: data.totalReports,
      country: data.countryCode,
      isp: data.isp,
      usageType: data.usageType,
      riskContribution: Math.min(data.abuseConfidenceScore * 0.3, 30)
    };
  } catch (e) {
    return { available: false, error: e.message };
  }
}

// ─── Google Safe Browsing API ─────────────────────────────────────────────────
async function checkGoogleSafeBrowsing(url) {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_KEY;
  if (!apiKey || apiKey === 'your_google_safe_browsing_key') {
    return { available: false, message: 'API key not configured' };
  }
  try {
    const res = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        client: { clientId: 'linkcortexa', clientVersion: '1.0.0' },
        threatInfo: {
          threatTypes: ['MALWARE','SOCIAL_ENGINEERING','UNWANTED_SOFTWARE','POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }]
        }
      },
      { timeout: 8000 }
    );
    const isThreaten = res.data.matches && res.data.matches.length > 0;
    return {
      available: true,
      isThreat: isThreaten,
      threatTypes: isThreaten ? res.data.matches.map(m => m.threatType) : [],
      riskContribution: isThreaten ? 35 : 0
    };
  } catch (e) {
    return { available: false, error: e.message };
  }
}

// ─── URLhaus (abuse.ch) - FREE no key needed ──────────────────────────────────
async function checkURLhaus(url) {
  try {
    const res = await axios.post('https://urlhaus-api.abuse.ch/v1/url/', 
      `urls=${encodeURIComponent(url)}`,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 8000 }
    );
    const data = res.data;
    return {
      available: true,
      queryStatus: data.query_status,
      isMalicious: data.query_status === 'is_blacklisted',
      threat: data.threat || null,
      riskContribution: data.query_status === 'is_blacklisted' ? 30 : 0
    };
  } catch (e) {
    return { available: false, error: e.message };
  }
}

// ─── IPinfo - FREE 50k/month ──────────────────────────────────────────────────
async function getIPInfo(ip) {
  const token = process.env.IPINFO_TOKEN;
  if (!ip) return { available: false };
  try {
    const url = token && token !== 'your_ipinfo_free_token'
      ? `https://ipinfo.io/${ip}/json?token=${token}`
      : `https://ipinfo.io/${ip}/json`;
    const res = await axios.get(url, { timeout: 8000 });
    const data = res.data;
    const [lat, lon] = (data.loc || '0,0').split(',').map(Number);
    return { available: true, country: data.country, city: data.city, org: data.org, isp: data.org, lat, lon, timezone: data.timezone };
  } catch (e) {
    return { available: false, error: e.message };
  }
}

// ─── Master Analysis Function ─────────────────────────────────────────────────
async function analyzeURL(url) {
  const startTime = Date.now();
  const features = extractURLFeatures(url);
  const mlResult = calculateMLScore(features);
  const { domain, ip } = await getDomainInfo(url);

  const [vtResult, abuseResult, gsbResult, urlhausResult, ipInfoResult] = await Promise.allSettled([
    checkVirusTotal(url),
    checkAbuseIPDB(ip),
    checkGoogleSafeBrowsing(url),
    checkURLhaus(url),
    getIPInfo(ip)
  ]);

  const apiResults = {
    virusTotal: vtResult.value || { available: false },
    abuseIPDB: abuseResult.value || { available: false },
    googleSafeBrowsing: gsbResult.value || { available: false },
    urlhaus: urlhausResult.value || { available: false },
    ipInfo: ipInfoResult.value || { available: false }
  };

  // Calculate composite risk score
  let finalScore = mlResult.score * 0.4;
  if (apiResults.virusTotal.available) finalScore += (apiResults.virusTotal.riskContribution || 0) * 0.25;
  if (apiResults.abuseIPDB.available) finalScore += (apiResults.abuseIPDB.riskContribution || 0) * 0.15;
  if (apiResults.googleSafeBrowsing.available) finalScore += (apiResults.googleSafeBrowsing.riskContribution || 0) * 0.1;
  if (apiResults.urlhaus.available) finalScore += (apiResults.urlhaus.riskContribution || 0) * 0.1;

  // Normalize
  finalScore = Math.min(100, Math.max(0, Math.round(finalScore)));

  const status = finalScore >= 70 ? 'phishing' : finalScore >= 40 ? 'suspicious' : 'safe';
  const threatTypes = [];
  if (apiResults.googleSafeBrowsing.isThreat) threatTypes.push(...apiResults.googleSafeBrowsing.threatTypes);
  if (apiResults.urlhaus.isMalicious) threatTypes.push('malware');
  if (mlResult.label === 'phishing') threatTypes.push('phishing');
  if (apiResults.abuseIPDB.abuseScore > 50) threatTypes.push('malicious_ip');

  return {
    url, domain, ip,
    riskScore: finalScore,
    status,
    threatTypes: [...new Set(threatTypes)],
    mlPrediction: mlResult,
    apiResults,
    geoLocation: apiResults.ipInfo.available ? {
      country: apiResults.ipInfo.country,
      city: apiResults.ipInfo.city,
      lat: apiResults.ipInfo.lat,
      lon: apiResults.ipInfo.lon,
      isp: apiResults.ipInfo.isp,
      org: apiResults.ipInfo.org
    } : null,
    analysisTime: Date.now() - startTime,
    timestamp: new Date()
  };
}

module.exports = { analyzeURL, extractURLFeatures, calculateMLScore };
