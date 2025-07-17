import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog";
import { Input } from "@/components/ui/input";

import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../../components/ui/button";
import { ClassData, EnrollmentStatus } from "@/types/user";
import Loading from "../../../../components/Loading";
import { useUser } from "@/context/UserContext";
import { useClassActionDialog } from "@/pages/classes/hooks/useClassActionDialog";
import { getAllClasses } from "@/api/classes";
import ClassActionDialog from "@/pages/classes/ui/components/ClassActionDialog";
import { useNavigate } from "react-router-dom";
import EnrollmentBadge from "../../../../components/EnrollmentBadge";

export const RegisterClassDialog = () => {
  const { userData } = useUser();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(false);

  const classActionDialog = useClassActionDialog({
    onSuccess: () => {
      if (search.trim()) {
        fetchClasses(search);
      }
    },
  });

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search.trim()) {
        fetchClasses(search);
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const fetchClasses = async (searchTerm: string) => {
    if (!userData?.id) return;

    setLoading(true);
    try {
      const { data, error } = await getAllClasses({
        search: searchTerm,
        userId: userData.id,
        page: 1,
        limit: 20,
      });

      if (error) {
        console.error("Error fetching classes:", error);
        setResults([]);
      } else if (data?.classes) {
        setResults(data.classes);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSearch("");
      setResults([]);
    }
  };

  const handleClassClick = (cls: ClassData) => {
    if (cls.id) {
      setOpen(false); // Close the dialog
      navigate(`/classes/${cls.id}`);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4" />
            <span className="ml-1">Register</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl mb-4">
              Search and Register for Classes
            </DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Search by class title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />

          {loading && (
            <div className="text-center text-sm py-4">
              <Loading size="sm" showText={false} />
              <span className="ml-2">Searching classes...</span>
            </div>
          )}

          {!loading && results.length === 0 && search && (
            <div className="text-center text-sm text-muted-foreground py-8">
              No classes found matching "{search}"
            </div>
          )}

          {!loading && !search && (
            <div className="text-center text-sm text-muted-foreground py-8">
              Start typing to search for classes...
            </div>
          )}

          <AnimatePresence>
            {results.length > 0 && (
              <motion.div
                className="grid gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {results.map((cls) => {
                  const enrollmentStatus = cls.enrollmentStatus;

                  return (
                    <div
                      key={cls.id}
                      className="p-4 rounded-lg border shadow cursor-pointer hover:bg-muted/50 transition-colors"
                      style={{
                        borderLeft: `6px solid ${cls.classHexColor || "#6366f1"}`,
                      }}
                      onClick={() => handleClassClick(cls)}
                    >
                      <div className="flex justify-between items-start text-sm">
                        <div className="flex-1">
                          <div className="font-semibold text-foreground mb-1 line-clamp-1 truncate">
                            {cls.classTitle}
                          </div>
                          <div className="text-muted-foreground mb-2">
                            {cls.classCode} •{" "}
                            {cls.instructorName || "Instructor"}
                          </div>
                          <div className="text-muted-foreground line-clamp-2">
                            {cls.classDescription || "No description available"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <EnrollmentBadge
                            status={enrollmentStatus as EnrollmentStatus}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Add the class action dialog */}
      <ClassActionDialog
        isOpen={classActionDialog.isOpen}
        isLoading={classActionDialog.isLoading}
        classInfo={classActionDialog.classInfo}
        onClose={classActionDialog.closeDialog}
        onConfirm={classActionDialog.handleConfirm}
      />
    </>
  );
};

export default RegisterClassDialog;
