import React from 'react';
import Button from '../../../components/ui/Button';


const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  onItemsPerPageChange 
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages?.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages?.push(i);
        }
        pages?.push('...');
        pages?.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages?.push(1);
        pages?.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages?.push(i);
        }
      } else {
        pages?.push(1);
        pages?.push('...');
        pages?.push(currentPage - 1);
        pages?.push(currentPage);
        pages?.push(currentPage + 1);
        pages?.push('...');
        pages?.push(totalPages);
      }
    }
    
    return pages;
  };

  const itemsPerPageOptions = [10, 25, 50, 100];

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <p className="caption text-muted-foreground">
            {startItem}-{endItem} arası gösteriliyor (Toplam {totalItems?.toLocaleString('tr-TR')} kayıt)
          </p>
          <div className="flex items-center gap-2">
            <span className="caption text-muted-foreground whitespace-nowrap">Sayfa başına:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e?.target?.value))}
              className="px-3 py-2 rounded-lg bg-input border border-border text-foreground caption focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {itemsPerPageOptions?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            iconName="ChevronLeft"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Önceki sayfa"
          />

          <div className="hidden sm:flex items-center gap-1">
            {getPageNumbers()?.map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2 text-muted-foreground">...</span>
                ) : (
                  <button
                    onClick={() => onPageChange(page)}
                    className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-all duration-250 ${
                      currentPage === page
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-foreground hover:bg-muted border border-border'
                    }`}
                    aria-label={`Sayfa ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="sm:hidden flex items-center gap-2">
            <span className="caption text-foreground font-medium">
              {currentPage} / {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            iconName="ChevronRight"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Sonraki sayfa"
          />
        </div>
      </div>
    </div>
  );
};

export default Pagination;