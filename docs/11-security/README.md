# 🛡️ Security Best Practices Excellence

> *"Build secure applications across all platforms with Context Engineering precision"*

## 🎯 Overview

Security is paramount in modern software development, protecting users, data, and systems from evolving threats. This comprehensive section covers **Security Best Practices** with **Context Engineering** methodology across all development platforms.

## 🚀 What You'll Master

- **Security Fundamentals**: Core principles and threat modeling
- **Platform-Specific Security**: Tailored security practices for each platform
- **Authentication & Authorization**: Secure user identity and access management
- **Data Protection**: Encryption, privacy, and data security
- **Secure Development Lifecycle**: Security integration in development processes
- **Incident Response**: Security breach detection and response strategies

---

## 📋 Security Context Engineering Template

### System Context Layer
```markdown
## Role Definition
You are a Senior Security Engineer with expertise in application security across multiple platforms. You specialize in implementing defense-in-depth strategies, threat modeling, and secure development practices.

## Behavioral Guidelines
- Implement security by design, not as an afterthought
- Follow principle of least privilege and zero trust architecture
- Assume breach mentality with comprehensive monitoring
- Prioritize user privacy and data protection
- Maintain security awareness and threat intelligence
- Document security decisions and risk assessments
- Implement comprehensive security testing and validation

## Quality Standards
- Zero known critical vulnerabilities in production
- All data encrypted in transit and at rest
- Multi-factor authentication for all sensitive access
- Security incident response time under 1 hour
- Regular security audits and penetration testing
- Compliance with relevant security frameworks (SOC 2, ISO 27001)
```

### Domain Context Layer
```markdown
## Security Technology Standards
- **Authentication**: OAuth 2.0, OIDC, SAML, multi-factor authentication
- **Encryption**: TLS 1.3, AES-256, RSA-4096, perfect forward secrecy
- **Authorization**: RBAC, ABAC, JWT tokens with proper validation
- **Security Testing**: SAST, DAST, IAST, dependency scanning
- **Monitoring**: SIEM, EDR, application security monitoring
- **Incident Response**: Automated detection, alert escalation

## Security Architecture Patterns
- **Zero Trust**: Never trust, always verify
- **Defense in Depth**: Multiple security layers
- **Principle of Least Privilege**: Minimal access rights
- **Secure by Default**: Security-first configuration
- **Fail Secure**: Secure failure modes
- **Security Monitoring**: Comprehensive logging and alerting
```

---

## 🔐 Security Fundamentals

### [11.1 Security Principles](01-fundamentals/01-principles.md)
**Core Security Concepts and Threat Modeling**

#### Security Principles:
- **Confidentiality**: Data privacy and access control
- **Integrity**: Data accuracy and authenticity
- **Availability**: System accessibility and resilience
- **Authentication**: Identity verification and validation
- **Authorization**: Access control and permissions
- **Non-repudiation**: Action accountability and audit trails

#### Context Engineering Template:
```markdown
# Security Fundamentals Context Template

## System Context Layer
- Security Architect with threat modeling expertise
- Risk assessment and security design specialist
- Compliance and governance security expert

## Domain Context Layer
- Threat Modeling: STRIDE, PASTA, attack tree analysis
- Risk Assessment: CVSS scoring, business impact analysis
- Compliance: GDPR, CCPA, HIPAA, PCI DSS, SOX
- Standards: OWASP Top 10, NIST Cybersecurity Framework
- Testing: Penetration testing, red team exercises

## Task Context Layer
- Threat landscape and attack vectors relevant to application
- Regulatory compliance requirements and industry standards
- Business risk tolerance and security budget constraints
- User privacy requirements and data sensitivity levels
```

#### Threat Modeling Example:
```markdown
# Application Threat Model

## Assets
- User personal data (PII)
- Payment information
- Business intellectual property
- System infrastructure

## Threats (STRIDE)
- **Spoofing**: Impersonation of legitimate users
- **Tampering**: Unauthorized data modification
- **Repudiation**: Denial of actions performed
- **Information Disclosure**: Unauthorized data access
- **Denial of Service**: System availability attacks
- **Elevation of Privilege**: Unauthorized access escalation

## Mitigations
- Multi-factor authentication
- Input validation and sanitization
- Comprehensive audit logging
- Data encryption and access controls
- Rate limiting and DDoS protection
- Role-based access control (RBAC)
```

---

## 🌐 Platform-Specific Security

### [11.2 Web Application Security](02-platforms/01-web.md)
**Frontend and Backend Web Security**

