import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import gsap from "gsap";
import { useAppStore } from "../store";
import { Bus, ArrowRight, UserPlus, Sparkles } from "lucide-react";

const VAN_IMG =
  "https://images.unsplash.com/photo-1649495673744-cf74c8616483?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YW4lMjBtaW5pYnVzJTIwY3V0ZSUyMGNhcnRvb24lMjBpbGx1c3RyYXRpb258ZW58MXx8fHwxNzczNzY1NDA0fDA&ixlib=rb-4.1.0&q=80&w=800";

/* Decorative floating bubble */
function Bubble({
  size,
  x,
  y,
  delay,
  opacity,
}: {
  size: number;
  x: string;
  y: string;
  delay: number;
  opacity: number;
}) {
  return (
    <div
      className="absolute rounded-full pointer-events-none animate-floating"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: "rgba(251,146,60,0.18)",
        animationDelay: `${delay}s`,
        animationDuration: `${3 + delay}s`,
        opacity,
      }}
    />
  );
}

export function Login() {
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);

  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const illustrationRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main entrance timeline
      const tl = gsap.timeline({ defaults: { ease: "back.out(1.4)" } });

      tl.from(logoRef.current, {
        scale: 0,
        opacity: 0,
        rotation: -15,
        duration: 0.7,
      })
        .from(
          titleRef.current,
          { y: 24, opacity: 0, duration: 0.55 },
          "-=0.25"
        )
        .from(
          subtitleRef.current,
          { y: 16, opacity: 0, duration: 0.45, ease: "power2.out" },
          "-=0.25"
        )
        .from(
          illustrationRef.current,
          { y: 40, opacity: 0, scale: 0.92, duration: 0.65 },
          "-=0.15"
        )
        .from(
          ".feature-chip",
          {
            y: 20,
            opacity: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.3"
        )
        .from(
          ".login-btn",
          {
            y: 20,
            opacity: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.2"
        );

      // Continuous floating on the illustration
      gsap.to(illustrationRef.current, {
        y: -12,
        duration: 2.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Subtle logo pulse
      gsap.to(logoRef.current, {
        scale: 1.06,
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1,
      });
    });

    return () => ctx.revert();
  }, []);

  const handleLogin = () => {
    login();
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-orange-100 to-orange-50 flex flex-col items-center justify-between px-6 py-12 overflow-hidden relative">
      {/* Decorative floating bubbles */}
      <Bubble size={80}  x="-15px" y="10%"  delay={0}   opacity={0.6} />
      <Bubble size={50}  x="85%"  y="5%"   delay={0.8} opacity={0.4} />
      <Bubble size={120} x="75%"  y="25%"  delay={1.5} opacity={0.25} />
      <Bubble size={40}  x="10%"  y="50%"  delay={2.2} opacity={0.35} />
      <Bubble size={90}  x="-20px" y="70%" delay={1.1} opacity={0.2} />
      <Bubble size={60}  x="80%"  y="75%"  delay={0.5} opacity={0.3} />

      {/* Sparkle dots */}
      <motion.div
        className="absolute top-[15%] right-[20%] text-orange-300 pointer-events-none"
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles size={18} />
      </motion.div>
      <motion.div
        className="absolute top-[55%] left-[12%] text-orange-200 pointer-events-none"
        animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <Sparkles size={14} />
      </motion.div>

      {/* Top Section */}
      <div className="w-full flex flex-col items-center relative z-10">
        {/* Logo */}
        <div
          ref={logoRef}
          className="bg-white rounded-3xl p-5 shadow-lg mb-6 animate-glow-pulse"
          style={{ opacity: 0 }}
        >
          <Bus size={40} className="text-orange-500" />
        </div>

        <div ref={titleRef} className="text-center mb-1" style={{ opacity: 0 }}>
          <h1 className="text-orange-700">TU Van Booking</h1>
        </div>
        <div ref={subtitleRef} style={{ opacity: 0 }}>
          <p className="text-sm text-orange-400">ระบบจองรถตู้มหาวิทยาลัยธรรมศาสตร์</p>
        </div>
      </div>

      {/* Illustration */}
      <div
        ref={illustrationRef}
        className="w-full max-w-xs aspect-video rounded-3xl overflow-hidden shadow-xl my-6 relative z-10"
        style={{ opacity: 0 }}
      >
        <img
          src={VAN_IMG}
          alt="Van Booking"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-orange-500/30 to-transparent rounded-3xl" />
        {/* Shimmer overlay */}
        <div className="absolute inset-0 animate-shimmer-btn rounded-3xl" />
      </div>

      {/* Features */}
      <div
        ref={featuresRef}
        className="w-full max-w-sm grid grid-cols-3 gap-3 mb-8 relative z-10"
      >
        {[
          { icon: "🚌", label: "จองออนไลน์" },
          { icon: "⚡", label: "รวดเร็ว" },
          { icon: "💳", label: "ชำระง่าย" },
        ].map((f) => (
          <div
            key={f.label}
            className="feature-chip bg-white/90 rounded-2xl p-3 text-center shadow-sm border border-orange-100"
            style={{ opacity: 0 }}
          >
            <div className="text-2xl mb-1 animate-bounce-subtle">{f.icon}</div>
            <p className="text-xs text-gray-600">{f.label}</p>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div
        ref={buttonsRef}
        className="w-full max-w-sm flex flex-col gap-3 relative z-10"
      >
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleLogin}
          className="login-btn flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-2xl py-4 shadow-lg shadow-orange-200 animate-shimmer-btn animate-gradient-shift"
          style={{ opacity: 0 }}
        >
          <span>ลงชื่อเข้าใช้</span>
          <ArrowRight size={18} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleLogin}
          className="login-btn flex items-center justify-center gap-2 w-full bg-white text-orange-500 border border-orange-200 rounded-2xl py-4 shadow-sm"
          style={{ opacity: 0 }}
        >
          <UserPlus size={18} />
          <span>ลงทะเบียน</span>
        </motion.button>
      </div>
    </div>
  );
}
