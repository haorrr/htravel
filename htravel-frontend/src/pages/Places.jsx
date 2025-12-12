import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
// NEW: Thêm icon Compass hoặc Eye
import { Search, MapPin, Star, Phone, Globe, Clock, X, Navigation, Compass } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import LuxuryButton from '../components/common/LuxuryButton';
import api from '../services/api';

export default function Places() {
  // ... (giữ nguyên các state cũ)
  const [searchQuery, setSearchQuery] = useState('');
  const [placeType, setPlaceType] = useState('');
  const [places, setPlaces] = useState([]);
  const [placeTypes, setPlaceTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // NEW: State cho Modal 360
  const [show360Modal, setShow360Modal] = useState(false);
  const [selected360Location, setSelected360Location] = useState(null);

  useEffect(() => {
    fetchPlaceTypes();
  }, []);

  // ... (giữ nguyên fetchPlaceTypes và handleSearch)
  const fetchPlaceTypes = async () => {
      // code cũ...
      try {
        const response = await api.get('/places/types');
        const typesData = response.data.data || [];
        setPlaceTypes(Array.isArray(typesData) ? typesData : []);
      } catch (err) {
        console.error('Error fetching place types:', err);
        setPlaceTypes([]);
      }
  };

  const handleSearch = async () => {
    // code cũ...
    if (!searchQuery.trim()) {
        setError('Vui lòng nhập từ khóa tìm kiếm');
        return;
      }
  
      setIsLoading(true);
      setError('');
  
      try {
        const params = {
          query: searchQuery,
          type: placeType || undefined
        };
  
        const response = await api.get('/places/search', { params });
        
        const responseData = response.data.data;
        const placesData = responseData && responseData.results ? responseData.results : [];
        
        setPlaces(Array.isArray(placesData) ? placesData : []);
  
        if (placesData.length === 0) {
          setError('Không tìm thấy địa điểm nào');
        }
      } catch (err) {
        console.error('Error searching places:', err);
        setError('Không thể tìm kiếm địa điểm. Vui lòng thử lại.');
        setPlaces([]);
      } finally {
        setIsLoading(false);
      }
  };

  const handlePlaceClick = async (place) => {
    // code cũ...
    try {
        const response = await api.get(`/places/details/${place.placeId}`);
        setSelectedPlace(response.data.data);
        setShowDetailModal(true);
      } catch (err) {
        console.error('Error fetching place details:', err);
        alert('Không thể tải thông tin chi tiết');
      }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // NEW: Hàm xử lý khi click nút 360
  const handleView360 = (e, place) => {
    e.stopPropagation(); // Ngăn chặn việc click xuyên qua để mở modal chi tiết
    
    if (place.location) {
      setSelected360Location({
        lat: place.location.lat,
        lng: place.location.lng,
        name: place.name
      });
      setShow360Modal(true);
    } else {
      alert('Địa điểm này chưa có dữ liệu tọa độ 360°');
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header & Search Section (Giữ nguyên) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-playfair text-white mb-4">
            Khám Phá <span className="text-luxury-gold">Địa Điểm</span>
          </h1>
          <p className="text-luxury-gray-100 font-philosopher text-lg max-w-2xl mx-auto">
            Tìm kiếm nhà hàng, khách sạn, điểm tham quan và nhiều hơn nữa trên khắp Việt Nam
          </p>
        </motion.div>

        {/* Search Input Section (Giữ nguyên code search input) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gray-200" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tìm kiếm nhà hàng, khách sạn, điểm tham quan..."
                  className="w-full bg-luxury-darker border border-luxury-gray-400 text-white rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-luxury-gold transition-colors font-philosopher"
                />
              </div>

              <select
                value={placeType}
                onChange={(e) => setPlaceType(e.target.value)}
                className="bg-luxury-darker border border-luxury-gray-400 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-luxury-gold transition-colors font-philosopher min-w-[200px]"
              >
                <option value="">Tất cả loại hình</option>
                {Array.isArray(placeTypes) && placeTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              <LuxuryButton
                variant="primary"
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? 'Đang tìm...' : 'Tìm kiếm'}
              </LuxuryButton>
            </div>
          </GlassCard>
        </motion.div>

        {/* Error & Loading (Giữ nguyên) */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8">
            <p className="text-red-300 font-philosopher text-center">{error}</p>
          </motion.div>
        )}
        {isLoading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-luxury-gold mx-auto mb-4"></div>
            <p className="text-luxury-gray-100 font-philosopher">Đang tìm kiếm...</p>
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && places.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place, index) => (
              <motion.div
                key={place.placeId}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -8 }}
              >
                <GlassCard
                  className="h-full cursor-pointer hover:border-luxury-gold transition-colors group relative" // Thêm relative để định vị nút 360
                  onClick={() => handlePlaceClick(place)}
                >
                  {/* Image Area */}
                  {place.photos && place.photos[0] && (
                    <div className="relative h-48 overflow-hidden rounded-t-xl">
                      <motion.img
                        src={place.photos[0].url}
                        alt={place.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.7 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/80 to-transparent" />
                      
                      {/* NEW: Nút 360 nằm góc trên phải ảnh */}
                      <button
                        onClick={(e) => handleView360(e, place)}
                        className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-md text-white p-2 rounded-full border border-luxury-gold/50 hover:bg-luxury-gold hover:text-black transition-all duration-300 flex items-center gap-2 group-hover:scale-110 shadow-lg"
                        title="Xem chế độ 360°"
                      >
                        <Compass size={20} className="animate-pulse-slow" />
                        <span className="text-xs font-bold font-philosopher hidden group-hover:block whitespace-nowrap pr-1">
                          Xem 360°
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Content (Giữ nguyên) */}
                  <div className="p-6">
                    <h3 className="text-xl font-playfair text-white mb-2 line-clamp-2">
                      {place.name}
                    </h3>
                    {/* ... (Rating, Address, etc. giữ nguyên) ... */}
                     {place.rating && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="text-luxury-gold fill-luxury-gold" size={16} />
                          <span className="text-luxury-gold font-philosopher font-bold">
                            {place.rating}
                          </span>
                        </div>
                        {place.ratingsCount && (
                          <span className="text-luxury-gray-200 text-sm font-philosopher">
                            ({place.ratingsCount} đánh giá)
                          </span>
                        )}
                      </div>
                    )}
                     {place.address && (
                      <div className="flex items-start gap-2 text-luxury-gray-100 text-sm font-philosopher mb-3">
                        <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{place.address}</span>
                      </div>
                    )}
                    {place.openNow !== undefined && place.openNow !== null && (
                      <div className="flex items-center gap-2 text-sm font-philosopher">
                        <Clock size={14} />
                        <span className={place.openNow ? 'text-green-400' : 'text-red-400'}>
                          {place.openNow ? 'Đang mở cửa' : 'Đã đóng cửa'}
                        </span>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State (Giữ nguyên) */}
        {!isLoading && places.length === 0 && !error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <MapPin size={64} className="mx-auto text-luxury-gray-300 mb-4" />
                <p className="text-luxury-gray-100 font-philosopher text-lg">Nhập từ khóa để bắt đầu tìm kiếm</p>
            </motion.div>
        )}
      </div>

      {/* Detail Modal (Giữ nguyên code cũ) */}
      {showDetailModal && selectedPlace && (
           // ... (Code modal chi tiết của bạn giữ nguyên)
           <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/80 backdrop-blur-sm overflow-y-auto py-12"
           onClick={() => setShowDetailModal(false)}
         >
           <motion.div
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             onClick={(e) => e.stopPropagation()}
             className="w-full max-w-4xl my-auto"
           >
             <GlassCard className="relative">
               {/* Close Button */}
               <button
                 onClick={() => setShowDetailModal(false)}
                 className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-luxury-black/80 flex items-center justify-center hover:bg-luxury-gold hover:text-luxury-black transition-colors"
               >
                 <X size={20} />
               </button>
 
               {/* Images */}
               {selectedPlace.photos && selectedPlace.photos.length > 0 && (
                 <div className="relative h-72 overflow-hidden rounded-t-xl">
                   <img
                     src={selectedPlace.photos[0].url}
                     alt={selectedPlace.name}
                     className="w-full h-full object-cover"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/90 via-luxury-black/50 to-transparent" />
                 </div>
               )}
 
               {/* Content */}
               <div className="p-8">
                 <h2 className="text-3xl md:text-4xl font-playfair text-white mb-4">
                   {selectedPlace.name}
                 </h2>
 
                 {/* Rating */}
                 {selectedPlace.rating && (
                   <div className="flex items-center gap-3 mb-6">
                     <div className="flex items-center gap-2">
                       <Star className="text-luxury-gold fill-luxury-gold" size={20} />
                       <span className="text-2xl text-luxury-gold font-playfair font-bold">
                         {selectedPlace.rating}
                       </span>
                     </div>
                     {/* FIX: user_ratings_total -> ratingsCount */}
                     {selectedPlace.ratingsCount && (
                       <span className="text-luxury-gray-100 font-philosopher">
                         {selectedPlace.ratingsCount} đánh giá
                       </span>
                     )}
                   </div>
                 )}
 
                 {/* Info Grid */}
                 <div className="grid md:grid-cols-2 gap-6 mb-8">
                   {/* Address */}
                   {/* FIX: formatted_address -> address */}
                   {selectedPlace.address && (
                     <div>
                       <h3 className="text-luxury-gray-200 text-sm font-philosopher uppercase tracking-wider mb-2 flex items-center gap-2">
                         <MapPin size={14} />
                         Địa chỉ
                       </h3>
                       <p className="text-white font-philosopher">
                         {selectedPlace.address}
                       </p>
                     </div>
                   )}
 
                   {/* Phone */}
                   {/* FIX: formatted_phone_number -> phoneNumber */}
                   {selectedPlace.phoneNumber && (
                     <div>
                       <h3 className="text-luxury-gray-200 text-sm font-philosopher uppercase tracking-wider mb-2 flex items-center gap-2">
                         <Phone size={14} />
                         Điện thoại
                       </h3>
                       <a
                         href={`tel:${selectedPlace.phoneNumber}`}
                         className="text-luxury-gold hover:text-luxury-gold-light font-philosopher"
                       >
                         {selectedPlace.phoneNumber}
                       </a>
                     </div>
                   )}
 
                   {/* Website */}
                   {selectedPlace.website && (
                     <div>
                       <h3 className="text-luxury-gray-200 text-sm font-philosopher uppercase tracking-wider mb-2 flex items-center gap-2">
                         <Globe size={14} />
                         Website
                       </h3>
                       <a
                         href={selectedPlace.website}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-luxury-gold hover:text-luxury-gold-light font-philosopher break-all"
                       >
                         {selectedPlace.website}
                       </a>
                     </div>
                   )}
 
                   {/* Opening Hours */}
                   {/* FIX: structure openingHours { openNow, weekdayText } */}
                   {selectedPlace.openingHours && (
                     <div>
                       <h3 className="text-luxury-gray-200 text-sm font-philosopher uppercase tracking-wider mb-2 flex items-center gap-2">
                         <Clock size={14} />
                         Giờ mở cửa
                       </h3>
                       <p className={`font-philosopher mb-2 ${selectedPlace.openingHours.openNow ? 'text-green-400' : 'text-red-400'}`}>
                         {selectedPlace.openingHours.openNow ? 'Đang mở cửa' : 'Đã đóng cửa'}
                       </p>
                       {selectedPlace.openingHours.weekdayText && (
                         <ul className="space-y-1">
                           {selectedPlace.openingHours.weekdayText.map((text, index) => (
                             <li key={index} className="text-luxury-gray-100 font-philosopher text-sm">
                               {text}
                             </li>
                           ))}
                         </ul>
                       )}
                     </div>
                   )}
                 </div>
 
                 {/* Reviews */}
                 {selectedPlace.reviews && selectedPlace.reviews.length > 0 && (
                   <div className="mb-6">
                     <h3 className="text-2xl font-playfair text-white mb-4">
                       Đánh giá
                     </h3>
                     <div className="space-y-4">
                       {selectedPlace.reviews.slice(0, 3).map((review, index) => (
                         <div key={index} className="bg-luxury-darker rounded-lg p-4">
                           <div className="flex items-center justify-between mb-2">
                             {/* FIX: author_name -> authorName */}
                             <p className="text-white font-philosopher font-bold">
                               {review.authorName}
                             </p>
                             <div className="flex items-center gap-1">
                               <Star className="text-luxury-gold fill-luxury-gold" size={14} />
                               <span className="text-luxury-gold font-philosopher">
                                 {review.rating}
                               </span>
                             </div>
                           </div>
                           <p className="text-luxury-gray-100 font-philosopher text-sm">
                             {review.text}
                           </p>
                           {/* FIX: relative_time_description -> relativeTime */}
                           <p className="text-luxury-gray-200 text-xs font-philosopher mt-2">
                             {review.relativeTime}
                           </p>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
 
                 {/* Actions */}
                 <div className="flex gap-4">
                   {/* Note: Backend BE không trả về URL Google Maps trong formatPlaceDetails, 
                       nên check website hoặc ẩn đi nếu không có */}
                   {selectedPlace.website && (
                     <LuxuryButton
                       variant="primary"
                       onClick={() => window.open(selectedPlace.website, '_blank')}
                       className="flex-1"
                     >
                       <Navigation size={20} className="mr-2" />
                       Truy cập Website
                     </LuxuryButton>
                   )}
                   <LuxuryButton
                     variant="secondary"
                     onClick={() => setShowDetailModal(false)}
                     className={!selectedPlace.website ? "w-full" : ""}
                   >
                     Đóng
                   </LuxuryButton>
                 </div>
               </div>
             </GlassCard>
           </motion.div>
         </motion.div>
      )}

      {/* NEW: 360 View Modal */}
      {show360Modal && selected360Location && (
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
            {/* Header Modal */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start pointer-events-none">
              <h3 className="text-white font-playfair text-xl drop-shadow-md">
                360° View: <span className="text-luxury-gold">{selected360Location.name}</span>
              </h3>
              <button
                onClick={() => setShow360Modal(false)}
                className="pointer-events-auto bg-black/50 hover:bg-red-500 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
              >
                <X size={24} />
              </button>
            </div>

            {/* Google Street View Embed Iframe */}
            <iframe
              width="100%"
              height="100%"
              className="border-0 w-full h-full"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/streetview?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&location=${selected360Location.lat},${selected360Location.lng}&heading=0&pitch=0&fov=90`}
            ></iframe>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}