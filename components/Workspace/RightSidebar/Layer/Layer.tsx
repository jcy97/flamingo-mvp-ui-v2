import React from "react";
import "@/styles/scrollbar.css";
import LayerHeader from "./LayerHeader";
import LayerList from "./LayerList";

function Layer() {
  return (
    <div className="flex flex-col gap-3 h-full">
      <LayerHeader />
      <LayerList />
    </div>
  );
}

export default Layer;
