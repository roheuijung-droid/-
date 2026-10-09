import React, { useState } from 'react';
import { Book as BookType } from '../types/book';
import { Book as BookIcon, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { DEFAULT_CATEGORY_MAP } from '../constants/categories';

interface BookCardProps {
  book: BookType;
  onClick: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onClick }) => {
  const [imageError, setImageError] = useState(false);

  const totalCopiesNum = Number(book.total_copies) || 0;
  const availableCopiesNum = Number(book.available_copies) || 0;
  const isAvailable = availableCopiesNum > 0;
  const isNoCopies = totalCopiesNum === 0;

  const displayCategory =
    book.category_name ||
    (book.category_id ? DEFAULT_CATEGORY_MAP[book.category_id] || book.category_id : '일반도서');

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200 overflow-hidden flex flex-col text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
    >
      {/* Cover image container */}
      <div className="relative aspect-[3/4] w-full bg-slate-100 overflow-hidden flex items-center justify-center">
        {book.cover_url && !imageError ? (
          <img
            src={book.cover_url}
            alt={book.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full p-6 flex flex-col justify-between bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50/40 text-slate-700 select-none">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-semibold tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                {displayCategory}
              </span>
              <BookIcon className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </div>

            <div className="my-auto py-2">
              <h4 className="font-bold text-slate-800 text-sm line-clamp-3 leading-snug">
                {book.title}
              </h4>
              {book.author && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {book.author}
                </p>
              )}
            </div>

            <div className="text-[10px] text-slate-400 font-mono">
              {book.isbn ? `ISBN ${book.isbn}` : '도서관 소장도서'}
            </div>
          </div>
        )}

        {/* Availability Badge Overlay */}
        <div className="absolute top-2.5 right-2.5">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-600 text-white backdrop-blur-xs shadow-xs">
              <CheckCircle className="w-3 h-3" />
              대출가능 {availableCopiesNum}
            </span>
          ) : isNoCopies ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-600/90 text-white backdrop-blur-xs shadow-xs" title="소장본이 아직 등록되지 않았습니다">
              <AlertCircle className="w-3 h-3" />
              소장본 0권
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800/85 text-slate-200 backdrop-blur-xs shadow-xs">
              <Clock className="w-3 h-3" />
              전권 대출중
            </span>
          )}
        </div>
      </div>

      {/* Book Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Date */}
          <div className="flex items-center gap-1.5 mb-1.5 text-xs text-slate-500">
            <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
              {displayCategory}
            </span>
            {book.published_date && (
              <span className="text-[11px] text-slate-400">
                {book.published_date}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {book.title}
          </h3>

          {/* Author & Publisher */}
          <p className="text-xs text-slate-600 mt-1 line-clamp-1">
            {book.author || '저자 미상'}
            {book.publisher ? ` · ${book.publisher}` : ''}
          </p>
        </div>

        {/* Copies Info Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={totalCopiesNum > 0 ? 'text-slate-600' : 'text-amber-700 font-medium'}>
              소장 <strong className={totalCopiesNum > 0 ? 'text-slate-800 font-semibold' : 'text-amber-800'}>{totalCopiesNum}</strong>권
            </span>
            <span className="text-slate-300">|</span>
            <span className={isAvailable ? 'text-emerald-600 font-medium' : isNoCopies ? 'text-amber-600' : 'text-slate-400'}>
              가능 <strong className={isAvailable ? 'text-emerald-700 font-bold' : isNoCopies ? 'text-amber-700' : 'text-slate-500'}>{availableCopiesNum}</strong>권
            </span>
          </div>

          <span className="text-[11px] font-medium text-emerald-600 group-hover:translate-x-0.5 transition-transform">
            상세보기 &rarr;
          </span>
        </div>
      </div>
    </div>
  );
};
