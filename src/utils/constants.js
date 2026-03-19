export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PASSWORD: '/auth/password',

  // Keys
  KEYS: '/keys',
  GENERATE_KEY: '/keys/generate',

  // CSR
  CSRS: '/csr',
  CSR_BY_ID: (id) => `/csr/${id}`,

  // Certificates
  CERTIFICATES: '/certificates',
  CERTIFICATE_BY_ID: (id) => `/certificates/${id}`,
  CERTIFICATE_DOWNLOAD: (id) => `/certificates/${id}/download`,
  CERTIFICATE_REVOKE_REQUEST: (id) => `/certificates/${id}/revoke-request`,
  CERTIFICATE_UPLOAD: '/certificates/upload',
  UPLOADED_CERTS: '/certificates/uploaded',

  // Admin - Config
  ADMIN_CONFIG: '/admin/config',

  // Admin - Root CA
  ADMIN_ROOT_CA: '/admin/root-ca',
  ADMIN_ROOT_CA_KEYPAIR: '/admin/root-ca/keypair',
  ADMIN_ROOT_CA_CERT: '/admin/root-ca/certificate',

  // Admin - CSR
  ADMIN_CSRS: '/admin/csr',
  ADMIN_CSR_APPROVE: (id) => `/admin/csr/${id}/approve`,
  ADMIN_CSR_REJECT: (id) => `/admin/csr/${id}/reject`,

  // Admin - Certificates
  ADMIN_CERTIFICATES: '/admin/certificates',
  ADMIN_CERT_REVOKE: (id) => `/admin/certificates/${id}/revoke`,
  ADMIN_CERT_RENEW: (id) => `/admin/certificates/${id}/renew`,

  // Admin - Revocations
  ADMIN_REVOCATIONS: '/admin/revocation-requests',
  ADMIN_REVOCATION_APPROVE: (id) => `/admin/revocation-requests/${id}/approve`,
  ADMIN_REVOCATION_REJECT: (id) => `/admin/revocation-requests/${id}/reject`,

  // Admin - Logs
  ADMIN_LOGS: '/admin/logs',

  // Public
  CRL: '/crl',
}

export const ROLES = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
}

export const CERTIFICATE_STATUS = {
  ACTIVE: 'ACTIVE',
  REVOKED: 'REVOKED',
  EXPIRED: 'EXPIRED',
}

export const CSR_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
}

export const REVOCATION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
}

export const KEY_ALGORITHMS = {
  RSA: 'RSA',
  ECDSA: 'ECDSA',
}

export const KEY_SIZES = {
  RSA_2048: 2048,
  RSA_4096: 4096,
  ECDSA_256: 256,
  ECDSA_384: 384,
}

export const HASH_FUNCTIONS = {
  SHA256: 'SHA-256',
  SHA384: 'SHA-384',
  SHA512: 'SHA-512',
}