#### Web Security Threats:
- **Cross-Site Scripting (XSS)**: Client-side code injection
- **Cross-Site Request Forgery (CSRF)**: Unauthorized request execution
- **SQL Injection**: Database manipulation attacks
- **Authentication Bypass**: Weak authentication mechanisms
- **Session Management**: Insecure session handling
- **Security Misconfigurations**: Improper security settings

#### Frontend Security Implementation:
```javascript
// Content Security Policy (CSP)
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://trusted-cdn.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' https://fonts.googleapis.com;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`;

// XSS Prevention
function sanitizeInput(input) {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: []
  });
}

// CSRF Protection
function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Secure API Calls
async function secureApiCall(endpoint, data) {
  const token = localStorage.getItem('auth_token');
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
  
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-CSRF-Token': csrfToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}
```

#### Backend Security Implementation:
```python
# Flask Security Best Practices
from flask import Flask, request, session
from flask_wtf.csrf import CSRFProtect
from werkzeug.security import generate_password_hash, check_password_hash
import logging

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
csrf = CSRFProtect(app)

# Secure session configuration
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    PERMANENT_SESSION_LIFETIME=timedelta(hours=1)
)

# Input validation and sanitization
from marshmallow import Schema, fields, validate

class UserSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8))
    name = fields.Str(required=True, validate=validate.Length(max=100))

# SQL Injection Prevention
from sqlalchemy import text

def get_user_by_email(email):
    # Use parameterized queries
    result = db.session.execute(
        text("SELECT * FROM users WHERE email = :email"),
        {"email": email}
    )
    return result.fetchone()

# Rate limiting
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    # Secure login implementation
    pass
```

---

### [11.3 Mobile Application Security](02-platforms/02-mobile.md)
**iOS, Android, and Cross-Platform Security**

#### Mobile Security Threats:
- **Insecure Data Storage**: Unencrypted local data
- **Insecure Communication**: Unencrypted network traffic
- **Insecure Authentication**: Weak biometric or PIN security
- **Code Tampering**: Application reverse engineering
- **Insecure Authorization**: Improper access controls
- **Client-Side Injection**: Mobile-specific injection attacks

#### iOS Security Implementation:
```swift
// iOS Security Best Practices
import Security
import CryptoKit

class SecureStorage {
    // Keychain storage for sensitive data
    static func store(data: Data, forKey key: String) -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]
        
        SecItemDelete(query as CFDictionary) // Remove existing
        let status = SecItemAdd(query as CFDictionary, nil)
        return status == errSecSuccess
    }
    
    // Certificate pinning
    static func validateCertificate(challenge: URLAuthenticationChallenge) -> Bool {
        guard let serverTrust = challenge.protectionSpace.serverTrust,
              let certificate = SecTrustGetCertificateAtIndex(serverTrust, 0) else {
            return false
        }
        
        let serverCertData = SecCertificateCopyData(certificate)
        let expectedCertPath = Bundle.main.path(forResource: "api_cert", ofType: "cer")!
        let expectedCertData = NSData(contentsOfFile: expectedCertPath)!
        
        return CFEqual(serverCertData, expectedCertData)
    }
    
    // Biometric authentication
    static func authenticateWithBiometrics(completion: @escaping (Bool) -> Void) {
        let context = LAContext()
        let reason = "Authenticate to access secure data"
        
        context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics,
                              localizedReason: reason) { success, error in
            DispatchQueue.main.async {
                completion(success)
            }
        }
    }
}
```

#### Android Security Implementation:
```kotlin
// Android Security Best Practices
class SecureAndroidApp {
    
