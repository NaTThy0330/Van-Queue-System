import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useAppStore } from "@/app/store";

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

  const switchMode = (next: AuthMode) => {
    setLocalError(null);
    setMode(next);
  };

  const handleLogin = async () => {
    setLocalError(null);
    if (!email.trim() || !password) {
      setLocalError("กรุณากรอกอีเมล์และรหัสผ่าน");
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
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50">
      {/* Hero */}
      <div className="px-6 pt-10">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-orange-100 flex items-center justify-center">
            <img src={VAN_IMG} alt="Van" className="w-10 h-10 rounded-xl object-cover" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-orange-700">TU Van Booking</h1>
          <p className="text-sm text-orange-400">
            จองคิวรถตู้—รวดเร็ว ปลอดภัย
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="px-6 pb-10 mt-6">
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-orange-100 p-5">
          {/* Segmented Control */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-orange-50 rounded-2xl">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={`h-11 rounded-xl text-sm font-semibold transition-all ${
                mode === "signin"
                  ? "bg-white shadow text-orange-600"
                  : "text-orange-400"
              }`}
            >
              ลงชื่อเข้าใช้
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`h-11 rounded-xl text-sm font-semibold transition-all ${
                mode === "signup"
                  ? "bg-white shadow text-orange-600"
                  : "text-orange-400"
              }`}
            >
              สมัครสมาชิก
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {mode === "signup" && (
              <>
                <Input
                  placeholder="ชื่อ-นามสกุล"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  placeholder="เบอร์โทร (ถ้ามี)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </>
            )}

            <Input
              placeholder="อีเมล"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="รหัสผ่าน"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {mode === "signup" && (
              <Input
                placeholder="ยืนยันรหัสผ่าน"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            )}

            {localError && <p className="text-sm text-destructive">{localError}</p>}
            {authError && <p className="text-sm text-destructive">{authError}</p>}
          </div>

          <div className="mt-5 space-y-3">
            {mode === "signin" ? (
              <Button
                onClick={handleLogin}
                disabled={isAuthLoading}
                className="w-full h-12 text-base font-semibold shadow-md"
              >
                {isAuthLoading ? "กำลังลงชื่อ..." : "ลงชื่อเข้าใช้"}
              </Button>
            ) : (
              <Button
                onClick={handleRegister}
                disabled={isAuthLoading}
                className="w-full h-12 text-base font-semibold shadow-md"
              >
                {isAuthLoading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
              </Button>
            )}

            <div className="text-center text-sm text-muted-foreground">
              {mode === "signin" ? (
                <>
                  ยังไม่มีบัญชี?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className="text-orange-500 font-semibold"
                  >
                    สมัครสมาชิก
                  </button>
                </>
              ) : (
                <>
                  มีบัญชีแล้ว?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signin")}
                    className="text-orange-500 font-semibold"
                  >
                    ลงชื่อเข้าใช้
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;