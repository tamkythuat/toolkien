import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";

const FILE = "users.json";
const TRIALS_FILE = "trials.json";
const ACTIVE_TRIALS_FILE = "active_trials.json";

function loadUsers() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}

function loadTrials() {
  if (!fs.existsSync(TRIALS_FILE)) return [];
  return JSON.parse(fs.readFileSync(TRIALS_FILE, "utf-8"));
}

function loadActiveTrials() {
  if (!fs.existsSync(ACTIVE_TRIALS_FILE)) return [];
  return JSON.parse(fs.readFileSync(ACTIVE_TRIALS_FILE, "utf-8"));
}

function saveTrials(data: any) {
  fs.writeFileSync(TRIALS_FILE, JSON.stringify(data, null, 2));
}

function saveActiveTrials(data: any) {
  fs.writeFileSync(ACTIVE_TRIALS_FILE, JSON.stringify(data, null, 2));
}

function saveUsers(data: any) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function getPrice(pack: number) {
  switch (pack) {
    case 1: return 300000;
    case 3: return 600000;
    case 9: return 900000;
    case 12: return 1000000;
    default: return 0;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API Routes
  app.post("/register", (req, res) => {
    const { name, phone, email, pack } = req.body;
    if (!name || !phone || !email || !pack) {
      return res.json({ message: "Thiếu thông tin" });
    }
    const users = loadUsers();
    const user = {
      id: Date.now(),
      name,
      phone,
      email,
      pack,
      expiredAt: null,
      status: "pending"
    };
    users.push(user);
    saveUsers(users);
    const payUrl = `https://qr.sepay.vn/pay?amount=${getPrice(pack)}&content=${name}_${phone}`;
    res.json({ message: "Chuyển sang thanh toán...", payUrl, orderId: `${name}_${phone}` });
  });

  app.post("/webhook", (req, res) => {
    // Để bảo mật thực tế, bạn nên thêm logic kiểm tra token từ header SePay
    const { content, amount } = req.body;
    if (!content) return res.send("ok");
    
    // Nội dung chuyển khoản có dạng: name_phone
    const [name, phone] = content.split("_");
    let users = loadUsers();
    // Tìm user theo name và phone
    let user = users.find((u: any) => u.name === name && u.phone === phone);
    
    if (user) {
      const now = new Date();
      // Cộng thêm tháng dựa trên gói user đã chọn
      now.setMonth(now.getMonth() + user.pack);
      user.expiredAt = now.toISOString();
      user.status = "active";
      saveUsers(users);
      console.log(`Đã kích hoạt cho user ${name} (${phone})`);
      sendEmail(user.email, "Thanh toán thành công", `Xin chào ${user.name}, tài khoản của bạn đã được kích hoạt thành công cho gói ${user.pack} tháng!`);
      
      // Gửi thông báo cho chủ shop (bạn)
      if (process.env.ADMIN_EMAIL) {
        sendEmail(process.env.ADMIN_EMAIL, "Có thanh toán mới!", `Khách hàng ${user.name} (${user.email}, ${user.phone}) đã thanh toán thành công gói ${user.pack} tháng.`);
      }
    }
    res.send("ok");
  });

function sendEmail(to: string, subject: string, text: string) {
    if (!process.env.SMTP_HOST) return;
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    transporter.sendMail({
        from: `"${process.env.SMTP_USER}" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
    }).catch(console.error);
}

  // API test webhook (Chỉ dành cho môi trường dev)
  app.post("/api/test-webhook", (req, res) => {
    const { content, amount } = req.body;
    // Gọi trực tiếp đến route /webhook để giả lập
    req.url = '/webhook';
    return app._router.handle(req, res);
  });

  app.post("/login", (req, res) => {
    const { email } = req.body;
    const users = loadUsers();
    const activeTrials = loadActiveTrials();
    
    // Check main users
    const user = users.find((u: any) => u.email === email);
    if (user && user.status === "active") {
        const now = new Date();
        if (new Date(user.expiredAt) >= now) return res.json({ message: "Đăng nhập thành công" });
        return res.json({ message: "Hết hạn, vui lòng gia hạn" });
    }

    // Check trial users (get latest activation)
    const trialUser = [...activeTrials].reverse().find((t: any) => t.email === email);
    if (trialUser) {
        const activatedAt = new Date(trialUser.activatedAt);
        const expiresAt = new Date(activatedAt.getTime() + 24 * 60 * 60 * 1000); // 24 hours
        if (new Date() < expiresAt) return res.json({ message: "Đăng nhập thành công" });
        else return res.json({ message: "Mã dùng thử đã hết hạn" });
    }

    if (!user) return res.json({ message: "Không tồn tại" });
    res.json({ message: "Chưa thanh toán" });
  });

  app.post("/api/verify-trial", async (req, res) => {
    const { email, trialCode } = req.body;
    let trials = loadTrials();
    let activeTrials = loadActiveTrials();
    
    // 1. Kiểm tra mã nội bộ trước
    const trialIndex = trials.findIndex((t: any) => t.code === trialCode && !t.used);
    
    if (trialIndex !== -1) {
      trials[trialIndex].used = true;
      trials[trialIndex].usedAt = new Date().toISOString();
      saveTrials(trials);
      
      activeTrials.push({ email, activatedAt: new Date().toISOString() });
      saveActiveTrials(activeTrials);
      
      return res.json({ success: true, message: "Đăng nhập thành công" });
    }

    // 2. Nếu không thấy mã nội bộ, thử "hỏi" server bên kia (Relay Verification)
    try {
      const remoteVerifyUrl = "https://ais-dev-kzpsgzywmyzgstt2t5qtdj-412998410507.asia-east1.run.app/api/verify-trial";
      const remoteRes = await fetch(remoteVerifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, trialCode })
      });
      
      const contentType = remoteRes.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const remoteData: any = await remoteRes.json();
        if (remoteData.success || remoteData.message === "Đăng nhập thành công") {
          activeTrials.push({ email, activatedAt: new Date().toISOString() });
          saveActiveTrials(activeTrials);
          return res.json({ success: true, message: "Đăng nhập thành công (Mã liên kết)" });
        }
      } else {
        // Nếu server bên kia trả về HTML, có thể endpoint bị sai hoặc không tồn tại
        const text = await remoteRes.text();
        console.error("Server liên kết không trả về JSON. Nội dung nhận được:", text.substring(0, 100));
      }
    } catch (error) {
      console.error("Lỗi kết nối server liên kết:", error);
    }
    
    res.json({ success: false, message: "Mã không hợp lệ hoặc đã được sử dụng ở cả hai hệ thống" });
  });

  // Admin endpoint to generate codes
  app.get("/api/admin/generate-trials", (req, res) => {
    const count = parseInt(req.query.count as string) || 10;
    const trials = loadTrials();
    const newTrials = [];
    
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      newTrials.push({ code, used: false });
    }
    
    saveTrials([...trials, ...newTrials]);
    res.json({ message: `Đã tạo ${count} mã mới`, codes: newTrials.map(t => t.code) });
  });

  // Fetch from the provided remote source and register locally
  app.post("/api/get-external-trial", async (req, res) => {
    try {
      const remoteUrl = "https://ais-dev-kzpsgzywmyzgstt2t5qtdj-412998410507.asia-east1.run.app/api/admin/generate-trials?count=1";
      const response = await fetch(remoteUrl);
      const data: any = await response.json();
      
      if (data.codes && data.codes.length > 0) {
        const remoteCode = data.codes[0];
        
        // Register this code locally so this app recognizes it
        let trials = loadTrials();
        if (!trials.find((t: any) => t.code === remoteCode)) {
          trials.push({ code: remoteCode, used: false, source: "external" });
          saveTrials(trials);
        }
        
        return res.json({ success: true, code: remoteCode });
      }
      res.json({ success: false, message: "Không thể lấy mã từ nguồn ngoài" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Lỗi kết nối máy chủ quản lý mã" });
    }
  });

  // Endpoint lấy 1 mã nhanh cho khách hàng (Trả về TEXT đơn giản để dễ copy)
  app.get("/api/get-free-trial", (req, res) => {
    const trials = loadTrials();
    const code = "TRIAL-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    trials.push({ code, used: false, createdAt: new Date().toISOString() });
    saveTrials(trials);
    
    res.send(`Mã dùng thử 1 ngày của bạn là: ${code}`);
  });

  // API lấy danh sách mã (JSON)
  app.get("/api/admin/list-codes", (req, res) => {
    res.json(loadTrials());
  });

  // API xóa mã
  app.post("/api/admin/delete-code", (req, res) => {
    const { code } = req.body;
    let trials = loadTrials();
    trials = trials.filter((t: any) => t.code !== code);
    saveTrials(trials);
    res.json({ success: true });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
