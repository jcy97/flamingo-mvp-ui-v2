import React from "react";
import PageHeader from "./PageHeader";
import PageList from "./PageList";

function Page() {
  return (
    <div className="flex flex-col gap-2 text-neutral-100">
      <PageHeader />
      <PageList />
    </div>
  );
}

export default Page;
