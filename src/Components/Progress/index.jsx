import { memo, useMemo } from "react";

import "./index.css";

const MAX_VALUE = 100;

function getTone(percent) {
  if (percent <= 0) {
    return "empty";
  }

  if (percent < 25) {
    return "low";
  }

  if (percent < 60) {
    return "medium";
  }

  return "high";
}

function Progress({ value = 0, max = MAX_VALUE }) {
  const percent = useMemo(() => {
    const safeMax = max > 0 ? max : MAX_VALUE;
    return Math.min(100, Math.max(0, (value / safeMax) * 100));
  }, [max, value]);

  const tone = getTone(percent);

  return (
    <div
      className="stockProgress"
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Stock level ${Math.round(percent)} percent`}
    >
      <div className="stockProgress__track">
        <div
          className={`stockProgress__fill stockProgress__fill--${tone}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default memo(Progress);
