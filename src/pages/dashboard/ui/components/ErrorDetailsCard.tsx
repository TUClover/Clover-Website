import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  Code,
  Calendar,
  Monitor,
  Hash,
  ChevronRight,
  User,
} from "lucide-react";
import { ErrorLog, getErrorById } from "@/api/stats";
import { useResolveError } from "@/pages/dashboard/hooks/useErrors";
import { Label } from "@/components/ui/label";

interface ContextDisplayProps {
  data: Record<string, any> | null | undefined;
  title?: string;
}

const ContextDisplay = ({ data, title = "Context" }: ContextDisplayProps) => {
  const renderValue = (value: any, key: string = ""): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">null</span>;
    }

    if (typeof value === "boolean") {
      return (
        <Badge variant={value ? "default" : "secondary"} className="text-xs">
          {value.toString()}
        </Badge>
      );
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      return (
        <div className="space-y-3 ml-4 border-l-2 border-gray-200 pl-4">
          {Object.entries(value).map(([nestedKey, nestedValue]) => (
            <div key={nestedKey} className="flex flex-col space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1 rounded">
                {nestedKey}
              </span>
              <div className="ml-2">{renderValue(nestedValue, nestedKey)}</div>
            </div>
          ))}
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div className="space-y-2 rounded-md p-3">
          {value.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-xs text-muted-foreground mt-1">•</span>
              <div className="flex-1">{renderValue(item)}</div>
            </div>
          ))}
        </div>
      );
    }

    // String/primitive values
    const stringValue = String(value);
    if (stringValue.length > 60 || stringValue.includes("\n")) {
      return (
        <div className="bg-gray-900 text-green-400 rounded-lg p-3 text-sm font-mono overflow-x-auto">
          <pre className="whitespace-pre-wrap">{stringValue}</pre>
        </div>
      );
    }

    return (
      <span className="text-sm text-gray-900 px-2 py-1 rounded">
        {stringValue}
      </span>
    );
  };

  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-muted-foreground flex items-center gap-2 pb-2">
        <Code className="w-5 h-5" />
        {title}
      </h4>
      <div className="rounded-xl p-6 space-y-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground px-3 py-1.5 rounded-lg">
                {key}
              </span>
            </div>
            <div className="ml-6">{renderValue(value, key)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ErrorDetailsCardProps {
  errorId: string;
  onClose: () => void;
}

export const ErrorDetailsCard = ({
  errorId,
  onClose,
}: ErrorDetailsCardProps) => {
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [errorDetailLoading, setErrorDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { resolveError, isResolving } = useResolveError();

  // Fetch error details when errorId changes
  useEffect(() => {
    const fetchErrorDetails = async () => {
      if (!errorId) {
        setSelectedError(null);
        return;
      }

      setErrorDetailLoading(true);
      setError(null);
      try {
        const { data, error } = await getErrorById(errorId);
        if (error) {
          console.error("Error fetching error details:", error);
          setError(error);
          setSelectedError(null);
        } else {
          console.log("Fetched error details:", data);
          setSelectedError(data || null);
        }
      } catch (err) {
        console.error("Failed to fetch error:", err);
        setError("Failed to fetch error details");
        setSelectedError(null);
      } finally {
        setErrorDetailLoading(false);
      }
    };

    fetchErrorDetails();
  }, [errorId]);

  const handleResolveError = async () => {
    if (!selectedError) return;

    const result = await resolveError(selectedError.id, {
      resolved: true,
      resolutionNotes: "Resolved from analytics view",
      resolvedBy: "admin",
    });

    if (result) {
      onClose();
    }
  };

  const formatDate = (dateString: string, showFull: boolean = false) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      if (showFull) {
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch (error) {
      return "Invalid date";
    }
  };

  if (error) {
    return (
      <Card className="max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="flex items-center gap-3 text-xl">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Error Loading Details
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl">
              Error Details
            </CardTitle>
            <CardDescription className="mt-3 text-muted-foreground">
              Error ID:{" "}
              <code className="px-2 py-1 rounded text-sm">{errorId}</code>
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        {errorDetailLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-500 border-t-transparent"></div>
          </div>
        ) : selectedError ? (
          <div className="space-y-8">
            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-lg p-4">
                <label className="text-sm font-semibold text-muted-foreground block mb-2">
                  Type
                </label>
                <Badge
                  variant={
                    selectedError.level === "CRITICAL"
                      ? "error"
                      : selectedError.level === "ERROR"
                        ? "destructive"
                        : selectedError.level === "WARNING"
                          ? "warning"
                          : "default"
                  }
                  className="w-20 justify-center text-xs"
                >
                  {selectedError.level}
                </Badge>
              </div>

              <div className="rounded-lg p-4">
                <label className="text-sm font-semibold text-muted-foreground block mb-2">
                  Category
                </label>
                <p className="text-sm font-medium">{selectedError.category}</p>
              </div>

              <div className="rounded-lg p-4">
                <label className="text-sm font-semibold text-muted-foreground block mb-2">
                  Status
                </label>
                <Badge
                  variant={selectedError.resolved ? "default" : "destructive"}
                  className="w-20 justify-center text-xs"
                >
                  {selectedError.resolved ? "Resolved" : "Open"}
                </Badge>
              </div>
            </div>

            {/* Message */}
            <div className="rounded-xl p-6">
              <Label className="text-lg font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Message
              </Label>
              <p className="text-gray-300 p-4 rounded-lg">
                {selectedError.message}
              </p>
            </div>

            {/* Stack Trace */}
            {selectedError.stackTrace && (
              <div className="space-y-3">
                <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Code className="w-5 h-5 text-red-600" />
                  Stack Trace
                </label>
                <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto shadow-inner">
                  {selectedError.stackTrace}
                </pre>
              </div>
            )}

            {/* Context */}
            {selectedError.context && (
              <ContextDisplay
                data={selectedError.context}
                title="Context Data"
              />
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedError.errorCode && (
                <div className="rounded-lg p-4">
                  <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                    <Hash className="w-4 h-4" />
                    Error Code
                  </label>
                  <p className="text-sm font-mono px-3 py-2 rounded">
                    {selectedError.errorCode}
                  </p>
                </div>
              )}

              {selectedError.action && (
                <div className="rounded-lg p-4">
                  <label className="text-sm font-semibold text-muted-foreground block mb-2">
                    Action
                  </label>
                  <p className="text-sm px-3 py-2 rounded">
                    {selectedError.action}
                  </p>
                </div>
              )}

              {selectedError.userId && (
                <div className="rounded-lg p-4">
                  <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    User ID
                  </label>
                  <p className="text-sm font-mono px-3 py-2 rounded break-all">
                    {selectedError.userId}
                  </p>
                </div>
              )}

              <div className="rounded-lg p-4">
                <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" />
                  Created At
                </label>
                <p className="text-sm px-3 py-2 rounded">
                  {formatDate(selectedError.createdAt, true)}
                </p>
              </div>
            </div>

            {/* System Info */}
            {(selectedError.vscodeVersion ||
              selectedError.extensionVersion ||
              selectedError.operatingSystem) && (
              <div className="space-y-4">
                <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-muted-foreground" />
                  System Information
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-xl">
                  {selectedError.vscodeVersion && (
                    <div className="p-3 rounded-lg">
                      <div className="text-xs font-semibold text-muted-foreground mb-1">
                        VS Code
                      </div>
                      <div className="text-sm font-mono">
                        {selectedError.vscodeVersion}
                      </div>
                    </div>
                  )}
                  {selectedError.extensionVersion && (
                    <div className="p-3 rounded-lg">
                      <div className="text-xs font-semibold text-muted-foreground mb-1">
                        Extension
                      </div>
                      <div className="text-sm font-mono">
                        {selectedError.extensionVersion}
                      </div>
                    </div>
                  )}
                  {selectedError.operatingSystem && (
                    <div className="p-3 rounded-lg">
                      <div className="text-xs font-semibold text-muted-foreground mb-1">
                        OS
                      </div>
                      <div className="text-sm font-mono">
                        {selectedError.operatingSystem}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              {!selectedError.resolved && (
                <Button
                  onClick={handleResolveError}
                  disabled={isResolving}
                  className="text-white px-6 py-2 flex items-center gap-2 shadow-lg"
                >
                  {isResolving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Mark as Resolved
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg">Error details not found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ErrorDetailsCard;
