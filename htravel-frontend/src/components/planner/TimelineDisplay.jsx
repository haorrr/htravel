import { motion } from 'framer-motion';
// NEW: Import icon Compass
import { Sun, CloudSun, Moon, Clock, DollarSign, Lightbulb, AlertTriangle, Compass } from 'lucide-react';
import GlassCard from "../common/GlassCard";
// NEW: Nhận thêm prop onView360
const TimelineDisplay = ({ tripData, onView360 }) => {
  if (!tripData || !tripData.days) {
    return null;
  }

  const { days, totalEstimatedCost, tips, warnings } = tripData;

  const periodIcons = {
    morning: { icon: Sun, label: 'Buổi sáng', color: 'text-yellow-400' },
    afternoon: { icon: CloudSun, label: 'Buổi chiều', color: 'text-orange-400' },
    evening: { icon: Moon, label: 'Buổi tối', color: 'text-blue-400' }
  };

  return (
    <div className="space-y-6">
      {/* Days */}
      {days.map((day, index) => (
        <motion.div
          key={day.day}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <GlassCard>
            <div className="mb-6">
              <h3 className="text-2xl font-playfair text-luxury-gold mb-1">
                Ngày {day.day}
              </h3>
              <p className="text-luxury-gray-100">
                {new Date(day.date).toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="space-y-4">
              {['morning', 'afternoon', 'evening'].map((period) => {
                const activity = day[period];
                const { icon: Icon, label, color } = periodIcons[period];

                if (!activity) return null; // Safety check

                return (
                  <div
                    key={period}
                    className="p-4 bg-luxury-black/30 rounded-lg border border-luxury-gold/20"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg bg-luxury-black/50 ${color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-luxury-gold font-semibold">{label}</span>
                          <span className="flex items-center text-sm text-luxury-gray-100">
                            <Clock className="w-4 h-4 mr-1" />
                            {activity.time}
                          </span>
                        </div>

                        {/* NEW: Flex container cho Tên địa điểm và Nút 360 */}
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h4 className="text-white font-semibold text-lg">
                            {activity.activity}
                          </h4>
                          
                          {/* Nút xem 360 chỉ hiện khi có hàm xử lý */}
                          {onView360 && (
                            <button
                              onClick={() => onView360(activity.activity)}
                              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-luxury-gold/10 hover:bg-luxury-gold/20 text-luxury-gold border border-luxury-gold/30 transition-all text-xs font-medium group"
                              title="Xem chế độ 360°"
                            >
                              <Compass className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
                              360° View
                            </button>
                          )}
                        </div>

                        <p className="text-luxury-gray-100 mb-3">
                          {activity.description}
                        </p>
                        <div className="flex items-center text-luxury-gold">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span className="font-semibold">{activity.estimatedCost}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      ))}

      {/* Summary */}
      <GlassCard>
        <h3 className="text-2xl font-playfair text-luxury-gold mb-4">
          Tổng quan
        </h3>
        <div className="mb-6">
          <div className="flex items-center text-white mb-2">
            <DollarSign className="w-5 h-5 mr-2 text-luxury-gold" />
            <span className="font-semibold">Tổng chi phí ước tính:</span>
          </div>
          <p className="text-2xl font-bold text-luxury-gold">
            {totalEstimatedCost}
          </p>
        </div>

        {tips && tips.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center text-white mb-3">
              <Lightbulb className="w-5 h-5 mr-2 text-luxury-gold" />
              <span className="font-semibold">Mẹo hữu ích</span>
            </div>
            <ul className="space-y-2">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start text-luxury-gray-100">
                  <span className="text-luxury-gold mr-2">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {warnings && warnings.length > 0 && (
          <div>
            <div className="flex items-center text-white mb-3">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-400" />
              <span className="font-semibold">Lưu ý quan trọng</span>
            </div>
            <ul className="space-y-2">
              {warnings.map((warning, index) => (
                <li key={index} className="flex items-start text-orange-200">
                  <span className="text-orange-400 mr-2">⚠</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default TimelineDisplay;