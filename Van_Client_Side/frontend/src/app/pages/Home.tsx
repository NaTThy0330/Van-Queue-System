import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import gsap from "gsap";
import { useAppStore } from "../store";
import { BottomNav } from "../components/BottomNav";
import { Ticket, Newspaper, Bell, ChevronRight, Sparkles } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "อรุณสวัสดิ์ 🌅", sub: "เช้านี้จะไปไหนไหม?" };
  if (hour < 17) return { text: "สวัสดียามบ่าย ☀️", sub: "บ่ายนี้จะไปไหนไหม?" };
  return { text: "สวัสดียามเย็น 🌇", sub: "เย็นนี้จะไปไหนไหม?" };
}

const CARDS = [
  {
    id: "book",
    icon: Ticket,
    emoji: "🚌",
    title: "จองที่นั่งออนไลน์",
    desc: "ค้นหาและจองรถตู้ได้เลย",
    gradient: "from-orange-400 to-orange-500",
    path: "/explore",
  },
  {
    id: "news",
    icon: Newspaper,
    emoji: "📰",
    title: "ข่าวสารในมหาวิทยาลัย",
    desc: "อ่านข่าวสารล่าสุด",
    gradient: "from-amber-300 to-amber-400",
    path: null,
  },
];

export function Home() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const bookings = useAppStore((s) => s.bookings);
  const greeting = getGreeting();
  const cardsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  const activeBookings = bookings.filter((b) =>
    ["waiting", "unpaid", "confirmed"].includes(b.status)
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stagger entrance for menu cards
      gsap.from(".home-card", {
        y: 30,
        opacity: 0,
        duration: 0.55,
        stagger: 0.15,
        ease: "back.out(1.5)",
        delay: 0.1,
      });

      // Stats pop in
      gsap.from(".home-stat", {
        scale: 0.8,
        opacity: 0,
        duration: 0.45,
        stagger: 0.1,
        ease: "back.out(1.5)",
        delay: 0.4,
      });

      // Bell wiggle after entrance
      gsap.delayedCall(1.2, () => {
        gsap.to(bellRef.current, {
          rotation: 20,
          duration: 0.1,
          ease: "power2.inOut",
          yoyo: true,
          repeat: 5,
          onComplete: () => gsap.set(bellRef.current, { rotation: 0 }),
        });
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-24 relative overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-500 px-5 pt-12 pb-20 relative overflow-hidden animate-gradient-shift">
        {/* Decorative circles — animated */}
        <motion.div
          className="absolute -top-12 -right-12 w-44 h-44 bg-white/10 rounded-full"
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-10 -left-10 w-36 h-36 bg-white/10 rounded-full"
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        {/* Small sparkles */}
        <motion.div
          className="absolute top-6 right-20 text-white/40"
          animate={{ opacity: [0.2, 0.8, 0.2], y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles size={14} />
        </motion.div>
        <motion.div
          className="absolute bottom-8 left-16 text-white/30"
          animate={{ opacity: [0.1, 0.6, 0.1], y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
        >
          <Sparkles size={10} />
        </motion.div>

        <div className="relative flex items-start justify-between">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="text-orange-100 text-sm mb-1">{greeting.sub}</p>
            <h2 className="text-white">{greeting.text}</h2>
            <h1 className="text-white mt-1">{user?.name ?? "ผู้ใช้"}</h1>
          </motion.div>
          <motion.button
            ref={bellRef}
            className="bg-white/20 rounded-2xl p-2.5"
            whileTap={{ scale: 0.9 }}
            whileHover={{ backgroundColor: "rgba(255,255,255,0.3)" }}
          >
            <Bell size={20} className="text-white" />
          </motion.button>
        </div>
      </div>

      {/* Active Queue Banner */}
      {activeBookings.length > 0 && (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          className="mx-4 -mt-4 mb-2 z-10 relative"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/queue/${activeBookings[0].id}`)}
            className="w-full bg-white rounded-2xl p-4 shadow-lg border border-orange-100 flex items-center justify-between animate-glow-pulse"
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="bg-orange-100 rounded-xl p-2"
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles size={18} className="text-orange-500" />
              </motion.div>
              <div>
                <p className="text-sm text-gray-800">คุณมีคิวที่ใช้งาน</p>
                <p className="text-xs text-gray-500">
                  คิวที่ {activeBookings[0].queueNumber} · {activeBookings[0].from} →{" "}
                  {activeBookings[0].to}
                </p>
              </div>
            </div>
            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronRight size={18} className="text-orange-400" />
            </motion.div>
          </motion.button>
        </motion.div>
      )}

      {/* Main Content */}
      <div ref={cardsRef} className="px-4 -mt-12 relative z-10 pt-4">
        {activeBookings.length === 0 && <div className="h-4" />}

        <p className="text-gray-500 text-sm mb-3">เมนูหลัก</p>

        <div className="grid grid-cols-1 gap-4">
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.id}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => card.path && navigate(card.path)}
                className={`home-card bg-gradient-to-r ${card.gradient} rounded-3xl p-5 text-left shadow-lg relative overflow-hidden animate-shimmer-btn`}
                style={{ opacity: 0 }}
              >
                {/* Animated emoji */}
                <motion.div
                  className="absolute -right-4 -bottom-4 text-7xl opacity-20 select-none pointer-events-none"
                  animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  {card.emoji}
                </motion.div>
                <div className="bg-white/20 rounded-2xl w-fit p-3 mb-3">
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="text-white mb-1">{card.title}</h3>
                <p className="text-white/80 text-sm">{card.desc}</p>
                <div className="flex items-center gap-1 mt-3">
                  <span className="text-white/90 text-sm">ดูเพิ่มเติม</span>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ChevronRight size={16} className="text-white/90" />
                  </motion.div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div ref={statsRef} className="mt-5 grid grid-cols-2 gap-3">
          <div
            className="home-stat bg-white rounded-2xl p-4 shadow-sm border border-orange-50"
            style={{ opacity: 0 }}
            data-aos="zoom-in"
            data-aos-delay="100"
          >
            <p className="text-xs text-gray-400 mb-1">การจองทั้งหมด</p>
            <motion.p
              className="text-2xl text-orange-500"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.5 }}
            >
              {bookings.length}
            </motion.p>
            <p className="text-xs text-gray-400">ครั้ง</p>
          </div>
          <div
            className="home-stat bg-white rounded-2xl p-4 shadow-sm border border-orange-50"
            style={{ opacity: 0 }}
            data-aos="zoom-in"
            data-aos-delay="180"
          >
            <p className="text-xs text-gray-400 mb-1">คิวที่ใช้งาน</p>
            <motion.p
              className="text-2xl text-orange-500"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.6 }}
            >
              {activeBookings.length}
            </motion.p>
            <p className="text-xs text-gray-400">คิว</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
