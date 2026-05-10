export function AppLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.18),_transparent_40%),linear-gradient(180deg,#fff7f0_0%,#ffffff_55%,#fff2e6_100%)]">
      <div className="relative w-full max-w-sm px-6">
        <div className="absolute inset-x-10 top-0 h-44 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-8 text-center shadow-[0_18px_60px_rgba(249,115,22,0.18)] backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400 to-orange-500 text-2xl text-white shadow-lg shadow-orange-200">
            🚐
          </div>
          <h1 className="text-2xl font-bold text-orange-700">TU Van Booking</h1>
          <p className="mt-2 text-sm text-orange-500">กำลังเตรียมหน้าจอและข้อมูลของคุณ</p>

          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-orange-300 animate-[pulse_1.2s_ease-in-out_infinite]" />
            <div className="h-2.5 w-2.5 rounded-full bg-orange-400 animate-[pulse_1.2s_ease-in-out_0.15s_infinite]" />
            <div className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-[pulse_1.2s_ease-in-out_0.3s_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
}
