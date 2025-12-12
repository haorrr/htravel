import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks';
import GlassCard from '../components/common/GlassCard';
import LuxuryInput from '../components/common/LuxuryInput';
import LuxuryButton from '../components/common/LuxuryButton';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    const result = await login(data.email, data.password);

    if (result.success) {
      // Role-based redirect
      const from = location.state?.from?.pathname;

      if (from) {
        // If redirected from protected route, go back there
        navigate(from, { replace: true });
      } else {
        // Default redirect based on role
        const defaultPath = result.user.role === 'admin' ? '/admin' : '/profile';
        navigate(defaultPath, { replace: true });
      }
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-luxury-black relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070"
          alt="Vietnam Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-luxury-black via-luxury-black/90 to-luxury-dark" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <GlassCard className="p-8 md:p-12" hover={false}>
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-playfair text-white mb-2">
              Chào Mừng Trở Lại
            </h1>
            <p className="text-luxury-gray-100 font-philosopher">
              Đăng nhập để tiếp tục hành trình khám phá
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6"
            >
              <p className="text-red-300 text-sm font-philosopher">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <LuxuryInput
                label="Email"
                type="email"
                placeholder="email@example.com"
                required
                {...register('email', {
                  required: 'Email là bắt buộc',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email không hợp lệ'
                  }
                })}
                error={errors.email?.message}
              />
            </div>

            <div>
              <LuxuryInput
                label="Mật khẩu"
                type="password"
                placeholder="••••••••"
                required
                {...register('password', {
                  required: 'Mật khẩu là bắt buộc',
                  minLength: {
                    value: 6,
                    message: 'Mật khẩu phải có ít nhất 6 ký tự'
                  }
                })}
                error={errors.password?.message}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-luxury-gray-100 font-philosopher cursor-pointer">
                <input type="checkbox" className="accent-luxury-gold" />
                Ghi nhớ đăng nhập
              </label>
              <Link
                to="/forgot-password"
                className="text-luxury-gold-light hover:text-luxury-gold transition-colors font-philosopher"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <LuxuryButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
            </LuxuryButton>
          </form>

          <div className="mt-8 text-center">
            <p className="text-luxury-gray-100 font-philosopher">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="text-luxury-gold-light hover:text-luxury-gold transition-colors font-bold"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
