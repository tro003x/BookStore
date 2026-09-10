import Link from 'next/link';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '@/components/ui/pagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
}

export default function PaginationControls({
  currentPage,
  totalPages,
}: PaginationControlsProps) {
  const pages: (number | 'ellipsis')[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else if (currentPage <= 3) {
    pages.push(1, 2, 3, 4, 'ellipsis', totalPages);
  } else if (currentPage >= totalPages - 2) {
    pages.push(
      1,
      'ellipsis',
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages
    );
  } else {
    pages.push(
      1,
      'ellipsis',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      'ellipsis',
      totalPages
    );
  }

  const linkBase =
    'inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-sm font-medium transition-colors h-9 px-4 py-2 hover:bg-[#F5F6F7]';
  const activeClass = 'bg-[#1A1D1E] text-white hover:bg-[#1A1D1E]/90';
  const disabledClass = 'pointer-events-none opacity-50';

  return (
    <Pagination className="mt-10">
      <PaginationContent>
        {/* Previous */}
        <PaginationItem>
          <Link
            href={currentPage > 1 ? `/?page=${currentPage - 1}` : '#'}
            aria-label="Go to previous page"
            className={cn(
              linkBase,
              'gap-1 pl-2.5',
              currentPage === 1 && disabledClass
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Link>
        </PaginationItem>

        {/* Page numbers */}
        {pages.map((page, idx) =>
          page === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <Link
                href={`/?page=${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
                className={cn(
                  linkBase,
                  page === currentPage && activeClass
                )}
              >
                {page}
              </Link>
            </PaginationItem>
          )
        )}

        {/* Next */}
        <PaginationItem>
          <Link
            href={currentPage < totalPages ? `/?page=${currentPage + 1}` : '#'}
            aria-label="Go to next page"
            className={cn(
              linkBase,
              'gap-1 pr-2.5',
              currentPage === totalPages && disabledClass
            )}
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}