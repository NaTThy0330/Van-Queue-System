import { motion } from "motion/react";
import { MapPin, Clock, Users, ArrowRight, Zap } from "lucide-react";
import { Trip } from "../store";

interface TripCardProps {
  trip: Trip;
  onBook: (trip: Trip) => void;
  index: number;
}

export function TripCard({ trip, onBook, index }: TripCardProps) {
  const isLowQueue = trip.queueCount <= 3;
  const isFast = trip.eta <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.07,
        duration: 0.45,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="group relative overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/85 p-4 shadow-[0_14px_40px_rgba(249,115,22,0.10)] backdrop-blur-sm transition-shadow hover:shadow-[0_18px_54px_rgba(249,115,22,0.16)]"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-300 via-orange-500 to-amber-300" />

      {(isLowQueue || isFast) && (
        <div className="mb-3 flex flex-wrap gap-2">
          {isFast && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, delay: index * 0.07 + 0.2 }}
              className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 text-[11px] text-white shadow-sm"
            >
              <Zap size={9} />
              เร็ว
            </motion.span>
          )}
          {isLowQueue && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, delay: index * 0.07 + 0.3 }}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] text-emerald-700"
            >
              คิวน้อย
            </motion.span>
          )}
        </div>
      )}

      <div className="mb-4 flex items-center gap-3">
        <div className="flex flex-col items-center gap-1.5">
          <motion.div
            className="h-3 w-3 rounded-full bg-orange-400 shadow-[0_0_0_6px_rgba(251,146,60,0.15)]"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
          />
          <div className="h-10 w-0.5 bg-gradient-to-b from-orange-200 via-orange-300 to-orange-500" />
          <motion.div
            className="h-3 w-3 rounded-full bg-orange-600 shadow-[0_0_0_6px_rgba(249,115,22,0.16)]"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 + 0.5 }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2 min-w-0">
            <MapPin size={14} className="shrink-0 text-orange-400" />
            <span className="truncate text-sm font-medium text-slate-700">{trip.from}</span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <MapPin size={14} className="shrink-0 text-orange-600" />
            <span className="truncate text-sm font-semibold text-slate-900">{trip.to}</span>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5">
          <Clock size={12} className="text-orange-500" />
          <span className="text-xs font-medium text-orange-700">{trip.eta} นาที</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5">
          <Users size={12} className="text-orange-500" />
          <span className="text-xs font-medium text-orange-700">คิว {trip.queueCount} คน</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5">
          <span className="text-xs font-medium text-orange-700">🚌 {trip.departureTime}</span>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => onBook(trip)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 py-3 text-white shadow-[0_12px_30px_rgba(249,115,22,0.22)] transition-all animate-shimmer-btn"
      >
        <span className="text-sm font-semibold">จองเลย</span>
        <motion.div
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowRight size={15} />
        </motion.div>
      </motion.button>
    </motion.div>
  );
}
