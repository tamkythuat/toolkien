import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { saveAs } from "file-saver";
import { 
  Sword, 
  Shield, 
  Map as MapIcon, 
  Wind, 
  Camera, 
  Sparkles, 
  Copy, 
  Check, 
  Download,
  RefreshCw,
  Zap,
  Flame,
  Skull,
  Ghost,
  Bug,
  Dna,
  Crosshair,
  Radar,
  Activity,
  Terminal,
  Layers,
  Target
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Badge } from "@/src/components/ui/badge";
import { generateCinematicSequence, type SceneData } from "@/src/lib/gemini";
import { Register } from "@/src/components/Register";
import { Login } from "@/src/components/Login";

import { AdminCodes } from "@/src/components/AdminCodes";

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [view, setView] = useState<'app' | 'register' | 'login' | 'admin'>('login');

  const [creatureType, setCreatureType] = useState("ant");
  const [customCreature, setCustomCreature] = useState("");
  const [sceneNumber, setSceneNumber] = useState(1);
  const [armorStyle, setArmorStyle] = useState("medieval armor");
  const [customArmor, setCustomArmor] = useState("");
  const [action, setAction] = useState("leading a massive charge as a general");
  const [environment, setEnvironment] = useState("vast cracked desert");
  const [customEnvironment, setCustomEnvironment] = useState("");
  const [weapons, setWeapons] = useState("sharp longsword");
  const [customWeapons, setCustomWeapons] = useState("");
  const [lighting, setLighting] = useState("golden hour");
  const [camera, setCamera] = useState("auto cinematic movement");
  const [mood, setMood] = useState("epic");
  
  const [scenes, setScenes] = useState<SceneData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  if (view === 'admin') return <AdminCodes />;

  if (!authenticated) {
    if (view === 'register') return <Register onViewChange={setView} />;
    return (
      <div className="relative">
        <Login onLogin={() => setAuthenticated(true)} onViewChange={setView} />
        <button 
          onClick={() => setView('admin')} 
          className="fixed bottom-4 right-4 text-[10px] text-slate-300 hover:text-slate-600 transition"
        >
          Admin
        </button>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (creatureType === "custom" && !customCreature.trim()) return;
    if (armorStyle === "custom" && !customArmor.trim()) return;
    if (environment === "custom" && !customEnvironment.trim()) return;
    if (weapons === "custom" && !customWeapons.trim()) return;

    setIsGenerating(true);
    setHasGenerated(true);
    
    try {
      const result = await generateCinematicSequence({
        creatureType: creatureType === "custom" ? customCreature : creatureType,
        armorStyle: armorStyle === "custom" ? customArmor : armorStyle,
        action,
        environment: environment === "custom" ? customEnvironment : environment,
        weapons: weapons === "custom" ? customWeapons : weapons,
        lighting,
        mood,
        camera,
        sceneCount: sceneNumber
      });
      setScenes(result);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadFile = (text: string, filename: string) => {
    if (!text) return;
    try {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      saveAs(blob, filename);
    } catch (error) {
      console.error("Download failed:", error);
      // Last resort: standard anchor click
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };
  const downloadAllImagePrompts = () => {
    const content = scenes
      .map((s) => s.imagePrompt)
      .join("\n\n");

    downloadFile(content, "image-prompt.txt");
  };

  const downloadAllVideoPrompts = () => {
    const content = scenes
      .map((s) => `${s.videoPrompt} [Voice: ${s.voiceOver}]`)
      .join("\n\n");

    downloadFile(content, "video-prompt.txt");
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      {/* Background HUD Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#dee2e6_1px,transparent_1px)] [background-size:40px_40px]" />
        <div className="scanline" />
      </div>

      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header - Tactical HUD */}
        <header className="relative py-12 border-b border-war-red/20">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-32 h-px bg-gradient-to-r from-war-red to-transparent" />
            <div className="absolute top-0 left-0 w-px h-32 bg-gradient-to-b from-war-red to-transparent" />
            <div className="absolute bottom-0 right-0 w-32 h-px bg-gradient-to-l from-war-red to-transparent" />
            <div className="absolute bottom-0 right-0 w-px h-32 bg-gradient-to-t from-war-red to-transparent" />
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              src="https://yt3.googleusercontent.com/Gug5UDLjPMRBto68HqZvJCSryebEkqiI2_9qV_8y16ZKIVLgxYBFx_PyUYZStcTzSc3v7TLq=s900-c-k-c0x00ffffff-no-rj"
              alt="Logo"
              className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-war-red/50 shadow-[0_0_30px_rgba(239,68,68,0.2)] mb-2 object-cover"
              referrerPolicy="no-referrer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 px-4 py-1.5 rounded-none border border-war-red/30 bg-war-red/10 text-war-red text-[10px] font-bold uppercase tracking-[0.3em] mb-2"
            >
              <Radar className="w-3 h-3 animate-pulse" />
              <span>Trung tâm chỉ huy Prompt Chiến thuật v2.0</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tighter uppercase glow-red"
            >
              Cuộc Chiến Sinh Vật
            </motion.h1>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section - Mission Config */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-5 space-y-6"
          >
            <Card className="border-war-border bg-war-card/90 backdrop-blur-md rounded-3xl relative overflow-hidden">
              <div className="hud-corner hud-corner-tl !rounded-tl-3xl" />
              <div className="hud-corner hud-corner-tr !rounded-tr-3xl" />
              <div className="hud-corner hud-corner-bl !rounded-bl-3xl" />
              <div className="hud-corner hud-corner-br !rounded-br-3xl" />
              
              <CardHeader className="border-b border-war-border/50 bg-black/[0.02] p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="font-roboto text-[18px] font-bold uppercase tracking-[0.1em] text-war-red flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Cấu hình nhiệm vụ
                    </CardTitle>
                    <CardDescription className="text-xs uppercase tracking-wider opacity-50">Xác định các thông số chiến trường</CardDescription>
                  </div>
                  <Crosshair className="w-6 h-6 text-war-red/20" />
                </div>
              </CardHeader>
              
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="font-roboto font-bold text-[18px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Bug className="w-5 h-5" /> Chủng Loài
                    </Label>
                    <Select value={creatureType} onValueChange={setCreatureType}>
                      <SelectTrigger className="bg-muted/40 border-war-border rounded-xl h-12 focus:ring-war-red/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-war-card border-war-border text-foreground max-h-[300px] rounded-xl">
                        <SelectItem value="ant">Kiến (Ant)</SelectItem>
                        <SelectItem value="bee">Ong (Bee)</SelectItem>
                        <SelectItem value="beetle">Bọ Cánh Cứng (Beetle)</SelectItem>
                        <SelectItem value="spider">Nhện (Spider)</SelectItem>
                        <SelectItem value="mantis">Bọ Ngựa (Mantis)</SelectItem>
                        <SelectItem value="scorpion">Bọ Cạp (Scorpion)</SelectItem>
                        <SelectItem value="wasp">Tò Vò (Wasp)</SelectItem>
                        <SelectItem value="dragonfly">Chuồn Chuồn (Dragonfly)</SelectItem>
                        <SelectItem value="termite">Mối (Termite)</SelectItem>
                        <SelectItem value="moth">Bướm Đêm (Moth)</SelectItem>
                        <SelectItem value="grasshopper">Châu Chấu (Grasshopper)</SelectItem>
                        <SelectItem value="centipede">Rết (Centipede)</SelectItem>
                        <SelectItem value="millipede">Cuốn Chiếu (Millipede)</SelectItem>
                        <SelectItem value="dung beetle">Bọ Hung (Dung Beetle)</SelectItem>
                        <SelectItem value="stick insect">Bọ Que (Stick Insect)</SelectItem>
                        <SelectItem value="cicada">Ve Sầu (Cicada)</SelectItem>
                        <SelectItem value="ladybug">Bọ Rùa (Ladybug)</SelectItem>
                        <SelectItem value="mosquito">Muỗi (Mosquito)</SelectItem>
                        <SelectItem value="fly">Ruồi (Fly)</SelectItem>
                        <SelectItem value="stink bug">Bọ Xít (Stink Bug)</SelectItem>
                        <SelectItem value="custom" className="font-bold text-war-red">Tự chọn...</SelectItem>
                      </SelectContent>
                    </Select>
                    {creatureType === "custom" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pt-2"
                      >
                        <Input 
                          placeholder="Nhập chủng loài của bạn..."
                          value={customCreature}
                          onChange={(e) => setCustomCreature(e.target.value)}
                          className="bg-muted/40 border-war-border rounded-xl h-10 focus:ring-war-red/50"
                        />
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="font-roboto font-bold text-[18px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Shield className="w-5 h-5" /> Giáp Trụ
                    </Label>
                    <Select value={armorStyle} onValueChange={setArmorStyle}>
                      <SelectTrigger className="bg-muted/40 border-war-border rounded-xl h-12 focus:ring-war-red/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-war-card border-war-border text-foreground max-h-[300px] rounded-xl">
                        <SelectItem value="medieval armor">Giáp Trung Cổ</SelectItem>
                        <SelectItem value="samurai armor">Giáp Samurai</SelectItem>
                        <SelectItem value="cybernetic tech">Công Nghệ Cyber</SelectItem>
                        <SelectItem value="bone armor">Giáp Xương</SelectItem>
                        <SelectItem value="steampunk brass">Đồng Steampunk</SelectItem>
                        <SelectItem value="crystal shards">Mảnh Pha Lê</SelectItem>
                        <SelectItem value="lava plate">Giáp Dung Nham</SelectItem>
                        <SelectItem value="frost guard">Giáp Băng Giá</SelectItem>
                        <SelectItem value="bio-organic">Giáp Sinh Học</SelectItem>
                        <SelectItem value="ancient egyptian">Giáp Cổ Ai Cập</SelectItem>
                        <SelectItem value="viking raider">Giáp Viking</SelectItem>
                        <SelectItem value="divine gold">Giáp Thần Thánh</SelectItem>
                        <SelectItem value="void shadow">Giáp Hư Không</SelectItem>
                        <SelectItem value="forest guardian">Giáp Lá Cây</SelectItem>
                        <SelectItem value="desert nomad">Giáp Sa Mạc</SelectItem>
                        <SelectItem value="gladiator leather">Giáp Đấu Sĩ</SelectItem>
                        <SelectItem value="futuristic nano">Giáp Tương Lai</SelectItem>
                        <SelectItem value="obsidian glass">Giáp Thủy Tinh</SelectItem>
                        <SelectItem value="dragon scale">Giáp Rồng</SelectItem>
                        <SelectItem value="arcane rune">Giáp Ma Thuật</SelectItem>
                        <SelectItem value="custom" className="font-bold text-war-red">Tự chọn...</SelectItem>
                      </SelectContent>
                    </Select>
                    {armorStyle === "custom" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pt-2"
                      >
                        <Input 
                          placeholder="Nhập loại giáp trụ của bạn..."
                          value={customArmor}
                          onChange={(e) => setCustomArmor(e.target.value)}
                          className="bg-muted/40 border-war-border rounded-xl h-10 focus:ring-war-red/50"
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="font-roboto font-bold text-[18px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Sword className="w-5 h-5" /> Hành Động Chính
                  </Label>
                  <Select value={action} onValueChange={setAction}>
                    <SelectTrigger className="bg-muted/40 border-war-border rounded-xl h-12 focus:ring-war-red/50">
                      <SelectValue placeholder="Chọn hành động..." />
                    </SelectTrigger>
                    <SelectContent className="bg-war-card border-war-border text-foreground max-h-[300px] rounded-xl">
                      <SelectItem value="leading a massive charge as a general">Dẫn đầu cuộc tổng tấn công</SelectItem>
                      <SelectItem value="raiding enemy base at night">Đột kích căn cứ địch trong đêm</SelectItem>
                      <SelectItem value="defending the fortress gates">Thủ thế bảo vệ thành trì</SelectItem>
                      <SelectItem value="scouting the dead wasteland">Trinh sát vùng đất chết</SelectItem>
                      <SelectItem value="ambushing the supply convoy">Phục kích đoàn xe tiếp tế</SelectItem>
                      <SelectItem value="breaking through enemy lines">Phá vỡ phòng tuyến kẻ thù</SelectItem>
                      <SelectItem value="rallying troops for war">Triệu tập quân đội chuẩn bị tham chiến</SelectItem>
                      <SelectItem value="tactical retreat under fire">Rút lui chiến thuật dưới làn đạn</SelectItem>
                      <SelectItem value="lone warrior standing ground">Đơn độc chiến đấu giữa vòng vây</SelectItem>
                      <SelectItem value="firing heavy cannons at gates">Khai hỏa đại bác công phá cổng thành</SelectItem>
                      <SelectItem value="escorting leader to safety">Hộ tống thủ lĩnh đến nơi an toàn</SelectItem>
                      <SelectItem value="setting traps in the jungle">Đặt bẫy trong rừng rậm</SelectItem>
                      <SelectItem value="leaping through a burning battlefield">Nhảy qua chiến trường rực lửa</SelectItem>
                      <SelectItem value="commanding special ops infiltration">Chỉ huy đội đặc nhiệm đột nhập</SelectItem>
                      <SelectItem value="holding a strategic position">Cố thủ vị trí chiến lược</SelectItem>
                      <SelectItem value="pursuing retreating enemy forces">Truy đuổi tàn quân địch</SelectItem>
                      <SelectItem value="rescuing captured comrades">Giải cứu đồng đội bị bắt giữ</SelectItem>
                      <SelectItem value="destroying enemy weapon cache">Phá hủy kho vũ khí đối phương</SelectItem>
                      <SelectItem value="patrolling the foggy border">Tuần tra biên giới đầy sương mù</SelectItem>
                      <SelectItem value="shouting the final battle cry">Hô vang hiệu lệnh quyết chiến</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              <div className="space-y-3">
                <Label className="font-roboto font-bold text-[18px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <MapIcon className="w-5 h-5" /> Môi Trường
                </Label>
                <Select value={environment} onValueChange={setEnvironment}>
                  <SelectTrigger className="bg-muted/40 border-war-border rounded-xl h-12 focus:ring-war-red/50">
                    <SelectValue placeholder="Chọn môi trường..." />
                  </SelectTrigger>
                  <SelectContent className="bg-war-card border-war-border text-foreground max-h-[300px] rounded-xl">
                    <SelectItem value="vast cracked desert">Sa mạc nứt nẻ rộng lớn</SelectItem>
                    <SelectItem value="desolate post-war wasteland">Vùng đất hoang tàn sau chiến tranh</SelectItem>
                    <SelectItem value="rugged rocky mountains covered in dust">Núi đá hiểm trở phủ đầy bụi mù</SelectItem>
                    <SelectItem value="burning fields after battle">Cánh đồng cháy rực sau trận chiến</SelectItem>
                    <SelectItem value="valley covered in thick fog">Thung lũng phủ sương dày đặc</SelectItem>
                    <SelectItem value="dense jungle with dappled light">Rừng rậm um tùm ánh sáng le lói</SelectItem>
                    <SelectItem value="deep underground cavern">Hang động sâu dưới lòng đất</SelectItem>
                    <SelectItem value="massive terracotta fortress">Pháo đài đất nung khổng lồ</SelectItem>
                    <SelectItem value="ruined ancient citadel">Thành trì cổ bị tàn phá</SelectItem>
                    <SelectItem value="erupting volcanic land">Vùng đất núi lửa đang phun trào</SelectItem>
                    <SelectItem value="custom" className="font-bold text-war-red">Tự chọn...</SelectItem>
                  </SelectContent>
                </Select>
                {environment === "custom" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="pt-2"
                  >
                    <Input 
                      placeholder="Nhập môi trường của bạn..."
                      value={customEnvironment}
                      onChange={(e) => setCustomEnvironment(e.target.value)}
                      className="bg-muted/40 border-war-border rounded-xl h-10 focus:ring-war-red/50"
                    />
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="font-roboto font-bold text-[18px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Flame className="w-5 h-5" /> Vũ Khí
                  </Label>
                  <Select value={weapons} onValueChange={setWeapons}>
                    <SelectTrigger className="bg-muted/40 border-war-border rounded-xl h-12 focus:ring-war-red/50">
                      <SelectValue placeholder="Chọn vũ khí..." />
                    </SelectTrigger>
                    <SelectContent className="bg-war-card border-war-border text-foreground max-h-[300px] rounded-xl">
                      <SelectItem value="sharp longsword">Kiếm dài sắc bén</SelectItem>
                      <SelectItem value="metal war spear">Giáo chiến bằng kim loại</SelectItem>
                      <SelectItem value="giant battle axe">Rìu chiến khổng lồ</SelectItem>
                      <SelectItem value="combat daggers">Dao găm chiến đấu</SelectItem>
                      <SelectItem value="heavy war hammer">Búa chiến nặng</SelectItem>
                      <SelectItem value="classic bow and arrows">Cung tên cổ điển</SelectItem>
                      <SelectItem value="high-speed crossbow">Nỏ bắn tốc độ cao</SelectItem>
                      <SelectItem value="wooden cannons">Đại bác gỗ</SelectItem>
                      <SelectItem value="flamethrower weapon">Vũ khí phun lửa</SelectItem>
                      <SelectItem value="solid defensive shield">Khiên chắn kiên cố</SelectItem>
                      <SelectItem value="custom" className="font-bold text-war-red">Tự chọn...</SelectItem>
                    </SelectContent>
                  </Select>
                  {weapons === "custom" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="pt-2"
                    >
                      <Input 
                        placeholder="Nhập vũ khí của bạn..."
                        value={customWeapons}
                        onChange={(e) => setCustomWeapons(e.target.value)}
                        className="bg-muted/40 border-war-border rounded-xl h-10 focus:ring-war-red/50"
                      />
                    </motion.div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="font-roboto font-bold text-[18px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Wind className="w-5 h-5" /> Ánh Sáng
                  </Label>
                  <Select value={lighting} onValueChange={setLighting}>
                    <SelectTrigger className="bg-muted/40 border-war-border rounded-xl h-12 focus:ring-war-red/50">
                      <SelectValue placeholder="Chọn ánh sáng..." />
                    </SelectTrigger>
                    <SelectContent className="bg-war-card border-war-border text-foreground rounded-xl">
                      <SelectItem value="golden hour">Giờ Vàng (Golden Hour)</SelectItem>
                      <SelectItem value="cinematic night">Đêm Điện Ảnh</SelectItem>
                      <SelectItem value="foggy morning">Sương Mù Buổi Sáng</SelectItem>
                      <SelectItem value="firelight">Ánh Lửa Bập Bùng</SelectItem>
                      <SelectItem value="harsh moonlight">Ánh Trăng Lạnh Lẽo</SelectItem>
                      <SelectItem value="dramatic sunset">Hoàng Hôn Kịch Tính</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="font-roboto font-bold text-[18px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Camera className="w-5 h-5" /> Góc Quay
                    </Label>
                    <Select value={camera} onValueChange={setCamera}>
                      <SelectTrigger className="bg-muted/40 border-war-border rounded-xl h-12 focus:ring-war-red/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-war-card border-war-border text-foreground rounded-xl">
                        <SelectItem value="auto cinematic movement">Điện Ảnh Tự Động</SelectItem>
                        <SelectItem value="low angle heroic">Góc Thấp Anh Hùng</SelectItem>
                        <SelectItem value="dynamic drone follow">Drone Theo Sát</SelectItem>
                        <SelectItem value="extreme close-up">Cận Cảnh Đặc Tả</SelectItem>
                        <SelectItem value="wide panoramic">Toàn Cảnh Rộng</SelectItem>
                        <SelectItem value="handheld shaky cam">Cầm Tay Rung Lắc</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="font-roboto font-bold text-[18px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Zap className="w-5 h-5" /> Số Cảnh (1-100)
                    </Label>
                    <Input 
                      type="number"
                      min={1}
                      max={100}
                      value={sceneNumber} 
                      onChange={(e) => setSceneNumber(parseInt(e.target.value) || 1)}
                      className="bg-muted/40 border-war-border rounded-xl h-12 focus:ring-war-red/50"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="font-roboto font-bold text-[18px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Ghost className="w-5 h-5" /> Tâm Trạng
                  </Label>
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger className="bg-muted/40 border-war-border rounded-xl h-12 focus:ring-war-red/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-war-card border-war-border text-foreground rounded-xl">
                      <SelectItem value="epic">Hùng Tráng (Epic)</SelectItem>
                      <SelectItem value="dark">U Tối (Dark)</SelectItem>
                      <SelectItem value="melancholic">Bi Tráng (Melancholic)</SelectItem>
                      <SelectItem value="intense">Căng Thẳng (Intense)</SelectItem>
                      <SelectItem value="mysterious">Bí Ẩn (Mysterious)</SelectItem>
                      <SelectItem value="hopeful">Hy Vọng (Hopeful)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                  className="w-full h-16 rounded-2xl bg-war-red hover:bg-war-red/90 text-white font-black uppercase tracking-[0.4em] text-xl group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                  {isGenerating ? (
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 fill-current" />
                      <span>Bắt đầu tạo prompt</span>
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Output Section - Tactical Data Feed */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-7"
          >
            <div className="h-[800px] border border-war-border bg-war-card/40 relative overflow-hidden rounded-3xl">
              <div className="absolute top-0 left-0 w-full h-16 bg-black/[0.02] border-b border-war-border flex items-center px-8 justify-between">
                <div className="flex items-center gap-4">
                  <Terminal className="w-5 h-5 text-war-red" />
                  <span className="font-roboto text-[14px] font-black uppercase tracking-[0.2em] text-war-red">Bản tin nhiệm vụ</span>
                </div>
                <div className="flex items-center gap-4">
                  {/* Buttons moved to bottom of list */}
                </div>
              </div>

              <ScrollArea className="h-full pt-16 px-8 pb-8">
                <div className="space-y-8 py-6">
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-40 space-y-6">
                      <div className="relative">
                        <Radar className="w-20 h-20 text-war-red animate-spin duration-[3000ms]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Activity className="w-8 h-8 text-war-red animate-pulse" />
                        </div>
                      </div>
                        <div className="text-center space-y-2">
                          <p className="text-sm font-bold uppercase tracking-[0.3em] text-war-red animate-pulse">Dựng phim điện ảnh...</p>
                          <p className="text-[10px] font-mono opacity-40 uppercase tracking-widest">Đang phân tích {sceneNumber} kịch bản chiến thuật</p>
                        </div>
                    </div>
                  ) : hasGenerated && scenes.length > 0 ? (
                    <>
                      {!isGenerating && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col md:flex-row gap-4 pb-12 pt-6"
                        >
                          <Button 
                            variant="outline" 
                            onClick={downloadAllImagePrompts}
                            className="flex-1 h-16 bg-war-brown/5 border-war-brown/20 hover:bg-war-brown/15 hover:border-war-brown/40 text-war-brown font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95"
                          >
                            <Download className="w-5 h-5" />
                            <span>TẢI TẤT CẢ PROMPT ẢNH</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={downloadAllVideoPrompts}
                            className="flex-1 h-16 bg-war-red/5 border-war-red/20 hover:bg-war-red/15 hover:border-war-red/40 text-war-red font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95"
                          >
                            <Download className="w-5 h-5" />
                            <span>TẢI TẤT CẢ PROMPT VIDEO</span>
                          </Button>
                        </motion.div>
                      )}

                      {scenes.map((scene, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="space-y-4 relative"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-war-red/10 border border-war-red/30 px-3 py-1">
                              <span className="text-xs font-black text-war-red uppercase tracking-wider">Cảnh {idx + 1}</span>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-war-red/30 to-transparent" />
                          </div>
                          
                          <div className="grid grid-cols-1 gap-4">
                            {/* Image Prompt */}
                            <Card className="border-war-border bg-war-card/60 rounded-[2rem] overflow-hidden group relative border-2 hover:border-war-brown/50 transition-all duration-300">
                              <div className="absolute top-0 left-0 w-2 h-full bg-war-brown/20" />
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-6 px-8 bg-black/[0.02] border-b border-war-border">
                                <CardTitle className="text-lg font-black uppercase tracking-[0.2em] text-war-brown">Prompt ảnh</CardTitle>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => copyToClipboard(scene.imagePrompt, `img-${idx}`)}
                                    className="h-12 w-12 hover:bg-war-brown/10 text-war-brown/40 hover:text-war-brown rounded-2xl"
                                    title="Sao chép prompt"
                                  >
                                    {copied === `img-${idx}` ? <Check className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6" />}
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="p-8 text-lg text-foreground/80 font-mono leading-relaxed">
                                {scene.imagePrompt}
                              </CardContent>
                            </Card>

                            {/* Video Prompt & Voice-Over */}
                            <Card className="border-war-border bg-war-card/60 rounded-[2rem] overflow-hidden group relative border-2 hover:border-war-red/50 transition-all duration-300">
                              <div className="absolute top-0 left-0 w-2 h-full bg-war-red/20" />
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-6 px-8 bg-black/[0.02] border-b border-war-border">
                                <CardTitle className="text-lg font-black uppercase tracking-[0.2em] text-war-red">Prompt video</CardTitle>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => copyToClipboard(`${scene.videoPrompt} [Voice: ${scene.voiceOver}]`, `vid-${idx}`)}
                                    className="h-12 w-12 hover:bg-war-red/10 text-war-red/40 hover:text-war-red rounded-2xl"
                                    title="Sao chép prompt"
                                  >
                                    {copied === `vid-${idx}` ? <Check className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6" />}
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="p-8">
                                <div className="text-lg text-foreground/80 font-mono leading-relaxed">
                                  {scene.videoPrompt} <span className="text-war-red font-bold">[Voice: {scene.voiceOver}]</span>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </motion.div>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-40 opacity-30 flex flex-col items-center gap-6">
                      <div className="p-8 rounded-full border border-dashed border-war-red/20 relative">
                        <Radar className="w-16 h-16 text-war-red/20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Target className="w-6 h-6 text-war-red/10" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-bold uppercase tracking-[0.3em]">Đang chờ dữ liệu nhiệm vụ</p>
                        <p className="text-[10px] font-mono uppercase tracking-widest">Thiết lập các thông số và nhấn nút để bắt đầu</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
