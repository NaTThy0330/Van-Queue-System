import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Timer } from "lucide-react";

interface CountdownTimerProps {
  expiresAt: Date;
  onExpire: () => void;
}

export function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const wasUrgent = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, expiresAt.getTime() - Date.now());
      setTimeLeft(diff);
      if (diff === 0) onExpire();
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const progress = timeLeft / (5 * 60 * 1000);
  const isUrgent = timeLeft < 60000 && timeLeft > 0;

  useEffect(() => {
    if (isUrgent && !wasUrgent.current && containerRef.current) {
      wasUrgent.current = true;
      containerRef.current.classList.add("animate-shake");
      setTimeout(() => {
        containerRef.current?.classList.remove("animate-shake");
      }, 600);
    }
  }, [isUrgent]);

  return (
    <div
      ref={containerRef}
      className={`rounded-[1.5rem] border p-4 transition-colors duration-500 ${
        isUrgent
          ? "border-red-200 bg-red-50/90 shadow-[0_12px_30px_rgba(239,68,68,0.10)] animate-glow-pulse-red"
          : "border-orange-200 bg-orange-50/90 shadow-[0_12px_30px_rgba(249,115,22,0.08)]"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={
              isUrgent
                ? { scale: [1, 1.3, 1], rotate: [0, -15, 15, 0] }
                : { scale: [1, 1.08, 1] }
            }
            transition={{ repeat: Infinity, duration: isUrgent ? 0.8 : 2 }}
          >
            <Timer size={16} className={isUrgent ? "text-red-500" : "text-orange-500"} />
          </motion.div>
          <div>
            <p className={`text-xs font-medium ${isUrgent ? "text-red-600" : "text-orange-700"}`}>
              เวลาชำระเงิน
            </p>
            <p className="text-[11px] text-slate-500">นับถอยหลังถึงการหมดอายุ</p>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          <motion.div
            key={`${minutes}:${seconds}`}
            initial={{ y: -16, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25, ease: "backOut" }}
            className={`text-2xl font-semibold tabular-nums ${
              isUrgent ? "text-red-600" : "text-orange-600"
            }`}
          >
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-white shadow-inner">
        <motion.div
          className={`h-full rounded-full transition-colors duration-500 ${
            isUrgent
              ? "bg-gradient-to-r from-red-400 to-red-500"
              : "bg-gradient-to-r from-orange-400 to-amber-500"
          }`}
          style={{ width: `${Math.max(0, progress * 100)}%` }}
          animate={isUrgent ? { opacity: [1, 0.6, 1] } : {}}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="mt-2 flex justify-between px-0.5">
        {[100, 75, 50, 25, 0].map((pct) => (
          <div
            key={pct}
            className={`h-1 w-1 rounded-full transition-colors ${
              progress * 100 >= pct
                ? isUrgent
                  ? "bg-red-300"
                  : "bg-orange-300"
                : "bg-slate-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
