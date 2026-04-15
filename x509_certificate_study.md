# Tìm Hiểu Cấu Trúc Chứng Nhận X509

> Tài liệu nghiên cứu phục vụ việc triển khai sinh chứng chỉ X509 tự động trong dự án.
> Tech stack dự án: **Go (Golang)** + React + TypeScript + PostgreSQL.

---

## 1. Cấu Trúc Chứng Chỉ X509

Chứng chỉ X509 theo chuẩn **ITU-T X.509** được định nghĩa bằng **ASN.1 (Abstract Syntax Notation One)** và mã hóa theo định dạng **DER (Distinguished Encoding Rules)**. Chuỗi cấp bậc như sau:

```
Certificate (SEQUENCE)
├── tbsCertificate        TBSCertificate   ← Nội dung chính cần ký
├── signatureAlgorithm    AlgorithmIdentifier
└── signatureValue        BIT STRING       ← Chữ ký số của CA
```

### 1.1. TBSCertificate (To-Be-Signed Certificate)

Phần nội dung cốt lõi, chứa toàn bộ thông tin danh tính của chứng chỉ:

```
TBSCertificate ::= SEQUENCE {
    version               [0] EXPLICIT Version DEFAULT v1,
    serialNumber                CertificateSerialNumber,
    signature                   AlgorithmIdentifier,
    issuer                     Name,
    validity                   Validity,
    subject                    Name,
    subjectPublicKeyInfo       SubjectPublicKeyInfo,
    issuerUniqueID        [1] IMPLICIT UniqueIdentifier OPTIONAL,
    subjectUniqueID       [2] IMPLICIT UniqueIdentifier OPTIONAL,
    extensions            [3] EXPLICIT Extensions OPTIONAL
}
```

#### Chi tiết từng trường:

| Trường                 | Kiểu ASN.1             | Mô tả chi tiết                                                                                                                           |
| ---------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `version`              | `INTEGER`              | Phiên bản: `v1 (0)`, `v2 (1)`, `v3 (2)`. **Mặc định v1.** Tất cả chứng chỉ hợp lệ hiện nay đều dùng v3 — cần thiết để sử dụng extensions |
| `serialNumber`         | `INTEGER`              | Số serial duy nhất do CA phát hành. Dùng để revocation và tracking. RFC 5280 quy định tối đa **20 octets**. Phải là số nguyên dương      |
| `signature`            | `AlgorithmIdentifier`  | Thuật toán chữ ký mà CA dùng ký chứng chỉ này (vd: `SHA256withRSA`, `ECDSAwithSHA256`)                                                   |
| `issuer`               | `Name`                 | Tên phân biệt (DN) của tổ chức phát hành (CA). Ví dụ: `C=VN, O=MyOrg, CN=MyRootCA`                                                       |
| `validity`             | `Validity`             | Khoảng thời gian chứng chỉ có hiệu lực                                                                                                   |
| `subject`              | `Name`                 | Tên phân biệt của chủ thể sở hữu chứng chỉ. Ví dụ: `C=VN, O=MyOrg, CN=server.example.com`                                                |
| `subjectPublicKeyInfo` | `SubjectPublicKeyInfo` | Khóa công khai của chủ thể + thuật toán mã hóa khóa (RSA, ECDSA, Ed25519)                                                                |
| `issuerUniqueID`       | `UniqueIdentifier`     | (Tùy chọn, v2) Định danh duy nhất cho issuer                                                                                             |
| `subjectUniqueID`      | `UniqueIdentifier`     | (Tùy chọn, v2) Định danh duy nhất cho subject                                                                                            |
| `extensions`           | `Extensions`           | **(Chỉ có ở v3)** Các phần mở rộng — chứa phần lớn thông tin quan trọng nhất                                                             |

---

#### 1.1.1. Trường `Name` (Distinguished Name)

Name là chuỗi các **Relative Distinguished Name (RDN)** theo chuẩn **X.500**:

```
Name ::= RDNSequence
RDNsequence ::= SEQUENCE OF RelativeDistinguishedName
RelativeDistinguishedName ::= SET OF AttributeTypeAndValue
AttributeTypeAndValue ::= SEQUENCE {
    type    AttributeType,      -- OID
    value   AttributeValue      -- UTF8String, PrintableString...
}
```

