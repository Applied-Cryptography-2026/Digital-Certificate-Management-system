// Backend server (swagger.yaml server: http://localhost:8080)
// Paths are relative: /auth/login, /admin/csrs, etc. — no /api prefix
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Endpoints must match swagger.yaml paths exactly
export const ENDPOINTS = {
  // === Auth ===
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_REFRESH: '/auth/refresh',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_REFRESH: '/admin/refresh',

  // === Customer ===
  CUSTOMER_LOGOUT: '/customer/logout',
  CUSTOMER_CSRS: '/customer/csrs',
  CUSTOMER_CSR_BY_ID: (id) => `/customer/csrs/${id}`,
  CUSTOMER_CSR_DOWNLOAD: (id) => `/customer/csrs/${id}/download`,
  CUSTOMER_CERTS: '/customer/certificates',
  CUSTOMER_CERT_BY_ID: (id) => `/customer/certificates/${id}`,
  CUSTOMER_CERT_DOWNLOAD: (id) => `/customer/certificates/${id}/download`,

  // === Admin ===
  ADMIN_CHANGE_PASSWORD: '/admin/change-password',
  ADMIN_CSRS: '/admin/csrs',
  ADMIN_CSR_BY_ID: (id) => `/admin/csrs/${id}`,
  ADMIN_CSR_APPROVE: (id) => `/admin/csrs/${id}/approve`,
  ADMIN_CSR_REJECT: (id) => `/admin/csrs/${id}/reject`,
  ADMIN_CSR_DOWNLOAD: (id) => `/admin/csrs/${id}/download`,
  ADMIN_CERTS: '/admin/certificates',
  ADMIN_CERT_BY_ID: (id) => `/admin/certificates/${id}`,
  ADMIN_CERT_DOWNLOAD: (id) => `/admin/certificates/${id}/download`,
  ADMIN_CERT_REVOKE: (id) => `/admin/certificates/${id}/revoke`,
  ADMIN_CERT_EXPIRING: '/admin/certificates/expiring',
  ADMIN_CERT_VALIDATE: '/admin/certificates/validate',

  // === Root CA ===
  ROOT_CA: '/admin/root-ca',
  ROOT_CA_CERT_PEM: '/admin/root-ca/cert.pem',
  ROOT_CA_KEY_PEM: '/admin/root-ca/key.pem',
  ROOT_CA_GENERATE: '/admin/root-ca/generate',
  ROOT_CA_TEST: '/admin/root-ca/test',

  // === Customer Key Pairs ===
  KEY_PAIRS: '/customer/key-pairs',
  KEY_PAIR_BY_ID: (id) => `/customer/key-pairs/${id}`,
  KEY_PAIR_KEY_PEM: (id) => `/customer/key-pairs/${id}/key.pem`,

  // === Revocation Requests ===
  CUSTOMER_REVOCATIONS: '/customer/revocations',
  CUSTOMER_REVOCATION_BY_ID: (id) => `/customer/revocations/${id}`,
  ADMIN_REVOCATIONS: '/admin/revocations',
  ADMIN_REVOCATION_APPROVE: (id) => `/admin/revocations/${id}/approve`,
  ADMIN_REVOCATION_REJECT: (id) => `/admin/revocations/${id}/reject`,
  ADMIN_REVOCATION_REVOKE: (id) => `/admin/revocations/${id}/revoke`,

  // === CRL ===
  ADMIN_CRL_REVOKED: '/admin/crl/revoked',
  ADMIN_CRL_GENERATE: '/admin/crl/generate',
}

export const ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
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
