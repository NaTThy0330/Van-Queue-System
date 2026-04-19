import { useLocation, useNavigate } from "react-router";
import { Home, ClipboardList, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const navItems = [
  { path: "/home", label: "หน้าหลัก", icon: Home },
  { path: "/history", label: "ประวัติ", icon: ClipboardList },
  { path: "/profile", label: "โปรไฟล์", icon: User },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-md border-t border-orange-100 px-4 pb-safe z-50 shadow-[0_-4px_20px_rgba(249,115,22,0.08)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              whileTap={{ scale: 0.88 }}
              className="flex flex-col items-center gap-0.5 flex-1 py-2"
            >
              <div className="relative flex items-center justify-center w-10 h-8">
                {/* Active background pill */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-orange-100 rounded-2xl"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 420, damping: 28 }}
                    />
                  )}
                </AnimatePresence>

                {/* Icon with scale bounce when active */}
                <motion.div
                  animate={
                    isActive
                      ? { scale: [1, 1.25, 0.95, 1.05, 1], y: [0, -4, 1, -1, 0] }
                      : { scale: 1, y: 0 }
                  }
                  transition={
                    isActive
                      ? { duration: 0.45, ease: "easeOut" }
                      : { duration: 0.2 }
                  }
                  className="relative z-10"
                >
                  <Icon
                    size={20}
                    className={`transition-colors duration-200 ${
                      isActive ? "text-orange-500" : "text-gray-400"
                    }`}
                  />
                </motion.div>
              </div>

              <motion.span
                animate={{ opacity: isActive ? 1 : 0.6 }}
                className={`text-[11px] transition-colors duration-200 ${
                  isActive ? "text-orange-500" : "text-gray-400"
                }`}
              >
                {item.label}
              </motion.span>

              {/* Active dot */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="w-1 h-1 rounded-full bg-orange-500"
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