**Các thành phần DN phổ biến:**

| OID                    | Ký hiệu              | Ví dụ giá trị           | Mô tả                                        |
| ---------------------- | -------------------- | ----------------------- | -------------------------------------------- |
| `2.5.4.3`              | `CN`                 | `CN=server.example.com` | **Common Name** — tên chính của chủ thể      |
| `2.5.4.6`              | `C`                  | `C=VN`                  | **Country** — mã quốc gia (2 ký tự ISO 3166) |
| `2.5.4.7`              | `L`                  | `L=Hanoi`               | **Locality** — thành phố / địa phương        |
| `2.5.4.8`              | `ST`                 | `ST=Hanoi`              | **State or Province** — tỉnh / bang          |
| `2.5.4.10`             | `O`                  | `O=MyCompany`           | **Organization** — tên tổ chức               |
| `2.5.4.11`             | `OU`                 | `OU=IT Department`      | **Organizational Unit** — đơn vị phòng ban   |
| `1.2.840.113549.1.9.1` | `E` / `emailAddress` | `E=admin@example.com`   | Địa chỉ email                                |
| `2.5.4.5`              | `serialNumber`       | `SN=1234567890`         | Số serial của tổ chức                        |

> **Quy tắc quan trọng:** Trường `CN` (Common Name) trong `subject` không còn được dùng để xác thực tên miền trong HTTPS — phải dùng **Subject Alternative Name (SAN)** thay thế.

---

#### 1.1.2. Trường `Validity`

```
Validity ::= SEQUENCE {
    notBefore       Time,
    notAfter        Time
}

Time ::= CHOICE {
    utcTime         UTCTime,         -- YYMMDDHHMMSSZ  (năm 1950–2049)
    generalTime     GeneralizedTime  -- YYYYMMDDHHMMSSZ (năm <1950 hoặc >2049)
}
```

- `notBefore`: Thời điểm bắt đầu có hiệu lực
- `notAfter`: Thời điểm hết hạn
- Hầu hết chứng chỉ hiện nay dùng `UTCTime` (2 ký tự năm, ví dụ `250322` = 2025-03-22)
- **Thời hạn khuyến nghị:** Root CA tối đa 25 năm, Intermediate CA tối đa 10 năm, End-entity certificate tối đa 397 ngày (theo CA/Browser Forum)

---

#### 1.1.3. Trường `subjectPublicKeyInfo`

```
SubjectPublicKeyInfo ::= SEQUENCE {
    algorithm       AlgorithmIdentifier,
    subjectPublicKey    BIT STRING
}
```

- Chứa **khóa công khai** của chủ thể
- Thuật toán hỗ trợ trong dự án: **RSA** (2048–4096 bit), **ECDSA** (P-256, P-384), **Ed25519**

---

### 1.2. Extensions (Phần Mở Rộng — Chỉ Version 3)

Extensions là phần quan trọng nhất trong chứng chỉ X509 v3:

```
Extension ::= SEQUENCE {
    extnID      OBJECT IDENTIFIER,  -- OID của extension
    critical    BOOLEAN DEFAULT FALSE,
    extnValue   OCTET STRING        -- Giá trị mã hóa DER của extension
}
```

**Các Extension quan trọng — cần triển khai trong dự án:**

| Extension                          | OID                 | Critical | Mô tả chi tiết                               |
| ---------------------------------- | ------------------- | -------- | -------------------------------------------- |
| **Key Usage**                      | `2.5.29.15`         | ✅       | Quy định mục đích sử dụng khóa               |
| **Extended Key Usage**             | `2.5.29.37`         | ❌       | Mục đích mở rộng (TLS server, client...)     |
| **Subject Alternative Name (SAN)** | `2.5.29.17`         | ✅       | Danh sách tên DNS/IP/Email thay thế CN       |
| **Basic Constraints**              | `2.5.29.19`         | ✅       | `cA=TRUE/FALSE` — chỉ định CA hay end-entity |
| **Subject Key Identifier**         | `2.5.29.14`         | ❌       | Định danh duy nhất cho khóa của subject      |
| **Authority Key Identifier**       | `2.5.29.35`         | ❌       | Định danh duy nhất cho khóa của issuer (CA)  |
| **CRL Distribution Points**        | `2.5.29.31`         | ❌       | URL phân phối CRL                            |
| **Authority Information Access**   | `1.3.6.1.5.5.7.1.1` | ❌       | URL tới OCSP responder và issuer cert        |
| **Certificate Policies**           | `2.5.29.32`         | ❌       | OID chính sách + CPS URL                     |

