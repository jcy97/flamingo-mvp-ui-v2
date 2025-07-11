import sampleData from "@/samples/data";
import React from "react";

const pageData = sampleData.pages;

function PageList() {
  return (
    <div className="text-xs text-neutral-100 max-h-[150px] overflow-y-auto">
      {pageData.map((page) => (
        <div
          key={page.id}
          className="flex items-center mt-1 rounded-md p-2 h-[28px] cursor-pointer hover:bg-primary-500"
        >
          {page.name}
        </div>
      ))}
    </div>
  );
}

export default PageList;
