import api from './client'
import { ENDPOINTS } from '../utils/constants'

export const authApi = {
  login: (credentials) => api.post(ENDPOINTS.LOGIN, credentials),
  register: (data) => api.post(ENDPOINTS.REGISTER, data),
  changePassword: (data) => api.put(ENDPOINTS.PASSWORD, data),
}

export const keysApi = {
  list: () => api.get(ENDPOINTS.KEYS),
  generate: (data) => api.post(ENDPOINTS.GENERATE_KEY, data),
}

export const csrApi = {
  list: () => api.get(ENDPOINTS.CSRS),
  getById: (id) => api.get(ENDPOINTS.CSR_BY_ID(id)),
  submit: (data) => api.post(ENDPOINTS.CSRS, data),
}

export const certificateApi = {
  list: () => api.get(ENDPOINTS.CERTIFICATES),
  getById: (id) => api.get(ENDPOINTS.CERTIFICATE_BY_ID(id)),
  download: (id) => api.get(ENDPOINTS.CERTIFICATE_DOWNLOAD(id), { responseType: 'blob' }),
  requestRevocation: (id, data) => api.post(ENDPOINTS.CERTIFICATE_REVOKE_REQUEST(id), data),
  upload: (formData) => api.post(ENDPOINTS.CERTIFICATE_UPLOAD, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  listUploaded: () => api.get(ENDPOINTS.UPLOADED_CERTS),
}

export const adminApi = {
  getConfig: () => api.get(ENDPOINTS.ADMIN_CONFIG),
  updateConfig: (data) => api.put(ENDPOINTS.ADMIN_CONFIG, data),
  getRootCA: () => api.get(ENDPOINTS.ADMIN_ROOT_CA),
  generateRootCAKeypair: (data) => api.post(ENDPOINTS.ADMIN_ROOT_CA_KEYPAIR, data),
  generateRootCACert: (data) => api.post(ENDPOINTS.ADMIN_ROOT_CA_CERT, data),
  listCSRs: (params) => api.get(ENDPOINTS.ADMIN_CSRS, { params }),
  approveCSR: (id) => api.post(ENDPOINTS.ADMIN_CSR_APPROVE(id)),
  rejectCSR: (id, data) => api.post(ENDPOINTS.ADMIN_CSR_REJECT(id), data),
  listCertificates: (params) => api.get(ENDPOINTS.ADMIN_CERTIFICATES, { params }),
  revokeCert: (id, data) => api.post(ENDPOINTS.ADMIN_CERT_REVOKE(id), data),
  renewCert: (id) => api.post(ENDPOINTS.ADMIN_CERT_RENEW(id)),
  listRevocations: (params) => api.get(ENDPOINTS.ADMIN_REVOCATIONS, { params }),
  approveRevocation: (id) => api.post(ENDPOINTS.ADMIN_REVOCATION_APPROVE(id)),
  rejectRevocation: (id, data) => api.post(ENDPOINTS.ADMIN_REVOCATION_REJECT(id), data),
  getLogs: (params) => api.get(ENDPOINTS.ADMIN_LOGS, { params }),
}

export const publicApi = {
  getCRL: () => api.get(ENDPOINTS.CRL),
}