#### Chi tiết Key Usage:

```
KeyUsage ::= BIT STRING {
    digitalSignature   (0),  -- Chữ ký số (cho end-entity)
    nonRepudiation    (1),  -- Chống chối cãi
    keyEncipherment   (2),  -- Mã hóa khóa (cho RSA key exchange)
    dataEncipherment  (3),  -- Mã hóa dữ liệu trực tiếp
    keyAgreement      (4),  -- Trao đổi khóa (ECDH)
    keyCertSign       (5),  -- Ký chứng chỉ CA      ← Root/Intermediate CA bắt buộc
    cRLSign           (6),  -- Ký danh sách thu hồi  ← Root/Intermediate CA bắt buộc
    encipherOnly      (7),
    decipherOnly       (8)
}
```

| Loại chứng chỉ                  | Key Usage cần thiết                   |
| ------------------------------- | ------------------------------------- |
| **Root CA Certificate**         | `keyCertSign`, `cRLSign`              |
| **Intermediate CA Certificate** | `keyCertSign`, `cRLSign`              |
| **End-Entity (TLS Server)**     | `digitalSignature`, `keyEncipherment` |
| **End-Entity (TLS Client)**     | `digitalSignature`                    |
| **Code Signing**                | `digitalSignature`                    |

#### Chi tiết Basic Constraints:

```
BasicConstraints ::= SEQUENCE {
    cA              BOOLEAN DEFAULT FALSE,
    pathLenConstraint INTEGER (0..MAX) OPTIONAL
}
```

- `cA=TRUE`: Chứng chỉ này có thể ký chứng chỉ khác (Root CA, Intermediate CA)
- `cA=FALSE` (default): End-entity certificate — không thể ký chứng chỉ khác
- `pathLenConstraint`: Chỉ có ý nghĩa khi `cA=TRUE`. Giới hạn số lượng intermediate CA tối đa phía dưới. Ví dụ: `pathLenConstraint=0` nghĩa là chỉ được phép có end-entity certificate phía dưới, không được có thêm intermediate CA nào.

---

### 1.3. AlgorithmIdentifier

```
AlgorithmIdentifier ::= SEQUENCE {
    algorithm   OBJECT IDENTIFIER,
    parameters  ANY DEFINED BY algorithm OPTIONAL
}
```

**Các OID thuật toán chính:**

| Thuật toán chữ ký    | OID                     | Mô tả                                     |
| -------------------- | ----------------------- | ----------------------------------------- |
| SHA-256 with RSA     | `1.2.840.113549.1.1.11` | RSA-PKCS#1 v1.5 với SHA-256               |
| SHA-384 with RSA     | `1.2.840.113549.1.1.12` | RSA với SHA-384                           |
| SHA-512 with RSA     | `1.2.840.113549.1.1.13` | RSA với SHA-512                           |
| ECDSA with SHA-256   | `1.2.840.10045.4.3.2`   | ECDSA P-256 với SHA-256                   |
| ECDSA with SHA-384   | `1.2.840.10045.4.3.3`   | ECDSA P-384 với SHA-384                   |
| Ed25519              | `1.3.101.112`           | Edwards-curve Digital Signature Algorithm |
| SHA-256 with RSA-PSS | `1.2.840.113549.1.1.10` | RSA-PSS (probabilistic signature scheme)  |

---

### 1.4. Signature Value

- Là **chữ ký số** của CA, tính trên toàn bộ DER encoding của `TBSCertificate`
- Mã hóa bằng thuật toán được chỉ định trong `signatureAlgorithm`
- Định dạng: `BIT STRING`
- Quá trình ký: `TBSCertificate → DER → hash(SHA-256/SHA-384) → encrypt(private_key) → signature`

