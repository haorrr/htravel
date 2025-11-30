import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks';
import GlassCard from '../components/common/GlassCard';
import LuxuryInput from '../components/common/LuxuryInput';
import LuxuryButton from '../components/common/LuxuryButton';

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    const result = await registerUser(data.name, data.email, data.password);

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-luxury-black relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2071"
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
              Tạo Tài Khoản
            </h1>
            <p className="text-luxury-gray-100 font-philosopher">
              Bắt đầu hành trình khám phá Việt Nam cùng AI
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
                label="Họ và tên"
                type="text"
                placeholder="Nguyễn Văn A"
                required
                {...register('name', {
                  required: 'Họ và tên là bắt buộc',
                  minLength: {
                    value: 2,
                    message: 'Họ và tên phải có ít nhất 2 ký tự'
                  }
                })}
                error={errors.name?.message}
              />
            </div>

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

            <div>
              <LuxuryInput
                label="Xác nhận mật khẩu"
                type="password"
                placeholder="••••••••"
                required
                {...register('confirmPassword', {
                  required: 'Vui lòng xác nhận mật khẩu',
                  validate: value =>
                    value === password || 'Mật khẩu không khớp'
                })}
                error={errors.confirmPassword?.message}
              />
            </div>

            <div className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-luxury-gold mt-1"
                {...register('terms', { required: 'Vui lòng đồng ý với điều khoản' })}
              />
              <label className="text-luxury-gray-100 font-philosopher">
                Tôi đồng ý với{' '}
                <Link to="/terms" className="text-luxury-gold-light hover:text-luxury-gold">
                  Điều khoản sử dụng
                </Link>{' '}
                và{' '}
                <Link to="/privacy" className="text-luxury-gold-light hover:text-luxury-gold">
                  Chính sách bảo mật
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="text-red-400 text-sm font-philosopher -mt-4">{errors.terms.message}</p>
            )}

            <LuxuryButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng Ký'}
            </LuxuryButton>
          </form>

          <div className="mt-8 text-center">
            <p className="text-luxury-gray-100 font-philosopher">
              Đã có tài khoản?{' '}
              <Link
                to="/login"
                className="text-luxury-gold-light hover:text-luxury-gold transition-colors font-bold"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
