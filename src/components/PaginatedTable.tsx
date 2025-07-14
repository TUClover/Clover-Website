import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import CustomSelect from "./CustomSelect";

interface PaginatedTableProps<T> {
  data: T[];
  renderTable: (filteredData: T[], startIndex: number) => React.ReactNode;
  filterFn?: (item: T) => boolean;
  defaultItemsPerPage?: number;
}

/**
 * A generic paginated table component that allows for filtering and pagination.
 * @param {PaginatedTableProps} props - The properties for the paginated table.
 * @param props.data - The data to be displayed in the table.
 * @param props.renderTable - A function that takes the filtered data and returns the table JSX.
 * @param props.filterFn - An optional filter function to filter the data before displaying it.
 * @param props.defaultItemsPerPage - The default number of items to display per page.
 * @returns {JSX.component} A paginated table component.
 */
export const PaginatedTable = <T,>({
  data,
  renderTable,
  filterFn,
  defaultItemsPerPage = 10,
}: PaginatedTableProps<T>) => {
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(
    () => (filterFn ? data.filter(filterFn) : data),
    [data, filterFn]
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const currentItems = filteredData.slice(start, end);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Reset to page 1 when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Show:</label>
          <CustomSelect
            value={itemsPerPage.toString()}
            onValueChange={(value) => setItemsPerPage(Number(value))}
            options={[
              { value: "10", label: "10 per page" },
              { value: "20", label: "20 per page" },
              { value: "50", label: "50 per page" },
            ]}
            placeholder="Items per page"
            className="w-32"
          />
        </div>

        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages} ({filteredData.length} total{" "}
          {filteredData.length === 1 ? "result" : "results"})
        </div>
      </div>

      <div className="w-full">{renderTable(currentItems, start)}</div>

      <div className="flex justify-center items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                className="w-8 h-8 p-0"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default PaginatedTable;
