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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Filter,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  X,
  Code,
  Calendar,
  Monitor,
  Hash,
  ChevronRight,
} from "lucide-react";
import PaginatedTable from "@/components/PaginatedTable";
import ModalContainer from "@/components/ModalContainer";
import { useErrors, useResolveError } from "@/pages/dashboard/hooks/useErrors";
import { ErrorLog, getErrorById } from "@/api/stats";

// Dynamic Context Display Component
interface ContextDisplayProps {
  data: Record<string, any> | null | undefined;
  title?: string;
}

const ContextDisplay = ({ data, title = "Context" }: ContextDisplayProps) => {
  const renderValue = (value: any, key: string = ""): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>;
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
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide px-2 py-1 rounded border">
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
        <div className="space-y-2 rounded-md p-3 border">
          {value.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-xs text-gray-400 mt-1">•</span>
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
        <div className="bg-gray-900 text-green-400 rounded-lg p-3 text-sm font-mono overflow-x-auto border">
          <pre className="whitespace-pre-wrap">{stringValue}</pre>
        </div>
      );
    }

    return (
      <span className="text-sm text-gray-900 px-2 py-1 rounded border">
        {stringValue}
      </span>
    );
  };

  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b pb-2">
        <Code className="w-5 h-5 text-blue-600" />
        {title}
      </h4>
      <div className="rounded-xl p-6 space-y-4 border">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-800 px-3 py-1.5 rounded-lg border">
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

