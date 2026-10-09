import React, { useEffect, useState } from 'react';
import { Book as BookType } from '../types/book';
import { X, Book as BookIcon, CheckCircle, Clock, Calendar, Bookmark, Building2, User, Hash, AlertCircle } from 'lucide-react';
import { DEFAULT_CATEGORY_MAP } from '../constants/categories';

interface BookDetailModalProps {
  book: BookType | null;
  onClose: () => void;
  onOpenAppsScriptGuide?: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  onOpenAppsScriptGuide,
}) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (book) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [book, onClose]);

  if (!book) return null;

  const totalCopiesNum = Number(book.total_copies) || 0;
  const availableCopiesNum = Number(book.available_copies) || 0;
  const isAvailable = availableCopiesNum > 0;
  const isNoCopies = totalCopiesNum === 0;

  const displayCategory =
    book.category_name ||
    (book.category_id ? DEFAULT_CATEGORY_MAP[book.category_id] || book.category_id : '일반도서');

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-100/70 text-emerald-800">
              {displayCategory}
            </span>
            <span className="text-xs text-slate-400">도서코드: {book.book_id}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Book Cover */}
            <div className="w-full sm:w-48 shrink-0 flex flex-col items-center">
              <div className="w-36 sm:w-48 aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden shadow-md border border-slate-200 flex items-center justify-center">
                {book.cover_url && !imageError ? (
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br from-slate-100 to-emerald-50/50 text-slate-700">
                    <BookIcon className="w-8 h-8 text-emerald-600" />
                    <div>
                      <p className="font-bold text-xs line-clamp-3 text-slate-800">
                        {book.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                        {book.author}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {book.isbn ? `ISBN ${book.isbn}` : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Status pill under cover */}
              <div className="mt-3 w-full">
                {isAvailable ? (
                  <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                    대출 및 예약 가능 ({availableCopiesNum}권)
                  </div>
                ) : isNoCopies ? (
                  <div className="flex flex-col gap-1 items-center justify-center py-2 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                    <div className="flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                      소장본 미등록 (0권)
                    </div>
                    <span className="text-[10px] text-amber-700 text-center">
                      BOOK_COPIES 시트에 바코드를 등록하거나 Apps Script 백엔드를 업데이트하세요.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">
                    <Clock className="w-4 h-4 shrink-0 text-slate-400" />
                    현재 전권 대출 중 (소진)
                  </div>
                )}
              </div>
            </div>

            {/* Details Information */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {book.title}
                </h2>
                <p className="text-sm text-slate-600 mt-1.5 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{book.author || '저자 미상'}</span>
                </p>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <div className="text-slate-400 text-[11px]">출판사</div>
                    <div className="font-medium text-slate-700">{book.publisher || '-'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <div className="text-slate-400 text-[11px]">발행일</div>
                    <div className="font-medium text-slate-700">{book.published_date || '-'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <div className="text-slate-400 text-[11px]">도서 분류</div>
                    <div className="font-medium text-slate-700">
                      {displayCategory} {book.category_id ? `(${book.category_id})` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <div className="text-slate-400 text-[11px]">ISBN</div>
                    <div className="font-medium text-slate-700 font-mono text-[11px]">{book.isbn || '-'}</div>
                  </div>
                </div>
              </div>

              {/* Holding & Availability Summary */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-around text-center ${
                isNoCopies
                  ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                  : 'bg-emerald-50/50 border-emerald-100'
              }`}>
                <div>
                  <div className="text-xs text-slate-500">전체 소장 권수</div>
                  <div className="text-lg font-bold text-slate-800 mt-0.5">
                    {totalCopiesNum} <span className="text-xs font-normal text-slate-500">권</span>
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <div className="text-xs text-slate-500">대출·예약 가능</div>
                  <div className={`text-lg font-bold mt-0.5 ${isAvailable ? 'text-emerald-700' : isNoCopies ? 'text-amber-700' : 'text-slate-500'}`}>
                    {availableCopiesNum} <span className="text-xs font-normal text-slate-500">권</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold text-slate-900 mb-1.5 flex items-center gap-1.5">
                  도서 소개
                </h4>
                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/60 p-3.5 rounded-xl border border-slate-100 max-h-40 overflow-y-auto whitespace-pre-line">
                  {book.description ? book.description : '등록된 도서 소개 내용이 없습니다.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {isNoCopies && onOpenAppsScriptGuide ? (
            <button
              onClick={() => {
                onClose();
                onOpenAppsScriptGuide();
              }}
              type="button"
              className="text-xs text-amber-800 font-semibold underline hover:text-amber-950"
            >
              대출불가(소장본 0권) 해결 코드 보기 &rarr;
            </button>
          ) : (
            <p className="text-xs text-slate-500">
              * 실시간 Google Sheets 연동 데이터입니다.
            </p>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-900 text-white transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