---

## 2. Luồng Sinh Chứng Chỉ Trong Dự Án

```
Khởi tạo hệ thống (Sprint 2)
┌──────────────────────────────────────────────────────────┐
│  1. Admin cấu hình thuật toán (RSA/ECDSA), hash, key len│
│  2. Tạo cặp khóa Root CA (Private Key CA)                │
│  3. Xây dựng TBS cho Root Certificate                    │
│     ├── version = v3                                     │
│     ├── serialNumber = random                            │
│     ├── signature = SHA256withRSA                        │
│     ├── issuer = Root CA's DN (self-signed)              │
│     ├── subject = Root CA's DN                           │
│     ├── subjectPublicKeyInfo = CA public key             │
│     └── extensions: Key Usage(cA=TRUE), Basic Constraints│
│  4. Ký TBS bằng Root CA Private Key                      │
│  5. Lưu: Certificate PEM + Encrypted Private Key PEM     │
└──────────────────────────────────────────────────────────┘

Yêu cầu chứng chỉ (Sprint 3–4)
┌──────────────────────────────────────────────────────────┐
│  6. Customer tạo cặp khóa riêng                          │
│  7. Customer tạo CSR (Certificate Signing Request)      │
│  8. Admin duyệt CSR → Approve                           │
│  9. Xây dựng TBS cho End-Entity Certificate              │
│     ├── version = v3                                     │
│     ├── serialNumber = unique sequential                 │
│     ├── signature = thuật toán đã cấu hình                │
│     ├── issuer = Root CA DN                              │
│     ├── subject = CSR subject info                       │
│     ├── subjectPublicKeyInfo = CSR public key            │
│     └── extensions: SAN, Key Usage, Basic Constraints     │
│ 10. Ký TBS bằng Root CA Private Key                      │
│ 11. Lưu: Certificate PEM, trả về Customer                │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Thư Viện Dự Kiến Sử Dụng

mã hóa trước khi đưa vào DB

### 3.1. Go Standard Library (Khuyên dùng)

Dự án sử dụng **Go standard library** — không cần thư viện bên thứ ba cho phần mã hóa.

| Gói (package)      | Mô tả                                                |
| ------------------ | ---------------------------------------------------- |
| `crypto/rsa`       | Sinh khóa RSA, ký/chữ ký RSA                         |
| `crypto/ecdsa`     | Sinh khóa ECDSA (P-256, P-384), ký/chữ ký ECDSA      |
| `crypto/ed25519`   | Sinh khóa Ed25519, ký/chữ ký Ed25519                 |
| `crypto/x509`      | Phân tích (parse) và xây dựng (build) chứng chỉ X509 |
| `crypto/x509/pkix` | Cấu trúc ASN.1 cho extensions, CRL...                |
| `crypto/tls`       | TLS handshake, certificate chain validation          |
| `encoding/pem`     | Mã hóa/giải mã định dạng PEM                         |
| `encoding/asn1`    | Mã hóa/giải mã DER ASN.1                             |

**Cài đặt:** Không cần — đã có sẵn trong Go.

---

### 3.2. Ví Dụ Code Go (Minh họa luồng sinh chứng chỉ)

#### 3.2.1. Sinh cặp khóa RSA

```go
package crypto

import (
    "crypto/rand"
    "crypto/rsa"
    "crypto/x509"
    "crypto/x509/pkix"
    "encoding/pem"
    "math/big"
    "time"
)

// GenerateRSAKeyPair tạo cặp khóa RSA
func GenerateRSAKeyPair(bits int) (*rsa.PrivateKey, error) {
    return rsa.GenerateKey(rand.Reader, bits)
}

// EncodePrivateKeyToPEM mã hóa private key thành PEM
func EncodePrivateKeyToPEM(key *rsa.PrivateKey) ([]byte, error) {
    return pem.EncodeToMemory(&pem.Block{
        Type:  "RSA PRIVATE KEY",
        Bytes: x509.MarshalPKCS1PrivateKey(key),
    }), nil
}