    // Encrypted SharedPreferences
    private fun getEncryptedSharedPreferences(): SharedPreferences {
        val masterKey = MasterKey.Builder(this)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
            
        return EncryptedSharedPreferences.create(
            this,
            "secure_prefs",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }
    
    // Network Security Config
    // res/xml/network_security_config.xml
    /*
    <?xml version="1.0" encoding="utf-8"?>
    <network-security-config>
        <domain-config cleartextTrafficPermitted="false">
            <domain includeSubdomains="true">api.example.com</domain>
            <pin-set expiration="2025-01-01">
                <pin digest="SHA-256">AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=</pin>
                <pin digest="SHA-256">BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=</pin>
            </pin-set>
        </domain-config>
    </network-security-config>
    */
    
    // Root detection
    private fun isDeviceRooted(): Boolean {
        val rootPaths = arrayOf(
            "/system/app/Superuser.apk",
            "/sbin/su",
            "/system/bin/su",
            "/system/xbin/su"
        )
        
        return rootPaths.any { File(it).exists() }
    }
    
    // Certificate pinning with OkHttp
    private fun createSecureOkHttpClient(): OkHttpClient {
        val certificatePinner = CertificatePinner.Builder()
            .add("api.example.com", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
            .build()
            
        return OkHttpClient.Builder()
            .certificatePinner(certificatePinner)
            .build()
    }
}
```

---

### [11.4 Cloud Security](02-platforms/03-cloud.md)
**Infrastructure and Cloud-Native Security**

#### Cloud Security Areas:
- **Identity and Access Management**: Cloud IAM and federated identity
- **Network Security**: VPC, security groups, network ACLs
- **Data Encryption**: At rest and in transit encryption
- **Container Security**: Image scanning, runtime protection
- **Serverless Security**: Function security and event validation
- **Infrastructure as Code Security**: Secure configuration management

---

## 🔑 Authentication & Authorization

### [11.3 Identity Management](03-identity/README.md)
**Secure User Authentication and Access Control**

#### Modern Authentication Patterns:
- **OAuth 2.0/OIDC**: Delegated authorization and authentication
- **JWT Tokens**: Stateless authentication with proper validation
- **Multi-Factor Authentication**: Multiple verification factors
- **Single Sign-On**: Centralized authentication across systems
- **Zero Trust**: Never trust, always verify principle
- **Passwordless Authentication**: WebAuthn, FIDO2, biometrics

#### OAuth 2.0 Implementation:
```javascript
// OAuth 2.0 Authorization Code Flow
class OAuth2Client {
  constructor(clientId, redirectUri, authServer) {
    this.clientId = clientId;
    this.redirectUri = redirectUri;
    this.authServer = authServer;
  }

  // Generate secure state parameter
  generateState() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate PKCE challenge
  generatePKCE() {
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto.createHash('sha256')
      .update(verifier)
      .digest('base64url');
    
    return { verifier, challenge };
  }

  // Initiate authorization
  authorize(scopes, state, codeChallenge) {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scopes.join(' '),
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    window.location.href = `${this.authServer}/authorize?${params}`;
  }

  // Exchange code for tokens
  async exchangeCodeForTokens(code, codeVerifier) {
    const response = await fetch(`${this.authServer}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        code: code,
        redirect_uri: this.redirectUri,
        code_verifier: codeVerifier
      })
    });

    return response.json();
  }
}
```

#### JWT Security Implementation:
```python
# Secure JWT Implementation
import jwt
import time
from datetime import datetime, timedelta
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding

class SecureJWTManager:
    def __init__(self, private_key, public_key):
        self.private_key = private_key
        self.public_key = public_key
        self.algorithm = 'RS256'
    
    def create_token(self, user_id, roles, expires_in=3600):
        now = datetime.utcnow()
        payload = {
            'iss': 'your-app.com',  # Issuer
            'sub': user_id,         # Subject
            'aud': 'your-app.com',  # Audience
            'iat': now,             # Issued at
            'exp': now + timedelta(seconds=expires_in),  # Expiration
            'nbf': now,             # Not before
            'jti': self.generate_jti(),  # JWT ID
            'roles': roles
        }
        
        return jwt.encode(payload, self.private_key, algorithm=self.algorithm)
    
    def validate_token(self, token):
        try:
            payload = jwt.decode(
                token,
                self.public_key,
                algorithms=[self.algorithm],
                audience='your-app.com',
                issuer='your-app.com'
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise Exception('Token has expired')
        except jwt.InvalidTokenError:
            raise Exception('Invalid token')
    
    def generate_jti(self):
        return hashlib.sha256(
            f"{time.time()}{random.random()}".encode()
        ).hexdigest()
```

---

## 🔒 Data Protection

### [11.4 Data Security](04-data-protection/README.md)
**Encryption, Privacy, and Data Governance**

#### Data Protection Strategies:
- **Encryption at Rest**: Database and file system encryption
- **Encryption in Transit**: TLS/SSL implementation
- **Key Management**: Secure key generation, rotation, and storage
- **Data Classification**: Sensitivity-based data handling
- **Privacy by Design**: GDPR and privacy compliance
- **Data Loss Prevention**: Monitoring and protection mechanisms

#### Encryption Implementation:
```python
# Advanced Encryption Implementation
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
import os
import base64

class DataProtection:
    @staticmethod
    def generate_key_from_password(password: str, salt: bytes = None) -> bytes:
        if salt is None:
            salt = os.urandom(16)
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        return base64.urlsafe_b64encode(kdf.derive(password.encode()))
    
    @staticmethod
    def encrypt_data(data: str, key: bytes) -> str:
        f = Fernet(key)
        encrypted = f.encrypt(data.encode())
        return base64.urlsafe_b64encode(encrypted).decode()
    
    @staticmethod
    def decrypt_data(encrypted_data: str, key: bytes) -> str:
        f = Fernet(key)
        decoded = base64.urlsafe_b64decode(encrypted_data.encode())
        decrypted = f.decrypt(decoded)
        return decrypted.decode()
    
    @staticmethod
    def secure_file_encryption(file_path: str, password: str):
        # Generate salt and key
        salt = os.urandom(16)
        key = DataProtection.generate_key_from_password(password, salt)
        
        # Read file
        with open(file_path, 'rb') as file:
            data = file.read()
        
        # Encrypt
        f = Fernet(key)
        encrypted_data = f.encrypt(data)
        
        # Write encrypted file with salt
        with open(f"{file_path}.encrypted", 'wb') as file:
            file.write(salt + encrypted_data)
```

---

## 🔍 Security Testing & Monitoring

### [11.5 Security Testing](05-testing/README.md)
**Automated Security Testing and Validation**

#### Security Testing Types:
- **Static Application Security Testing (SAST)**: Source code analysis
- **Dynamic Application Security Testing (DAST)**: Runtime testing
- **Interactive Application Security Testing (IAST)**: Hybrid approach
- **Software Composition Analysis (SCA)**: Dependency scanning
- **Infrastructure as Code Security**: Configuration scanning
- **Penetration Testing**: Manual security assessment

#### CI/CD Security Pipeline:
```yaml
# Security Testing in CI/CD
name: Security Pipeline
on: [push, pull_request]

jobs:
  security-tests:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    # Secret scanning
    - name: TruffleHog OSS
      uses: trufflesecurity/trufflehog@main
      with:
        path: ./
        base: ${{ github.event.repository.default_branch }}
        head: HEAD
    
    # Static Application Security Testing
    - name: CodeQL Analysis
      uses: github/codeql-action/analyze@v2
      with:
        languages: 'javascript,python'
    
    # Dependency scanning
    - name: Snyk Security Scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
    
    # Container security scanning
    - name: Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: 'my-app:latest'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    # Infrastructure as Code scanning
    - name: Checkov
      uses: bridgecrewio/checkov-action@master
      with:
        directory: ./terraform
        framework: terraform
```

---

## 🚨 Incident Response

### [11.6 Security Incident Management](06-incident-response/README.md)
**Breach Detection and Response Strategies**

#### Incident Response Process:
- **Preparation**: Incident response plan and team training
- **Detection**: Security monitoring and alert systems
- **Analysis**: Threat analysis and impact assessment
- **Containment**: Incident isolation and damage limitation
- **Eradication**: Threat removal and vulnerability patching
- **Recovery**: System restoration and business continuity
- **Post-Incident**: Lessons learned and process improvement

#### Security Monitoring Implementation:
```python
# Security Event Monitoring
import logging
import json
from datetime import datetime
from enum import Enum

class SecurityEventType(Enum):
    LOGIN_ATTEMPT = "login_attempt"
    FAILED_LOGIN = "failed_login"
    PRIVILEGE_ESCALATION = "privilege_escalation"
    DATA_ACCESS = "data_access"
    CONFIGURATION_CHANGE = "config_change"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"

class SecurityMonitor:
    def __init__(self, logger):
        self.logger = logger
        self.failed_login_threshold = 5
        self.failed_login_window = 300  # 5 minutes
        self.failed_attempts = {}
    
    def log_security_event(self, event_type: SecurityEventType, 
                          user_id: str, ip_address: str, 
                          details: dict = None):
        event = {
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': event_type.value,
            'user_id': user_id,
            'ip_address': ip_address,
            'details': details or {},
            'severity': self.get_event_severity(event_type)
        }
        
        self.logger.info(json.dumps(event))
        
        # Check for brute force attacks
        if event_type == SecurityEventType.FAILED_LOGIN:
            self.check_brute_force(user_id, ip_address)
    
    def check_brute_force(self, user_id: str, ip_address: str):
        key = f"{user_id}:{ip_address}"
        current_time = datetime.utcnow().timestamp()
        
        if key not in self.failed_attempts:
            self.failed_attempts[key] = []
        
        # Clean old attempts
        self.failed_attempts[key] = [
            attempt for attempt in self.failed_attempts[key]
            if current_time - attempt < self.failed_login_window
        ]
        
        # Add current attempt
        self.failed_attempts[key].append(current_time)
        
        # Check threshold
        if len(self.failed_attempts[key]) >= self.failed_login_threshold:
            self.trigger_security_alert(
                SecurityEventType.SUSPICIOUS_ACTIVITY,
                user_id, ip_address,
                {'reason': 'Brute force attack detected'}
            )
    
    def trigger_security_alert(self, event_type: SecurityEventType,
                              user_id: str, ip_address: str, details: dict):
        alert = {
            'alert_type': 'SECURITY_INCIDENT',
            'severity': 'HIGH',
            'event': {
                'type': event_type.value,
                'user_id': user_id,
                'ip_address': ip_address,
                'details': details,
                'timestamp': datetime.utcnow().isoformat()
            }
        }
        
        # Send to SIEM system
        self.send_to_siem(alert)
        
        # Trigger automated response
        self.automated_response(alert)
    
    def automated_response(self, alert):
        # Implement automated incident response
        # - Block IP address
        # - Disable user account
        # - Notify security team
        pass
```

---

## 🛡️ Security Compliance & Governance

### [11.7 Compliance Frameworks](07-compliance/README.md)
**Regulatory Compliance and Security Standards**

#### Major Compliance Frameworks:
- **GDPR**: General Data Protection Regulation
- **CCPA**: California Consumer Privacy Act
- **HIPAA**: Health Insurance Portability and Accountability Act
- **PCI DSS**: Payment Card Industry Data Security Standard
- **SOC 2**: Service Organization Control 2
- **ISO 27001**: Information Security Management

#### GDPR Compliance Implementation:
```javascript
// GDPR Compliance Features
class GDPRCompliance {
  constructor() {
    this.consentTypes = [
      'analytics',
      'marketing',
      'functional',
      'necessary'
    ];
  }

  // Consent management
  requestConsent(userId, consentTypes) {
    const consent = {
      userId: userId,
      timestamp: new Date().toISOString(),
      consentGiven: consentTypes,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent
    };
    
    return this.storeConsent(consent);
  }

  // Right to be forgotten
  async deleteUserData(userId) {
    const deletionLog = {
      userId: userId,
      timestamp: new Date().toISOString(),
      dataTypes: ['profile', 'analytics', 'transactions'],
      requestedBy: userId,
      status: 'initiated'
    };
    
    try {
      // Delete from all systems
      await this.deleteFromDatabase(userId);
      await this.deleteFromAnalytics(userId);
      await this.deleteFromBackups(userId);
      
      deletionLog.status = 'completed';
    } catch (error) {
      deletionLog.status = 'failed';
      deletionLog.error = error.message;
    }
    
    return this.logDeletion(deletionLog);
  }

  // Data portability
  async exportUserData(userId) {
    const userData = {
      profile: await this.getUserProfile(userId),
      analytics: await this.getUserAnalytics(userId),
      transactions: await this.getUserTransactions(userId),
      exportDate: new Date().toISOString(),
      format: 'JSON'
    };
    
    return this.encryptExport(userData);
  }

  // Privacy by design
  anonymizeData(data, fields) {
    const anonymized = { ...data };
    
    fields.forEach(field => {
      if (anonymized[field]) {
        anonymized[field] = this.generateAnonymousValue(field);
      }
    });
    
    return anonymized;
  }
}
```

---

## 📚 Security Resources & Tools

### Security Testing Tools
- **SAST**: SonarQube, Checkmarx, Veracode
- **DAST**: OWASP ZAP, Burp Suite, Nessus
- **Container Security**: Trivy, Clair, Snyk
- **Dependency Scanning**: Snyk, WhiteSource, FOSSA

### Security Frameworks & Standards
- **OWASP**: Top 10, ASVS, SAMM
- **NIST**: Cybersecurity Framework, SP 800 series
- **CIS**: Controls and Benchmarks
- **SANS**: Top 25 Software Errors

### Security Monitoring & SIEM
- **Commercial**: Splunk, QRadar, ArcSight
- **Open Source**: ELK Stack, OSSIM, Wazuh
- **Cloud**: AWS Security Hub, Azure Sentinel, Google Security Command Center

---

## 🚀 Advanced Security Topics

### DevSecOps Integration
- **Shift-Left Security**: Early security testing
- **Security as Code**: Infrastructure and policy automation
- **Continuous Compliance**: Automated compliance monitoring

### Zero Trust Architecture
- **Identity Verification**: Continuous authentication
- **Least Privilege Access**: Minimal permissions
- **Micro-segmentation**: Network isolation
- **Encryption Everywhere**: End-to-end encryption

### AI/ML Security
- **Model Security**: Adversarial attack protection
- **Data Privacy**: Federated learning, differential privacy
- **Bias Detection**: Fairness and ethical AI

---

**Next**: [Version Control & Collaboration](../12-version-control/README.md) | **Up**: [Table of Contents](../TOC.md)

*This section provides comprehensive security best practices with Context Engineering methodology across all platforms and security domains.*