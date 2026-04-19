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

  // Trigger shake when first becoming urgent
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
      className={`rounded-2xl p-4 transition-colors duration-500 ${
        isUrgent
          ? "bg-red-50 border border-red-200 animate-glow-pulse-red"
          : "bg-orange-50 border border-orange-200"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={
              isUrgent
                ? { scale: [1, 1.3, 1], rotate: [0, -15, 15, 0] }
                : { scale: [1, 1.1, 1] }
            }
            transition={{
              repeat: Infinity,
              duration: isUrgent ? 0.8 : 2,
            }}
          >
            <Timer
              size={16}
              className={isUrgent ? "text-red-500" : "text-orange-500"}
            />
          </motion.div>
          <span
            className={`text-xs ${isUrgent ? "text-red-600" : "text-orange-600"}`}
          >
            เวลาชำระเงิน
          </span>
          {isUrgent && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full"
            >
              ⚠️ ใกล้หมดแล้ว!
            </motion.span>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          <motion.div
            key={`${minutes}:${seconds}`}
            initial={{ y: -16, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25, ease: "backOut" }}
            className={`text-2xl tabular-nums ${
              isUrgent ? "text-red-600" : "text-orange-600"
            }`}
          >
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-white rounded-full overflow-hidden shadow-inner">
        <motion.div
          className={`h-full rounded-full transition-colors duration-500 ${
            isUrgent
              ? "bg-gradient-to-r from-red-400 to-red-500"
              : "bg-gradient-to-r from-orange-400 to-orange-500"
          }`}
          style={{ width: `${Math.max(0, progress * 100)}%` }}
          animate={isUrgent ? { opacity: [1, 0.6, 1] } : {}}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Segment dots */}
      <div className="flex justify-between mt-1.5 px-0.5">
        {[100, 75, 50, 25, 0].map((pct) => (
          <div
            key={pct}
            className={`w-1 h-1 rounded-full transition-colors ${
              progress * 100 >= pct
                ? isUrgent
                  ? "bg-red-300"
                  : "bg-orange-300"
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
