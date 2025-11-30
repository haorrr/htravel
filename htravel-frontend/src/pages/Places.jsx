import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Search, MapPin, Star, Phone, Globe, Clock, X, Navigation } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import LuxuryButton from '../components/common/LuxuryButton';
import api from '../services/api';

export default function Places() {
  const [searchQuery, setSearchQuery] = useState('');
  const [placeType, setPlaceType] = useState('');
  const [places, setPlaces] = useState([]);
  const [placeTypes, setPlaceTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchPlaceTypes();
  }, []);

  const fetchPlaceTypes = async () => {
    try {
      const response = await api.get('/api/places/types');
      setPlaceTypes(response.data.data || []);
    } catch (err) {
      console.error('Error fetching place types:', err);
    }
  };

  const handleSearch = async () => {
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

      const response = await api.get('/api/places/search', { params });
      setPlaces(response.data.data || []);

      if (response.data.data.length === 0) {
        setError('Không tìm thấy địa điểm nào');
      }
    } catch (err) {
      console.error('Error searching places:', err);
      setError('Không thể tìm kiếm địa điểm. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceClick = async (place) => {
    try {
      const response = await api.get(`/api/places/details/${place.place_id}`);
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
            Khám Phá <span className="text-luxury-gold">Địa Điểm</span>
          </h1>
          <p className="text-luxury-gray-100 font-philosopher text-lg max-w-2xl mx-auto">
            Tìm kiếm nhà hàng, khách sạn, điểm tham quan và nhiều hơn nữa trên khắp Việt Nam
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
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

              {/* Type Filter */}
              <select
                value={placeType}
                onChange={(e) => setPlaceType(e.target.value)}
                className="bg-luxury-darker border border-luxury-gray-400 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-luxury-gold transition-colors font-philosopher min-w-[200px]"
              >
                <option value="">Tất cả loại hình</option>
                {placeTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              {/* Search Button */}
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

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8"
          >
            <p className="text-red-300 font-philosopher text-center">{error}</p>
          </motion.div>
        )}

        {/* Loading */}
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
                key={place.place_id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -8 }}
              >
                <GlassCard
                  className="h-full cursor-pointer hover:border-luxury-gold transition-colors"
                  onClick={() => handlePlaceClick(place)}
                >
                  {/* Image */}
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
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-playfair text-white mb-2 line-clamp-2">
                      {place.name}
                    </h3>

                    {/* Rating */}
                    {place.rating && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="text-luxury-gold fill-luxury-gold" size={16} />
                          <span className="text-luxury-gold font-philosopher font-bold">
                            {place.rating}
                          </span>
                        </div>
                        {place.user_ratings_total && (
                          <span className="text-luxury-gray-200 text-sm font-philosopher">
                            ({place.user_ratings_total} đánh giá)
                          </span>
                        )}
                      </div>
                    )}

                    {/* Address */}
                    {place.vicinity && (
                      <div className="flex items-start gap-2 text-luxury-gray-100 text-sm font-philosopher mb-3">
                        <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{place.vicinity}</span>
                      </div>
                    )}

                    {/* Status */}
                    {place.opening_hours && (
                      <div className="flex items-center gap-2 text-sm font-philosopher">
                        <Clock size={14} />
                        <span className={place.opening_hours.open_now ? 'text-green-400' : 'text-red-400'}>
                          {place.opening_hours.open_now ? 'Đang mở cửa' : 'Đã đóng cửa'}
                        </span>
                      </div>
                    )}

                    {/* Price Level */}
                    {place.price_level && (
                      <div className="mt-3 text-luxury-gold text-sm font-philosopher">
                        {'$'.repeat(place.price_level)}
                      </div>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && places.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <MapPin size={64} className="mx-auto text-luxury-gray-300 mb-4" />
            <p className="text-luxury-gray-100 font-philosopher text-lg">
              Nhập từ khóa để bắt đầu tìm kiếm
            </p>
          </motion.div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedPlace && (
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
                    {selectedPlace.user_ratings_total && (
                      <span className="text-luxury-gray-100 font-philosopher">
                        {selectedPlace.user_ratings_total} đánh giá
                      </span>
                    )}
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {/* Address */}
                  {selectedPlace.formatted_address && (
                    <div>
                      <h3 className="text-luxury-gray-200 text-sm font-philosopher uppercase tracking-wider mb-2 flex items-center gap-2">
                        <MapPin size={14} />
                        Địa chỉ
                      </h3>
                      <p className="text-white font-philosopher">
                        {selectedPlace.formatted_address}
                      </p>
                    </div>
                  )}

                  {/* Phone */}
                  {selectedPlace.formatted_phone_number && (
                    <div>
                      <h3 className="text-luxury-gray-200 text-sm font-philosopher uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Phone size={14} />
                        Điện thoại
                      </h3>
                      <a
                        href={`tel:${selectedPlace.formatted_phone_number}`}
                        className="text-luxury-gold hover:text-luxury-gold-light font-philosopher"
                      >
                        {selectedPlace.formatted_phone_number}
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
                  {selectedPlace.opening_hours && (
                    <div>
                      <h3 className="text-luxury-gray-200 text-sm font-philosopher uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Clock size={14} />
                        Giờ mở cửa
                      </h3>
                      <p className={`font-philosopher mb-2 ${selectedPlace.opening_hours.open_now ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedPlace.opening_hours.open_now ? 'Đang mở cửa' : 'Đã đóng cửa'}
                      </p>
                      {selectedPlace.opening_hours.weekday_text && (
                        <ul className="space-y-1">
                          {selectedPlace.opening_hours.weekday_text.map((text, index) => (
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
                            <p className="text-white font-philosopher font-bold">
                              {review.author_name}
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
                          <p className="text-luxury-gray-200 text-xs font-philosopher mt-2">
                            {review.relative_time_description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                  {selectedPlace.url && (
                    <LuxuryButton
                      variant="primary"
                      onClick={() => window.open(selectedPlace.url, '_blank')}
                      className="flex-1"
                    >
                      <Navigation size={20} className="mr-2" />
                      Xem trên Google Maps
                    </LuxuryButton>
                  )}
                  <LuxuryButton
                    variant="secondary"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Đóng
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
