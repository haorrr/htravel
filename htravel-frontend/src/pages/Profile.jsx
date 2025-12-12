import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
// 1. Thêm import useNavigate và Map icon
import { useNavigate } from 'react-router-dom';
import { Camera, Mail, MapPin, Calendar, Edit2, Save, X, Map } from 'lucide-react';
import toast from 'react-hot-toast';
import GlassCard from '../components/common/GlassCard';
import LuxuryButton from '../components/common/LuxuryButton';
import LuxuryInput from '../components/common/LuxuryInput';
import { useUserProfile, useUploadAvatar } from '../hooks/useUser';

// Hàm hỗ trợ lấy full URL ảnh từ backend
const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `http://localhost:3000${path}`; 
};

export default function Profile() {
  // 2. Khởi tạo navigate
  const navigate = useNavigate();
  
  const { data: userData, isLoading, error: fetchError } = useUserProfile();
  const user = userData?.data || userData;
  const uploadAvatarMutation = useUploadAvatar();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: '',
    location: ''
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        phone: user.phone || '',
        location: user.location || ''
      });
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await uploadAvatarMutation.mutateAsync({
        file: avatarFile,
        profileData: formData
      });

      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      console.error('Profile update failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      bio: user?.bio || '',
      phone: user?.phone || '',
      location: user?.location || ''
    });
    setAvatarFile(null);
    setAvatarPreview(null);
  };

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

  if (fetchError) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <GlassCard className="p-8">
            <div className="text-red-400 mb-4">
              <X className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-playfair text-white mb-2">
              Không thể tải thông tin
            </h2>
            <p className="text-luxury-gray-100 font-philosopher mb-6">
              Đã xảy ra lỗi khi tải thông tin hồ sơ. Vui lòng thử lại sau.
            </p>
            <LuxuryButton
              variant="primary"
              onClick={() => window.location.reload()}
            >
              Tải lại trang
            </LuxuryButton>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  const serverAvatarUrl = user?.avatarUrl
    ? `${getFullImageUrl(user.avatarUrl)}?t=${user.updatedAt ? new Date(user.updatedAt).getTime() : Date.now()}`
    : null;

  const displayAvatar = avatarPreview || serverAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=D4AF37&color=0A0A0A&size=200`;

  return (
    <div className="min-h-screen bg-luxury-black pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-playfair text-white mb-4">
            Hồ Sơ <span className="text-luxury-gold">Cá Nhân</span>
          </h1>
          <p className="text-luxury-gray-100 font-philosopher">
            Quản lý thông tin và tùy chỉnh tài khoản của bạn
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GlassCard className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <img
                    src={displayAvatar}
                    alt={user?.name}
                    className="w-40 h-40 rounded-full object-cover border-4 border-luxury-gold shadow-lg shadow-luxury-gold/20"
                    onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=333&color=fff`;
                    }}
                  />
                  {isEditing && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                      <Camera className="text-luxury-gold" size={32} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div className="mt-6 text-center">
                  <h2 className="text-2xl font-playfair text-white mb-1">
                    {user?.name}
                  </h2>
                  <p className="text-luxury-gray-100 font-philosopher text-sm flex items-center justify-center gap-2">
                    <Mail size={14} />
                    {user?.email}
                  </p>
                  <p className="text-luxury-gray-200 text-xs font-philosopher mt-2 flex items-center justify-center gap-1">
                    <Calendar size={12} />
                    Tham gia {new Date(user?.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                {/* 3. SỬA ĐOẠN NÀY: Thêm nút Lịch trình của tôi */}
                {!isEditing ? (
                  <div className="flex flex-col gap-3 mt-6 w-full max-w-[200px]">
                    {/* Nút Chỉnh sửa */}
                    <LuxuryButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="w-full"
                    >
                      <Edit2 size={16} className="mr-2" />
                      Chỉnh Sửa
                    </LuxuryButton>
                    
                    {/* Nút MỚI: Lịch trình của tôi */}
                    <LuxuryButton
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/my-trips')}
                      className="w-full"
                    >
                      <Map size={16} className="mr-2" />
                      Lịch trình của tôi
                    </LuxuryButton>
                  </div>
                ) : (
                  <div className="flex gap-3 mt-6">
                    <LuxuryButton
                      variant="primary"
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      <Save size={16} className="mr-2" />
                      {isSaving ? 'Đang lưu...' : 'Lưu'}
                    </LuxuryButton>
                    <LuxuryButton
                      variant="tertiary"
                      size="sm"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      <X size={16} className="mr-2" />
                      Hủy
                    </LuxuryButton>
                  </div>
                )}
              </div>

              {/* Info Section - Giữ nguyên */}
              <div className="flex-1">
                <div className="space-y-6">
                  {isEditing ? (
                    <>
                      <div>
                        <LuxuryInput
                          label="Họ và tên"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Nhập họ và tên"
                        />
                      </div>
                      <div>
                        <label className="block text-luxury-gray-100 text-sm font-philosopher uppercase tracking-wider mb-2">
                          Giới thiệu
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          placeholder="Viết vài dòng về bạn..."
                          rows="4"
                          className="w-full bg-white/5 border border-white/10 rounded-lg text-white font-philosopher py-3 px-4 focus:outline-none focus:border-luxury-gold transition-colors resize-none placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <LuxuryInput
                          label="Số điện thoại"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="0123 456 789"
                        />
                      </div>
                      <div>
                        <LuxuryInput
                          label="Vị trí"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="Thành phố, Quốc gia"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                        <h3 className="text-luxury-gold text-xs font-bold uppercase tracking-wider mb-2">
                          Giới thiệu
                        </h3>
                        <p className="text-gray-300 font-philosopher leading-relaxed">
                          {user?.bio || 'Chưa cập nhật'}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                          <h3 className="text-luxury-gold text-xs font-bold uppercase tracking-wider mb-2">
                            Số điện thoại
                          </h3>
                          <p className="text-white font-philosopher">
                            {user?.phone || 'Chưa cập nhật'}
                          </p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                          <h3 className="text-luxury-gold text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                            <MapPin size={14} />
                            Vị trí
                          </h3>
                          <p className="text-white font-philosopher">
                            {user?.location || 'Chưa cập nhật'}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats Section - Giữ nguyên */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          <GlassCard className="p-6 text-center hover:border-luxury-gold/50 transition-colors cursor-default">
            <div className="text-3xl font-playfair text-luxury-gold mb-2">
              {user?.checkinsCount || 0}
            </div>
            <p className="text-luxury-gray-100 font-philosopher text-sm uppercase tracking-wider">
              Địa điểm đã ghé thăm
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center hover:border-luxury-gold/50 transition-colors cursor-default">
            <div className="text-3xl font-playfair text-luxury-gold mb-2">
              {user?.virtualTravelCount || 0}
            </div>
            <p className="text-luxury-gray-100 font-philosopher text-sm uppercase tracking-wider">
              Ảnh du lịch ảo
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center hover:border-luxury-gold/50 transition-colors cursor-default">
            <div className="text-3xl font-playfair text-luxury-gold mb-2">
              {user?.landmarksIdentified || 0}
            </div>
            <p className="text-luxury-gray-100 font-philosopher text-sm uppercase tracking-wider">
              Địa danh nhận diện
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}