import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const CreateNewClassButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/classes/create");
  };

  return (
    <Button onClick={handleClick} variant="default">
      <Plus />
      <span>Add New Class</span>
    </Button>
  );
};

export default CreateNewClassButton;
