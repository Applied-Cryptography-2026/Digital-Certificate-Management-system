/**
 * X.509 Certificate Parser Utilities
 * Note: In production, use a library like node-forge or asn1.js
 * These are helper functions for working with certificate data
 */

export function parsePEM(pemString) {
  // Extract certificate from PEM format
  const certMatch = pemString.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/)
  if (!certMatch) {
    throw new Error('Invalid PEM format')
  }
  return certMatch[0]
}

export function extractSubjectDN(cert) {
  // Placeholder - in production use proper ASN.1 parsing
  return {
    commonName: cert.commonName || '',
    organization: cert.organization || '',
    organizationalUnit: cert.organizationalUnit || '',
    country: cert.country || '',
  }
}

export function getCertificateFingerprint(cert, hashAlgo = 'SHA256') {
  // Generate certificate fingerprint
  // In production, compute actual hash of DER-encoded certificate
  return `${hashAlgo}:${cert.serialNumber || 'unknown'}`
}

export function isCertificateExpired(notAfter) {
  return new Date(notAfter) < new Date()
}

export function isCertificateValid(notBefore, notAfter) {
  const now = new Date()
  return new Date(notBefore) <= now && new Date(notAfter) >= now
}

export function formatSubjectDN(subject) {
  const parts = []
  if (subject.CN) parts.push(`CN=${subject.CN}`)
  if (subject.O) parts.push(`O=${subject.O}`)
  if (subject.OU) parts.push(`OU=${subject.OU}`)
  if (subject.C) parts.push(`C=${subject.C}`)
  return parts.join(', ')
}
