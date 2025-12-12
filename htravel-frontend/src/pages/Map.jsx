import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { MapPin, Calendar, Plus, Check } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import LuxuryButton from '../components/common/LuxuryButton';
import api from '../services/api';

export default function Map() {
  const [visitedProvinces, setVisitedProvinces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const vietnamProvinces = [
    // Northern Vietnam
    { id: 1, name: 'Hà Nội', region: 'Bắc' },
    { id: 2, name: 'Hải Phòng', region: 'Bắc' },
    { id: 3, name: 'Quảng Ninh', region: 'Bắc' },
    { id: 4, name: 'Lào Cai', region: 'Bắc' },
    { id: 5, name: 'Ninh Bình', region: 'Bắc' },
    { id: 6, name: 'Hạ Long', region: 'Bắc' },

    // Central Vietnam
    { id: 7, name: 'Huế', region: 'Trung' },
    { id: 8, name: 'Đà Nẵng', region: 'Trung' },
    { id: 9, name: 'Hội An', region: 'Trung' },
    { id: 10, name: 'Nha Trang', region: 'Trung' },
    { id: 11, name: 'Đà Lạt', region: 'Trung' },
    { id: 12, name: 'Quy Nhơn', region: 'Trung' },

    // Southern Vietnam
    { id: 13, name: 'TP. Hồ Chí Minh', region: 'Nam' },
    { id: 14, name: 'Vũng Tàu', region: 'Nam' },
    { id: 15, name: 'Phú Quốc', region: 'Nam' },
    { id: 16, name: 'Cần Thơ', region: 'Nam' },
    { id: 17, name: 'Mũi Né', region: 'Nam' },
    { id: 18, name: 'Côn Đảo', region: 'Nam' }
  ];

  useEffect(() => {
    fetchMapHistory();
  }, []);

  const fetchMapHistory = async () => {
    try {
      const response = await api.get('/user/map-history');
      const historyData = response.data.data || [];
      setVisitedProvinces(Array.isArray(historyData) ? historyData : []);
    } catch (err) {
      console.error('Error fetching map history:', err);
      setError('Không thể tải lịch sử ghé thăm');
      setVisitedProvinces([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedProvince) {
      setError('Vui lòng chọn tỉnh/thành phố');
      return;
    }

    setCheckInLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/user/check-in', {
        provinceName: selectedProvince
      });

      setSuccess('Check-in thành công!');
      setShowCheckInModal(false);
      setSelectedProvince('');
      fetchMapHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in thất bại');
    } finally {
      setCheckInLoading(false);
    }
  };

  const isVisited = (provinceName) => {
    return Array.isArray(visitedProvinces) && visitedProvinces.some(v => v.provinceName === provinceName);
  };

  const getVisitDate = (provinceName) => {
    if (!Array.isArray(visitedProvinces)) return null;
    const visit = visitedProvinces.find(v => v.provinceName === provinceName);
    return visit ? new Date(visit.visitedAt).toLocaleDateString('vi-VN') : null;
  };

  const groupedByRegion = vietnamProvinces.reduce((acc, province) => {
    if (!acc[province.region]) acc[province.region] = [];
    acc[province.region].push(province);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-luxury-gold mx-auto mb-4"></div>
          <p className="text-luxury-gray-100 font-philosopher">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-playfair text-white mb-4">
            Bản Đồ <span className="text-luxury-gold">Hành Trình</span>
          </h1>
          <p className="text-luxury-gray-100 font-philosopher text-lg">
            Ghi lại những điểm đến bạn đã khám phá trên khắp Việt Nam
          </p>
        </motion.div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 max-w-2xl mx-auto"
          >
            <p className="text-red-300 font-philosopher text-center">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6 max-w-2xl mx-auto"
          >
            <p className="text-green-300 font-philosopher text-center">{success}</p>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <GlassCard className="p-6 text-center">
            <div className="text-4xl font-playfair text-luxury-gold mb-2">
              {visitedProvinces.length}
            </div>
            <p className="text-luxury-gray-100 font-philosopher">
              Tỉnh/Thành đã ghé
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="text-4xl font-playfair text-luxury-gold mb-2">
              {vietnamProvinces.length}
            </div>
            <p className="text-luxury-gray-100 font-philosopher">
              Tổng điểm đến
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="text-4xl font-playfair text-luxury-gold mb-2">
              {Math.round((visitedProvinces.length / vietnamProvinces.length) * 100)}%
            </div>
            <p className="text-luxury-gray-100 font-philosopher">
              Tiến độ khám phá
            </p>
          </GlassCard>
        </motion.div>

        {/* Check-in Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mb-12"
        >
          <LuxuryButton
            variant="primary"
            size="lg"
            onClick={() => setShowCheckInModal(true)}
          >
            <Plus size={20} className="mr-2" />
            Check-in Địa Điểm Mới
          </LuxuryButton>
        </motion.div>

        {/* Province List by Region */}
        <div className="space-y-12">
          {Object.entries(groupedByRegion).map(([region, provinces], index) => (
            <motion.div
              key={region}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <h2 className="text-3xl font-playfair text-white mb-6">
                Miền <span className="text-luxury-gold">{region}</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {provinces.map((province) => {
                  const visited = isVisited(province.name);
                  const visitDate = getVisitDate(province.name);

                  return (
                    <motion.div
                      key={province.id}
                      whileHover={{ y: -8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <GlassCard
                        className={`p-6 ${visited ? 'border-luxury-gold border-2' : ''}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              visited ? 'bg-luxury-gold/20' : 'bg-luxury-darker'
                            }`}>
                              <MapPin
                                className={visited ? 'text-luxury-gold' : 'text-luxury-gray-200'}
                                size={24}
                              />
                            </div>
                            <div>
                              <h3 className="text-xl font-playfair text-white">
                                {province.name}
                              </h3>
                              <p className="text-luxury-gray-200 text-sm font-philosopher">
                                {province.region === 'Bắc' && 'Miền Bắc'}
                                {province.region === 'Trung' && 'Miền Trung'}
                                {province.region === 'Nam' && 'Miền Nam'}
                              </p>
                            </div>
                          </div>

                          {visited && (
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-luxury-gold">
                              <Check className="text-luxury-black" size={16} />
                            </div>
                          )}
                        </div>

                        {visited && visitDate && (
                          <div className="flex items-center gap-2 text-luxury-gray-100 text-sm font-philosopher">
                            <Calendar size={14} />
                            <span>Ghé thăm: {visitDate}</span>
                          </div>
                        )}

                        {!visited && (
                          <p className="text-luxury-gray-200 text-sm font-philosopher italic">
                            Chưa khám phá
                          </p>
                        )}
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Check-in Modal */}
      {showCheckInModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowCheckInModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <GlassCard className="p-8">
              <h2 className="text-2xl font-playfair text-white mb-6">
                Check-in Địa Điểm
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-luxury-gray-100 text-sm font-philosopher uppercase tracking-wider mb-3">
                    Chọn tỉnh/thành phố
                  </label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="w-full bg-luxury-darker border border-luxury-gray-400 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-luxury-gold transition-colors font-philosopher"
                  >
                    <option value="">-- Chọn địa điểm --</option>
                    {vietnamProvinces.map((province) => (
                      <option key={province.id} value={province.name}>
                        {province.name} ({province.region === 'Bắc' ? 'Miền Bắc' : province.region === 'Trung' ? 'Miền Trung' : 'Miền Nam'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <LuxuryButton
                    variant="primary"
                    onClick={handleCheckIn}
                    disabled={checkInLoading || !selectedProvince}
                    className="flex-1"
                  >
                    {checkInLoading ? 'Đang xử lý...' : 'Check-in'}
                  </LuxuryButton>
                  <LuxuryButton
                    variant="tertiary"
                    onClick={() => {
                      setShowCheckInModal(false);
                      setSelectedProvince('');
                    }}
                    disabled={checkInLoading}
                  >
                    Hủy
                  </LuxuryButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
