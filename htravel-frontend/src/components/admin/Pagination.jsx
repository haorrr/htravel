import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Pagination Component
 * Page navigation with first/last/prev/next buttons
 *
 * @param {Number} currentPage - Current page number (1-based)
 * @param {Number} totalPages - Total number of pages
 * @param {Number} totalItems - Total number of items
 * @param {Number} itemsPerPage - Items per page
 * @param {Function} onPageChange - Callback when page changes
 * @param {Boolean} isLoading - Loading state
 */
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  isLoading = false,
}) => {
  // Don't render if only 1 page or no data
  if (totalPages <= 1) return null;

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  // Calculate visible page range (show 5 pages max)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    // Adjust start if we're near the end
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Calculate showing range
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const buttonClass = (disabled) =>
    `p-2 rounded-lg transition-colors ${
      disabled
        ? 'opacity-30 cursor-not-allowed'
        : 'hover:bg-white/10 text-luxury-gray-100 hover:text-white'
    }`;

  const pageButtonClass = (isActive) =>
    `px-3 py-2 rounded-lg font-philosopher font-semibold transition-all ${
      isActive
        ? 'bg-luxury-gold text-luxury-black'
        : 'hover:bg-white/10 text-luxury-gray-100 hover:text-white'
    }`;

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white/5 border border-luxury-gold/30 rounded-lg">
      {/* Showing Info */}
      <div className="text-luxury-gray-200 font-philosopher text-sm">
        Hiển thị{' '}
        <span className="text-white font-semibold">
          {startItem}-{endItem}
        </span>{' '}
        trong tổng số{' '}
        <span className="text-white font-semibold">{totalItems}</span> người dùng
      </div>

      {/* Page Navigation */}
      <div className="flex items-center gap-2">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={isFirstPage || isLoading}
          className={buttonClass(isFirstPage || isLoading)}
          aria-label="First page"
        >
          <ChevronsLeft className="w-5 h-5" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage || isLoading}
          className={buttonClass(isFirstPage || isLoading)}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {/* Show ... if not starting from page 1 */}
          {pageNumbers[0] > 1 && (
            <span className="px-2 text-luxury-gray-200 font-philosopher">...</span>
          )}

          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={isLoading}
              className={pageButtonClass(page === currentPage)}
            >
              {page}
            </button>
          ))}

          {/* Show ... if not ending at last page */}
          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <span className="px-2 text-luxury-gray-200 font-philosopher">...</span>
          )}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage || isLoading}
          className={buttonClass(isLastPage || isLoading)}
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={isLastPage || isLoading}
          className={buttonClass(isLastPage || isLoading)}
          aria-label="Last page"
        >
          <ChevronsRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default Pagination;
