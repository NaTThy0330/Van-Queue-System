import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, User, Phone, MapPin, AlertCircle, Bus, Clock, Timer } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { CountdownTimer } from "@/app/components/CountdownTimer";
import { CancelModal } from "@/app/components/CancelModal";
import { useAppStore } from "@/app/store";
import { useGsapReveal } from "@/app/hooks/useGsapReveal";

const QueueStatus = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const bookings = useAppStore((s) => s.bookings);
  const user = useAppStore((s) => s.user);
  const updateBookingStatus = useAppStore((s) => s.updateBookingStatus);
  const cancelBooking = useAppStore((s) => s.cancelBooking);
  const ensureQueue = useAppStore((s) => s.ensureQueue);
  const refreshQueue = useAppStore((s) => s.refreshQueue);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  useGsapReveal(pageRef, [id, bookings.length]);

  const booking = useMemo(() => bookings.find((b) => b.id === id), [bookings, id]);

  useEffect(() => {
    if (!id || booking) return;
    setIsLoading(true);
    ensureQueue(id)
      .then((result) => {
        if (!result) {
          navigate("/home");
        }
      })
      .finally(() => setIsLoading(false));
  }, [booking, ensureQueue, id, navigate]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const refresh = async () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      await refreshQueue(id);
    };

    refresh();
    const interval = setInterval(refresh, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id, refreshQueue]);

  if (!booking) {
    return (
      <div
        ref={pageRef}
        className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.14),_transparent_36%),linear-gradient(180deg,#fff7f0_0%,#fffdf9_100%)] px-6 text-center"
      >
        <div className="rounded-[1.6rem] border border-white/70 bg-white/85 p-8 shadow-[0_12px_34px_rgba(249,115,22,0.08)] backdrop-blur-sm">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
          <p className="text-slate-600">
            {isLoading ? "กำลังโหลดข้อมูลคิว..." : "ไม่พบข้อมูลคิว"}
          </p>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (booking.status) {
      case "waiting":
        return <Badge className="border-0 bg-orange-100 px-3 py-1 text-orange-700">กำลังรอรถ</Badge>;
      case "unpaid":
        return <Badge variant="outline" className="border-orange-200 px-3 py-1 text-orange-700">รอชำระเงิน</Badge>;
      case "confirmed":
        return <Badge className="border-0 bg-emerald-100 px-3 py-1 text-emerald-700">ยืนยันแล้ว</Badge>;
      case "completed":
        return <Badge className="border-0 bg-slate-200 px-3 py-1 text-slate-700">จบงานแล้ว</Badge>;
      case "expired":
        return <Badge variant="destructive" className="px-3 py-1">หมดเวลา</Badge>;
      case "cancelled":
        return <Badge variant="secondary" className="px-3 py-1">ยกเลิกแล้ว</Badge>;
      default:
        return null;
    }
  };

  const handlePayment = () => {
    navigate(`/payment/${booking.id}`);
  };

  const handleCancel = async () => {
    await cancelBooking(booking.id);
    setShowCancelModal(false);
    navigate("/history");
  };

  const handleExpire = () => {
    updateBookingStatus(booking.id, "expired");
  };

  const isActive =
    booking.status === "waiting" ||
    booking.status === "unpaid" ||
    booking.status === "confirmed";

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.16),_transparent_38%),linear-gradient(180deg,#fff7f0_0%,#fffdf9_100%)] pb-10"
    >
      <div className="sticky top-0 z-40 border-b border-white/50 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/home")}
            className="rounded-2xl bg-white/90 shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.22em] text-orange-500">สถานะคิว</p>
            <h1 className="text-lg font-bold text-slate-900">ตรวจสอบคิวแบบเรียลไทม์</h1>
          </div>
          {getStatusBadge()}
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-4 px-4 py-5">
        <Card className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(249,115,22,0.98)_0%,rgba(251,146,60,0.92)_100%)] p-6 text-center text-white shadow-[0_20px_60px_rgba(249,115,22,0.20)]">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-white/10" />
          <p className="text-sm text-white/80">หมายเลขคิวของคุณ</p>
          <div className="mt-2 text-7xl font-bold drop-shadow-sm">{booking.queueNumber}</div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur">
            <MapPin className="h-4 w-4" />
            <span>
              {booking.from} → {booking.to}
            </span>
          </div>
        </Card>

        {booking.status === "unpaid" && (
          <>
            <Card className="rounded-[1.6rem] border border-white/70 bg-white/85 p-5 shadow-[0_12px_34px_rgba(249,115,22,0.08)] backdrop-blur-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                <Bus className="h-5 w-5 text-orange-500" />
                ข้อมูลรถที่รอ
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-[1.4rem] bg-orange-50 p-4 text-center">
                  <Bus className="mx-auto mb-2 h-6 w-6 text-orange-500" />
                  <p className="mb-1 text-xs text-slate-500">รถคันที่</p>
                  <p className="font-bold text-slate-900">{booking.vanNumber || "ตู้ 7"}</p>
                </div>
                <div className="rounded-[1.4rem] bg-orange-50 p-4 text-center">
                  <Clock className="mx-auto mb-2 h-6 w-6 text-orange-500" />
                  <p className="mb-1 text-xs text-slate-500">รถจะมาถึง</p>
                  <p className="font-bold text-slate-900">{booking.departureTime}</p>
                </div>
              </div>
            </Card>

            {booking.expiresAt && (
              <CountdownTimer expiresAt={new Date(booking.expiresAt)} onExpire={handleExpire} />
            )}
          </>
        )}

        {(booking.status === "confirmed" || booking.status === "waiting") && (
          <Card className="rounded-[1.6rem] border border-white/70 bg-white/85 p-5 shadow-[0_12px_34px_rgba(249,115,22,0.08)] backdrop-blur-sm">
            <div className="mb-4 grid gap-3">
              <div className="flex items-center gap-3 rounded-2xl bg-orange-50 p-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">ชื่อผู้จอง</p>
                  <p className="font-semibold text-slate-900">{user?.name ?? "ผู้ใช้"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-orange-50 p-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">เบอร์โทรศัพท์</p>
                  <p className="font-semibold text-slate-900">{user?.phone ?? "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-orange-50 p-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">เวลาโดยประมาณ</p>
                  <p className="font-semibold text-slate-900">{booking.departureTime}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {booking.status === "completed" && (
          <Card className="rounded-[1.6rem] border border-slate-200 bg-white/85 p-5 text-center shadow-[0_12px_34px_rgba(148,163,184,0.10)] backdrop-blur-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <Timer className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">เที่ยวนี้จบงานแล้ว</h3>
            <p className="mt-2 text-sm text-slate-500">
              คิวนี้ถูกย้ายออกจากคิวใช้งานแล้ว คุณสามารถดูรายละเอียดย้อนหลังได้จากประวัติ
            </p>
          </Card>
        )}

        {booking.status === "unpaid" && (
          <div className="rounded-[1.6rem] border border-red-200 bg-red-50/90 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-red-500 shadow-sm">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="mb-1 font-semibold text-red-700">โปรดชำระเงิน</p>
                <p className="text-sm leading-6 text-red-700/85">
                  คิวของคุณจะยังไม่ถูกยืนยันจนกว่าจะชำระเงินเรียบร้อย
                </p>
              </div>
            </div>
          </div>
        )}

        {isActive && (
          <div className="space-y-3 pt-1">
            {booking.status === "unpaid" && (
              <Button
                onClick={handlePayment}
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 text-base font-semibold shadow-[0_12px_30px_rgba(249,115,22,0.22)] animate-shimmer-btn"
              >
                ชำระเงินตอนนี้
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setShowCancelModal(true)}
              className="h-12 w-full rounded-2xl border-red-200 bg-white text-base font-semibold text-red-600 hover:bg-red-50"
            >
              ยกเลิกการจอง
            </Button>
          </div>
        )}
      </div>

      <CancelModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
      />
    </div>
  );
};

export default QueueStatus;
