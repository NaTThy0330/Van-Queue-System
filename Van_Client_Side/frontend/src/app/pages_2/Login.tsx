import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Bus, Sparkles, ShieldCheck, Clock3, UserRound, Phone, Mail, Lock } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useAppStore } from "@/app/store";
import { useGsapReveal } from "@/app/hooks/useGsapReveal";

const VAN_IMG =
  "https://images.unsplash.com/photo-1649495673744-cf74c8616483?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YW4lMjBtaW5pYnVzJTIwY3V0ZSUyMGNhcnRvb24lMjBpbGx1c3RyYXRpb258ZW58MXx8fHwxNzczNzY1NDA0fDA&ixlib=rb-4.1.0&q=80&w=800";

type AuthMode = "signin" | "signup";

const Login = () => {
  const navigate = useNavigate();
  const { login, register, isAuthLoading, authError } = useAppStore();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  useGsapReveal(pageRef, [mode]);

  const isSignup = mode === "signup";

  const helperPills = useMemo(
    () => [
      { icon: Clock3, label: "เข้าระบบเร็ว" },
      { icon: ShieldCheck, label: "ปลอดภัย" },
      { icon: Bus, label: "ใช้ต่อเนื่อง" },
    ],
    []
  );

  const switchMode = (next: AuthMode) => {
    setLocalError(null);
    setMode(next);
  };

  const handleLogin = async () => {
    setLocalError(null);
    if (!email.trim() || !password) {
      setLocalError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    try {
      await login(email.trim(), password);
      navigate("/home");
    } catch {
      // handled by authError
    }
  };

  const handleRegister = async () => {
    setLocalError(null);
    if (!name.trim() || !email.trim() || !password) {
      setLocalError("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    try {
      await register({
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim(),
        password,
      });
      navigate("/home");
    } catch {
      // handled by authError
    }
  };

  return (
    <div
      ref={pageRef}
      className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.22),_transparent_35%),linear-gradient(180deg,#fff7f0_0%,#fffdf9_100%)]"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-12 right-0 h-44 w-44 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="absolute top-1/3 -left-16 h-52 w-52 rounded-full bg-amber-200/25 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-36 w-36 rounded-full bg-orange-200/20 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-6">
        <motion.section
          data-reveal="hero"
          className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(249,115,22,0.98)_0%,rgba(251,146,60,0.92)_55%,rgba(253,186,116,0.94)_100%)] p-5 text-white shadow-[0_20px_60px_rgba(249,115,22,0.20)]"
        >
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] bg-white/15 shadow-lg backdrop-blur">
              <Bus size={30} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
                <Sparkles size={12} />
                TU Van Booking
              </div>
              <h1 className="mt-2 text-2xl font-bold leading-tight">จองรถตู้แบบลื่นไหลในหน้าเดียว</h1>
              <p className="mt-1 text-sm text-white/85">
                เข้าสู่ระบบเพื่อดูเที่ยวรถ คิว และการชำระเงินอย่างรวดเร็ว
              </p>
            </div>
          </div>

          <div className="relative mt-5 grid grid-cols-3 gap-2">
            {helperPills.map((pill) => {
              const Icon = pill.icon;
              return (
                <div key={pill.label} className="rounded-2xl bg-white/15 px-3 py-2 text-center text-xs backdrop-blur">
                  <Icon size={14} className="mx-auto mb-1" />
                  {pill.label}
                </div>
              );
            })}
          </div>
        </motion.section>

        <motion.div
          data-reveal="card"
          className="relative mt-4 overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-[0_18px_50px_rgba(249,115,22,0.12)] backdrop-blur-xl"
        >
          <div className="mb-4 grid grid-cols-2 rounded-[1.4rem] bg-orange-50 p-1">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={`h-11 rounded-[1rem] text-sm font-semibold transition-all ${
                mode === "signin" ? "bg-white text-orange-600 shadow" : "text-orange-400"
              }`}
            >
              ลงชื่อเข้าใช้
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`h-11 rounded-[1rem] text-sm font-semibold transition-all ${
                mode === "signup" ? "bg-white text-orange-600 shadow" : "text-orange-400"
              }`}
            >
              สมัครสมาชิก
            </button>
          </div>

          <div className="space-y-3">
            {isSignup && (
              <>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <UserRound size={14} className="text-orange-500" />
                    ชื่อ-นามสกุล
                  </label>
                  <Input
                    placeholder="กรอกชื่อของคุณ"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-2xl border-orange-100 bg-white/90 px-4 shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Phone size={14} className="text-orange-500" />
                    เบอร์โทรศัพท์
                  </label>
                  <Input
                    placeholder="0812345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12 rounded-2xl border-orange-100 bg-white/90 px-4 shadow-sm"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Mail size={14} className="text-orange-500" />
                อีเมล
              </label>
              <Input
                placeholder="your@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-2xl border-orange-100 bg-white/90 px-4 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Lock size={14} className="text-orange-500" />
                รหัสผ่าน
              </label>
              <Input
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-2xl border-orange-100 bg-white/90 px-4 shadow-sm"
              />
            </div>

            {isSignup && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Lock size={14} className="text-orange-500" />
                  ยืนยันรหัสผ่าน
                </label>
                <Input
                  placeholder="••••••••"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 rounded-2xl border-orange-100 bg-white/90 px-4 shadow-sm"
                />
              </div>
            )}

            {localError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {localError}
              </div>
            )}
            {authError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {authError}
              </div>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {isSignup ? (
              <Button
                onClick={handleRegister}
                disabled={isAuthLoading}
                className="h-12 w-full rounded-2xl bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 text-base font-semibold shadow-[0_12px_30px_rgba(249,115,22,0.22)] animate-shimmer-btn"
              >
                {isAuthLoading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
                {!isAuthLoading && <ArrowRight size={16} />}
              </Button>
            ) : (
              <Button
                onClick={handleLogin}
                disabled={isAuthLoading}
                className="h-12 w-full rounded-2xl bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 text-base font-semibold shadow-[0_12px_30px_rgba(249,115,22,0.22)] animate-shimmer-btn"
              >
                {isAuthLoading ? "กำลังลงชื่อ..." : "ลงชื่อเข้าใช้"}
                {!isAuthLoading && <ArrowRight size={16} />}
              </Button>
            )}

            <div className="rounded-[1.4rem] border border-orange-100 bg-orange-50/80 p-4 text-sm text-slate-600">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <ShieldCheck size={14} className="text-orange-500" />
                ทำงานต่อเนื่องกับระบบคิว
              </div>
              <p className="mt-2 leading-6">
                ใช้บัญชีเดียวเพื่อจองเที่ยวรถ ดูสถานะคิว และติดตามการชำระเงินได้ครบในที่เดียว
              </p>
            </div>

            <div className="text-center text-sm text-slate-500">
              {isSignup ? (
                <>
                  มีบัญชีอยู่แล้ว?{" "}
                  <button type="button" onClick={() => switchMode("signin")} className="font-semibold text-orange-500">
                    ลงชื่อเข้าใช้
                  </button>
                </>
              ) : (
                <>
                  ยังไม่มีบัญชี?{" "}
                  <button type="button" onClick={() => switchMode("signup")} className="font-semibold text-orange-500">
                    สมัครสมาชิก
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
