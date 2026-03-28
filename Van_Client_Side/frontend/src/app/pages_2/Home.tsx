import { Card } from "@/app/components/ui/card";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { Bus, Newspaper, ChevronRight } from 'lucide-react';
import { useNavigate } from "react-router";
import { useAppStore } from "@/app/store";
import { BottomNav } from "@/app/components/BottomNav";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'อรุณสวัสดิ์';
    if (hour < 17) return 'สวัสดีตอนบ่าย';
    return 'สวัสดีตอนเย็น';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-card/80 backdrop-blur-sm border-b border-border/50 z-40">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{getGreeting()}</p>
            <h1 className="text-lg font-bold text-foreground">{user?.name || 'ผู้ใช้'}</h1>
          </div>
          <Avatar className="w-10 h-10 border-2 border-primary">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Main Action Card */}
        <Card 
          className="p-6 shadow-lg cursor-pointer hover:shadow-xl transition-shadow active:scale-[0.98] border-border/50"
          onClick={() => navigate('/explore')}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Bus className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">จองที่นั่งออนไลน์</h2>
              <p className="text-sm text-muted-foreground">เลือกเส้นทางและจองคิว</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>
        
        {/* Secondary Card */}
        <Card 
          className="p-5 shadow-md cursor-pointer hover:shadow-lg transition-shadow active:scale-[0.98] border-border/50"
          onClick={() => {}}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">ข่าวสารในมหาวิทยาลัย</h3>
              <p className="text-xs text-muted-foreground">อัพเดทล่าสุด</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Home;
