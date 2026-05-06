import { useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, LogOut, User, Phone, BadgeCheck, Sparkles } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { BottomNav } from "@/app/components/BottomNav";
import { useAppStore } from "@/app/store";
import { useGsapReveal } from "@/app/hooks/useGsapReveal";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, bookings } = useAppStore();
  const pageRef = useRef<HTMLDivElement>(null);
  useGsapReveal(pageRef, [user?.name, bookings.length]);

  const stats = useMemo(
    () => [
      { label: "คิวทั้งหมด", value: bookings.length },
      { label: "คิวใช้งาน", value: bookings.filter((b) => ["waiting", "unpaid", "confirmed"].includes(b.status)).length },
      { label: "ประวัติ", value: bookings.filter((b) => ["completed", "expired", "cancelled"].includes(b.status)).length },
    ],
    [bookings]
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.16),_transparent_38%),linear-gradient(180deg,#fff7f0_0%,#fffdf9_100%)] pb-28"
    >
      <div className="sticky top-0 z-40 border-b border-white/50 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/home")} className="rounded-2xl bg-white/90 shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.22em] text-orange-500">โปรไฟล์</p>
            <h1 className="text-lg font-bold text-slate-900">ข้อมูลผู้ใช้งานของคุณ</h1>
          </div>
          <div className="rounded-2xl bg-orange-50 p-3 text-orange-500">
            <BadgeCheck size={18} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-4 px-4 py-5">
        <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(249,115,22,0.98)_0%,rgba(251,146,60,0.92)_100%)] p-6 text-white shadow-[0_20px_60px_rgba(249,115,22,0.18)]">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-white/25 shadow-lg">
              <AvatarFallback className="bg-white/15 text-2xl font-bold text-white">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
                <Sparkles size={12} />
                พร้อมใช้งาน
              </div>
              <h2 className="mt-2 text-2xl font-bold">{user?.name || "ผู้ใช้"}</h2>
              <p className="text-sm text-white/85">{user?.phone || "ยังไม่มีเบอร์โทรศัพท์"}</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="rounded-[1.4rem] border border-white/70 bg-white/85 p-4 text-center shadow-[0_12px_34px_rgba(249,115,22,0.08)] backdrop-blur-sm">
              <p className="text-2xl font-bold text-orange-600">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
            </Card>
          ))}
        </div>

        <Card className="space-y-4 rounded-[1.6rem] border border-white/70 bg-white/85 p-4 shadow-[0_12px_34px_rgba(249,115,22,0.08)] backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-2xl bg-orange-50 p-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">ชื่อ-นามสกุล</p>
              <p className="font-semibold text-slate-900">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-orange-50 p-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">เบอร์โทรศัพท์</p>
              <p className="font-semibold text-slate-900">{user?.phone || "-"}</p>
            </div>
          </div>
        </Card>

        <Button
          variant="outline"
          onClick={handleLogout}
          className="h-12 w-full rounded-2xl border-red-200 bg-white text-base font-semibold text-red-600 hover:bg-red-50"
        >
          <LogOut className="mr-2 h-5 w-5" />
          ออกจากระบบ
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
