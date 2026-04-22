import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

export function Register({ onViewChange }: { onViewChange: (view: 'login' | 'register') => void }) {
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", pack: 1 });
  const [msg, setMsg] = useState("");
  const [orderId, setOrderId] = useState("");
  // Sử dụng QR code SEPay linh hoạt với tài khoản VietinBank mới
  const getQrCodeUrl = (amount: number, content: string) => `https://qr.sepay.vn/img?acc=11592345&bank=VietinBank&amount=${amount}&des=${encodeURIComponent(content)}`;
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const pricing = { 1: 300000, 3: 600000, 9: 900000, 12: 1000000 };

  async function register() {
    const res = await fetch(`${window.location.origin}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    const result = await res.json();
    if (result.orderId) {
      setOrderId(result.orderId);
      setMsg("Vui lòng quét mã QR để thanh toán tự động.");
      const url = getQrCodeUrl(pricing[formData.pack as keyof typeof pricing], result.orderId);
      console.log("QR URL:", url);
      setQrCodeUrl(url);
    } else {
      setMsg(result.message);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-800">
      <Card className="w-[400px] p-6 bg-white border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900">Đăng ký sử dụng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!orderId ? (
            <>
              <Input placeholder="Họ tên" className="bg-slate-50 border-slate-200" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <Input placeholder="SĐT" className="bg-slate-50 border-slate-200" onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              <Input type="email" placeholder="Email" className="bg-slate-50 border-slate-200" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              
              <h3 className="text-lg font-semibold text-slate-900">Chọn gói</h3>
              {Object.entries(pricing).map(([months, price]) => (
                <div key={months} className={`cursor-pointer p-3 border rounded-lg transition ${formData.pack === Number(months) ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setFormData({ ...formData, pack: Number(months) })}>
                  <div className="font-semibold">{months} tháng</div>
                  <div className="text-sm text-slate-600">{price.toLocaleString()} VNĐ</div>
                </div>
              ))}
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={register}>Đăng ký & Thanh toán</Button>
              <Button variant="ghost" className="w-full text-slate-600" onClick={() => onViewChange('login')}>Đã có tài khoản? Đăng nhập</Button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold">Thanh Toán Tự Động</h2>
              <p>Nội dung CK: <span className="font-bold text-red-500">{orderId}</span></p>
              <img src={qrCodeUrl} alt="QR Thanh toán" className="mx-auto w-64 h-64" referrerPolicy="no-referrer" />
              <p className="text-sm text-slate-600">Hệ thống sẽ tự động duyệt khi bạn thanh toán đúng nội dung.</p>
              <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>Bỏ qua (Test)</Button>
            </div>
          )}
          <p className="text-sm text-slate-700">{msg}</p>
        </CardContent>
      </Card>
    </div>
  );
}
