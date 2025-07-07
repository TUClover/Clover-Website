import { Suggestion, UserActivityLogItem } from "../api/types/suggestion";
import { useCallback, useEffect, useState } from "react";
import { Card } from "./ui/card";
import { ActiveUserMode } from "../api/types/user";
import { getEventsForMode } from "../api/types/event";
import { Loader2, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { getSuggestionByModeAndId } from "../api/suggestion";

interface SuggestionTableProps {
  logItems: UserActivityLogItem[];
  startIndex?: number;
  mode: ActiveUserMode;
}

/**
 * SuggestionTable component displays a table of user activity log items and allows the user to view details of a selected suggestion.
 * It fetches suggestion details from the server when a log item is clicked.
 * @param param0 - props for the SuggestionTable component
 * @param param0.logItems - array of log items to display in the table
 * @param param0.range - range of log items to display (default is [0, 10])
 * @returns
 */
export const SuggestionTable = ({
  logItems,
  startIndex = 0,
  mode,
}: SuggestionTableProps) => {
  const [selectedLogItem, setSelectedLogItem] =
    useState<UserActivityLogItem | null>(null);
  const [suggestionDetail, setSuggestionDetail] = useState<Suggestion | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const events = getEventsForMode(mode);

  const isAcceptEvent = useCallback(
    (event: string) => {
      return (
        event === events?.accept ||
        event.includes("ACCEPT") ||
        event.includes("accept")
      );
    },
    [events]
  );

  const getDecisionCorrectness = (logItem: UserActivityLogItem) => {
    const isAccept = isAcceptEvent(logItem.event);
    const hasBug = logItem.hasBug || logItem.hasBug;

    const isCorrect = (isAccept && !hasBug) || (!isAccept && hasBug);
    return isCorrect ? "Correct" : "Incorrect";
  };

  useEffect(() => {
    const fetchSuggestion = async () => {
      if (!selectedLogItem?.id) return;

      setLoading(true);
      setFetchError(null);

      try {
        const result = await getSuggestionByModeAndId(selectedLogItem, mode);

        if (result.error) {
          setFetchError(result.error);
          setSuggestionDetail(null);
        }

        if (result.data) {
          const modifiedResult: Suggestion = {
            ...result.data,
            time_lapse: selectedLogItem.duration,
            accepted: isAcceptEvent(selectedLogItem.event),
          };

          setSuggestionDetail(modifiedResult || null);
        }
      } catch (err) {
        setFetchError(
          err instanceof Error ? err.message : "Failed to fetch suggestion"
        );
        setSuggestionDetail(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLogItem]);

  return (
    <>
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Decision</TableHead>
              <TableHead>Has Bug</TableHead>
              <TableHead>Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logItems.map((logItem, index) => {
              const isAccept = isAcceptEvent(logItem.event);
              const hasBug = logItem.hasBug || logItem.hasBug;
              const correctness = getDecisionCorrectness(logItem);

              return (
                <TableRow
                  key={logItem.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedLogItem(logItem)}
                >
                  <TableCell>{startIndex + index + 1}</TableCell>
                  <TableCell>
                    {new Date(
                      logItem.createdAt || logItem.createdAt
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={isAccept ? "default" : "destructive"}
                      className="w-20 justify-center"
                    >
                      {isAccept ? "Accepted" : "Rejected"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={hasBug ? "destructive" : "default"}
                      className="w-10 justify-center"
                    >
                      {hasBug ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        correctness === "Correct" ? "default" : "destructive"
                      }
                      className="w-20 justify-center"
                    >
                      {correctness}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedLogItem && (
        <div
          className="fixed inset-0 bg-black/20 z-50 flex justify-center items-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedLogItem(null);
            }
          }}
        >
          <Card className="p-6 max-w-3xl lg:max-w-5xl w-full max-h-[90vh] relative bg-white dark:bg-black">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setSelectedLogItem(null)}
            >
              <X className="h-4 w-4" />
            </Button>

            <h3 className="text-xl font-bold text-primary mb-4">
              Code Suggestion Details
            </h3>

            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="animate-spin h-8 w-8" />
              </div>
            ) : fetchError ? (
              <div className="text-destructive p-4 bg-destructive/10 rounded-md">
                {fetchError}
              </div>
            ) : suggestionDetail ? (
              <SuggestionDetailCard
                log={selectedLogItem}
                suggestion={suggestionDetail}
              />
            ) : (
              <p className="text-muted-foreground">
                No suggestion details available
              </p>
            )}
          </Card>
        </div>
      )}
    </>
  );
};

export default SuggestionTable;

/**
 * SuggestionDetailCard component displays the details of a code suggestion.
 * It shows the suggested code, status, bug detection, model, response time, and prompt.
 * @param param0 - props for the SuggestionDetailCard component
 * @param param0.suggestion - suggestion object containing details of the suggestion
 * @returns {JSX.Element} - JSX element representing the suggestion detail card
 */
export const SuggestionDetailCard = ({
  log,
  suggestion,
}: {
  log: UserActivityLogItem;
  suggestion: Suggestion;
}) => {
  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Suggested Code Section */}
      <div className="flex-1 flex flex-col min-h-0">
        {suggestion.has_bug ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                Correct Suggestion
              </h4>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                Incorrect Suggestion
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
              <pre className="bg-sidebar p-4 rounded-md overflow-x-auto text-sm overflow-auto max-h-64">
                {suggestion.suggestion_array[0] || "No code provided"}
              </pre>
              <pre className="bg-sidebar p-4 rounded-md overflow-x-auto text-sm overflow-auto max-h-64">
                {suggestion.suggestion_array[1] || "No code provided"}
              </pre>
            </div>
          </>
        ) : (
          <>
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Suggested Code
            </h4>
            <pre className="bg-sidebar p-4 rounded-md overflow-x-auto text-sm overflow-auto max-h-64">
              {suggestion.suggestion_array[0] || "No code provided"}
            </pre>
          </>
        )}
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-gray-700 dark:text-gray-300">
            Status
          </h4>
          <p
            className={suggestion.accepted ? "text-green-500" : "text-red-500"}
          >
            {suggestion.accepted ? "Accepted" : "Rejected"}
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 dark:text-gray-300">
            Bug Detected
          </h4>
          <p>{suggestion.has_bug ? "Yes" : "No"}</p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 dark:text-gray-300">
            Model
          </h4>
          <p>{suggestion.model}</p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 dark:text-gray-300">
            Response Time
          </h4>
          <p>{log.duration} ms</p>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Prompt
          </h4>
          <pre className="bg-sidebar p-4 rounded-md text-sm whitespace-pre-wrap overflow-auto max-h-48">
            {suggestion.prompt}
          </pre>
        </div>
      </div>
    </div>
  );
};
