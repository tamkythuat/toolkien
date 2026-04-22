import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

export function Login({ onLogin, onViewChange }: { onLogin: () => void, onViewChange: (view: 'login' | 'register') => void }) {
  const [email, setEmail] = useState("");
  const [trialCode, setTrialCode] = useState("");
  const [msg, setMsg] = useState("");

  async function login() {
    // 1. Nếu có mã dùng thử, chỉ kiểm tra theo luồng dùng thử
    if (trialCode) {
      const trialRes = await fetch(`${window.location.origin}/api/verify-trial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, trialCode })
      });
      const trialResult = await trialRes.json();
      
      if (trialResult.success) {
        onLogin();
      } else {
        setMsg(trialResult.message);
      }
      return; // Dừng lại ở đây sau khi đã kiểm tra mã dùng thử
    }

    // 2. Nếu không nhập mã dùng thử, kiểm tra đăng nhập chính thức
    const res = await fetch(`${window.location.origin}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const result = await res.json();
    setMsg(result.message);
    if (result.message === "Đăng nhập thành công") onLogin();
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-800">
      <Card className="w-[400px] p-6 bg-white border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900">Đăng nhập</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input type="email" placeholder="Email" className="bg-slate-50 border-slate-200" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="space-y-2">
            <Input 
              type="text" 
              placeholder="Mã dùng thử 1 ngày" 
              className="bg-slate-50 border-slate-200" 
              value={trialCode}
              onChange={(e) => setTrialCode(e.target.value)} 
            />
          </div>
          <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={login}>Đăng nhập</Button>
          <Button variant="ghost" className="w-full text-slate-600" onClick={() => onViewChange('register')}>Chưa có tài khoản? Đăng ký</Button>
          <p className="text-sm text-slate-700">{msg}</p>
        </CardContent>
      </Card>
    </div>
  );
}
