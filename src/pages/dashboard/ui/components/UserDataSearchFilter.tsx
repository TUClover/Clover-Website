import CustomSelect from "@/components/CustomSelect";
import FilterInput from "@/components/FilterInput";

interface UserFiltersProps {
  nameFilter?: string;
  setNameFilter?: (value: string) => void;
  namePlaceholder?: string;

  // Role filter
  roleFilter?: string;
  setRoleFilter?: (value: string) => void;

  // Status filter
  statusFilter?: string;
  setStatusFilter?: (value: string) => void;

  // Mode filter
  modeFilter?: string;
  setModeFilter?: (value: string) => void;

  // Class filter
  classFilter?: string;
  setClassFilter?: (value: string) => void;
  classOptions?: Array<{ id: string; title: string }>;

  // Styling
  className?: string;
  gridClassName?: string;
}

const UserDataSearchFilters = ({
  nameFilter,
  setNameFilter,
  namePlaceholder = "Filter by name or email",
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  modeFilter,
  setModeFilter,
  classFilter,
  setClassFilter,
  classOptions,
  className = "space-y-4",
  gridClassName = "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4",
}: UserFiltersProps) => {
  return (
    <div className={className}>
      <div className={gridClassName}>
        {/* Name Filter */}
        {nameFilter !== undefined && setNameFilter && (
          <FilterInput
            value={nameFilter}
            onChange={setNameFilter}
            placeholder={namePlaceholder}
            className="w-full"
            showClearButton={true}
            icon={true}
          />
        )}

        {/* Role Filter */}
        {roleFilter !== undefined && setRoleFilter && (
          <CustomSelect
            value={roleFilter}
            onValueChange={setRoleFilter}
            options={[
              { value: "all", label: "All Roles" },
              { value: "STUDENT", label: "Student" },
              { value: "INSTRUCTOR", label: "Instructor" },
              { value: "ADMIN", label: "Admin" },
              { value: "DEVELOPER", label: "Developer" },
            ]}
            placeholder="Select role"
          />
        )}

        {/* Status Filter */}
        {statusFilter !== undefined && setStatusFilter && (
          <CustomSelect
            value={statusFilter}
            onValueChange={setStatusFilter}
            options={[
              { value: "all", label: "All Statuses" },
              { value: "ACTIVE", label: "Active" },
              { value: "LOCKED", label: "Locked" },
            ]}
            placeholder="Select status"
          />
        )}

        {/* Mode Filter */}
        {modeFilter !== undefined && setModeFilter && (
          <CustomSelect
            value={modeFilter}
            onValueChange={setModeFilter}
            options={[
              { value: "all", label: "All Modes" },
              { value: "LINE_BY_LINE", label: "Line" },
              { value: "CODE_BLOCK", label: "Block" },
              { value: "CODE_SELECTION", label: "Selection" },
            ]}
            placeholder="Select mode"
          />
        )}

        {/* Class Filter */}
        {classFilter !== undefined && setClassFilter && classOptions && (
          <CustomSelect
            value={classFilter}
            onValueChange={setClassFilter}
            options={[
              { value: "all", label: "All Classes" },
              ...classOptions.map((c) => ({
                value: c.id,
                label: c.title,
              })),
            ]}
            placeholder="Select class"
          />
        )}
      </div>
    </div>
  );
};

export default UserDataSearchFilters;
