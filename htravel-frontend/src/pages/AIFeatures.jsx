import { motion } from 'framer-motion';
import { useState } from 'react';
import { Upload, Sparkles, Download } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import LuxuryButton from '../components/common/LuxuryButton';
import { aiService } from '../services/ai';

export default function AIFeatures() {
  const [landmarkImage, setLandmarkImage] = useState(null);
  const [landmarkResult, setLandmarkResult] = useState(null);
  const [landmarkLoading, setLandmarkLoading] = useState(false);

  const [selfieImage, setSelfieImage] = useState(null);
  const [destination, setDestination] = useState('');
  const [virtualTravelResult, setVirtualTravelResult] = useState(null);
  const [virtualTravelLoading, setVirtualTravelLoading] = useState(false);

  // --- HÀM XỬ LÝ NHẬN DIỆN ĐỊA DANH ---
  const handleLandmarkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLandmarkImage(URL.createObjectURL(file));
    setLandmarkLoading(true);
    setLandmarkResult(null);

    try {
      const result = await aiService.identifyLandmark(file);
      // Fix lỗi lệch data: Lấy result.data nếu có
      const data = result.data || result;
      setLandmarkResult(data);
    } catch (error) {
      console.error('Error identifying landmark:', error);
      alert('Không thể nhận diện địa danh. Vui lòng thử lại.');
    } finally {
      setLandmarkLoading(false);
    }
  };

  const handleVirtualTravel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelfieImage(URL.createObjectURL(file));
    setVirtualTravelResult(null); // Reset kết quả cũ
  };

  // --- HÀM XỬ LÝ TẠO ẢNH DU LỊCH ẢO ---
  const generateVirtualTravel = async () => {
    if (!selfieImage || !destination) {
      alert('Vui lòng upload ảnh và chọn địa danh');
      return;
    }

    setVirtualTravelLoading(true);

    try {
      const response = await fetch(selfieImage);
      const blob = await response.blob();
      const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });

      const result = await aiService.generateVirtualTravel(file, destination);
      console.log("Kết quả trả về:", result); // Debug

      // FIX QUAN TRỌNG: Lấy đúng đường dẫn ảnh từ response backend
      // Backend trả về: { success: true, data: { primaryImage: "/uploads/..." } }
      const data = result.data || result;
      setVirtualTravelResult(data);

    } catch (error) {
      console.error('Error generating virtual travel:', error);
      alert('Không thể tạo ảnh du lịch ảo. Vui lòng thử lại.');
    } finally {
      setVirtualTravelLoading(false);
    }
  };

  // Hàm hỗ trợ hiển thị ảnh full URL
  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path; // Nếu là link online (Unsplash)
    return `http://localhost:3000${path}`; // Nối với port backend
  };

  return (
    <div className="min-h-screen bg-luxury-black pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-playfair text-white mb-4">
            Tính Năng <span className="text-luxury-gold">AI Travel</span>
          </h1>
          <p className="text-luxury-gray-100 font-philosopher text-lg max-w-2xl mx-auto">
            Khám phá công nghệ AI tiên tiến để nâng cao trải nghiệm du lịch
          </p>
        </motion.div>

        {/* --- PHẦN 1: NHẬN DIỆN ĐỊA DANH --- */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-16">
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-luxury-gold" size={24} />
              <h2 className="text-2xl md:text-3xl font-playfair text-white">AI Nhận Diện Địa Danh</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block w-full cursor-pointer border-2 border-dashed border-luxury-gray-400 rounded-lg p-8 hover:border-luxury-gold transition-colors text-center">
                  <Upload className="mx-auto text-luxury-gray-200 mb-4" size={48} />
                  <p className="text-luxury-gray-100">Click chọn ảnh phong cảnh</p>
                  <input type="file" accept="image/*" onChange={handleLandmarkUpload} className="hidden" />
                </label>
                {landmarkImage && <img src={landmarkImage} className="mt-4 w-full h-64 object-cover rounded-lg" alt="Preview" />}
              </div>

              <div>
                {landmarkLoading ? (
                  <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div></div>
                ) : landmarkResult ? (
                  <div className="bg-white/5 p-6 rounded-xl border border-luxury-gold/20 h-full overflow-y-auto">
                    <h3 className="text-2xl text-luxury-gold font-playfair mb-2">{landmarkResult.name || landmarkResult.landmarkName}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{landmarkResult.description}</p>
                    {landmarkResult.interestingFacts && (
                       <div className="mt-4 p-3 bg-luxury-gold/10 rounded border border-luxury-gold/20">
                         <p className="text-xs text-luxury-gold font-bold mb-1">💡 THÔNG TIN THÚ VỊ</p>
                         <p className="text-sm text-gray-300 italic">"{landmarkResult.interestingFacts}"</p>
                       </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 border-2 border-dashed border-white/5 rounded-lg">Kết quả sẽ hiện ở đây</div>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* --- PHẦN 2: DU LỊCH ẢO AI --- */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-luxury-gold" size={24} />
              <h2 className="text-2xl md:text-3xl font-playfair text-white">Du Lịch Ảo AI</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block w-full cursor-pointer border-2 border-dashed border-luxury-gray-400 rounded-lg p-8 hover:border-luxury-gold transition-colors text-center">
                  <Upload className="mx-auto text-luxury-gray-200 mb-4" size={48} />
                  <p className="text-luxury-gray-100">Upload ảnh selfie của bạn</p>
                  <input type="file" accept="image/*" onChange={handleVirtualTravel} className="hidden" />
                </label>
                {selfieImage && <img src={selfieImage} className="w-full h-48 object-cover rounded-lg" alt="Selfie" />}

                <div>
                  <label className="text-sm text-gray-300 mb-2 block">CHỌN ĐỊA DANH</label>
                  <select value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full bg-luxury-darker border border-gray-600 text-white rounded p-3">
                    <option value="">-- Chọn địa điểm --</option>
                    <option value="Hội An">Phố Cổ Hội An</option>
                    <option value="Hạ Long">Vịnh Hạ Long</option>
                    <option value="Đà Nẵng">Cầu Rồng Đà Nẵng</option>
                    <option value="Sapa">Ruộng bậc thang Sapa</option>
                  </select>
                </div>

                <LuxuryButton onClick={generateVirtualTravel} disabled={virtualTravelLoading || !selfieImage || !destination} className="w-full">
                  {virtualTravelLoading ? 'Đang tạo ảnh...' : 'TẠO ẢNH DU LỊCH ẢO'}
                </LuxuryButton>
              </div>

              {/* KHUNG HIỂN THỊ KẾT QUẢ ẢNH */}
              <div>
                {virtualTravelLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mb-4"></div>
                    <p className="text-luxury-gold animate-pulse">AI đang vẽ tranh...</p>
                  </div>
                ) : virtualTravelResult ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative group">
                    {/* HIỂN THỊ ẢNH KẾT QUẢ */}
                    <img 
                      src={getImageUrl(virtualTravelResult.primaryImage)} 
                      alt="Result" 
                      className="w-full h-auto rounded-lg shadow-2xl border border-luxury-gold/50"
                    />
                    
                    {/* Nút tải ảnh */}
                    <a 
                      href={getImageUrl(virtualTravelResult.primaryImage)} 
                      download="my-travel-photo.jpg"
                      target="_blank"
                      rel="noreferrer"
                      className="absolute bottom-4 right-4 bg-luxury-gold text-black px-4 py-2 rounded-full font-bold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download size={16} /> Tải ảnh
                    </a>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-white/5 rounded-lg border border-white/10 min-h-[300px]">
                    <p className="text-gray-500">Ảnh kết quả sẽ hiện ở đây</p>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}