// MarshalPublicKeyToPEM mã hóa public key thành PEM
func MarshalPublicKeyToPEM(pub *rsa.PublicKey) ([]byte, error) {
    bytes, err := x509.MarshalPKIXPublicKey(pub)
    if err != nil {
        return nil, err
    }
    return pem.EncodeToMemory(&pem.Block{
        Type:  "PUBLIC KEY",
        Bytes: bytes,
    }), nil
}
```

#### 3.2.2. Sinh chứng chỉ Root CA (Self-signed)

```go
// BuildRootCACertificate tạo Root CA self-signed certificate
func BuildRootCACertificate(
    privateKey *rsa.PrivateKey,
    country, org, commonName string,
    validityDays int,
) (*x509.Certificate, error) {

    // Serial number: số ngẫu nhiên 20 octets max (RFC 5280)
    serialNumber, err := rand.Int(rand.Reader, new(big.Int).Lsh(big.NewInt(1), 160))
    if err != nil {
        return nil, err
    }

    // Xây dựng template
    template := &x509.Certificate{
        SerialNumber: serialNumber,
        Subject: pkix.Name{
            Country:            []string{country},
            Organization:       []string{org},
            CommonName:         commonName,
        },
        NotBefore:             time.Now(),
        NotAfter:              time.Now().AddDate(0, 0, validityDays), // max 25 năm

        // === Extensions cho Root CA ===
        KeyUsage: x509.KeyUsageCertSign | x509.KeyUsageCRLSign,

        BasicConstraintsValid: true,
        IsCA:                  true, // ← Đánh dấu là CA
        // pathLenConstraint không giới hạn cho Root CA

        SubjectKeyId:          generateSubjectKeyID(privateKey.PublicKey),
    }

    // Self-sign: issuer = subject
    certDER, err := x509.CreateCertificate(
        rand.Reader,
        template,
        template,              // issuer = self (Root CA)
        &privateKey.PublicKey,
        privateKey,
    )
    if err != nil {
        return nil, err
    }

    return x509.ParseCertificate(certDER)
}

// EncodeCertificateToPEM xuất chứng chỉ ra định dạng PEM
func EncodeCertificateToPEM(cert *x509.Certificate) ([]byte, error) {
    return pem.EncodeToMemory(&pem.Block{
        Type:  "CERTIFICATE",
        Bytes: cert.Raw,
    }), nil
}
```

#### 3.2.3. Sinh End-Entity Certificate (ký bởi Root CA)

```go
// BuildEndEntityCertificate tạo end-entity certificate được ký bởi CA
func BuildEndEntityCertificate(
    caCert *x509.Certificate,
    caPrivateKey interface{}, // *rsa.PrivateKey or *ecdsa.PrivateKey
    publicKey interface{},
    subject pkix.Name,
    dnsNames []string,       // DANH SÁCH TÊN MIỀN — thay thế CN
    validityDays int,
) (*x509.Certificate, error) {

    serialNumber, err := rand.Int(rand.Reader, new(big.Int).Lsh(big.NewInt(1), 160))
    if err != nil {
        return nil, err
    }

    template := &x509.Certificate{
        SerialNumber: serialNumber,
        Subject:      subject,
        NotBefore:    time.Now(),
        NotAfter:     time.Now().AddDate(0, 0, validityDays), // max 397 ngày

        // === Extensions cho End-Entity ===
        KeyUsage: x509.KeyUsageDigitalSignature | x509.KeyUsageKeyEncipherment,

        ExtKeyUsage: []x509.ExtKeyUsage{
            x509.ExtKeyUsageServerAuth, // TLS Web Server Authentication
            x509.ExtKeyUsageClientAuth, // TLS Web Client Authentication
        },

        BasicConstraintsValid: true,
        IsCA:                  false,

        // === Subject Alternative Name (SAN) — THAY THẾ CN cho HTTPS ===
        SubjectAlternativeNames: dnsNames,

        // === Authority Key Identifier ===
        AuthorityKeyId: getAuthorityKeyID(caCert),

        SubjectKeyId: generateSubjectKeyID(publicKey),
    }

    certDER, err := x509.CreateCertificate(
        rand.Reader,
        template,
        caCert,
        publicKey,
        caPrivateKey,
    )
    if err != nil {
        return nil, err
    }

    return x509.ParseCertificate(certDER)
}
```

#### 3.2.4. Mã hóa Private Key bằng AES-256-GCM (lưu vào DB)

```go
package crypto

