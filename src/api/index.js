/**
 * api/index.js — axios-based API layer for x509_fe
 *
 * All endpoints are defined per swagger.yaml (x509_mvc).
 * Uses the shared axios instance (client.js) which handles:
 *   - baseURL (http://localhost:8080)
 *   - Bearer token injection
 *   - 401 → /login redirect
 *
 * Every method returns:  Promise<{ data, status }>
 * Errors are propagated with the full axios error object.
 */

import api from './client'
import {
  API_BASE_URL,
  ENDPOINTS,
} from '../utils/constants'

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Wrap a successful axios response into { data } for convenience */
const ok = (res) => ({ data: res.data, status: res.status })

/** Throw normalised error so callers always get { message, status, data } */
const err = (axiosError) => {
  const message =
    axiosError.response?.data?.error ||
    axiosError.response?.data?.message ||
    axiosError.message ||
    'Unknown error'
  const status = axiosError.response?.status || 0
  const data = axiosError.response?.data
  return Promise.reject({ message, status, data })
}

/** Short-hand GET / POST / DELETE wrappers */
const get  = (url, params) => api.get(url, { params }).then(ok).catch(err)
const post = (url, data, params) =>
  api.post(url, data, { params }).then(ok).catch(err)
const del  = (url) => api.delete(url).then(ok).catch(err)

// ── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  /**
   * POST /auth/register
   * @param {{ username, password, name?, email? }} body
   */
  register: (body) =>
    post(ENDPOINTS.AUTH_REGISTER, body),

  /**
   * POST /auth/login
   * @param {{ username, password }} body
   * @returns {{ data: { access_token, expires_in } }}
   */
  login: (body) =>
    post(ENDPOINTS.AUTH_LOGIN, body),

  /**
   * POST /auth/refresh — refresh customer access token
   */
  refreshToken: () =>
    post(ENDPOINTS.AUTH_REFRESH),
}

// ── Admin Auth API ───────────────────────────────────────────────────────────

export const adminAuthApi = {
  /**
   * POST /admin/login
   * @param {{ username, password }} body
   * @returns {{ data: { access_token, expires_in } }}
   */
  login: (body) =>
    post(ENDPOINTS.ADMIN_LOGIN, body),

  /**
   * POST /admin/refresh — refresh admin access token
   */
  refreshToken: () =>
    post(ENDPOINTS.ADMIN_REFRESH),
}

// ── Customer API ────────────────────────────────────────────────────────────

export const customerApi = {
  /**
   * POST /customer/logout
   */
  logout: () =>
    post(ENDPOINTS.CUSTOMER_LOGOUT),

  // ── CSRs ────────────────────────────────────────────────────────────────

  /**
   * POST /customer/csrs — submit a new CSR
   * @param {{ common_name, key_pair_id, dns_names?, ip_addresses? }} body
   *   key_pair_id is required (ID of a customer-owned key pair)
   */
  submitCSR: (body) =>
    post(ENDPOINTS.CUSTOMER_CSRS, body),

  /**
   * GET /customer/csrs — list current customer's CSRs
   */
  listCSRs: () =>
    get(ENDPOINTS.CUSTOMER_CSRS),

  /**
   * GET /customer/csrs/{id}
   * @param {number} id
   */
  getCSR: (id) =>
    get(ENDPOINTS.CUSTOMER_CSR_BY_ID(id)),

  /**
   * GET /customer/csrs/{id}/download — download CSR PEM file
   * @param {number} id
   */
  downloadCSR: (id) => {
    const token = localStorage.getItem('token')
    const url = API_BASE_URL + ENDPOINTS.CUSTOMER_CSR_DOWNLOAD(id)
    return fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (!res.ok) throw new Error('Failed to download CSR')
      return res.blob()
    })
  },

  // ── Certificates ─────────────────────────────────────────────────────────

  /**
   * GET /customer/certificates — list current customer's certificates
   */
  listCertificates: () =>
    get(ENDPOINTS.CUSTOMER_CERTS),

  /**
   * GET /customer/certificates/{id}
   * @param {number} id
   */
  getCertificate: (id) =>
    get(ENDPOINTS.CUSTOMER_CERT_BY_ID(id)),

  /**
   * GET /customer/certificates/{id}/download — download cert PEM file
   * @param {number} id
   */
  downloadCertificate: (id) => {
    const token = localStorage.getItem('token')
    const url = API_BASE_URL + ENDPOINTS.CUSTOMER_CERT_DOWNLOAD(id)
    return fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (!res.ok) throw new Error('Failed to download certificate')
      return res.blob()
    })
  },

  // ── Revocation Requests ─────────────────────────────────────────────────

  /**
   * GET /customer/revocations — list my revocation requests
   */
  listRevocations: () =>
    get(ENDPOINTS.CUSTOMER_REVOCATIONS),

  /**
   * POST /customer/revocations — submit a revocation request
   * @param {{ certificate_id, reason }} body
   */
  submitRevocation: (body) =>
    post(ENDPOINTS.CUSTOMER_REVOCATIONS, body),

  /**
   * DELETE /customer/revocations/:id — cancel my pending revocation request
   * @param {number} id
   */
  cancelRevocation: (id) =>
    del(ENDPOINTS.CUSTOMER_REVOCATION_BY_ID(id)),
}

