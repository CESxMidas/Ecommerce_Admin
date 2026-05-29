import { memo } from "react";

import { useTableScrollHint } from "../../hooks/useTableScrollHint";

import "./index.css";

function TableScrollPanel({ children, hint = "Swipe horizontally to see more columns" }) {
  const scrollRef = useTableScrollHint();

  return (
    <div className="tableScrollPanel" ref={scrollRef}>
      <p className="tableScrollHint" aria-hidden="true">
        {hint}
      </p>
      {children}
    </div>
  );
}

export default memo(TableScrollPanel);
