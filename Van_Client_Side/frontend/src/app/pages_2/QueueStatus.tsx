import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, User, Phone, MapPin, AlertCircle, Bus, Clock, Timer } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { CountdownTimer } from "@/app/components/CountdownTimer";
import { CancelModal } from "@/app/components/CancelModal";
import { useAppStore } from "@/app/store";

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

  const booking = bookings.find((b) => b.id === id);

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
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        {isLoading ? "กำลังโหลดข้อมูลคิว..." : "ไม่พบข้อมูลคิว"}
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (booking.status) {
      case "waiting":
        return (
          <Badge className="bg-primary/20 text-primary border-0 px-3 py-1">
            กำลังรอขึ้นรถ
          </Badge>
        );
      case "unpaid":
        return (
          <Badge
            variant="outline"
            className="border-accent-foreground text-accent-foreground px-3 py-1"
          >
            รอการชำระเงิน
          </Badge>
        );
      case "confirmed":
        return (
          <Badge className="bg-primary/20 text-primary border-0 px-3 py-1">
            ยืนยันแล้ว
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="destructive" className="px-3 py-1">
            หมดเวลา
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="secondary" className="px-3 py-1">
            ยกเลิกแล้ว
          </Badge>
        );
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
    <div className="min-h-screen bg-gradient-to-b from-background to-card/50">
      {/* Header */}
      <div className="sticky top-0 bg-card/90 backdrop-blur-md border-b border-border/30 z-40">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/home")}
            className="rounded-full hover:bg-primary/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">สถานะคิว</h1>
          {getStatusBadge()}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-5">
        {/* Queue Number Card - More Modern */}
        <Card className="p-6 text-center shadow-xl border-0 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <p className="text-sm text-muted-foreground mb-2">หมายเลขคิวของคุณ</p>
            <div className="text-7xl font-bold text-primary mb-3 drop-shadow-sm">
              {booking.queueNumber}
            </div>
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <MapPin className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium text-foreground">
                {booking.from} → {booking.to}
              </p>
            </div>
          </div>
        </Card>

        {/* Unpaid Queue Info Card */}
        {booking.status === "unpaid" && (
          <>
            <Card className="p-5 shadow-lg border-0 bg-card space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Bus className="w-5 h-5 text-primary" />
                ข้อมูลรถที่รอ
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background/50 rounded-xl p-4 text-center">
                  <Bus className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground mb-1">รถคันที่</p>
                  <p className="font-bold text-foreground">
                    {booking.vanNumber || "ตู้ 7"}
                  </p>
                </div>
                <div className="bg-background/50 rounded-xl p-4 text-center">
                  <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground mb-1">รถจะมาเวลา</p>
                  <p className="font-bold text-foreground">{booking.departureTime}</p>
                </div>
              </div>

              <div className="bg-accent/50 rounded-xl p-4 text-center">
                <Timer className="w-6 h-6 text-accent-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">ต้องไปถึงก่อน</p>
                <p className="font-bold text-lg text-accent-foreground">
                  {booking.departureTime}
                </p>
              </div>
            </Card>

            {/* Countdown Timer */}
            {booking.expiresAt && (
              <CountdownTimer
                expiresAt={new Date(booking.expiresAt)}
                onExpire={handleExpire}
              />
            )}
          </>
        )}

        {/* Info Card for Confirmed/Waiting */}
        {(booking.status === "confirmed" || booking.status === "waiting") && (
          <Card className="p-5 shadow-lg border-0 bg-card space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border/50">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ชื่อผู้จอง</p>
                <p className="font-semibold text-foreground">{user?.name ?? "ผู้ใช้"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pb-3 border-b border-border/50">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">เบอร์โทร</p>
                <p className="font-semibold text-foreground">{user?.phone ?? "-"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">เวลาโดยประมาณ</p>
                <p className="font-semibold text-foreground">{booking.departureTime}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Alert */}
        {booking.status === "unpaid" && (
          <div className="flex items-start gap-3 p-4 bg-accent/70 rounded-2xl shadow-sm">
            <div className="w-8 h-8 bg-accent-foreground/10 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-accent-foreground" />
            </div>
            <div>
              <p className="font-medium text-accent-foreground text-sm mb-1">โปรดทราบ</p>
              <p className="text-sm text-accent-foreground/80">
                คิวที่ยังไม่ชำระเงินจะอยู่หลังคิวที่ชำระแล้ว กรุณาชำระเงินเพื่อยืนยันคิว
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        {isActive && (
          <div className="space-y-3 pt-2">
            {booking.status === "unpaid" && (
              <Button
                onClick={handlePayment}
                className="w-full h-14 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                ชำระเงินตอนนี้
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setShowCancelModal(true)}
              className="w-full h-12 text-base font-semibold text-destructive border-destructive/30 hover:bg-destructive/10 rounded-2xl"
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