// ── Admin API ───────────────────────────────────────────────────────────────

export const adminApi = {
  /**
   * POST /admin/change-password
   * @param {{ current_password, new_password }} body
   */
  changePassword: (body) =>
    post(ENDPOINTS.ADMIN_CHANGE_PASSWORD, body),

  // ── CSRs ──────────────────────────────────────────────────────────────────

  /**
   * GET /admin/csrs — list all CSRs, optionally filtered by status
   * @param {'pending'|'approved'|'rejected'} [status]
   */
  listCSRs: (status) =>
    get(ENDPOINTS.ADMIN_CSRS, status ? { status } : {}),

  /**
   * GET /admin/csrs/{id}
   * @param {number} id
   */
  getCSR: (id) =>
    get(ENDPOINTS.ADMIN_CSR_BY_ID(id)),

  /**
   * POST /admin/csrs/{id}/approve — approve CSR and issue certificate
   * @param {number} id
   * @param {{ approver_id?: number }} [body]
   */
  approveCSR: (id, body = {}) =>
    post(ENDPOINTS.ADMIN_CSR_APPROVE(id), body),

  /**
   * POST /admin/csrs/{id}/reject — reject a CSR
   * @param {number} id
   * @param {{ notes?: string }} [body]
   */
  rejectCSR: (id, body = {}) =>
    post(ENDPOINTS.ADMIN_CSR_REJECT(id), body),

  /**
   * GET /admin/csrs/{id}/download — download CSR PEM file
   * @param {number} id
   */
  downloadCSR: (id) => {
    const token = localStorage.getItem('token')
    const url = API_BASE_URL + ENDPOINTS.ADMIN_CSR_DOWNLOAD(id)
    return fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (!res.ok) throw new Error('Failed to download CSR')
      return res.blob()
    })
  },

  // ── Certificates ──────────────────────────────────────────────────────────

  /**
   * GET /admin/certificates — list all certificates
   */
  listCertificates: () =>
    get(ENDPOINTS.ADMIN_CERTS),

  /**
   * POST /admin/certificates — import a certificate (PEM)
   * @param {{ cert_pem, key_pem }} body
   */
  importCertificate: (body) =>
    post(ENDPOINTS.ADMIN_CERTS, body),

  /**
   * GET /admin/certificates/{id}
   * @param {number} id
   */
  getCertificate: (id) =>
    get(ENDPOINTS.ADMIN_CERT_BY_ID(id)),

  /**
   * DELETE /admin/certificates/{id} — soft-delete a certificate
   * @param {number} id
   */
  deleteCertificate: (id) =>
    del(ENDPOINTS.ADMIN_CERT_BY_ID(id)),

  /**
   * GET /admin/certificates/{id}/download — download cert PEM file
   * @param {number} id
   */
  downloadCertificate: (id) => {
    const token = localStorage.getItem('token')
    const url = API_BASE_URL + ENDPOINTS.ADMIN_CERT_DOWNLOAD(id)
    return fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (!res.ok) throw new Error('Failed to download certificate')
      return res.blob()
    })
  },

  /**
   * GET /admin/certificates/expiring?days={days}
   * @param {number} days
   */
  getExpiringCertificates: (days) =>
    get(ENDPOINTS.ADMIN_CERT_EXPIRING, { days }),

  /**
   * POST /admin/certificates/validate — validate a PEM certificate
   * @param {{ cert_pem }} body
   */
  validateCertificate: (body) =>
    post(ENDPOINTS.ADMIN_CERT_VALIDATE, body),

  // ── Root CA ────────────────────────────────────────────────────────────

  /**
   * GET /admin/root-ca — get current Root CA details
   */
  getRootCA: () => get(ENDPOINTS.ROOT_CA),

  /**
   * POST /admin/root-ca/generate — generate a new Root CA
   * @param {{ common_name, organization, country, algorithm, key_size, years }} body
   */
  generateRootCA: (body) => post(ENDPOINTS.ROOT_CA_GENERATE, body),

  /**
   * GET /admin/root-ca/cert.pem — download the Root CA certificate PEM file
   */
  downloadCertPEM: async () => {
    const token = localStorage.getItem('token')
    const url = API_BASE_URL + ENDPOINTS.ROOT_CA_CERT_PEM
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Failed to download certificate')
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'root-ca.crt'
    a.click()
    URL.revokeObjectURL(a.href)
  },

  /**
   * GET /admin/root-ca/key.pem — download the Root CA private key PEM file
   */
  downloadKeyPEM: async () => {
    const token = localStorage.getItem('token')
    const url = API_BASE_URL + ENDPOINTS.ROOT_CA_KEY_PEM
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Failed to download key')
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'root-ca-key.pem'
    a.click()
    URL.revokeObjectURL(a.href)
  },

  /**
   * POST /admin/root-ca/test — run TLS handshake test
   */
  testTLS: () => post(ENDPOINTS.ROOT_CA_TEST, {}),

  // ── Revocation Requests ─────────────────────────────────────────────────

  /**
   * GET /admin/revocations — list all revocation requests (filter: ?status=pending)
   */
  listRevocations: (status) =>
    get(ENDPOINTS.ADMIN_REVOCATIONS, status ? { status } : {}),

  /**
   * POST /admin/revocations/:id/approve — approve a revocation request
   * @param {number} id
   * @param {{ notes?: string }} body
   */
  approveRevocation: (id, body = {}) =>
    post(ENDPOINTS.ADMIN_REVOCATION_APPROVE(id), body),

  /**
   * POST /admin/revocations/:id/reject — reject a revocation request
   * @param {number} id
   * @param {{ notes?: string }} body
   */
  rejectRevocation: (id, body = {}) =>
    post(ENDPOINTS.ADMIN_REVOCATION_REJECT(id), body),

  /**
   * POST /admin/revocations/:id/revoke — directly revoke a certificate (admin bypass, no request needed)
   * @param {number} id  certificate_id
   * @param {{ notes?: string }} body
   */
  revokeDirectly: (id, body = {}) =>
    post(ENDPOINTS.ADMIN_REVOCATION_REVOKE(id), body),

  // ── CRL ─────────────────────────────────────────────────────────────────

  /**
   * GET /admin/crl/revoked — list all revoked certificates
   */
  listRevoked: () => get(ENDPOINTS.ADMIN_CRL_REVOKED),

  /**
   * GET /admin/crl/generate — download the CRL PEM file
   */
  downloadCRL: async () => {
    const token = localStorage.getItem('token')
    const res = await fetch(API_BASE_URL + ENDPOINTS.ADMIN_CRL_GENERATE, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Failed to generate CRL')
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `root-ca-${new Date().toISOString().slice(0, 10)}.crl.pem`
    a.click()
    URL.revokeObjectURL(a.href)
  },
}

