import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "motion/react";
import { X, CreditCard, Clock, ShieldCheck, BadgeCheck } from "lucide-react";
import { Trip } from "../store";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  trip: Trip | null;
  onPayNow: () => void;
  onPayLater: () => void;
}

export function PaymentModal({
  open,
  onClose,
  trip,
  onPayNow,
  onPayLater,
}: PaymentModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[6px]"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                initial={{ y: "100%", opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 rounded-t-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,248,241,0.98)_100%)] p-6 pb-10 shadow-[0_-18px_48px_rgba(15,23,42,0.12)]"
              >
                <motion.div
                  className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-orange-200"
                  animate={{ scaleX: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />

                <Dialog.Close asChild>
                  <button className="absolute right-5 top-5 rounded-full bg-white/80 p-2 text-slate-400 shadow-sm transition-colors hover:text-slate-700">
                    <X size={18} />
                  </button>
                </Dialog.Close>

                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                    <BadgeCheck size={14} />
                    เลือกวิธีชำระเงิน
                  </div>
                  <h3 className="mt-3 text-center text-2xl font-bold text-slate-900">จองคิวได้ทันที</h3>
                  {trip && (
                    <p className="mt-1 text-center text-sm text-slate-500">
                      {trip.from} → {trip.to}
                    </p>
                  )}
                </div>

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
                  className="mb-5 rounded-[1.5rem] border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5 text-center"
                >
                  <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-orange-500">
                    ยอดชำระ
                  </p>
                  <p className="text-4xl font-bold text-orange-600">฿35</p>
                  <p className="mt-2 text-xs text-slate-500">ระบบจะพาคุณไปยังหน้าชำระเงินทันที</p>
                </motion.div>

                <div className="space-y-3">
                  <motion.button
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={onPayNow}
                    className="flex w-full items-center gap-3 rounded-[1.5rem] bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 p-4 text-left text-white shadow-[0_12px_30px_rgba(249,115,22,0.22)] animate-shimmer-btn"
                  >
                    <div className="rounded-2xl bg-white/20 p-2.5">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">ชำระเงินทันที</p>
                      <p className="text-xs text-orange-100">อัปโหลดสลิปหรือจ่ายตอนนี้เลย</p>
                    </div>
                  </motion.button>

                  <motion.button
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.28 }}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={onPayLater}
                    className="flex w-full items-center gap-3 rounded-[1.5rem] border border-orange-200 bg-white p-4 text-left shadow-sm transition-colors hover:bg-orange-50"
                  >
                    <div className="rounded-2xl bg-orange-100 p-2.5">
                      <Clock size={20} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">จ่ายภายหลัง</p>
                      <p className="text-xs text-slate-500">เลือกจองคิวก่อน แล้วค่อยชำระเงิน</p>
                    </div>
                  </motion.button>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-slate-500">
                  <div className="rounded-2xl bg-white px-3 py-2 shadow-sm">
                    <div className="mb-1 flex items-center gap-2 text-orange-600">
                      <ShieldCheck size={14} />
                      ปลอดภัย
                    </div>
                    ข้อมูลการชำระเงินถูกเก็บในระบบ
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-2 shadow-sm">
                    <div className="mb-1 flex items-center gap-2 text-orange-600">
                      <Clock size={14} />
                      เร็วขึ้น
                    </div>
                    เลือกได้ตามรูปแบบที่สะดวก
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
