import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, DollarSign, Heart, Sparkles, Save, Loader2 } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import LuxuryButton from '../components/common/LuxuryButton';
import TimelineDisplay from '../components/planner/TimelineDisplay';
import { plannerService } from '../services/planner';
import { BUDGET_OPTIONS, INTEREST_OPTIONS, MESSAGES } from '../utils/constants';

export default function TripPlanner() {
  const [formData, setFormData] = useState({
    destination: '',
    duration: 3,
    budget: 'moderate',
    interests: []
  });

  const [generatedTrip, setGeneratedTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.interests.length === 0) {
      setError('Vui lòng chọn ít nhất một sở thích');
      return;
    }

    setLoading(true);
    setSaved(false);
    setGeneratedTrip(null);

    try {
      const result = await plannerService.generateItinerary(formData);
      setGeneratedTrip(result.data);
    } catch (err) {
      setError(err.response?.data?.message || MESSAGES.ITINERARY_GENERATE_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedTrip) return;

    try {
      await plannerService.saveItinerary(generatedTrip);
      setSaved(true);
      alert(MESSAGES.ITINERARY_SAVE_SUCCESS);
    } catch (err) {
      alert(err.response?.data?.message || MESSAGES.ITINERARY_SAVE_FAILED);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-playfair text-white mb-4">
            Lập <span className="text-luxury-gold">Kế Hoạch Du Lịch</span> AI
          </h1>
          <p className="text-luxury-gray-100 font-philosopher text-lg max-w-2xl mx-auto">
            Để AI tạo lịch trình du lịch hoàn hảo cho chuyến đi của bạn
          </p>
        </motion.div>

        {/* Form */}
        {!generatedTrip && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="max-w-3xl mx-auto">
              <form onSubmit={handleGenerate} className="space-y-6">
                {/* Destination */}
                <div>
                  <label className="flex items-center text-white mb-2 font-philosopher">
                    <MapPin className="w-5 h-5 mr-2 text-luxury-gold" />
                    Điểm đến
                  </label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                    placeholder="Ví dụ: Hà Nội, Đà Nẵng, Nha Trang..."
                    className="w-full px-4 py-3 bg-luxury-black/50 border border-luxury-gold/30 rounded-lg text-white focus:border-luxury-gold focus:outline-none"
                    required
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="flex items-center text-white mb-2 font-philosopher">
                    <Calendar className="w-5 h-5 mr-2 text-luxury-gold" />
                    Số ngày: {formData.duration} ngày
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="14"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-luxury-gray-100 mt-1">
                    <span>1 ngày</span>
                    <span>14 ngày</span>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="flex items-center text-white mb-3 font-philosopher">
                    <DollarSign className="w-5 h-5 mr-2 text-luxury-gold" />
                    Ngân sách
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {BUDGET_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({...formData, budget: option.value})}
                        className={`p-4 border rounded-lg text-left transition ${
                          formData.budget === option.value
                            ? 'border-luxury-gold bg-luxury-gold/10'
                            : 'border-luxury-gold/30 hover:border-luxury-gold/50'
                        }`}
                      >
                        <div className="text-white font-semibold">{option.label}</div>
                        <div className="text-sm text-luxury-gray-100 mt-1">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label className="flex items-center text-white mb-3 font-philosopher">
                    <Heart className="w-5 h-5 mr-2 text-luxury-gold" />
                    Sở thích (chọn ít nhất 1)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {INTEREST_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleInterestToggle(option.value)}
                        className={`p-3 border rounded-lg transition ${
                          formData.interests.includes(option.value)
                            ? 'border-luxury-gold bg-luxury-gold/10'
                            : 'border-luxury-gold/30 hover:border-luxury-gold/50'
                        }`}
                      >
                        <div className="text-2xl mb-1">{option.icon}</div>
                        <div className="text-white text-sm">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <LuxuryButton
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang tạo lịch trình...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Tạo Lịch Trình AI
                    </>
                  )}
                </LuxuryButton>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 max-w-5xl mx-auto"
          >
            {[1, 2, 3].map(i => (
              <GlassCard key={i} className="mb-4 h-48 animate-pulse">
                <div className="h-6 bg-luxury-gold/20 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-luxury-gold/10 rounded w-full mb-2"></div>
                <div className="h-4 bg-luxury-gold/10 rounded w-5/6"></div>
              </GlassCard>
            ))}
          </motion.div>
        )}

        {/* Result */}
        {generatedTrip && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 max-w-5xl mx-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-playfair text-white">
                Lịch trình {formData.duration} ngày tại {formData.destination}
              </h2>
              <div className="flex gap-3">
                <LuxuryButton
                  onClick={() => {
                    setGeneratedTrip(null);
                    setSaved(false);
                  }}
                  variant="outline"
                >
                  Tạo mới
                </LuxuryButton>
                {!saved && (
                  <LuxuryButton
                    onClick={handleSave}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Lưu lịch trình
                  </LuxuryButton>
                )}
              </div>
            </div>

            <TimelineDisplay tripData={generatedTrip.tripData} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
