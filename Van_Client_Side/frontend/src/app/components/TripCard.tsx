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
      className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 transition-shadow hover:shadow-md"
      data-aos="fade-up"
      data-aos-delay={String(index * 60)}
      data-aos-once="false"
    >
      {/* Badges row */}
      {(isLowQueue || isFast) && (
        <div className="flex gap-1.5 mb-2">
          {isFast && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, delay: index * 0.07 + 0.2 }}
              className="flex items-center gap-0.5 text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full"
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
              className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
            >
              คิวน้อย 🎯
            </motion.span>
          )}
        </div>
      )}

      {/* Route */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex flex-col items-center gap-1">
          <motion.div
            className="w-2.5 h-2.5 rounded-full bg-orange-400"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
          />
          <div className="w-0.5 h-8 bg-gradient-to-b from-orange-300 to-orange-500" />
          <motion.div
            className="w-2.5 h-2.5 rounded-full bg-orange-600"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 + 0.5 }}
          />
        </div>
        <div className="flex flex-col justify-between h-12 flex-1">
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-orange-400 shrink-0" />
            <span className="text-sm text-gray-700 truncate">{trip.from}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-orange-600 shrink-0" />
            <span className="text-sm text-gray-800 truncate">{trip.to}</span>
          </div>
        </div>
      </div>

      {/* Info Row */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-orange-50 rounded-full px-3 py-1">
          <Clock size={12} className="text-orange-500" />
          <span className="text-xs text-orange-700">{trip.eta} นาที</span>
        </div>
        <div className="flex items-center gap-1.5 bg-orange-50 rounded-full px-3 py-1">
          <Users size={12} className="text-orange-500" />
          <span className="text-xs text-orange-700">คิว {trip.queueCount} คน</span>
        </div>
        <div className="flex items-center gap-1.5 bg-orange-50 rounded-full px-3 py-1">
          <span className="text-xs text-orange-700">🚌 {trip.departureTime}</span>
        </div>
      </div>

      {/* Book Button */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => onBook(trip)}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl py-2.5 transition-all shadow-sm shadow-orange-200 animate-shimmer-btn"
      >
        <span className="text-sm">จองเลย</span>
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
