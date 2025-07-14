import sampleData from "@/samples/data";
import React from "react";
import PageItem from "./PageItem";

const pageData = sampleData.pages;

function PageList() {
  return (
    <div className="text-xs text-neutral-100 max-h-[150px] overflow-y-auto">
      {pageData.map((page) => (
        <PageItem key={page.id} data={page} isSelected={false} />
      ))}
    </div>
  );
}

export default PageList;
