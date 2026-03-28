import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Home } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Floating bubbles */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-orange-200/30 animate-floating pointer-events-none"
          style={{
            width: 40 + i * 20,
            height: 40 + i * 20,
            left: `${10 + i * 18}%`,
            top: `${20 + (i % 3) * 20}%`,
            animationDelay: `${i * 0.6}s`,
            animationDuration: `${3 + i}s`,
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="text-center relative z-10"
      >
        <motion.div
          className="text-8xl mb-4"
          animate={{ rotate: [0, -5, 5, -5, 5, 0], y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          🚌
        </motion.div>
        <motion.h1
          className="text-orange-500 mb-2"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          404
        </motion.h1>
        <h2 className="text-gray-700 mb-2">หน้าที่คุณต้องการไม่มีอยู่</h2>
        <p className="text-sm text-gray-400 mb-8">รถตู้ยังหาเส้นทางนี้ไม่เจอ 😅</p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-2xl px-6 py-3 mx-auto shadow-lg shadow-orange-200 animate-shimmer-btn"
        >
          <Home size={18} />
          <span>กลับหน้าหลัก</span>
        </motion.button>
      </motion.div>
    </div>
  );
}