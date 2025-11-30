import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Camera, Mail, MapPin, Calendar, Edit2, Save, X } from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import LuxuryButton from '../components/common/LuxuryButton';
import LuxuryInput from '../components/common/LuxuryInput';
import { authService } from '../services/auth';
import api from '../services/api';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: '',
    location: ''
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/api/user/profile');
      const userData = response.data.data;
      setUser(userData);
      setFormData({
        name: userData.name || '',
        bio: userData.bio || '',
        phone: userData.phone || '',
        location: userData.location || ''
      });
    } catch (err) {
      setError('Không thể tải thông tin người dùng');
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước ảnh không được vượt quá 5MB');
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
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('location', formData.location);

      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

      const response = await api.put('/api/user/profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUser(response.data.data);
      setSuccess('Cập nhật hồ sơ thành công!');
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật hồ sơ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name || '',
      bio: user.bio || '',
      phone: user.phone || '',
      location: user.location || ''
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setError('');
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

  const displayAvatar = avatarPreview || user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=D4AF37&color=0A0A0A&size=200`;

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

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6"
          >
            <p className="text-red-300 font-philosopher">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6"
          >
            <p className="text-green-300 font-philosopher">{success}</p>
          </motion.div>
        )}

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
                    className="w-40 h-40 rounded-full object-cover border-4 border-luxury-gold"
                  />
                  {isEditing && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
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

                {!isEditing ? (
                  <LuxuryButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="mt-6"
                  >
                    <Edit2 size={16} className="mr-2" />
                    Chỉnh Sửa
                  </LuxuryButton>
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

              {/* Info Section */}
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
                          className="w-full bg-transparent border-b-2 border-luxury-gray-400 text-white font-philosopher py-3 px-0 focus:outline-none focus:border-luxury-gold transition-colors resize-none"
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
                      <div>
                        <h3 className="text-luxury-gray-200 text-sm font-philosopher uppercase tracking-wider mb-2">
                          Giới thiệu
                        </h3>
                        <p className="text-white font-philosopher">
                          {user?.bio || 'Chưa cập nhật'}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-luxury-gray-200 text-sm font-philosopher uppercase tracking-wider mb-2">
                          Số điện thoại
                        </h3>
                        <p className="text-white font-philosopher">
                          {user?.phone || 'Chưa cập nhật'}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-luxury-gray-200 text-sm font-philosopher uppercase tracking-wider mb-2 flex items-center gap-2">
                          <MapPin size={14} />
                          Vị trí
                        </h3>
                        <p className="text-white font-philosopher">
                          {user?.location || 'Chưa cập nhật'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          <GlassCard className="p-6 text-center">
            <div className="text-3xl font-playfair text-luxury-gold mb-2">
              {user?.checkinsCount || 0}
            </div>
            <p className="text-luxury-gray-100 font-philosopher text-sm">
              Địa điểm đã ghé thăm
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="text-3xl font-playfair text-luxury-gold mb-2">
              {user?.virtualTravelCount || 0}
            </div>
            <p className="text-luxury-gray-100 font-philosopher text-sm">
              Ảnh du lịch ảo
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="text-3xl font-playfair text-luxury-gold mb-2">
              {user?.landmarksIdentified || 0}
            </div>
            <p className="text-luxury-gray-100 font-philosopher text-sm">
              Địa danh nhận diện
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
