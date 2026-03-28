import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useAppStore } from "../store";
import { CancelModal } from "../components/CancelModal";
import { CountdownTimer } from "../components/CountdownTimer";
import { useState, useCallback } from "react";
import {
  ArrowLeft,
  Bus,
  Clock,
  Phone,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

const STATUS_CONFIG = {
  unpaid: {
    label: "รอชำระเงิน",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: AlertCircle,
    iconColor: "text-amber-500",
    headerGrad: "from-amber-400 to-orange-400",
  },
  waiting: {
    label: "รอขึ้นรถ",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Clock,
    iconColor: "text-blue-500",
    headerGrad: "from-blue-400 to-cyan-400",
  },
  confirmed: {
    label: "ยืนยันแล้ว",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle2,
    iconColor: "text-green-500",
    headerGrad: "from-green-400 to-emerald-400",
  },
  expired: {
    label: "หมดเวลา",
    color: "bg-gray-100 text-gray-600 border-gray-200",
    icon: XCircle,
    iconColor: "text-gray-400",
    headerGrad: "from-gray-400 to-slate-400",
  },
  cancelled: {
    label: "ยกเลิกแล้ว",
    color: "bg-red-100 text-red-600 border-red-200",
    icon: XCircle,
    iconColor: "text-red-400",
    headerGrad: "from-red-400 to-rose-400",
  },
};

export function QueueStatus() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const bookings = useAppStore((s) => s.bookings);
  const user = useAppStore((s) => s.user);
  const updateBookingStatus = useAppStore((s) => s.updateBookingStatus);
  const cancelBooking = useAppStore((s) => s.cancelBooking);

  const [cancelOpen, setCancelOpen] = useState(false);

  const booking = bookings.find((b) => b.id === id);

  const handleExpire = useCallback(() => {
    if (booking?.status === "unpaid") {
      updateBookingStatus(booking.id, "expired");
    }
  }, [booking, updateBookingStatus]);

  if (!booking) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-gray-500">ไม่พบข้อมูลการจอง</p>
          <button
            onClick={() => navigate("/home")}
            className="mt-4 text-orange-500 underline text-sm"
          >
            กลับหน้าหลัก
          </button>
        </motion.div>
      </div>
    );
  }

  const config = STATUS_CONFIG[booking.status];
  const StatusIcon = config.icon;
  const isActive = ["waiting", "unpaid", "confirmed"].includes(booking.status);

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <div
        className={`bg-gradient-to-br ${config.headerGrad} px-4 pt-12 pb-10 relative overflow-hidden`}
      >
        {/* Decorative circles */}
        <motion.div
          className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/10 rounded-full"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />

        <div className="flex items-center gap-3 mb-4 relative">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="bg-white/20 rounded-xl p-2"
          >
            <ArrowLeft size={20} className="text-white" />
          </motion.button>
          <h2 className="text-white">สถานะคิว</h2>
        </div>

        {/* Queue Number Big Display with Pulse Rings */}
        <div className="text-center py-4 relative">
          <p className="text-white/80 text-sm mb-3">หมายเลขคิวของคุณ</p>

          {/* Pulse rings (only when active) */}
          {isActive && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              {[0, 0.5, 1].map((delay) => (
                <div
                  key={delay}
                  className="absolute rounded-full border-2 border-white/30"
                  style={{
                    width: 100,
                    height: 100,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    animation: `pulse-ring 2s ease-out infinite`,
                    animationDelay: `${delay}s`,
                  }}
                />
              ))}
            </div>
          )}

          <motion.div
            initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
            className="relative inline-block"
          >
            <motion.p
              className="text-8xl text-white tabular-nums select-none"
              animate={
                isActive
                  ? { scale: [1, 1.06, 1], textShadow: ["0 0 0px rgba(255,255,255,0)", "0 0 20px rgba(255,255,255,0.4)", "0 0 0px rgba(255,255,255,0)"] }
                  : {}
              }
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              {booking.queueNumber}
            </motion.p>
          </motion.div>
        </div>
      </div>

      <div className="px-4 -mt-4 pb-8">
        {/* Status Badge */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex justify-center mb-4"
        >
          <motion.div
            className={`flex items-center gap-2 px-4 py-2 rounded-full border ${config.color} shadow-sm`}
            animate={isActive ? { scale: [1, 1.04, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <StatusIcon size={15} className={config.iconColor} />
            <span className="text-sm">{config.label}</span>
          </motion.div>
        </motion.div>

        {/* Route Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-5 mb-3 shadow-sm border border-orange-100"
          data-aos="fade-up"
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-orange-400" />
            <h3 className="text-gray-800">เส้นทาง</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                className="w-2.5 h-2.5 rounded-full bg-orange-400"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div className="w-0.5 h-6 bg-orange-200" />
              <motion.div
                className="w-2.5 h-2.5 rounded-full bg-orange-600"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <span className="text-sm text-gray-700">{booking.from}</span>
              <span className="text-sm text-gray-800">{booking.to}</span>
            </div>
          </div>
        </motion.div>

        {/* Van Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-3xl p-5 mb-3 shadow-sm border border-orange-100"
          data-aos="fade-up"
          data-aos-delay="80"
        >
          <div className="flex items-center gap-2 mb-3">
            <Bus size={16} className="text-orange-400" />
            <h3 className="text-gray-800">ข้อมูลรถ</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoBox label={booking.vanNumber} value="ของคุณ" icon="🚌" />
            <InfoBox label={`${booking.departureTime} น.`} value="เวลาออกรถ" icon="⏰" />
          </div>
        </motion.div>

        {/* Countdown (only for unpaid) */}
        <AnimatePresence>
          {booking.status === "unpaid" && booking.expiresAt && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3"
            >
              <CountdownTimer
                expiresAt={booking.expiresAt}
                onExpire={handleExpire}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Info (confirmed/waiting) */}
        {(booking.status === "confirmed" || booking.status === "waiting") && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-5 mb-3 shadow-sm border border-orange-100"
            data-aos="fade-up"
          >
            <div className="flex items-center gap-2 mb-3">
              <User size={16} className="text-orange-400" />
              <h3 className="text-gray-800">ข้อมูลผู้จอง</h3>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <User size={14} className="text-gray-400" />
                <span className="text-sm text-gray-700">{user?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gray-400" />
                <span className="text-sm text-gray-700">{user?.phone}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Confirmed success banner */}
        {booking.status === "confirmed" && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.35 }}
            className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center mb-3 animate-glow-pulse"
            style={{ animationName: "none" }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <CheckCircle2 size={24} className="text-green-500 mx-auto mb-1" />
            </motion.div>
            <p className="text-sm text-green-700">การจองได้รับการยืนยันแล้ว ✅</p>
          </motion.div>
        )}

        {/* Expired/Cancelled message */}
        {(booking.status === "expired" || booking.status === "cancelled") && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-gray-50 rounded-3xl p-5 mb-3 text-center border border-gray-100"
          >
            <motion.div
              className="text-4xl mb-2"
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {booking.status === "expired" ? "⏰" : "🚫"}
            </motion.div>
            <p className="text-gray-500 text-sm">
              {booking.status === "expired"
                ? "คิวหมดอายุแล้ว กรุณาจองใหม่"
                : "การจองนี้ถูกยกเลิกแล้ว"}
            </p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-2">
          {booking.status === "unpaid" && (
            <>
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(`/payment/${booking.id}`)}
                className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-2xl py-4 shadow-md animate-shimmer-btn"
              >
                ชำระเงินตอนนี้
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setCancelOpen(true)}
                className="w-full bg-white text-red-400 border border-red-200 rounded-2xl py-3 text-sm"
              >
                ยกเลิกการจอง
              </motion.button>
            </>
          )}
          {booking.status === "waiting" && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setCancelOpen(true)}
              className="w-full bg-white text-red-400 border border-red-200 rounded-2xl py-3 text-sm"
            >
              ยกเลิกการจอง
            </motion.button>
          )}
          {(booking.status === "expired" || booking.status === "cancelled") && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate("/explore")}
              className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-2xl py-4 animate-shimmer-btn"
            >
              จองใหม่
            </motion.button>
          )}
        </div>
      </div>

      <CancelModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={() => {
          cancelBooking(booking.id);
          setCancelOpen(false);
        }}
      />
    </div>
  );
}

function InfoBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-orange-50 rounded-2xl p-3 text-center"
    >
      <motion.div
        className="text-2xl mb-1"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {icon}
      </motion.div>
      <p className="text-sm text-gray-800">{label}</p>
      <p className="text-xs text-gray-400">{value}</p>
    </motion.div>
  );
}
