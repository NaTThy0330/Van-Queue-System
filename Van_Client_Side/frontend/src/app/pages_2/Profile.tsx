import { useNavigate } from "react-router";
import { ArrowLeft, LogOut, User, Phone } from 'lucide-react';
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { BottomNav } from "@/app/components/BottomNav";
import { useAppStore } from "@/app/store";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAppStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border/50 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/home')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">โปรไฟล์</h1>
        </div>
      </div>
      
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Profile Card */}
        <Card className="p-6 shadow-lg border-border/50">
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-20 h-20 border-4 border-primary mb-4">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-foreground">{user?.name || 'ผู้ใช้'}</h2>
          </div>
        </Card>
        
        {/* Info Card */}
        <Card className="p-4 shadow-md border-border/50 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ชื่อ-นามสกุล</p>
              <p className="font-medium text-foreground">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">เบอร์โทรศัพท์</p>
              <p className="font-medium text-foreground">{user?.phone}</p>
            </div>
          </div>
        </Card>
        
        {/* Logout */}
        <Button 
          variant="outline"
          onClick={handleLogout}
          className="w-full h-12 text-base font-semibold text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5 mr-2" />
          ออกจากระบบ
        </Button>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Profile;
