import { Component } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import LuxuryButton from './LuxuryButton';
import GlassCard from './GlassCard';

/**
 * Error Boundary component to catch React errors
 * Displays a fallback UI when errors occur
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo
    });

    // You can also log to an error reporting service here
    // e.g., Sentry.captureException(error);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-luxury-black flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl w-full"
          >
            <GlassCard className="p-8 md:p-12 text-center">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="text-red-400" size={40} />
                </div>
              </div>

              {/* Error Title */}
              <h1 className="text-3xl md:text-4xl font-playfair text-white mb-4">
                Oops! Có lỗi xảy ra
              </h1>

              {/* Error Message */}
              <p className="text-luxury-gray-100 font-philosopher mb-6">
                Ứng dụng gặp phải một lỗi không mong muốn. Chúng tôi rất xin lỗi vì sự bất tiện này.
              </p>

              {/* Error Details (Development only) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-luxury-darker rounded-lg p-4 mb-6 text-left overflow-auto max-h-60">
                  <p className="text-red-400 font-mono text-sm mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-luxury-gray-200 font-mono text-xs whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <LuxuryButton
                  variant="primary"
                  onClick={this.handleReset}
                >
                  <RefreshCw size={20} className="mr-2" />
                  Thử Lại
                </LuxuryButton>
                <LuxuryButton
                  variant="secondary"
                  onClick={this.handleGoHome}
                >
                  <Home size={20} className="mr-2" />
                  Về Trang Chủ
                </LuxuryButton>
              </div>

              {/* Help Text */}
              <p className="text-luxury-gray-200 text-sm font-philosopher mt-8">
                Nếu vấn đề vẫn tiếp diễn, vui lòng liên hệ với chúng tôi.
              </p>
            </GlassCard>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
