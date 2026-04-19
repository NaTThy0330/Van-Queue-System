import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Upload, CheckCircle2, Clock, ImageIcon, X, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { useAppStore } from "@/app/store";

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

  const booking = bookings.find((b) => b.id === id);

  useEffect(() => {
    if (!id || booking) return;
    ensureQueue(id).then((result) => {
      if (!result) navigate("/home");
    });
  }, [booking, ensureQueue, id, navigate]);

  if (!booking) {
    return null;
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      setSlipFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipPreview(reader.result as string);
      };
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
      setError(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
      );
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
      if (showSpinner) {
        setIsChecking(false);
      }
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
      if (!cancelled) {
        setTimeout(poll, 5000);
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [paymentStatus, id, booking, updateBookingStatus]);

  const handleClearSlip = () => {
    setSlipPreview(null);
    setSlipFile(null);
  };

  const handleContinue = () => {
    navigate(`/queue/${booking.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card/50">
      {/* Header */}
      <div className="sticky top-0 bg-card/90 backdrop-blur-md border-b border-border/30 z-40">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-primary/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">ยืนยันการชำระเงิน</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-5">
        {/* Booking Summary Card */}
        <Card className="p-5 shadow-lg border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">เส้นทาง</p>
              <p className="font-semibold text-foreground">{booking.from}</p>
              <p className="text-primary font-semibold">→ {booking.to}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">คิวของคุณ</p>
              <p className="text-3xl font-bold text-primary">{booking.queueNumber}</p>
            </div>
          </div>
          <div className="pt-3 border-t border-border/50">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ยอดชำระ</span>
              <span className="font-bold text-foreground">฿35.00</span>
            </div>
          </div>
        </Card>

        {/* Upload Section */}
        {paymentStatus === "upload" && (
          <Card className="p-5 shadow-lg border-0 bg-card">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              อัพโหลดสลิปการโอนเงิน
            </h2>

            {!slipPreview ? (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-300">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-medium text-foreground mb-1">
                    แตะเพื่อเลือกรูปสลิป
                  </p>
                  <p className="text-sm text-muted-foreground">รองรับ JPG, PNG</p>
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
                <div className="relative rounded-2xl overflow-hidden shadow-md">
                  <img src={slipPreview} alt="Payment slip" className="w-full h-auto" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 rounded-full w-8 h-8 shadow-lg"
                    onClick={handleClearSlip}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleSubmitSlip}
                  disabled={isUploading}
                  className="w-full h-12 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-shadow"
                >
                  {isUploading
                    ? "กำลังส่งสลิป..."
                    : "ส่งสลิปเพื่อตรวจสอบ"}
                </Button>
              </div>
            )}
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          </Card>
        )}

        {/* Pending Verification */}
        {paymentStatus === "pending" && (
          <Card className="p-8 shadow-lg border-0 bg-card text-center">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-5 animate-pulse">
              <Loader2 className="w-10 h-10 text-accent-foreground animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              กำลังรอคนขับตรวจสอบสลิป
            </h2>
            <p className="text-muted-foreground mb-4">
              รอทางคนขับตรวจสอบสลิปของคุณ
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>โดยปกติใช้เวลาไม่เกิน 2 นาที</span>
            </div>
            <div className="mt-5">
              <Button variant="outline" onClick={checkPaymentStatus} disabled={isChecking} className="w-full">
                {isChecking
                  ? "กำลังตรวจสอบ..."
                  : "ตรวจสอบสถานะอีกครั้ง"}
              </Button>
            </div>
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          </Card>
        )}

        {/* Verified Success */}
        {paymentStatus === "verified" && (
          <Card className="p-8 shadow-lg border-0 bg-gradient-to-br from-primary/10 to-card text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">ชำระเงินสำเร็จ!</h2>
            <p className="text-muted-foreground mb-6">
              คิวของคุณได้รับการยืนยันแล้ว
            </p>
            <Button onClick={handleContinue} className="w-full h-12 text-base font-semibold rounded-xl shadow-md">
              ดูสถานะคิว
            </Button>
          </Card>
        )}

        {/* Payment Info */}
        <Card className="p-4 shadow-md border-0 bg-accent/50">
          <h3 className="font-semibold text-accent-foreground mb-3">ข้อมูลการโอนเงิน</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ธนาคาร</span>
              <span className="font-medium text-foreground">กสิกรไทย</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">เลขบัญชี</span>
              <span className="font-medium text-foreground">123-4-56789-0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ชื่อบัญชี</span>
              <span className="font-medium text-foreground">
                สหกรณ์รถตู้มหาวิทยาลัย
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentConfirmation;