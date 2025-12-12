import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Trash2, X } from 'lucide-react';
// 1. IMPORT api để gọi search
import api from '../services/api';
import LuxuryButton from '../components/common/LuxuryButton';
import TimelineDisplay from '../components/planner/TimelineDisplay';
import { plannerService } from '../services/planner';
import { MESSAGES } from '../utils/constants';

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // State cho Modal 360
  const [show360Modal, setShow360Modal] = useState(false);
  const [viewQuery, setViewQuery] = useState('');
  // 2. THÊM State lưu tọa độ và trạng thái đang tìm tọa độ
  const [viewLocation, setViewLocation] = useState(null); 
  const [isLoading360, setIsLoading360] = useState(false);

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const result = await plannerService.getTripById(id);
      setTrip(result.data);
    } catch (error) {
      console.error('Error fetching trip:', error);
      alert(error.response?.data?.message || 'Không thể tải lịch trình');
      navigate('/my-trips');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa lịch trình này?')) return;
    setDeleting(true);
    try {
      await plannerService.deleteTrip(id);
      alert(MESSAGES.ITINERARY_DELETE_SUCCESS);
      navigate('/my-trips');
    } catch (error) {
      alert(error.response?.data?.message || MESSAGES.ITINERARY_DELETE_FAILED);
      setDeleting(false);
    }
  };

  // 3. NÂNG CẤP hàm xử lý: Tìm tọa độ từ tên địa điểm trước khi hiện Modal
  const handleView360 = async (locationName) => {
    const query = `${locationName}, ${trip.destination}`;
    setViewQuery(query);
    setIsLoading360(true);
    setShow360Modal(true); // Hiện modal ngay để hiện loading
    setViewLocation(null); // Reset tọa độ cũ

    try {
      // Gọi API search địa điểm của chính bạn để lấy lat/lng
      const response = await api.get('/places/search', {
        params: { query: query }
      });
      
      const results = response.data.data?.results;
      if (results && results.length > 0) {
        // Lấy tọa độ của kết quả đầu tiên
        const location = results[0].location;
        setViewLocation(location);
      } else {
        // Không tìm thấy tọa độ -> Sẽ fallback về chế độ Map thường
        setViewLocation(null);
      }
    } catch (error) {
      console.error("Failed to find location coordinates", error);
    } finally {
      setIsLoading360(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black pt-24 pb-12 px-6 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-luxury-gold" />
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="min-h-screen bg-luxury-black pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* ... (Phần Header giữ nguyên) ... */}
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => navigate('/my-trips')} className="flex items-center text-luxury-gold hover:text-white transition">
              <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại danh sách
            </button>
            <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-2 px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500/10 transition disabled:opacity-50">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {deleting ? 'Đang xóa...' : 'Xóa lịch trình'}
            </button>
          </div>

          <h1 className="text-4xl md:text-5xl font-playfair text-white mb-2">
            Lịch trình {trip.duration} ngày tại <span className="text-luxury-gold">{trip.destination}</span>
          </h1>
          <p className="text-luxury-gray-100 font-philosopher">
            Tạo ngày {new Date(trip.createdAt).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        <TimelineDisplay tripData={trip.tripData} onView360={handleView360} />
      </div>

      {/* Modal hiển thị Google Maps Embed */}
      {show360Modal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/90 backdrop-blur-md"
          onClick={() => setShow360Modal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-6xl aspect-video relative bg-luxury-black rounded-2xl overflow-hidden border border-luxury-gold/30 shadow-2xl"
          >
            <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start pointer-events-none">
              <h3 className="text-white font-playfair text-xl drop-shadow-md truncate pr-8">
                Khám phá: <span className="text-luxury-gold">{viewQuery}</span>
              </h3>
              <button
                onClick={() => setShow360Modal(false)}
                className="pointer-events-auto bg-black/50 hover:bg-red-500 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
              >
                <X size={24} />
              </button>
            </div>

            {/* 4. LOGIC HIỂN THỊ IFRAME THÔNG MINH */}
            {isLoading360 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-luxury-gold">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="font-philosopher">Đang tìm dữ liệu 360°...</p>
              </div>
            ) : viewLocation ? (
              // TRƯỜNG HỢP 1: Có tọa độ -> Hiện Street View 360
              <iframe
                width="100%"
                height="100%"
                className="border-0 w-full h-full"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/streetview?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&location=${viewLocation.lat},${viewLocation.lng}&heading=0&pitch=0&fov=90`}
              ></iframe>
            ) : (
              // TRƯỜNG HỢP 2: Không tìm được tọa độ -> Fallback về Map thường (mode=place)
              <iframe
                width="100%"
                height="100%"
                className="border-0 w-full h-full"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(viewQuery)}`}
              ></iframe>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}