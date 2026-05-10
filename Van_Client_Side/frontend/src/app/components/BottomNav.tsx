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
    <nav className="fixed bottom-4 left-1/2 z-50 w-[min(100%-1rem,430px)] -translate-x-1/2">
      <div className="rounded-[1.6rem] border border-white/70 bg-white/80 px-3 py-2 shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur-xl">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                whileTap={{ scale: 0.92 }}
                className="flex flex-1 flex-col items-center gap-1 py-2"
              >
                <div className="relative flex h-11 w-11 items-center justify-center">
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-2xl bg-orange-100"
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.7, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 420, damping: 30 }}
                      />
                    )}
                  </AnimatePresence>

                  <motion.div
                    animate={
                      isActive
                        ? { scale: [1, 1.18, 0.96, 1], y: [0, -3, 1, 0] }
                        : { scale: 1, y: 0 }
                    }
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="relative z-10"
                  >
                    <Icon
                      size={20}
                      className={isActive ? "text-orange-500" : "text-slate-400"}
                    />
                  </motion.div>
                </div>

                <motion.span
                  animate={{ opacity: isActive ? 1 : 0.6 }}
                  className={`text-[11px] font-medium transition-colors ${
                    isActive ? "text-orange-500" : "text-slate-400"
                  }`}
                >
                  {item.label}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
