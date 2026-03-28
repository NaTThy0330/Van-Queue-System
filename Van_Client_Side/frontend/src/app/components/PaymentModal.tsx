import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "motion/react";
import { X, CreditCard, Clock } from "lucide-react";
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
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ y: "100%", opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-3xl z-50 p-6 pb-10 shadow-[0_-8px_40px_rgba(249,115,22,0.12)]"
              >
                {/* Handle */}
                <motion.div
                  className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5"
                  animate={{ scaleX: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />

                <Dialog.Close asChild>
                  <button className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </Dialog.Close>

                <h3 className="text-center mb-1 text-gray-800">เลือกวิธีชำระเงิน</h3>
                {trip && (
                  <p className="text-center text-sm text-gray-500 mb-5">
                    {trip.from} → {trip.to}
                  </p>
                )}

                {/* Amount */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
                  className="bg-orange-50 rounded-2xl p-4 mb-5 text-center"
                >
                  <p className="text-xs text-orange-500 mb-1">ยอดชำระ</p>
                  <p className="text-3xl text-orange-600">฿35</p>
                </motion.div>

                <div className="flex flex-col gap-3">
                  <motion.button
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={onPayNow}
                    className="flex items-center gap-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-2xl p-4 shadow-md shadow-orange-200 animate-shimmer-btn"
                  >
                    <div className="bg-white/20 rounded-xl p-2">
                      <CreditCard size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm">ชำระเงินทันที</p>
                      <p className="text-xs text-orange-100">อัปโหลดสลิปโอนเงิน</p>
                    </div>
                  </motion.button>

                  <motion.button
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.28 }}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={onPayLater}
                    className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl p-4"
                  >
                    <div className="bg-orange-100 rounded-xl p-2">
                      <Clock size={20} className="text-orange-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-700">จ่ายทีหลัง</p>
                      <p className="text-xs text-gray-400">มีเวลา 5 นาที</p>
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}