import (
    "crypto/aes"
    "crypto/cipher"
    "crypto/rand"
    "io"
)

// EncryptPrivateKey mã hóa private key bằng AES-256-GCM
// masterKey: 32 bytes key từ PBKDF2 hoặc hệ thống quản lý khóa
func EncryptPrivateKey(pemBytes []byte, masterKey []byte) ([]byte, error) {
    block, err := aes.NewCipher(masterKey)
    if err != nil {
        return nil, err
    }

    gcm, err := cipher.NewGCM(block)
    if err != nil {
        return nil, err
    }

    nonce := make([]byte, gcm.NonceSize())
    if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
        return nil, err
    }

    // nonce + ciphertext + tag
    return gcm.Seal(nonce, nonce, pemBytes, nil), nil
}

// DecryptPrivateKey giải mã private key
func DecryptPrivateKey(encrypted []byte, masterKey []byte) ([]byte, error) {
    block, err := aes.NewCipher(masterKey)
    if err != nil {
        return nil, err
    }

    gcm, err := cipher.NewGCM(block)
    if err != nil {
        return nil, err
    }

    nonceSize := gcm.NonceSize()
    nonce, ciphertext := encrypted[:nonceSize], encrypted[nonceSize:]
    return gcm.Open(nil, nonce, ciphertext, nil)
}
```

---

### 3.3. Các Thư Viện Bổ Sung

| Thư viện                  | Mục đích                             | Cài đặt                          |
| ------------------------- | ------------------------------------ | -------------------------------- |
| `golang.org/x/crypto`     | Scrypt, Argon2 (key derivation)      | `go get golang.org/x/crypto`     |
| `github.com/spf13/viper`  | Đọc cấu hình từ file `.env`, `.yaml` | `go get github.com/spf13/viper`  |
| `gorm.io/gorm`            | ORM cho PostgreSQL                   | `go get gorm.io/gorm`            |
| `gorm.io/driver/postgres` | PostgreSQL driver cho GORM           | `go get gorm.io/driver/postgres` |

---

## 4. Các Định Dạng Tệp Liên Quan

| Định dạng   | Phần mở rộng           | Mô tả                                                 | Trong dự án                    |
| ----------- | ---------------------- | ----------------------------------------------------- | ------------------------------ |
| **PEM**     | `.pem`, `.crt`, `.cer` | Base64-encoded, wrapped `-----BEGIN CERTIFICATE-----` | Dùng phổ biến nhất, lưu DB     |
| **DER**     | `.der`, `.cer`         | Binary DER, không encode                              | Dùng cho ứng dụng Java/Android |
| **PKCS#12** | `.pfx`, `.p12`         | Chứa certificate + private key + chain, đặt password  | Export cho end-user            |
| **PKCS#7**  | `.p7b`, `.p7c`         | Chứa certificate chain (không private key)            | CRL response format            |
| **CSR**     | `.csr`                 | Certificate Signing Request — gửi cho CA xin cấp cert | Dùng trong luồng customer      |

**Chuyển đổi trong Go:**

```go
// PEM → DER
block, _ := pem.Decode(pemBytes)
derBytes := block.Bytes

// DER → PEM
pemBytes := pem.EncodeToMemory(&pem.Block{
    Type:  "CERTIFICATE",
    Bytes: derBytes,
})

// Certificate → PKCS#12
// Dùng package "crypto/pkcs12" từ standard library
```

---

## 5. CSR (Certificate Signing Request) — Chuẩn bị cho Sprint 3

CSR là bước trung gian trước khi có certificate. Dự án cần triển khai CSR vì theo kiến trúc:

```
Customer tạo CSR → Gửi lên Server → Admin duyệt → Server ký → Trả certificate
```

```
CertificationRequest ::= SEQUENCE {
    certificationRequestInfo    CertificationRequestInfo,
    signatureAlgorithm          AlgorithmIdentifier,
    signature                   BIT STRING
}

