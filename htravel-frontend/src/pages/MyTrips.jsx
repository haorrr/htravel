import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, Trash2, Eye, Loader2 } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import LuxuryButton from '../components/common/LuxuryButton';
import { plannerService } from '../services/planner';
import { MESSAGES, BUDGET_OPTIONS } from '../utils/constants';

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const result = await plannerService.getMyTrips();
      setTrips(result.data.trips);
    } catch (error) {
      console.error('Error fetching trips:', error);
      alert(error.response?.data?.message || 'Không thể tải danh sách chuyến đi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lịch trình này?')) return;

    setDeleting(id);
    try {
      await plannerService.deleteTrip(id);
      setTrips(trips.filter(trip => trip.id !== id));
      alert(MESSAGES.ITINERARY_DELETE_SUCCESS);
    } catch (error) {
      alert(error.response?.data?.message || MESSAGES.ITINERARY_DELETE_FAILED);
    } finally {
      setDeleting(null);
    }
  };

  const getBudgetLabel = (budget) => {
    const option = BUDGET_OPTIONS.find(opt => opt.value === budget);
    return option ? option.label : budget;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black pt-24 pb-12 px-6 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-luxury-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-playfair text-white mb-2">
                Lịch Trình <span className="text-luxury-gold">Của Tôi</span>
              </h1>
              <p className="text-luxury-gray-100 font-philosopher">
                Tất cả các lịch trình du lịch đã lưu
              </p>
            </div>
            <LuxuryButton onClick={() => navigate('/trip-planner')}>
              + Tạo lịch trình mới
            </LuxuryButton>
          </div>
        </motion.div>

        {trips.length === 0 ? (
          <GlassCard className="text-center py-12">
            <p className="text-luxury-gray-100 mb-6">
              Bạn chưa có lịch trình nào được lưu
            </p>
            <LuxuryButton onClick={() => navigate('/trip-planner')}>
              Tạo lịch trình đầu tiên
            </LuxuryButton>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="hover:border-luxury-gold/50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-playfair text-white mb-2">
                        {trip.destination}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-luxury-gray-100">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {trip.duration} ngày
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {getBudgetLabel(trip.budget)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {trip.interests.map(interest => (
                      <span
                        key={interest}
                        className="px-2 py-1 bg-luxury-gold/20 text-luxury-gold text-xs rounded"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>

                  <div className="text-sm text-luxury-gray-100 mb-4">
                    Tạo ngày: {new Date(trip.createdAt).toLocaleDateString('vi-VN')}
                  </div>

                  <div className="flex gap-2">
                    <LuxuryButton
                      variant="outline"
                      onClick={() => navigate(`/trip-detail/${trip.id}`)}
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Xem chi tiết
                    </LuxuryButton>
                    <button
                      onClick={() => handleDelete(trip.id)}
                      disabled={deleting === trip.id}
                      className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition disabled:opacity-50"
                    >
                      {deleting === trip.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