const ErrorAnalyticsView = () => {
  const [selectedErrorId, setSelectedErrorId] = useState<string | null>(null);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorDetailLoading, setErrorDetailLoading] = useState(false);

  const {
    errors,
    pagination,
    isLoading,
    error,
    setPage,
    setLimit,
    setLevel,
    setCategory,
    setResolved,
    setSearch,
    setSortBy,
    setSortOrder,
    resetFilters,
  } = useErrors({
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });

  // Fetch error details when selectedErrorId changes
  useEffect(() => {
    const fetchErrorDetails = async () => {
      if (!selectedErrorId) {
        setSelectedError(null);
        return;
      }

      setErrorDetailLoading(true);
      try {
        const { data, error } = await getErrorById(selectedErrorId);
        if (error) {
          console.error("Error fetching error details:", error);
          setSelectedError(null);
        } else {
          setSelectedError(data || null);
        }
      } catch (err) {
        console.error("Failed to fetch error:", err);
        setSelectedError(null);
      } finally {
        setErrorDetailLoading(false);
      }
    };

    fetchErrorDetails();
  }, [selectedErrorId]);

  const { resolveError, isResolving } = useResolveError();

  const handleResolveError = async (errorId: string) => {
    const result = await resolveError(errorId, {
      resolved: true,
      resolutionNotes: "Resolved from analytics view",
      resolvedBy: "admin",
    });

    if (result) {
      setSelectedErrorId(null);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-500 text-white hover:bg-red-600 shadow-lg";
      case "ERROR":
        return "bg-red-100 text-red-800 hover:bg-red-200 border-red-200";
      case "WARNING":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200";
      case "INFO":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200";
    }
  };

  const getStatusIcon = (resolved: boolean) => {
    return resolved ? (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 border-2 border-green-200">
        <CheckCircle className="w-5 h-5 text-green-600" />
      </div>
    ) : (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 border-2 border-red-200">
        <XCircle className="w-5 h-5 text-red-600" />
      </div>
    );
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

  const renderErrorsTable = (filteredData: ErrorLog[], startIndex: number) => (
    <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
        <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Level</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-4">Message</div>
          <div className="col-span-2">Created</div>
          <div className="col-span-1">Action</div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {filteredData.map((errorItem, index) => (
          <div
            key={errorItem.id}
            className="px-6 py-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer group"
            onClick={() => setSelectedErrorId(errorItem.id)}
          >
            <div className="grid grid-cols-12 gap-4 items-center text-sm">
              <div className="col-span-1">
                {getStatusIcon(errorItem.resolved)}
              </div>

              <div className="col-span-2">
                <Badge
                  className={`${getLevelColor(errorItem.level)} font-medium px-3 py-1`}
                >
                  {errorItem.level}
                </Badge>
              </div>

              <div className="col-span-2">
                <span className="text-gray-600 font-medium bg-gray-50 px-2 py-1 rounded-md">
                  {errorItem.category}
                </span>
              </div>

              <div className="col-span-4">
                <p
                  className="truncate text-gray-900 font-medium"
                  title={errorItem.message}
                >
                  {errorItem.message}
                </p>
                {errorItem.errorCode && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    {errorItem.errorCode}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <div className="flex items-center text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                  <Clock className="w-3 h-3 mr-2" />
                  {formatDate(errorItem.createdAt)}
                </div>
              </div>

              <div className="col-span-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-blue-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedErrorId(errorItem.id);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="px-6 py-12 text-center text-gray-500">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg">No errors found matching your criteria</p>
        </div>
      )}
    </div>
  );

  if (error) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Failed to load errors: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Error Analytics
          </h1>
          <p className="text-lg text-gray-600">
            Monitor and manage application errors with ease
          </p>
        </div>

        {/* Filters Card */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Filter className="w-5 h-5 text-blue-600" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setSearch(e.target.value);
                    }}
                    className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                </div>
              </div>

              {/* Level Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Level
                </label>
                <Select onValueChange={(value) => setLevel(value as any)}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-400">
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All levels</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="ERROR">Error</SelectItem>
                    <SelectItem value="WARNING">Warning</SelectItem>
                    <SelectItem value="INFO">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Status
                </label>
                <Select onValueChange={(value) => setResolved(value as any)}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-400">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="false">Unresolved</SelectItem>
                    <SelectItem value="true">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Sort by
                </label>
                <Select onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-400">
                    <SelectValue placeholder="Created date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Created date</SelectItem>
                    <SelectItem value="level">Level</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="resolved">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="hover:bg-gray-50"
              >
                Reset Filters
              </Button>

              {pagination && (
                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-md">
                  Showing {errors.length} of {pagination.totalCount} errors
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Errors Table */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-gray-800">Errors</CardTitle>
            <CardDescription className="text-gray-600">
              Click on any error to view detailed information
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : (
              <PaginatedTable
                data={errors}
                renderTable={renderErrorsTable}
                defaultItemsPerPage={20}
              />
            )}
          </CardContent>
        </Card>

        {/* Error Detail Modal */}
        <ModalContainer
          isOpen={!!selectedErrorId}
          onClose={() => setSelectedErrorId(null)}
        >
          <Card className="max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-0">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    Error Details
                  </CardTitle>
                  <CardDescription className="mt-2 text-gray-600">
                    Error ID:{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {selectedErrorId}
                    </code>
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedErrorId(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              {errorDetailLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                </div>
              ) : selectedError ? (
                <div className="space-y-8">
                  {/* Header Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="rounded-lg p-4 border">
                      <label className="text-sm font-semibold text-gray-600 block mb-2">
                        Level
                      </label>
                      <Badge
                        className={`${getLevelColor(selectedError.level)} text-sm px-3 py-1`}
                      >
                        {selectedError.level}
                      </Badge>
                    </div>

                    <div className="rounded-lg p-4 border">
                      <label className="text-sm font-semibold text-gray-600 block mb-2">
                        Category
                      </label>
                      <p className="text-sm font-medium">
                        {selectedError.category}
                      </p>
                    </div>

                    <div className="rounded-lg p-4 border">
                      <label className="text-sm font-semibold text-gray-600 block mb-2">
                        Status
                      </label>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedError.resolved)}
                        <span className="text-sm font-medium">
                          {selectedError.resolved ? "Resolved" : "Unresolved"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="rounded-xl p-6 border">
                    <label className="text-lg font-semibold text-gray-800 block mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-blue-600" />
                      Message
                    </label>
                    <p className="text-gray-900 p-4 rounded-lg border">
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
                      <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto border shadow-inner">
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
                      <div className="rounded-lg p-4 border">
                        <label className="text-sm font-semibold text-gray-600 flex items-center gap-2 mb-2">
                          <Hash className="w-4 h-4" />
                          Error Code
                        </label>
                        <p className="text-sm font-mono px-3 py-2 rounded border">
                          {selectedError.errorCode}
                        </p>
                      </div>
                    )}

                    {selectedError.action && (
                      <div className="rounded-lg p-4 border">
                        <label className="text-sm font-semibold text-gray-600 block mb-2">
                          Action
                        </label>
                        <p className="text-sm px-3 py-2 rounded border">
                          {selectedError.action}
                        </p>
                      </div>
                    )}

                    {selectedError.userId && (
                      <div className="rounded-lg p-4 border">
                        <label className="text-sm font-semibold text-gray-600 flex items-center gap-2 mb-2">
                          <User className="w-4 h-4" />
                          User ID
                        </label>
                        <p className="text-sm font-mono px-3 py-2 rounded border break-all">
                          {selectedError.userId}
                        </p>
                      </div>
                    )}

                    <div className="rounded-lg p-4 border">
                      <label className="text-sm font-semibold text-gray-600 flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4" />
                        Created At
                      </label>
                      <p className="text-sm px-3 py-2 rounded border">
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
                        <Monitor className="w-5 h-5 text-blue-600" />
                        System Information
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-xl border">
                        {selectedError.vscodeVersion && (
                          <div className="p-3 rounded-lg border">
                            <div className="text-xs font-semibold text-gray-600 mb-1">
                              VS Code
                            </div>
                            <div className="text-sm font-mono">
                              {selectedError.vscodeVersion}
                            </div>
                          </div>
                        )}
                        {selectedError.extensionVersion && (
                          <div className="p-3 rounded-lg border">
                            <div className="text-xs font-semibold text-gray-600 mb-1">
                              Extension
                            </div>
                            <div className="text-sm font-mono">
                              {selectedError.extensionVersion}
                            </div>
                          </div>
                        )}
                        {selectedError.operatingSystem && (
                          <div className="p-3 rounded-lg border">
                            <div className="text-xs font-semibold text-gray-600 mb-1">
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
                        onClick={() => handleResolveError(selectedError.id)}
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
                <div className="text-center py-12 text-gray-500">
                  <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg">Error details not found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </ModalContainer>
      </div>
    </div>
  );
};

export default ErrorAnalyticsView;
