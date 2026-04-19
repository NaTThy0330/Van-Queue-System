import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useAppStore, Booking } from "../store";
import { BottomNav } from "../components/BottomNav";
import * as Tabs from "@radix-ui/react-tabs";
import { ClipboardList, ChevronRight, MapPin } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  waiting:   { label: "รอขึ้นรถ",   color: "bg-blue-100 text-blue-700",   emoji: "🕐" },
  unpaid:    { label: "รอชำระ",      color: "bg-amber-100 text-amber-700",  emoji: "💰" },
  confirmed: { label: "ยืนยันแล้ว", color: "bg-green-100 text-green-700", emoji: "✅" },
  expired:   { label: "หมดอายุ",    color: "bg-gray-100 text-gray-600",   emoji: "⏰" },
  cancelled: { label: "ยกเลิก",     color: "bg-red-100 text-red-600",     emoji: "🚫" },
};

function BookingCard({
  booking,
  onClick,
  index,
}: {
  booking: Booking;
  onClick: () => void;
  index: number;
}) {
  const status = STATUS_LABELS[booking.status];
  return (
    <motion.button
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-4 shadow-sm border border-orange-100 text-left flex items-center gap-3 hover:shadow-md transition-shadow"
      data-aos="fade-up"
      data-aos-delay={String(index * 50)}
    >
      <motion.div
        className="bg-orange-100 rounded-2xl p-3 text-xl shrink-0"
        animate={{ rotate: [0, 3, -3, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
      >
        {status.emoji}
      </motion.div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-800">คิว #{booking.queueNumber}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-1 mb-1">
          <MapPin size={11} className="text-orange-400 shrink-0" />
          <p className="text-xs text-gray-500 truncate">
            {booking.from} → {booking.to}
          </p>
        </div>
        <p className="text-xs text-gray-400">
          {new Date(booking.createdAt).toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      <motion.div
        animate={{ x: [0, 3, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
      >
        <ChevronRight size={16} className="text-orange-300 shrink-0" />
      </motion.div>
    </motion.button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="text-center py-16"
    >
      <motion.div
        className="text-5xl mb-3"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        📋
      </motion.div>
      <p className="text-gray-400 text-sm">{text}</p>
    </motion.div>
  );
}

export function History() {
  const navigate = useNavigate();
  const bookings = useAppStore((s) => s.bookings);

  const activeBookings = bookings.filter((b) =>
    ["waiting", "unpaid", "confirmed"].includes(b.status)
  );
  const historyBookings = bookings.filter((b) =>
    ["expired", "cancelled"].includes(b.status)
  );

  return (
    <div className="min-h-screen bg-orange-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-500 px-4 pt-12 pb-6 relative overflow-hidden">
        <motion.div
          className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="flex items-center gap-3 relative">
          <motion.div
            className="bg-white/20 rounded-xl p-2"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <ClipboardList size={20} className="text-white" />
          </motion.div>
          <h2 className="text-white">ประวัติการจอง</h2>
        </div>
      </div>

      <div className="px-4 py-4">
        <Tabs.Root defaultValue="active">
          <Tabs.List className="flex gap-1 bg-white rounded-2xl p-1 mb-4 shadow-sm border border-orange-100">
            <TabTrigger
              value="active"
              label={`คิวที่ใช้งาน (${activeBookings.length})`}
            />
            <TabTrigger
              value="history"
              label={`ประวัติ (${historyBookings.length})`}
            />
          </Tabs.List>

          <Tabs.Content value="active">
            <AnimatePresence mode="popLayout">
              {activeBookings.length === 0 ? (
                <EmptyState text="ยังไม่มีคิวที่ใช้งาน" />
              ) : (
                <div className="flex flex-col gap-3">
                  {activeBookings.map((b, i) => (
                    <BookingCard
                      key={b.id}
                      booking={b}
                      index={i}
                      onClick={() => navigate(`/queue/${b.id}`)}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </Tabs.Content>

          <Tabs.Content value="history">
            <AnimatePresence mode="popLayout">
              {historyBookings.length === 0 ? (
                <EmptyState text="ยังไม่มีประวัติการจอง" />
              ) : (
                <div className="flex flex-col gap-3">
                  {historyBookings.map((b, i) => (
                    <BookingCard
                      key={b.id}
                      booking={b}
                      index={i}
                      onClick={() => navigate(`/queue/${b.id}`)}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </Tabs.Content>
        </Tabs.Root>
      </div>

      <BottomNav />
    </div>
  );
}

function TabTrigger({ value, label }: { value: string; label: string }) {
  return (
    <Tabs.Trigger
      value={value}
      className="flex-1 py-2.5 rounded-xl text-sm text-gray-500 transition-all data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-sm"
    >
      {label}
    </Tabs.Trigger>
  );
}
