import { useState, useEffect } from "react";
import { PageLayout } from "../../components/layout/PageLayout";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";
import { Filter, Download, Loader } from "lucide-react";
import { auditApi } from "../../api/index";

export default function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [userFilter, setUserFilter] = useState("");

  // Fetch audit logs from backend
  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (dateFrom) params.startDate = dateFrom;
      if (dateTo) params.endDate = dateTo;
      if (userFilter) params.userEmail = userFilter;

      const response = await auditApi.getAuditLogs(params);
      if (response?.data?.data) {
        setAuditLogs(response.data.data || []);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch audit logs");
      console.error("Error fetching audit logs:", err);
      // Use mock data for demo if error
      setAuditLogs(getMockAuditLogs());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleFilter = () => {
    fetchAuditLogs();
  };

  const handleClearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setUserFilter("");
    setAuditLogs([]);
  };

  const handleExport = () => {
    // Export logic here
    console.log("Exporting audit logs...");
  };

  // Mock data for demo
  const getMockAuditLogs = () => [
    {
      id: 1,
      timestamp: "2026-03-19 14:32:15",
      user: "admin@example.com",
      action: "CERTIFICATE_ISSUED",
      entity: "api.example.com",
      details: "Certificate issued for 365 days",
    },
    {
      id: 2,
      timestamp: "2026-03-19 12:15:42",
      user: "admin@example.com",
      action: "CSR_APPROVED",
      entity: "CSR-2026-0042",
      details: "Approved CSR for mail.example.com",
    },
    {
      id: 3,
      timestamp: "2026-03-18 16:45:30",
      user: "security@example.com",
      action: "CERTIFICATE_REVOKED",
      entity: "www.example.com",
      details: "Revoked due to key compromise",
    },
    {
      id: 4,
      timestamp: "2026-03-18 10:22:08",
      user: "admin@example.com",
      action: "KEY_PAIR_GENERATED",
      entity: "Root CA",
      details: "New root CA key pair generated",
    },
    {
      id: 5,
      timestamp: "2026-03-17 09:11:55",
      user: "john.doe@example.com",
      action: "CSR_CREATED",
      entity: "CSR-2026-0041",
      details: "New CSR submitted for vpn.example.com",
    },
    {
      id: 6,
      timestamp: "2026-03-16 15:30:21",
      user: "admin@example.com",
      action: "USER_LOGIN",
      entity: "admin@example.com",
      details: "Successful login from 192.168.1.100",
    },
    {
      id: 7,
      timestamp: "2026-03-15 11:45:33",
      user: "jane.smith@example.com",
      action: "CERTIFICATE_ISSUED",
      entity: "db.example.com",
      details: "Certificate issued for 730 days",
    },
  ];

  const getActionColor = (action) => {
    if (
      action.includes("ISSUED") ||
      action.includes("APPROVED") ||
      action.includes("GENERATED")
    ) {
      return "text-lime-accent";
    }
    if (action.includes("REVOKED") || action.includes("REJECTED")) {
      return "text-error";
    }
    if (action.includes("LOGIN")) {
      return "text-info";
    }
    return "text-text-secondary";
  };

  return (
    <PageLayout>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-[32px] font-display font-semibold text-text-primary">
              Audit Logs
            </h1>
            <p className="text-sm font-mono text-text-tertiary">
              Track all system activities and changes
            </p>
          </div>
          <Button variant="secondary" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <Card className="mt-8">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              label="From Date"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <Input
              label="To Date"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <Input
              label="User Filter"
              type="text"
              placeholder="Search by user email..."
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            />
          </div>
          <Button variant="secondary" onClick={handleFilter} disabled={loading}>
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Filter className="w-4 h-4" />
                Apply
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setDateFrom("");
              setDateTo("");
              setUserFilter("");
              setAuditLogs([]);
            }}
            disabled={loading}
          >
            Clear
          </Button>
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card className="mt-6">
        {error && (
          <div className="mb-4 p-4 bg-error/10 border border-error rounded text-error text-sm">
            {error} (showing demo data)
          </div>
        )}

        {loading && auditLogs.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-text-secondary" />
            <span className="ml-2 text-text-secondary">
              Loading audit logs...
            </span>
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-8 text-text-tertiary">
            No audit logs found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {log.timestamp}
                  </TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-mono font-medium ${getActionColor(log.action)}`}
                    >
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-text-primary">
                    {log.entity}
                  </TableCell>
                  <TableCell className="max-w-[300px]">{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </PageLayout>
  );
}
