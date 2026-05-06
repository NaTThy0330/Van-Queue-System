import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Upload, CheckCircle2, Clock, ImageIcon, X, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { useAppStore } from "@/app/store";
import { useGsapReveal } from "@/app/hooks/useGsapReveal";

type PaymentStatus = "upload" | "pending" | "verified";

const PaymentConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const bookings = useAppStore((s) => s.bookings);
  const updateBookingStatus = useAppStore((s) => s.updateBookingStatus);
  const uploadPaymentSlip = useAppStore((s) => s.uploadPaymentSlip);
  const getPaymentStatus = useAppStore((s) => s.getPaymentStatus);
  const ensureQueue = useAppStore((s) => s.ensureQueue);

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("upload");
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  useGsapReveal(pageRef, [id, bookings.length]);

  const booking = useMemo(() => bookings.find((b) => b.id === id), [bookings, id]);

  useEffect(() => {
    if (!id || booking) return;
    ensureQueue(id).then((result) => {
      if (!result) navigate("/home");
    });
  }, [booking, ensureQueue, id, navigate]);

  if (!booking) {
    return (
      <div
        ref={pageRef}
        className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.16),_transparent_38%),linear-gradient(180deg,#fff7f0_0%,#fffdf9_100%)]"
      />
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      setSlipFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setSlipPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitSlip = async () => {
    if (!id) return;
    setIsUploading(true);
    setError(null);
    setPaymentStatus("pending");
    try {
      if (!slipFile) {
        throw new Error("กรุณาแนบสลิปก่อนส่ง");
      }
      await uploadPaymentSlip(id, slipFile);
    } catch (err) {
      setPaymentStatus("upload");
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsUploading(false);
    }
  };

  const resolvePaymentStatus = async (showSpinner: boolean) => {
    if (!id) return;
    if (showSpinner) {
      setIsChecking(true);
      setError(null);
    }
    try {
      const status = await getPaymentStatus(id);
      if (status === "verified") {
        setPaymentStatus("verified");
        updateBookingStatus(booking.id, "confirmed");
        return;
      }
      setPaymentStatus("pending");
    } catch (err) {
      if (showSpinner) {
        setError(err instanceof Error ? err.message : "ไม่สามารถตรวจสอบสถานะได้");
      }
    } finally {
      if (showSpinner) setIsChecking(false);
    }
  };

  const checkPaymentStatus = async () => {
    await resolvePaymentStatus(true);
  };

  useEffect(() => {
    if (paymentStatus !== "pending" || !id || !booking) return;
    let cancelled = false;

    const poll = async () => {
      try {
        await resolvePaymentStatus(false);
        if (cancelled) return;
      } catch {
        // ignore poll errors
      }
      if (!cancelled) setTimeout(poll, 5000);
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [paymentStatus, id, booking]);

  const handleClearSlip = () => {
    setSlipPreview(null);
    setSlipFile(null);
  };

  const handleContinue = () => {
    navigate(`/queue/${booking.id}`);
  };

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.16),_transparent_38%),linear-gradient(180deg,#fff7f0_0%,#fffdf9_100%)] pb-8"
    >
      <div className="sticky top-0 z-40 border-b border-white/50 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-2xl bg-white/90 shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.22em] text-orange-500">ชำระเงิน</p>
            <h1 className="text-lg font-bold text-slate-900">ยืนยันการชำระเงิน</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-4 px-4 py-5">
        <Card className="rounded-[1.6rem] border border-white/70 bg-[linear-gradient(135deg,rgba(249,115,22,0.98)_0%,rgba(251,146,60,0.92)_100%)] p-5 text-white shadow-[0_16px_44px_rgba(249,115,22,0.18)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-white/80">เส้นทาง</p>
              <p className="font-semibold">{booking.from}</p>
              <p className="text-lg font-bold">→ {booking.to}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/80">คิวของคุณ</p>
              <p className="text-4xl font-bold">{booking.queueNumber}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur">
              <p className="text-white/70 text-xs">ยอดชำระ</p>
              <p className="font-semibold">฿35.00</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-3 py-2 backdrop-blur">
              <p className="text-white/70 text-xs">สถานะ</p>
              <p className="font-semibold">{paymentStatus === "verified" ? "ยืนยันแล้ว" : "รอตรวจสอบ"}</p>
            </div>
          </div>
        </Card>

        {paymentStatus === "upload" && (
          <Card className="rounded-[1.6rem] border border-white/70 bg-white/85 p-5 shadow-[0_12px_34px_rgba(249,115,22,0.08)] backdrop-blur-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
              <Upload className="h-5 w-5 text-orange-500" />
              อัปโหลดสลิปการโอนเงิน
            </h2>

            {!slipPreview ? (
              <label className="block cursor-pointer">
                <div className="rounded-[1.5rem] border-2 border-dashed border-orange-200 bg-orange-50/70 p-8 text-center transition-colors hover:border-orange-300 hover:bg-orange-50">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-orange-500 shadow-sm">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                  <p className="font-semibold text-slate-900">แตะเพื่อเลือกสลิป</p>
                  <p className="mt-1 text-sm text-slate-500">รองรับ JPG, PNG</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  id="slip-input"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-[1.5rem] border border-orange-100 bg-white shadow-sm">
                  <img src={slipPreview} alt="Payment slip" className="h-auto w-full" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-3 top-3 h-9 w-9 rounded-full shadow-lg"
                    onClick={handleClearSlip}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleSubmitSlip}
                  disabled={isUploading}
                  className="h-12 w-full rounded-2xl bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 text-base font-semibold shadow-[0_12px_30px_rgba(249,115,22,0.22)] animate-shimmer-btn"
                >
                  {isUploading ? "กำลังส่งสลิป..." : "ส่งสลิปเพื่อตรวจสอบ"}
                </Button>
              </div>
            )}
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </Card>
        )}

        {paymentStatus === "pending" && (
          <Card className="rounded-[1.6rem] border border-white/70 bg-white/85 p-7 text-center shadow-[0_12px_34px_rgba(249,115,22,0.08)] backdrop-blur-sm">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.8rem] bg-orange-50">
              <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">กำลังตรวจสอบสลิป</h2>
            <p className="mt-2 text-slate-500">ระบบกำลังตรวจสอบหลักฐานการชำระเงินของคุณ</p>
            <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-700">
              <Clock className="h-4 w-4" />
              โดยปกติใช้เวลาไม่เกิน 2 นาที
            </div>
            <div className="mt-5">
              <Button variant="outline" onClick={checkPaymentStatus} disabled={isChecking} className="w-full rounded-2xl">
                {isChecking ? "กำลังตรวจสอบ..." : "ตรวจสอบสถานะอีกครั้ง"}
              </Button>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </Card>
        )}

        {paymentStatus === "verified" && (
          <Card className="rounded-[1.6rem] border border-emerald-100 bg-[linear-gradient(180deg,rgba(236,253,245,1)_0%,rgba(255,255,255,0.98)_100%)] p-7 text-center shadow-[0_12px_34px_rgba(16,185,129,0.08)]">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.8rem] bg-emerald-100">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">ชำระเงินสำเร็จ!</h2>
            <p className="mt-2 text-slate-500">คิวของคุณได้รับการยืนยันแล้ว</p>
            <Button onClick={handleContinue} className="mt-5 h-12 w-full rounded-2xl bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 text-base font-semibold shadow-[0_12px_30px_rgba(249,115,22,0.22)]">
              ดูสถานะคิว
            </Button>
          </Card>
        )}

        <Card className="rounded-[1.6rem] border border-white/70 bg-white/85 p-4 shadow-[0_12px_34px_rgba(249,115,22,0.08)] backdrop-blur-sm">
          <div className="mb-3 flex items-center gap-2 text-orange-700">
            <ShieldCheck className="h-4 w-4" />
            <h3 className="font-semibold">ข้อมูลการโอนเงิน</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">ธนาคาร</span>
              <span className="font-medium text-slate-900">กรุงไทย</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">เลขบัญชี</span>
              <span className="font-medium text-slate-900">123-4-56789-0</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">ชื่อบัญชี</span>
              <span className="font-medium text-slate-900">สหกรณ์รถตู้มหาวิทยาลัย</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
