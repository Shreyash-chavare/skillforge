import { useEffect, useState,forwardRef,useImperativeHandle } from "react";

const Timer = ({ startTime, isActive }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const elapsedSeconds = startTime
    ? Math.floor((now - startTime) / 1000)
    : 0;

  const m = Math.floor(elapsedSeconds / 60);
  const s = elapsedSeconds % 60;

  return (
    <div className="px-3 py-1 bg-gray-100 rounded-md font-mono text-green-600 font-bold shadow">
      ⏱ {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </div>
  );
};


export default Timer;
