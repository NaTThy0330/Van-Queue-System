import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useAppStore } from "../store";
import { BottomNav } from "../components/BottomNav";
import { LogOut, Phone, User, ChevronRight, Shield, HelpCircle, Bell } from "lucide-react";

export function Profile() {
  const navigate = useNavigate();
  const user = useAppStore((s: any) => s.user);
  const logout = useAppStore((s: any) => s.logout);
  const bookings = useAppStore((s: any) => s.bookings);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const initials = user?.name?.split(" ").map((n: any) => n[0]).join("") ?? "U";

  const menuItems = [
    { icon: Bell,         label: "การแจ้งเตือน",      action: () => {} },
    { icon: Shield,       label: "ความเป็นส่วนตัว",   action: () => {} },
    { icon: HelpCircle,   label: "ช่วยเหลือ",          action: () => {} },
  ];

  const stats = [
    { label: "ทั้งหมด", value: bookings.length,                                              icon: "🎫" },
    { label: "ยืนยัน",  value: bookings.filter((b: any) => b.status === "confirmed").length,      icon: "✅" },
    { label: "ยกเลิก",  value: bookings.filter((b: any) => ["expired","cancelled"].includes(b.status)).length, icon: "❌" },
  ];

  return (
    <div className="min-h-screen bg-orange-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-500 px-4 pt-12 pb-24 relative overflow-hidden">
        <motion.div
          className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"
          animate={{ scale: [1, 1.12, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <h2 className="text-white relative">โปรไฟล์</h2>
      </div>

      {/* Avatar Card */}
      <div className="px-4 -mt-16 mb-4 relative z-10">
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
          className="bg-white rounded-3xl p-5 shadow-lg border border-orange-100"
        >
          <div className="flex items-center gap-4">
            {/* Avatar with pulse ring */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center shadow-md animate-glow-pulse">
                <span className="text-white text-2xl relative z-10">{initials}</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-gray-800">{user?.name}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <Phone size={13} className="text-gray-400" />
                <p className="text-sm text-gray-400">{user?.phone}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-orange-50">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15 + i * 0.1, type: "spring", stiffness: 300 }}
                className="text-center bg-orange-50 rounded-2xl p-2"
                data-aos="zoom-in"
                data-aos-delay={String(i * 80)}
              >
                <motion.div
                  className="text-lg mb-0.5"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                >
                  {stat.icon}
                </motion.div>
                <p className="text-lg text-orange-500">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Info */}
      <div className="px-4 mb-4" data-aos="fade-up">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl overflow-hidden shadow-sm border border-orange-100"
        >
          <div className="flex items-center gap-3 p-4">
            <div className="bg-orange-100 rounded-xl p-2">
              <User size={18} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">ชื่อ-นามสกุล</p>
              <p className="text-sm text-gray-800">{user?.name}</p>
            </div>
          </div>
          <div className="h-px bg-orange-50 mx-4" />
          <div className="flex items-center gap-3 p-4">
            <div className="bg-orange-100 rounded-xl p-2">
              <Phone size={18} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">เบอร์โทรศัพท์</p>
              <p className="text-sm text-gray-800">{user?.phone}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Menu Items */}
      <div className="px-4 mb-4" data-aos="fade-up" data-aos-delay="60">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="bg-white rounded-3xl overflow-hidden shadow-sm border border-orange-100"
        >
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={item.label}>
                <motion.button
                  whileTap={{ scale: 0.98, backgroundColor: "#fff7ed" }}
                  whileHover={{ x: 2 }}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 p-4 hover:bg-orange-50 transition-colors"
                >
                  <div className="bg-orange-100 rounded-xl p-2">
                    <Icon size={18} className="text-orange-500" />
                  </div>
                  <span className="flex-1 text-left text-sm text-gray-700">
                    {item.label}
                  </span>
                  <motion.div
                    animate={{ x: [0, 2, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  >
                    <ChevronRight size={16} className="text-gray-300" />
                  </motion.div>
                </motion.button>
                {i < menuItems.length - 1 && (
                  <div className="h-px bg-orange-50 mx-4" />
                )}
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Logout */}
      <div className="px-4" data-aos="fade-up" data-aos-delay="100">
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-50 border border-red-100 text-red-500 rounded-2xl py-4"
        >
          <motion.div
            animate={{ rotate: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <LogOut size={18} />
          </motion.div>
          <span>ออกจากระบบ</span>
        </motion.button>
      </div>

      <BottomNav />
    </div>
  );
}
