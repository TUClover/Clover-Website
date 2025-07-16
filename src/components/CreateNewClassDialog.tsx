import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

export const CreateNewClassDialog = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/classes/create");
  };

  return (
    <Button onClick={handleClick} variant="default">
      <Plus />
      <span className="hidden sm:block ml-1">Add New Class</span>
    </Button>
  );
};

export default CreateNewClassDialog;
