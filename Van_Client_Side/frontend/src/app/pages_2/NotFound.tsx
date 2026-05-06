import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, Home, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { useGsapReveal } from "@/app/hooks/useGsapReveal";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  useGsapReveal(pageRef, [location.pathname]);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div
      ref={pageRef}
      className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.16),_transparent_38%),linear-gradient(180deg,#fff7f0_0%,#fffdf9_100%)] px-6"
    >
      <Card className="max-w-sm rounded-[2rem] border border-white/70 bg-white/85 p-8 text-center shadow-[0_18px_50px_rgba(249,115,22,0.12)] backdrop-blur-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-50 text-orange-500">
          <Sparkles size={24} />
        </div>
        <p className="text-xs uppercase tracking-[0.24em] text-orange-500">404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">ไม่พบหน้านี้</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          ลิงก์ที่คุณเปิดอาจถูกย้ายหรือไม่มีอยู่ในระบบ
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={() => navigate("/home")} className="h-12 rounded-2xl bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 text-base font-semibold shadow-[0_12px_30px_rgba(249,115,22,0.22)]">
            <Home className="mr-2 h-4 w-4" />
            กลับหน้าหลัก
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)} className="h-12 rounded-2xl border-orange-200 bg-white text-base font-semibold text-orange-600 hover:bg-orange-50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            ย้อนกลับ
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