CertificationRequestInfo ::= SEQUENCE {
    version                     INTEGER,
    subject                     Name,
    subjectPKInfo               SubjectPublicKeyInfo,
    attributes [0] IMIMPLICIT Attributes OPTIONAL
}
```

**Luồng trong dự án:**

1. Customer gọi `POST /api/keys/generate` → nhận key pair (public key lưu server, private key mã hóa lưu server)
2. Customer gọi `POST /api/csr` với domain info → server build CSR từ public key + subject info
3. Admin duyệt CSR → gọi `POST /api/admin/csr/:id/approve` → server ký tạo certificate

---

## 6. CRL (Certificate Revocation List) — Chuẩn bị cho Sprint 5

```
CertificateList ::= SEQUENCE {
    tbsCertList        TBSCertList,
    signatureAlgorithm AlgorithmIdentifier,
    signatureValue     BIT STRING
}

TBSCertList ::= SEQUENCE {
    version                 Version OPTIONAL,
    signature               AlgorithmIdentifier,
    issuer                  Name,
    thisUpdate              Time,
    nextUpdate              Time OPTIONAL,
    revokedCertificates     SEQUENCE OF RevokedCertificate OPTIONAL,
    extensions              [0] EXPLICIT Extensions OPTIONAL
}

RevokedCertificate ::= SEQUENCE {
    userCertificate         CertificateSerialNumber,
    revocationDate          Time,
    crlEntryExtensions      Extensions OPTIONAL
}
```

---

## 7. Hạn Chế & Lưu Ý Quan Trọng

1. **Root CA Private Key:** Phải được mã hóa bằng AES-256-GCM trước khi lưu vào database. Không bao giờ log hoặc hiển thị private key.
2. **Key Length:**
   - RSA: Tối thiểu **2048-bit** (khuyến nghị 4096-bit cho Root CA)
   - ECDSA: **P-256** hoặc **P-384** (P-521 cũng được hỗ trợ)
3. **Serial Number:** Phải là số nguyên dương, tối đa 20 octets (160 bits)
4. **Validity cho End-Entity:** Tối đa **397 ngày** theo CA/Browser Forum Baseline Requirements
5. **SAN bắt buộc:** Tất cả chứng chỉ TLS server phải có `SubjectAlternativeName` với ít nhất 1 DNS name
6. **OCSP Must-Staple:** Có thể thêm extension `1.3.6.1.5.5.7.48.1.5` để yêu cầu stapling OCSP

---

## 8. Tham Chiếu Đến Sprint Plan

| Sprint       | Task liên quan                 | Nội dung                                                      |
| ------------ | ------------------------------ | ------------------------------------------------------------- |
| **Sprint 2** | BE-2.2, BE-2.3, BE-2.4, BE-2.5 | Sinh Root CA key pair, sinh Root Certificate, mã hóa lưu key  |
| **Sprint 3** | BE-3.1, BE-3.3, BE-3.6         | Customer key gen, CSR generation, mã hóa private key customer |
| **Sprint 4** | BE-4.2, BE-4.4, BE-4.7         | Ký certificate từ CSR, sinh serial number                     |
| **Sprint 5** | BE-5.5, BE-5.8                 | CRL generation, parse uploaded certificate                    |

---

## Tài Liệu Tham Khảo

| Tài liệu       | Liên kết                                                                       | Phần liên quan                        |
| -------------- | ------------------------------------------------------------------------------ | ------------------------------------- |
| RFC 5280       | [IETF](https://datatracker.ietf.org/doc/html/rfc5280)                          | Cấu trúc X509, CRL, extensions đầy đủ |
| ITU-T X.509    | [ITU](https://www.itu.int/rec/T-REC-X.509)                                     | Định nghĩa ASN.1 gốc                  |
| RFC 3279       | [IETF](https://datatracker.ietf.org/doc/html/rfc3279)                          | Thuật toán mã hóa (RSA, DSA, ECDSA)   |
| RFC 4055       | [IETF](https://datatracker.ietf.org/doc/html/rfc4055)                          | RSA-PSS, RSA-OAEP                     |
| CA/B Forum BR  | [cabforum.org](https://cabforum.org/baseline-requirements/)                    | Quy tắc phát hành (397 ngày, SAN...)  |
| NIST SP 800-57 | [NIST](https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final) | Khuyến nghị độ dài khóa               |
