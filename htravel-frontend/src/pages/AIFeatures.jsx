import { motion } from 'framer-motion';
import { useState } from 'react';
import { Upload, Sparkles } from 'lucide-react';
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

  const handleLandmarkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLandmarkImage(URL.createObjectURL(file));
    setLandmarkLoading(true);

    try {
      const result = await aiService.identifyLandmark(file);
      setLandmarkResult(result);
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
  };

  const generateVirtualTravel = async () => {
    if (!selfieImage || !destination) {
      alert('Vui lòng upload ảnh và chọn địa danh');
      return;
    }

    setVirtualTravelLoading(true);

    try {
      // Convert blob URL back to file
      const response = await fetch(selfieImage);
      const blob = await response.blob();
      const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });

      const result = await aiService.generateVirtualTravel(file, destination);
      setVirtualTravelResult(result);
    } catch (error) {
      console.error('Error generating virtual travel:', error);
      alert('Không thể tạo ảnh du lịch ảo. Vui lòng thử lại.');
    } finally {
      setVirtualTravelLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-playfair text-white mb-4">
            Tính Năng <span className="text-luxury-gold">AI Travel</span>
          </h1>
          <p className="text-luxury-gray-100 font-philosopher text-lg max-w-2xl mx-auto">
            Khám phá công nghệ AI tiên tiến để nâng cao trải nghiệm du lịch của bạn
          </p>
        </motion.div>

        {/* Landmark Recognition */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-luxury-gold/20 flex items-center justify-center">
                <Sparkles className="text-luxury-gold" size={24} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-playfair text-white">
                  AI Nhận Diện Địa Danh
                </h2>
                <p className="text-luxury-gray-100 font-philosopher text-sm">
                  Upload ảnh để AI nhận diện địa danh Việt Nam
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Upload Section */}
              <div>
                <label className="block w-full cursor-pointer">
                  <div className="border-2 border-dashed border-luxury-gray-400 rounded-lg p-8 hover:border-luxury-gold transition-colors text-center">
                    <Upload className="mx-auto text-luxury-gray-200 mb-4" size={48} />
                    <p className="text-luxury-gray-100 font-philosopher">
                      Click để chọn ảnh hoặc kéo thả vào đây
                    </p>
                    <p className="text-luxury-gray-200 text-sm mt-2">PNG, JPG (tối đa 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLandmarkUpload}
                    className="hidden"
                  />
                </label>

                {landmarkImage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4"
                  >
                    <img
                      src={landmarkImage}
                      alt="Uploaded"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </motion.div>
                )}
              </div>

              {/* Result Section */}
              <div>
                {landmarkLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto mb-4"></div>
                      <p className="text-luxury-gray-100 font-philosopher">Đang phân tích...</p>
                    </div>
                  </div>
                ) : landmarkResult ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-luxury-darker rounded-lg p-6"
                  >
                    <h3 className="text-xl font-playfair text-luxury-gold mb-4">Kết quả nhận diện</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-luxury-gray-200 text-sm font-philosopher">Địa danh:</span>
                        <p className="text-white font-playfair text-lg">{landmarkResult.landmarkName}</p>
                      </div>
                      {landmarkResult.description && (
                        <div>
                          <span className="text-luxury-gray-200 text-sm font-philosopher">Mô tả:</span>
                          <p className="text-luxury-gray-100 font-philosopher">{landmarkResult.description}</p>
                        </div>
                      )}
                      {landmarkResult.confidence && (
                        <div>
                          <span className="text-luxury-gray-200 text-sm font-philosopher">Độ tin cậy:</span>
                          <p className="text-luxury-gold font-philosopher">{(landmarkResult.confidence * 100).toFixed(1)}%</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-luxury-gray-200 font-philosopher text-center">
                      Kết quả sẽ hiển thị ở đây
                    </p>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Virtual Travel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-luxury-navy/50 flex items-center justify-center">
                <Sparkles className="text-luxury-gold" size={24} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-playfair text-white">
                  Du Lịch Ảo AI
                </h2>
                <p className="text-luxury-gray-100 font-philosopher text-sm">
                  Tạo ảnh du lịch ảo với công nghệ AI
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Upload & Settings */}
              <div className="space-y-4">
                <label className="block w-full cursor-pointer">
                  <div className="border-2 border-dashed border-luxury-gray-400 rounded-lg p-8 hover:border-luxury-gold transition-colors text-center">
                    <Upload className="mx-auto text-luxury-gray-200 mb-4" size={48} />
                    <p className="text-luxury-gray-100 font-philosopher">
                      Upload ảnh selfie của bạn
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleVirtualTravel}
                    className="hidden"
                  />
                </label>

                {selfieImage && (
                  <img
                    src={selfieImage}
                    alt="Selfie"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}

                <div>
                  <label className="block text-luxury-gray-100 text-sm font-philosopher uppercase tracking-wider mb-2">
                    Chọn địa danh
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-luxury-darker border border-luxury-gray-400 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-luxury-gold transition-colors"
                  >
                    <option value="">-- Chọn địa danh --</option>
                    <option value="halong_bay">Vịnh Hạ Long</option>
                    <option value="hoian">Phố Cổ Hội An</option>
                    <option value="sapa">Sapa</option>
                    <option value="danang">Đà Nẵng</option>
                    <option value="phuquoc">Phú Quốc</option>
                  </select>
                </div>

                <LuxuryButton
                  onClick={generateVirtualTravel}
                  disabled={virtualTravelLoading || !selfieImage || !destination}
                  className="w-full"
                >
                  {virtualTravelLoading ? 'Đang tạo ảnh...' : 'Tạo Ảnh Du Lịch Ảo'}
                </LuxuryButton>
              </div>

              {/* Result */}
              <div>
                {virtualTravelLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto mb-4"></div>
                      <p className="text-luxury-gray-100 font-philosopher">Đang tạo ảnh...</p>
                    </div>
                  </div>
                ) : virtualTravelResult ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <img
                      src={virtualTravelResult.imageUrl}
                      alt="Virtual Travel Result"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-luxury-darker rounded-lg">
                    <p className="text-luxury-gray-200 font-philosopher text-center">
                      Ảnh du lịch ảo sẽ hiển thị ở đây
                    </p>
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
