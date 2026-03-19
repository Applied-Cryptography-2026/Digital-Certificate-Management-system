import { useState } from "react";
import { FileBadge } from "lucide-react";
import { PageLayout } from "../../components/layout/PageLayout";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

const keyPairs = [
  "Production Server Key (RSA-2048)",
  "Development Key (ECDSA-P256)",
  "Staging Key (RSA-4096)",
];

export default function CSRSubmission() {
  const [selectedKey, setSelectedKey] = useState(keyPairs[0]);

  const isRSA = selectedKey.includes("RSA");
  const keySize = isRSA
    ? selectedKey.includes("4096")
      ? "4096"
      : "2048"
    : "256";
  const algorithm = isRSA ? "RSA" : "ECDSA";

  return (
    <PageLayout
      title="Submit Certificate Signing Request"
      subtitle="Request a new certificate from your CA"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Domain Information */}
        <Card className="bg-zinc-900 border border-zinc-800">
          <CardHeader title="Domain Information" />
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                Domain Name <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g., example.com"
                className="w-full bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                Organization
              </label>
              <Input
                type="text"
                placeholder="e.g., Acme Corp"
                className="w-full bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                Country
              </label>
              <select className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:border-[#BFFF00]">
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Key Configuration */}
        <Card className="bg-zinc-900 border border-zinc-800">
          <CardHeader title="Key Configuration" />
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                Key Pair
              </label>
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:border-[#BFFF00]"
              >
                {keyPairs.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-md p-4">
              <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-3">
                Key Information
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-400">Algorithm:</span>
                  <span className="text-sm text-zinc-200 font-mono">
                    {algorithm}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-400">Key Size:</span>
                  <span className="text-sm text-zinc-200 font-mono">
                    {keySize} bits
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          className="bg-[#BFFF00] text-black hover:bg-[#d4ff33] font-semibold px-6"
          icon={<FileBadge size={16} />}
        >
          Submit CSR
        </Button>
      </div>
    </PageLayout>
  );
}
