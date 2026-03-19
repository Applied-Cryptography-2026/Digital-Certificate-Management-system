import { useState } from 'react'
import { PageLayout } from '../../components/layout/PageLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'

export default function SystemConfig() {
  const [config, setConfig] = useState({
    algorithm: 'RSA',
    hashFunction: 'SHA-256',
    keyLength: '2048',
    defaultValidity: '365',
    maxValidity: '3',
    passwordMinLength: '12',
    jwtExpiry: '60',
    rateLimit: '100',
  })

  const handleSave = () => {
    console.log('Saving configuration:', config)
  }

  return (
    <PageLayout>
      <div className="flex flex-col gap-2">
        <h1 className="text-[32px] font-display font-semibold text-text-primary">
          System Configuration
        </h1>
        <p className="text-sm font-mono text-text-tertiary">Manage PKI system settings</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Cryptographic Settings */}
          <Card>
            <h3 className="text-sm font-semibold font-display text-text-primary mb-6">
              Cryptographic Settings
            </h3>
            <div className="flex flex-col gap-5">
              <Select
                label="Algorithm"
                options={[
                  { value: 'RSA', label: 'RSA' },
                  { value: 'ECDSA', label: 'ECDSA' },
                ]}
                value={config.algorithm}
                onChange={(e) => setConfig({ ...config, algorithm: e.target.value })}
              />
              <Select
                label="Hash Function"
                options={[
                  { value: 'SHA-256', label: 'SHA-256' },
                  { value: 'SHA-384', label: 'SHA-384' },
                  { value: 'SHA-512', label: 'SHA-512' },
                ]}
                value={config.hashFunction}
                onChange={(e) => setConfig({ ...config, hashFunction: e.target.value })}
              />
              <Select
                label="Key Length"
                options={[
                  { value: '2048', label: '2048 bits' },
                  { value: '4096', label: '4096 bits' },
                ]}
                value={config.keyLength}
                onChange={(e) => setConfig({ ...config, keyLength: e.target.value })}
              />
            </div>
          </Card>

          {/* Certificate Validity */}
          <Card>
            <h3 className="text-sm font-semibold font-display text-text-primary mb-6">
              Certificate Validity
            </h3>
            <div className="flex flex-col gap-5">
              <Select
                label="Default Validity"
                options={[
                  { value: '365', label: '365 days (1 year)' },
                  { value: '730', label: '730 days (2 years)' },
                ]}
                value={config.defaultValidity}
                onChange={(e) => setConfig({ ...config, defaultValidity: e.target.value })}
              />
              <Select
                label="Maximum Validity"
                options={[
                  { value: '1', label: '1 year' },
                  { value: '3', label: '3 years' },
                  { value: '5', label: '5 years' },
                ]}
                value={config.maxValidity}
                onChange={(e) => setConfig({ ...config, maxValidity: e.target.value })}
              />
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Security Settings */}
          <Card>
            <h3 className="text-sm font-semibold font-display text-text-primary mb-6">
              Security Settings
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-xs font-mono text-text-secondary">Password Policy</span>
                <span className="text-xs font-mono text-text-primary">Min {config.passwordMinLength} chars, uppercase, number, special</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-xs font-mono text-text-secondary">JWT Expiry</span>
                <span className="text-xs font-mono text-text-primary">{config.jwtExpiry} minutes</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-xs font-mono text-text-secondary">Rate Limiting</span>
                <span className="text-xs font-mono text-text-primary">{config.rateLimit} requests/minute</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-xs font-mono text-text-secondary">Session Timeout</span>
                <span className="text-xs font-mono text-text-primary">8 hours</span>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <Button onClick={handleSave} className="self-start">
            Save Configuration
          </Button>
        </div>
      </div>
    </PageLayout>
  )
}
