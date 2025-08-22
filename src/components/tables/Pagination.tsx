import React from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}) => {
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, Math.min(
      currentPage - Math.floor(maxPagesToShow / 2),
      totalPages - maxPagesToShow + 1
    ));
    let endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = totalPages;
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    // console.log('>>>>>>',pages);
    return pages;

    
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span>Showing</span>
        <span className="font-medium text-gray-900 dark:text-white">
          {(currentPage - 1) * 10 + 1}
        </span>
        <span>to</span>
        <span className="font-medium text-gray-900 dark:text-white">
          {isNaN(currentPage) || isNaN(totalItems)
            ? '0'
            : Math.min(currentPage * 10, totalItems)}
        </span>

        <span>of</span>
        <span className="font-medium text-gray-900 dark:text-white">{totalItems}</span>
        <span>entries</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="First page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Previous page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-all duration-200 ${page === currentPage
                  ? "bg-purple-600 text-white shadow-sm hover:bg-purple-700"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Next page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Last page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
