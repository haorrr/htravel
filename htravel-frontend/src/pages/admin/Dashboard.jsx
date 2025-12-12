import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  MapPin,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import GlassCard from '../../components/common/GlassCard';
import {
  useDashboardStats,
  useDashboardTrends,
  useDashboardActivity
} from '../../hooks/useDashboard'; // Ensure path is correct

/**
 * KPI Stat Card Component
 */
const StatCard = ({ title, value, subtitle, icon: Icon, trend, isLoading }) => {
  const trendColor = trend >= 0 ? 'text-green-400' : 'text-red-400';
  const TrendIcon = trend >= 0 ? TrendingUp : TrendingDown;

  return (
    <GlassCard className="p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-luxury-gray-100 font-philosopher text-sm">
            {title}
          </p>
          {isLoading ? (
            <div className="h-10 w-24 bg-white/10 rounded animate-pulse mt-2"></div>
          ) : (
            <h3 className="text-4xl font-playfair text-white mt-2 font-bold">
              {value}
            </h3>
          )}
          {subtitle && (
            <p className="text-luxury-gray-200 font-philosopher text-xs mt-2">
              {subtitle}
            </p>
          )}
          {trend !== undefined && trend !== null && (
            <div className={`flex items-center gap-1 mt-2 ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              <span className="text-sm font-philosopher font-semibold">
                {Math.abs(trend)}%
              </span>
              <span className="text-luxury-gray-200 text-xs font-philosopher">
                tuần này
              </span>
            </div>
          )}
        </div>
        <div className="p-3 bg-luxury-gold/10 rounded-lg">
          <Icon className="w-6 h-6 text-luxury-gold" />
        </div>
      </div>
    </GlassCard>
  );
};

/**
 * Activity Item Component
 */
const ActivityItem = ({ activity }) => {
  const getActivityText = () => {
    if (activity.type === 'user_registered') {
      return {
        icon: '👤',
        text: `${activity.user?.name || 'User'} đã đăng ký tài khoản`,
        detail: activity.user?.email
      };
    } else if (activity.type === 'check_in') {
      return {
        icon: '📍',
        text: `${activity.user?.name || 'User'} đã check-in`,
        detail: `${activity.metadata?.locationName || 'Unknown'}, ${activity.metadata?.province || ''}`
      };
    }
    return { icon: '•', text: 'Hoạt động hệ thống', detail: '' };
  };

  const { icon, text, detail } = getActivityText();
  const timeAgo = getTimeAgo(activity.timestamp || activity.createdAt);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 py-3 border-b border-luxury-gold/10 last:border-0"
    >
      <div className="text-2xl">{icon}</div>
      <div className="flex-1">
        <p className="text-white font-philosopher text-sm">
          {text}
        </p>
        {detail && (
          <p className="text-luxury-gray-200 font-philosopher text-xs mt-1">
            {detail}
          </p>
        )}
        <div className="flex items-center gap-1 mt-1 text-luxury-gray-200">
          <Clock className="w-3 h-3" />
          <span className="text-xs font-philosopher">{timeAgo}</span>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Helper function to calculate time ago
 */
const getTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return `${seconds} giây trước`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  return `${Math.floor(seconds / 86400)} ngày trước`;
};

/**
 * Custom Recharts Tooltip
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-luxury-black/95 border border-luxury-gold/30 rounded-lg p-3 shadow-lg">
        <p className="text-luxury-gray-100 font-philosopher text-sm mb-1">
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-white font-philosopher text-sm font-semibold">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Admin Dashboard Page
 */
const AdminDashboard = () => {
  const [period, setPeriod] = useState('30d');

  // Fetch data using React Query hooks
  const { data: rawStats, isLoading: statsLoading } = useDashboardStats();
  const { data: rawTrends, isLoading: trendsLoading } = useDashboardTrends(period);
  const { data: rawActivity, isLoading: activityLoading } = useDashboardActivity(10);

  // Hooks already unwrap data.data in their queryFn, so use directly
  const stats = rawStats || {};
  const trends = rawTrends || {};
  const activity = rawActivity || {};

  const periodOptions = [
    { value: '7d', label: '7 ngày' },
    { value: '30d', label: '30 ngày' },
    { value: '90d', label: '90 ngày' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-playfair text-white mb-2">
          Admin <span className="text-luxury-gold">Dashboard</span>
        </h1>
        <p className="text-luxury-gray-100 font-philosopher">
          Tổng quan thống kê và hoạt động hệ thống
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tổng người dùng"
          value={stats?.users?.total || 0}
          subtitle={`${stats?.users?.admins || 0} quản trị viên`}
          icon={Users}
          trend={stats?.users?.growthRate}
          isLoading={statsLoading}
        />
        <StatCard
          title="Bài viết"
          value={stats?.articles?.total || 0}
          subtitle={`${stats?.articles?.newThisMonth || 0} bài mới tháng này`}
          icon={FileText}
          isLoading={statsLoading}
        />
        <StatCard
          title="Check-ins"
          value={stats?.checkIns?.total || 0}
          subtitle={`${stats?.checkIns?.uniqueProvinces || 0} tỉnh thành`}
          icon={MapPin}
          isLoading={statsLoading}
        />
        <StatCard
          title="Người dùng mới"
          value={stats?.users?.newThisWeek || 0}
          subtitle={`${stats?.users?.newToday || 0} hôm nay`}
          icon={TrendingUp}
          isLoading={statsLoading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-playfair text-white font-semibold">
                Tăng trưởng người dùng
              </h2>
              <p className="text-luxury-gray-200 text-sm font-philosopher mt-1">
                Số lượng người dùng theo thời gian
              </p>
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-luxury-gold/30 rounded-lg text-white font-philosopher text-sm focus:outline-none focus:ring-2 focus:ring-luxury-gold/50 transition-all"
            >
              {periodOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-luxury-black">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {trendsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends?.userGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.1)" />
                <XAxis
                  dataKey="date"
                  stroke="#888"
                  style={{ fontSize: '12px', fontFamily: 'Philosopher' }}
                />
                <YAxis
                  stroke="#888"
                  style={{ fontSize: '12px', fontFamily: 'Philosopher' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontFamily: 'Philosopher', fontSize: '14px' }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  name="Người dùng"
                  stroke="#D4AF37"
                  strokeWidth={2}
                  dot={{ fill: '#D4AF37', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        {/* Check-ins by Province Chart */}
        <GlassCard className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-playfair text-white font-semibold">
              Check-ins theo tỉnh
            </h2>
            <p className="text-luxury-gray-200 text-sm font-philosopher mt-1">
              Top 10 địa điểm được check-in nhiều nhất
            </p>
          </div>

          {trendsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trends?.checkInsByProvince?.slice(0, 10) || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 175, 55, 0.1)" />
                <XAxis
                  dataKey="province"
                  stroke="#888"
                  style={{ fontSize: '11px', fontFamily: 'Philosopher' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  stroke="#888"
                  style={{ fontSize: '12px', fontFamily: 'Philosopher' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontFamily: 'Philosopher', fontSize: '14px' }}
                />
                <Bar
                  dataKey="count"
                  name="Check-ins"
                  fill="#D4AF37"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <GlassCard className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-playfair text-white font-semibold">
            Hoạt động gần đây
          </h2>
          <p className="text-luxury-gray-200 text-sm font-philosopher mt-1">
            10 hoạt động mới nhất trên hệ thống
          </p>
        </div>

        {activityLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-white/5 rounded animate-pulse"></div>
            ))}
          </div>
        ) : activity?.activities && activity.activities.length > 0 ? (
          <div className="space-y-1">
            {activity.activities.map((item) => (
              <ActivityItem key={item.id} activity={item} />
            ))}
          </div>
        ) : (
          <p className="text-luxury-gray-200 text-center py-8 font-philosopher">
            Chưa có hoạt động nào
          </p>
        )}
      </GlassCard>
    </div>
  );
};

export default AdminDashboard;