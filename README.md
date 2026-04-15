# X509 Certificate Management System — Frontend

React frontend cho hệ thống quản lý chứng chỉ X.509, kết nối với backend `x509_mvc`.

---

## Mục lục

1. [Tech Stack](#1-tech-stack)
2. [Cấu trúc thư mục](#2-cấu-trúc-thư-mục)
3. [Cách chạy](#3-cách-chạy)
4. [Kết nối với Backend](#4-kết-nối-với-backend)
5. [JWT Authentication — luồng hoạt động đầy đủ](#5-jwt-authentication--luồng-hoạt-động-đầy-đủ)
6. [API Layer chi tiết](#6-api-layer-chi-tiết)
7. [AuthContext — quản lý auth state toàn app](#7-authcontext--quản-lý-auth-state-toàn-app)
8. [Routing — AppRoutes & PrivateRoute](#8-routing--approutes--privateroute)
9. [Các trang (Pages)](#9-các-trang-pages)
10. [UI Design System](#10-ui-design-system)
11. [Quy ước API Response](#11-quy-ước-api-response)

---

## 1. Tech Stack

| Công nghệ       | Mô tả                                      |
|------------------|----------------------------------------------|
| **React 18**     | UI framework                                 |
| **Vite 5**       | Build tool, dev server                        |
| **React Router v6** | Client-side routing, Protected routes      |
| **Axios**        | HTTP client, interceptors, token refresh      |
| **Tailwind CSS** | Styling (custom dark theme token)            |
| **clsx + tailwind-merge** | CSS utility helpers (`cn()`)          |
| **lucide-react** | Icon library                                 |

---

## 2. Cấu trúc thư mục

```
x509_fe/
├── public/
│
├── src/
│   ├── main.jsx              ← Entry point: mount React app
│   ├── App.jsx               ← BrowserRouter + AuthProvider wrapper
│   │
│   ├── api/
│   │   ├── client.js         ← Axios instance + Request/Response interceptors
│   │   └── index.js          ← Tất cả API methods (authApi, customerApi, adminApi, keyPairApi, publicApi)
│   │
│   ├── context/
│   │   └── AuthContext.jsx   ← Auth state toàn app: user, login(), logout(), isAdmin, isCustomer
│   │
│   ├── routes/
│   │   ├── AppRoutes.jsx     ← Tất cả route definitions
│   │   └── PrivateRoute.jsx  ← Route bảo vệ: check auth + role
│   │
│   ├── pages/
│   │   ├── Login.jsx         ← Unified login (thử admin trước, rồi customer)
│   │   ├── Register.jsx       ← Đăng ký customer
│   │   ├── NotFound.jsx       ← 404 page
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx      ← Trang chủ admin
│   │   │   ├── CSRReviewQueue.jsx       ← Duyệt/từ chối CSR, download CSR
│   │   │   ├── CertificateManagement.jsx ← Xem, revoke, download certificate
│   │   │   ├── RevocationQueue.jsx      ← Duyệt/từ chối revocation request
│   │   │   ├── RootCAManagement.jsx      ← Sinh, download Root CA cert/key
│   │   │   ├── CRLManagement.jsx         ← Xem revoked certs, generate CRL
│   │   │   ├── SystemConfig.jsx         ← Cấu hình hệ thống
│   │   │   └── AuditLogs.jsx            ← Audit logs
│   │   │
│   │   ├── customer/
│   │   │   ├── CustomerDashboard.jsx      ← Trang chủ customer
│   │   │   ├── CSRSubmission.jsx          ← Submit CSR (chọn key pair, điền domain)
│   │   │   ├── MyCertificates.jsx          ← Xem, download, request revoke certificate
│   │   │   ├── MyRevocations.jsx          ← Xem trạng thái revocation request
│   │   │   ├── KeyPairs.jsx               ← Sinh, xem, download private key
│   │   │   └── UploadCertificate.jsx      ← Import certificate bên ngoài
│   │   │
│   │   └── public/
│   │       └── CRLLookup.jsx              ← Tra cứu CRL (public)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── PageLayout.jsx   ← Wrapper layout: sidebar + page content
│   │   │   └── Sidebar.jsx      ← Sidebar navigation
│   │   └── ui/
│   │       ├── Button.jsx, Input.jsx, Select.jsx, Modal.jsx
│   │       ├── Card.jsx, Table.jsx, Badge.jsx
│   │
│   ├── utils/
│   │   ├── constants.js   ← API_BASE_URL + ENDPOINTS + constants (ROLES, STATUS...)
│   │   ├── cn.js         ← `cn()`: clsx + tailwind-merge helper
│   │   ├── formatters.js ← formatDate, formatFingerprint...
│   │   └── validators.js  ← Validation helpers
│   │
│   └── cert/
│       └── certificateParser.js  ← Parse PEM → JSON (hiển thị certificate)
│
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js   ← Custom tokens: lime-accent (#BFFF00), surface (#111111), border (#1A1A1A)...
└── README.md
```

---

## 3. Cách chạy

### 3.1 Cài đặt

```bash
cd x509_fe
npm install
```

### 3.2 Chạy dev server

```bash
npm run dev
# → Chạy tại http://localhost:5173
```

Frontend tự động proxy requests đến backend `http://localhost:8080`.

### 3.3 Build production

```bash
npm run build
npm run preview   # Preview production build
```

---

## 4. Kết nối với Backend

### 4.1 Cấu hình URL

```js
// src/utils/constants.js
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
```

Đổi backend URL bằng biến môi trường:

```bash
VITE_API_URL=http://your-server:8080 npm run dev
```

### 4.2 CORS

Backend (`x509_mvc/router/router.go`) đã configure CORS cho phép:
- `http://localhost:5173` (dev server)
- `http://localhost:5174` (alt dev port)
- `withCredentials: true` (gửi refresh token cookie)

---

## 5. JWT Authentication — Luồng hoạt động đầy đủ

### 5.1 Tổng quan

Có **hai loại JWT** được phân biệt bằng role:

| Token           | Role        | Header                  | Cookie        |
|-----------------|-------------|-------------------------|---------------|
| Customer JWT    | `customer`  | `Authorization: Bearer` | httpOnly cookie (refresh) |
| Admin JWT      | `admin`     | `Authorization: Bearer` | httpOnly cookie (refresh) |

### 5.2 Luồng đăng nhập

```
User đăng nhập
       │
       ▼
POST /auth/login  (customer)  HOẶC  POST /admin/login  (admin)
       │
       ▼
Backend trả về:
  {
    "access_token": "eyJhbG...",    ← Lưu vào localStorage.setItem('token')
    "expires_in": 900,              ← 15 phút
    "user": { id, username, name, role }
  }
       +
  httpOnly cookie: refresh_token     ← KHÔNG accessible bằng JS
```

### 5.3 Luồng Request có Token

```
Gọi API (VD: customerApi.listCertificates)
       │
       ▼
Request Interceptor (client.js)
  → Đọc token từ localStorage
  → Thêm header: Authorization: Bearer <token>
       │
       ▼
Backend xử lý
  → Trả 200 → Trả về caller
  → Trả 401 → Response Interceptor bắt
```

### 5.4 Luồng Refresh Token (Token bị hết hạn)

```
1. Gọi API → Backend trả 401 Unauthorized
2. Response Interceptor bắt 401
   → Kiểm tra: không phải trang login/auth request
   → Gọi POST /auth/refresh (với httpOnly cookie)
3. Backend verify cookie → Sinh token mới → Rotate refresh token
4. Interceptor nhận token mới
   → Lưu vào localStorage
   → Retry request gốc với token mới
5. Request gốc thành công → Trả về cho caller
```

### 5.5 Interceptor — Chi tiết

```
Request Interceptor:
  MỌI request đi ra đều được thêm:
    Authorization: Bearer <token_from_localStorage>

Response Interceptor:
  • 2xx        → Trả về bình thường
  • Network err → Reject với message "Network error..."
  • 401        → Xử lý refresh:
      ├─ Login page / Auth request → reject ngay (không refresh)
      ├─ Đang refresh rồi → Queue request, chờ token mới
      └─ Lần đầu bị 401:
           → Gọi POST /auth/refresh (customer)
              HOẶC POST /admin/refresh (admin)
           → Lưu token mới vào localStorage
           → Retry request với token mới
           → Nếu refresh fail → Xóa token, redirect /login
```

### 5.6 AuthContext — Trạng thái toàn app

```js
// AuthContext cung cấp:
{ user, login(), logout(), loading, isAdmin, isCustomer }

// user object (lưu trong localStorage dạng JSON):
{
  id: 1,
  username: "admin",
  name: "System Administrator",
  email: "admin@example.com",
  role: "admin"          // "admin" hoặc "customer"
}

// login() — được gọi khi đăng nhập thành công
login(token, userData) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(userData))
  setUser(userData)
}

// logout() — xóa token + redirect
logout() {
  Gọi POST /customer/logout (backend xóa refresh token)
  Xóa localStorage
  Redirect /login
}
```

---

## 6. API Layer chi tiết

### 6.1 Cấu trúc

```
client.js     → Axios instance (baseURL, interceptors, withCredentials)
index.js      → API methods (authApi, customerApi, adminApi, keyPairApi, publicApi)
constants.js  → ENDPOINTS (tất cả URL) + API_BASE_URL
```

### 6.2 Cấu hình Axios (client.js)

```js
const api = axios.create({
  baseURL: API_BASE_URL,          // http://localhost:8080
  timeout: 15000,                 // 15 giây
  withCredentials: true,         // Gửi refresh token cookie
  headers: { 'Content-Type': 'application/json' }
})
```

### 6.3 Quy ước response

**Tất cả method trả về `Promise<{ data, status }>`**

```js
// Lỗi → throw object: { message, status, data }
// Caller phải try/catch và truy cập .data

const res = await customerApi.listCertificates()
// res = { data: [...], status: 200 }
setCerts(res.data || [])

// Lỗi
try {
  await adminApi.approveCSR(id)
} catch (err) {
  console.error(err.message)  // "CSR is not pending"
}
```

### 6.4 Các API object

```js
// Auth
authApi.register(body)          → POST /auth/register
authApi.login(body)             → POST /auth/login
authApi.refreshToken()         → POST /auth/refresh (gửi cookie)

// Admin Auth
adminAuthApi.login(body)       → POST /admin/login
adminAuthApi.refreshToken()    → POST /admin/refresh

// Customer
customerApi.submitCSR(body)     → POST /customer/csrs
customerApi.listCSRs()         → GET /customer/csrs
customerApi.listCertificates()  → GET /customer/certificates
customerApi.downloadCertificate(id) → GET /customer/certificates/:id/download  (trả blob)
customerApi.submitRevocation(body)  → POST /customer/revocations
customerApi.listRevocations()   → GET /customer/revocations
customerApi.cancelRevocation(id) → DELETE /customer/revocations/:id

// Key Pairs
keyPairApi.list()              → GET /customer/key-pairs
keyPairApi.generate(body)      → POST /customer/key-pairs
keyPairApi.downloadKeyPEM(id)   → GET /customer/key-pairs/:id/key.pem (trả blob)

// Admin
adminApi.listCSRs()             → GET /admin/csrs
adminApi.approveCSR(id, body)  → POST /admin/csrs/:id/approve
adminApi.rejectCSR(id, body)   → POST /admin/csrs/:id/reject
adminApi.downloadCSR(id)        → GET /admin/csrs/:id/download
adminApi.listCertificates()     → GET /admin/certificates
adminApi.downloadCertificate(id)→ GET /admin/certificates/:id/download
adminApi.revokeDirectly(id, body) → POST /admin/revocations/:id/revoke
adminApi.approveRevocation(id, body) → POST /admin/revocations/:id/approve
adminApi.rejectRevocation(id, body) → POST /admin/revocations/:id/reject
adminApi.listRevocations(status)→ GET /admin/revocations
adminApi.getRootCA()           → GET /admin/root-ca
adminApi.generateRootCA(body)  → POST /admin/root-ca/generate
adminApi.downloadCertPEM()     → GET /admin/root-ca/cert.pem (blob)
adminApi.downloadKeyPEM()      → GET /admin/root-ca/key.pem (blob)
adminApi.downloadCRL()         → GET /admin/crl/generate (blob)
adminApi.listRevoked()         → GET /admin/crl/revoked

// Public
publicApi.downloadCRL()        → GET /admin/crl/generate (blob, không cần auth)
```

### 6.5 Download file (blob)

Với các endpoint trả về file (certificate PEM, CSR PEM, key PEM, CRL), dùng `fetch` trực tiếp thay vì axios để nhận blob:

```js
// VD: Download certificate
downloadCertificate: (id) => {
  const token = localStorage.getItem('token')
  const url = API_BASE_URL + ENDPOINTS.CUSTOMER_CERT_DOWNLOAD(id)
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => {
    if (!res.ok) throw new Error('Failed to download')
    return res.blob()  // Trả về Blob
  })
}

// Caller xử lý blob:
const blob = await customerApi.downloadCertificate(id)
const a = document.createElement('a')
a.href = URL.createObjectURL(blob)
a.download = 'certificate.crt'
a.click()
URL.revokeObjectURL(a.href)
```

---

## 7. AuthContext — Quản lý Auth State toàn App

```jsx
// src/context/AuthContext.jsx

<AuthProvider>           // Bọc App
  <AppRoutes />          // Các route
</AuthProvider>

// Dùng trong bất kỳ component nào:
const { user, login, logout, isAdmin, isCustomer, loading } = useAuth()
```

**Chu trình:**

```
App mount
  │
  ├── AuthProvider khởi tạo
  │     ├── Đọc token + user từ localStorage
  │     └── setLoading(true)
  │
  ├── AppRoutes render
  │     └── thấy loading=true → hiện spinner
  │
  ├── AuthProvider useEffect chạy xong
  │     └── setLoading(false)
  │
  └── AppRoutes render lần 2
        ├── Có user + isAdmin → redirect /admin
        ├── Có user + isCustomer → redirect /dashboard
        └── Không có user → render trang public (/login)
```

---

## 8. Routing — AppRoutes & PrivateRoute

### 8.1 AppRoutes.jsx

```jsx
<Routes>
  {/* Public: redirect nếu đã đăng nhập */}
  <Route path="/login"   element={user ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} /> : <Login />} />
  <Route path="/register" ... />
  <Route path="/crl" element={<CRLLookup />} />  {/* Không cần auth */}

  {/* Admin: bắt buộc role=admin */}
  <Route path="/admin"         element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
  <Route path="/admin/csr"     element={<PrivateRoute role="admin"><CSRReviewQueue /></PrivateRoute>} />
  <Route path="/admin/certificates" element={<PrivateRoute role="admin">...</PrivateRoute>} />
  ...

  {/* Customer: bất kỳ authenticated user nào */}
  <Route path="/dashboard"  element={<PrivateRoute><CustomerDashboard /></PrivateRoute>} />
  <Route path="/csr"       element={<PrivateRoute><CSRSubmission /></PrivateRoute>} />
  <Route path="/certificates" element={<PrivateRoute><MyCertificates /></PrivateRoute>} />
  <Route path="/keys"       element={<PrivateRoute><KeyPairs /></PrivateRoute>} />
  ...

  {/* Default redirect */}
  <Route path="/" element={<Navigate to={isAdmin ? '/admin' : isCustomer ? '/dashboard' : '/login'} />} />
</Routes>
```

### 8.2 PrivateRoute — Chi tiết

```jsx
function PrivateRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()

  // 1. Đang load auth state → spinner
  if (loading) return <FullPageSpinner />

  // 2. Chưa đăng nhập → redirect /login
  if (!user) return <Navigate to="/login" />

  // 3. Có yêu cầu role cụ thể nhưng user không đúng → redirect về dashboard tương ứng
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />
  }

  // 4. OK → render children
  return children
}
```

---

## 9. Các Trang (Pages)

### Admin Pages (`/admin/*`)

| Route                | Component                    | Mô tả                                    |
|---------------------|------------------------------|------------------------------------------|
| `/admin`            | AdminDashboard               | Dashboard tổng quan                      |
| `/admin/csr`        | CSRReviewQueue               | Duyệt/từ chối CSR, download CSR PEM      |
| `/admin/certificates`| CertificateManagement        | Xem tất cả cert, revoke, download, view   |
| `/admin/revocations`| RevocationQueue              | Duyệt/từ chối revocation request         |
| `/admin/root-ca`    | RootCAManagement             | Sinh, xem, download Root CA cert/key      |
| `/admin/crl`        | CRLManagement                | Xem revoked certs, generate CRL           |
| `/admin/config`      | SystemConfig                 | Cấu hình hệ thống                        |
| `/admin/logs`       | AuditLogs                    | Audit logs                               |

### Customer Pages (`/*`)

| Route             | Component                | Mô tả                                    |
|-------------------|--------------------------|------------------------------------------|
| `/dashboard`      | CustomerDashboard         | Dashboard tổng quan                       |
| `/csr`           | CSRSubmission            | Submit CSR (chọn key pair, domain...)    |
| `/certificates`  | MyCertificates            | Xem cert, download, view, request revoke  |
| `/revocations`   | MyRevocations            | Trạng thái revocation request của mình   |
| `/keys`          | KeyPairs                  | Sinh, xem, download private key           |
| `/upload`        | UploadCertificate         | Import certificate bên ngoài              |

### Public Pages

| Route | Component     | Mô tả                              |
|-------|---------------|--------------------------------------|
| `/crl`| CRLLookup     | Tra cứu CRL (không cần đăng nhập) |
| `/login`  | Login     | Unified login (admin → customer)  |
| `/register`| Register  | Đăng ký tài khoản customer        |

---

## 10. UI Design System

### 10.1 Dark Theme Tokens (tailwind.config.js)

```js
colors: {
  lime: { accent: '#BFFF00' },      // Accent màu chính
  surface: '#111111',                // Background chính
  border: '#1A1A1A',                 // Border
  'text-primary': '#FFFFFF',         // Text chính
  'text-secondary': '#999999',        // Text phụ
  'text-tertiary': '#6e6e6e',        // Text mờ
  'text-muted': '#404040',           // Text rất mờ
  error: '#FF4444',                  // Màu lỗi
  warning: '#F59E0B',                // Màu warning
  info: '#3B82F6',                   // Màu info
}
```

### 10.2 Utility (`cn()`)

```jsx
import { cn } from '../utils/cn'

<button className={cn(
  'px-4 py-2 rounded text-sm',
  isActive && 'bg-lime-accent text-black',
  !isActive && 'bg-zinc-800 text-zinc-300'
)} />
```

### 10.3 Reusable UI Components

```
Button        — variants: primary (lime), secondary, ghost, danger
Input         — dark styled input với label
Select        — dropdown styled
Modal         — overlay dialog
Card          — container với padding + border
Table/TableRow/TableCell — styled table components
Badge         — variants: success, error, warning, default
PageLayout    — sidebar + header + content wrapper
```

---

## 11. Quy ước API Response

### 11.1 Success Response

```js
// Tất cả API methods trả về:
{ data: <actual_payload>, status: <http_status> }

// VD:
const res = await customerApi.listCertificates()
// res.data = [ { id: 1, common_name: "example.com", key_algorithm: "RSA", ... }, ... ]
// res.status = 200
```

### 11.2 Error Response

```js
// Khi lỗi, promise bị reject với object:
{
  message: "CSR is not pending",   // Hoặc "Network error..."
  status: 400,                     // HTTP status code
  data: { ... }                    // Backend error response (nếu có)
}

// Caller xử lý:
try {
  await adminApi.approveCSR(id)
} catch (err) {
  console.error(err.message)     // "CSR is not pending"
  console.error(err.status)     // 400
}
```

### 11.3 Download Response (Blob)

```js
// Endpoint trả về file (PEM, CRL...) dùng fetch, trả về Promise<Blob>
const blob = await customerApi.downloadCertificate(id)
// blob: Blob { type: "application/x-pem-file", size: 1234 }

// Xử lý:
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'certificate.crt'
a.click()
URL.revokeObjectURL(url)
```
