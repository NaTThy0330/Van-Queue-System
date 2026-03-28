import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { useAppStore } from "../store";
import { ArrowLeft, Upload, CheckCircle, Clock, Building2, Image as ImageIcon } from "lucide-react";

type PaymentStep = "upload" | "pending" | "verified";

function fireConfetti() {
  // Orange-themed confetti burst
  const colors = ["#f97316", "#fdba74", "#fcd34d", "#fb923c", "#fff7ed"];

  confetti({
    particleCount: 90,
    spread: 80,
    origin: { x: 0.5, y: 0.5 },
    colors,
    scalar: 1.1,
  });
  // Second burst slightly offset
  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { x: 0.35, y: 0.45 },
      colors,
      angle: 120,
    });
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { x: 0.65, y: 0.45 },
      colors,
      angle: 60,
    });
  }, 150);
  // Stars burst
  setTimeout(() => {
    confetti({
      particleCount: 30,
      spread: 100,
      origin: { x: 0.5, y: 0.3 },
      colors,
      shapes: ["star"],
      scalar: 1.5,
    });
  }, 300);
}

export function Payment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const bookings = useAppStore((s) => s.bookings);
  const updateBookingStatus = useAppStore((s) => s.updateBookingStatus);
  const updateBookingSlip = useAppStore((s) => s.updateBookingSlip);

  const booking = bookings.find((b) => b.id === id);
  const [step, setStep] = useState<PaymentStep>("upload");
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!booking) navigate("/explore");
  }, [booking, navigate]);

  // Fire confetti when verified
  useEffect(() => {
    if (step === "verified") {
      fireConfetti();
    }
  }, [step]);

  if (!booking) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSlipPreview(url);
    updateBookingSlip(booking.id, url);
  };

  const handleUpload = () => {
    setStep("pending");
    setTimeout(() => {
      setStep("verified");
      updateBookingStatus(booking.id, "confirmed");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-500 px-4 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate(-1)}
            className="bg-white/20 rounded-xl p-2"
          >
            <ArrowLeft size={20} className="text-white" />
          </motion.button>
          <h2 className="text-white">ชำระเงิน</h2>
        </div>
      </div>

      <div className="px-4 py-5">
        {/* Booking Summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-orange-100"
        >
          <h3 className="text-gray-800 mb-3">สรุปการจอง</h3>
          <div className="flex flex-col gap-2">
            <Row label="เส้นทาง" value={`${booking.from} → ${booking.to}`} />
            <Row label="คิวที่" value={`#${booking.queueNumber}`} />
            <Row label={booking.vanNumber} value={`ออก ${booking.departureTime}`} />
            <div className="border-t border-orange-100 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">ยอดชำระ</span>
              <motion.span
                className="text-2xl text-orange-500"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
              >
                ฿35
              </motion.span>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
            >
              {/* Bank Info */}
              <div className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-orange-100">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 size={18} className="text-orange-500" />
                  <h3 className="text-gray-800">ข้อมูลธนาคาร</h3>
                </div>
                <div className="bg-orange-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-400 mb-1">ธนาคารกสิกรไทย</p>
                  <p className="text-lg text-gray-800">xxx-x-xxxxx-x</p>
                  <p className="text-sm text-gray-500">มหาวิทยาลัยธรรมศาสตร์</p>
                </div>
                <p className="text-xs text-orange-500 mt-3">
                  * โอนยอด ฿35 แล้วอัปโหลดสลิปด้านล่าง
                </p>
              </div>

              {/* Upload Slip */}
              <div className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-orange-100">
                <h3 className="text-gray-800 mb-3">อัปโหลดสลิป</h3>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-orange-200 rounded-2xl p-6 flex flex-col items-center gap-2 hover:bg-orange-50 transition-colors"
                >
                  {slipPreview ? (
                    <motion.img
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      src={slipPreview}
                      alt="Slip"
                      className="w-32 h-32 object-cover rounded-xl shadow-md"
                    />
                  ) : (
                    <>
                      <motion.div
                        className="bg-orange-100 rounded-2xl p-4"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ImageIcon size={28} className="text-orange-400" />
                      </motion.div>
                      <p className="text-sm text-gray-500">กดเพื่อเลือกรูปสลิป</p>
                      <p className="text-xs text-gray-400">PNG, JPG ขนาดไม่เกิน 10MB</p>
                    </>
                  )}
                </motion.button>
                {slipPreview && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="mt-2 text-xs text-orange-500 underline w-full text-center"
                  >
                    เปลี่ยนรูป
                  </button>
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={slipPreview ? { scale: 1.02 } : {}}
                disabled={!slipPreview}
                onClick={handleUpload}
                className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 transition-all ${
                  slipPreview
                    ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md shadow-orange-200 animate-shimmer-btn"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                <Upload size={18} />
                <span>ส่งสลิปชำระเงิน</span>
              </motion.button>
            </motion.div>
          )}

          {step === "pending" && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center py-12"
            >
              {/* Custom wobble spinner */}
              <div className="relative mb-6">
                <div
                  className="w-20 h-20 rounded-full border-4 border-orange-200 border-t-orange-500"
                  style={{ animation: "spin-wobble 1.8s linear infinite" }}
                />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center text-2xl"
                  animate={{ scale: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                >
                  🧾
                </motion.div>
              </div>
              <h2 className="text-gray-800 mb-2">กำลังตรวจสอบ</h2>
              <p className="text-sm text-gray-400 text-center px-8">
                รอคนขับตรวจสอบสลิป
                <br />
                ใช้เวลาไม่นาน...
              </p>
              {/* Animated dots */}
              <div className="flex gap-2 mt-5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-orange-400 rounded-full"
                    animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 0.9,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-5 bg-orange-50 rounded-2xl px-4 py-3">
                <Clock size={16} className="text-orange-400" />
                <span className="text-sm text-orange-600">รอสักครู่...</span>
              </div>
            </motion.div>
          )}

          {step === "verified" && (
            <motion.div
              key="verified"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 18 }}
              className="flex flex-col items-center py-10"
            >
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 18,
                  delay: 0.1,
                }}
                className="bg-green-100 rounded-full p-5 mb-5 animate-glow-pulse"
              >
                <CheckCircle size={52} className="text-green-500" />
              </motion.div>

              {/* Floating emoji celebration */}
              <div className="relative">
                {["🎉", "🎊", "✨"].map((emoji, i) => (
                  <motion.span
                    key={i}
                    className="absolute text-xl pointer-events-none"
                    initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      y: -60,
                      x: (i - 1) * 40,
                      scale: [0, 1.2, 0.8],
                    }}
                    transition={{ duration: 1.5, delay: 0.3 + i * 0.15 }}
                  >
                    {emoji}
                  </motion.span>
                ))}
              </div>

              <motion.h2
                className="text-gray-800 mb-2"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                ชำระเงินสำเร็จ! 🎉
              </motion.h2>
              <motion.p
                className="text-sm text-gray-400 mb-8 text-center px-8"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                การจองของคุณได้รับการยืนยันแล้ว
              </motion.p>
              <motion.button
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.55 }}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => navigate(`/queue/${booking.id}`)}
                className="w-full max-w-xs bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-2xl py-4 shadow-lg shadow-orange-200 animate-shimmer-btn"
              >
                ดูสถานะคิว
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-gray-700 text-sm">{value}</span>
    </div>
  );
}
