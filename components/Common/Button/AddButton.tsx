import { Plus } from "lucide-react";
import React from "react";

function AddButton() {
  return (
    <div className="w-[16px] h-[16px] flex items-center justify-center bg-secondary-500 cursor-pointer rounded-xs hover:bg-secondary-300 hover: transition-colors">
      <Plus color="white" />
    </div>
  );
}

export default AddButton;
