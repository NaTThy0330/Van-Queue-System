import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { motion, AnimatePresence } from "motion/react";

interface CancelModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CancelModal({ open, onClose, onConfirm }: CancelModalProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <AnimatePresence>
        {open && (
          <AlertDialog.Portal forceMount>
            <AlertDialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              />
            </AlertDialog.Overlay>
            <AlertDialog.Content asChild>
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 10 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-6"
              >
                <div className="bg-white rounded-3xl p-6 w-full max-w-[320px] shadow-2xl border border-red-100">
                  <div className="text-center mb-5">
                    <motion.div
                      className="text-4xl mb-3"
                      animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                      transition={{ duration: 0.7, delay: 0.1 }}
                    >
                      🚫
                    </motion.div>
                    <AlertDialog.Title className="text-gray-800 mb-2">
                      ยืนยันการยกเลิก
                    </AlertDialog.Title>
                    <AlertDialog.Description className="text-sm text-gray-500">
                      คุณต้องการยกเลิกการจองนี้ใช่ไหม? การยกเลิกไม่สามารถเปลี่ยนกลับได้
                    </AlertDialog.Description>
                  </div>
                  <div className="flex gap-3">
                    <AlertDialog.Cancel asChild>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={onClose}
                        className="flex-1 bg-gray-100 text-gray-700 rounded-2xl py-3 text-sm"
                      >
                        ไม่ยกเลิก
                      </motion.button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action asChild>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        whileHover={{ scale: 1.03 }}
                        onClick={onConfirm}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl py-3 text-sm shadow-md shadow-red-200"
                      >
                        ยืนยัน
                      </motion.button>
                    </AlertDialog.Action>
                  </div>
                </div>
              </motion.div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        )}
      </AnimatePresence>
    </AlertDialog.Root>
  );
}