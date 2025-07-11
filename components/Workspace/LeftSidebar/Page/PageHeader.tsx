import AddButton from "@/components/Common/Button/AddButton";
import React from "react";

function PageHeader() {
  return (
    <div className="flex items-center justify-start gap-2">
      <p className="text-xs font-bold">페이지</p>
      <AddButton />
    </div>
  );
}

export default PageHeader;