// ── Public API ───────────────────────────────────────────────────────────────

export const publicApi = {
  /**
   * GET /admin/crl/generate — download the CRL (public endpoint for CRL distribution)
   */
  downloadCRL: async () => {
    const res = await fetch(API_BASE_URL + ENDPOINTS.ADMIN_CRL_GENERATE)
    if (!res.ok) throw new Error('Failed to download CRL')
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'root-ca.crl.pem'
    a.click()
    URL.revokeObjectURL(a.href)
  },
}

// ── Customer Key Pair API ────────────────────────────────────────────────────

export const keyPairApi = {
  /**
   * GET /customer/key-pairs — list all key pairs for the authenticated customer
   */
  list: () => get(ENDPOINTS.KEY_PAIRS),

  /**
   * GET /customer/key-pairs/{id} — get a single key pair (includes public key PEM)
   * @param {number} id
   */
  getById: (id) => get(ENDPOINTS.KEY_PAIR_BY_ID(id)),

  /**
   * POST /customer/key-pairs — generate a new key pair
   * @param {{ name, algorithm, key_size }} body
   * @returns {{ data: { id, name, algorithm, key_size, fingerprint, private_key_pem, created_at } }}
   */
  generate: (body) => post(ENDPOINTS.KEY_PAIRS, body),

  /**
   * DELETE /customer/key-pairs/{id} — delete a key pair
   * @param {number} id
   */
  delete: (id) => del(ENDPOINTS.KEY_PAIR_BY_ID(id)),

  /**
   * GET /customer/key-pairs/{id}/key.pem — download private key PEM file
   * @param {number} id
   */
  downloadKeyPEM: (id) => {
    const token = localStorage.getItem('token')
    const url = API_BASE_URL + ENDPOINTS.KEY_PAIR_KEY_PEM(id)
    return fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (!res.ok) throw new Error('Failed to download private key')
      return res.blob()
    })
  },
}
