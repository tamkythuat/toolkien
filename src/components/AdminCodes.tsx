import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { RefreshCw, Trash2, Key, Copy, Check } from "lucide-react";

export function AdminCodes() {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/list-codes");
      const data = await res.json();
      setCodes(data.reverse());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    await fetch("/api/admin/generate-trials?count=1");
    fetchCodes();
  };

  const deleteCode = async (code: string) => {
    await fetch("/api/admin/delete-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    fetchCodes();
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Key className="w-8 h-8 text-cyan-600" />
          Quản lý mã dùng thử
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCodes} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button onClick={generateCode} className="bg-cyan-600 hover:bg-cyan-700">
            Tạo 1 mã mới
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách mã đã tạo</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {codes.length === 0 && <p className="text-center text-slate-500 py-8">Chưa có mã nào được tạo.</p>}
              {codes.map((t) => (
                <div key={t.code} className="flex items-center justify-between p-4 border rounded-xl bg-slate-50/50">
                  <div>
                    <div className="font-mono text-lg font-bold flex items-center gap-2">
                      {t.code}
                      <button onClick={() => copy(t.code)} className="text-slate-400 hover:text-cyan-600 transition">
                        {copied === t.code ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="text-xs text-slate-500">
                      {t.used ? `Hết hạn: ${new Date(t.usedAt).toLocaleString()}` : "Chưa sử dụng"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${t.used ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {t.used ? 'Đã dùng' : 'Sẵn sàng'}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => deleteCode(t.code)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="p-4 bg-cyan-50 border border-cyan-100 rounded-2xl text-cyan-800 text-sm">
        <strong>💡 Mẹo:</strong> Bạn có thể chia sẻ đường dẫn này cho khách hàng để họ tự lấy mã: 
        <code className="ml-2 bg-white px-2 py-1 rounded border border-cyan-200">{window.location.origin}/api/get-free-trial</code>
      </div>
    </div>
  );
}
