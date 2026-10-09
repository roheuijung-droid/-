import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Book, ApiResponse } from './types/book';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { BookCard } from './components/BookCard';
import { BookDetailModal } from './components/BookDetailModal';
import { ConnectionInfoModal } from './components/ConnectionInfoModal';
import { AppsScriptCodeModal } from './components/AppsScriptCodeModal';
import {
  BookOpen,
  Library,
  BookCheck,
  BookmarkCheck,
  AlertCircle,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Code2,
  HelpCircle,
} from 'lucide-react';

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Health check state
  const [healthConnected, setHealthConnected] = useState<boolean | null>(null);
  const [healthMessage, setHealthMessage] = useState<string>('');
  const [isHealthChecking, setIsHealthChecking] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('default');

  // Modals state
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isConnectionInfoOpen, setIsConnectionInfoOpen] = useState<boolean>(false);
  const [isAppsScriptModalOpen, setIsAppsScriptModalOpen] = useState<boolean>(false);

  // Check health status from backend proxy
  const checkHealth = useCallback(async () => {
    setIsHealthChecking(true);
    try {
      const res = await fetch('/api/health');
      const data: ApiResponse<any> = await res.json();
      if (data.success) {
        setHealthConnected(true);
        setHealthMessage(data.message || 'Google Sheets 연결 및 필수 헤더 검증 성공');
      } else {
        setHealthConnected(false);
        setHealthMessage(
          typeof data.error === 'string'
            ? data.error
            : data.error?.message || 'Google Sheets 응답 오류가 발생했습니다.'
        );
      }
    } catch (err: any) {
      setHealthConnected(false);
      setHealthMessage(err.message || '서버와의 통신에 실패했습니다.');
    } finally {
      setIsHealthChecking(false);
    }
  }, []);

  // Fetch books from backend proxy
  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/books');
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || `서버 오류 (HTTP ${res.status} ${res.statusText})`
        );
      }

      const responseData: ApiResponse<Book[]> = await res.json();

      if (!responseData.success) {
        const errMsg =
          typeof responseData.error === 'string'
            ? responseData.error
            : responseData.error?.message || '도서 데이터를 가져오지 못했습니다.';
        throw new Error(errMsg);
      }

      const rawBooks = Array.isArray(responseData.data) ? responseData.data : [];
      setBooks(rawBooks);
      setLastUpdated(new Date());
      setHealthConnected(true);
    } catch (err: any) {
      console.error('Fetch books error:', err);
      setError(
        err.message || 'Google Sheets와 통신하는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'
      );
      setHealthConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    checkHealth();
    fetchBooks();
  }, [checkHealth, fetchBooks]);

  // Extract unique categories from loaded books
  const categories = useMemo(() => {
    const list = new Set<string>();
    list.add('전체');
    books.forEach((b) => {
      if (b.category_id && b.category_id.trim()) {
        list.add(b.category_id.trim());
      }
    });
    return Array.from(list);
  }, [books]);

  // Filtered and sorted books
  const filteredBooks = useMemo(() => {
    let result = [...books];

    // Search query filter: title, author, isbn
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((book) => {
        const titleMatch = book.title ? book.title.toLowerCase().includes(q) : false;
        const authorMatch = book.author ? book.author.toLowerCase().includes(q) : false;
        const isbnMatch = book.isbn ? String(book.isbn).toLowerCase().includes(q) : false;
        const publisherMatch = book.publisher ? book.publisher.toLowerCase().includes(q) : false;
        return titleMatch || authorMatch || isbnMatch || publisherMatch;
      });
    }

    // Category filter
    if (selectedCategory !== '전체') {
      result = result.filter((book) => book.category_id === selectedCategory);
    }

    // Available only filter
    if (onlyAvailable) {
      result = result.filter((book) => (Number(book.available_copies) || 0) > 0);
    }

    // Sorting
    if (sortBy === 'title') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'ko'));
    } else if (sortBy === 'latest') {
      result.sort((a, b) => (b.published_date || '').localeCompare(a.published_date || ''));
    } else if (sortBy === 'copies') {
      result.sort(
        (a, b) => (Number(b.total_copies) || 0) - (Number(a.total_copies) || 0)
      );
    }

    return result;
  }, [books, searchQuery, selectedCategory, onlyAvailable, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const totalTitles = books.length;
    const totalCopies = books.reduce(
      (sum, b) => sum + (Number(b.total_copies) || 0),
      0
    );
    const availableCopies = books.reduce(
      (sum, b) => sum + (Number(b.available_copies) || 0),
      0
    );
    return { totalTitles, totalCopies, availableCopies };
  }, [books]);

  // Check if books exist but all copies are zero (the exact issue user encountered)
  const isAllCopiesZero = useMemo(() => {
    return books.length > 0 && stats.totalCopies === 0;
  }, [books, stats.totalCopies]);

  const handleRefresh = () => {
    checkHealth();
    fetchBooks();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        isLoading={isLoading}
        healthConnected={healthConnected}
        healthMessage={healthMessage}
        onRefresh={handleRefresh}
        onOpenConnectionInfo={() => setIsConnectionInfoOpen(true)}
        onOpenAppsScriptCode={() => setIsAppsScriptModalOpen(true)}
        lastUpdated={lastUpdated}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Banner Section */}
        <section className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-950/10 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-medium mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Google Sheets 실시간 도서관 데이터베이스</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              도서 검색 및 소장 현황
            </h2>
            <p className="mt-2 text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              Google 스프레드시트의 도서 목록을 실시간으로 조회하고, 소장 권수와 대출·예약 가능 여부를 확인하세요.
            </p>
          </div>

          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8 translate-y-8">
            <Library className="w-64 h-64 text-white" />
          </div>
        </section>

        {/* Issue Alert Banner: when total_copies is 0 for all books */}
        {isAllCopiesZero && (
          <section className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-amber-900 text-sm sm:text-base flex items-center gap-2">
                  <span>도서 {books.length}권 등록 완료됨 (소장본 권수 0권 설정 상태)</span>
                </h4>
                <p className="text-xs sm:text-sm text-amber-800/90 mt-0.5 leading-relaxed">
                  스프레드시트에 도서 정보는 등록되었으나, <strong>BOOK_COPIES(소장본)</strong> 시트가 비어있거나 권수가 0으로 되어 있어 <strong>'대출 불가'</strong>로 표시되고 있습니다.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAppsScriptModalOpen(true)}
              type="button"
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-800 hover:bg-amber-900 text-white transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
            >
              <Code2 className="w-4 h-4" />
              <span>새 백엔드 코드 복사 &amp; 해결하기</span>
            </button>
          </section>
        )}

        {/* Library Stats Summary */}
        <section className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                등록 도서
              </div>
              <div className="text-base sm:text-xl font-bold text-slate-900">
                {stats.totalTitles.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-500">종</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                총 소장 권수
              </div>
              <div className={`text-base sm:text-xl font-bold ${stats.totalCopies === 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                {stats.totalCopies.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-500">권</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-teal-50 text-teal-600 shrink-0">
              <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                대출·예약 가능
              </div>
              <div className={`text-base sm:text-xl font-bold ${stats.availableCopies === 0 ? 'text-slate-400' : 'text-teal-700'}`}>
                {stats.availableCopies.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-500">권</span>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Filter Bar */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          onlyAvailable={onlyAvailable}
          onToggleOnlyAvailable={() => setOnlyAvailable(!onlyAvailable)}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalFilteredCount={filteredBooks.length}
        />

        {/* Main Content Area */}
        {isLoading && (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              Google Sheets에서 도서 목록을 불러오는 중입니다...
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Google Apps Script API를 통해 시트 데이터를 동기화하고 있습니다.
            </p>
          </div>
        )}

        {!isLoading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 sm:p-8 text-center max-w-xl mx-auto my-8">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-rose-900">
              Google Sheets 연결 오류
            </h3>
            <p className="text-sm text-rose-700 mt-2 leading-relaxed">
              {error}
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={handleRefresh}
                type="button"
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
              >
                다시 시도하기
              </button>
              <button
                onClick={() => setIsConnectionInfoOpen(true)}
                type="button"
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-white border border-rose-300 text-rose-800 hover:bg-rose-100/50 transition-colors cursor-pointer"
              >
                연동 상태 상세 확인
              </button>
            </div>
          </div>
        )}

        {/* When not loading and no error */}
        {!isLoading && !error && (
          <>
            {/* Condition 1: Sheet is empty */}
            {books.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  등록된 도서가 없습니다
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  연결된 Google Sheets(BOOKS 시트)에 도서 정보가 아직 등록되지 않았습니다.
                  스프레드시트에 도서 데이터를 입력한 후 새로고침을 누르면 즉시 조회됩니다.
                </p>

                {/* Connection Status verification banner */}
                <div className="mt-6 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200/80 text-xs text-emerald-800 text-left flex items-start gap-2.5">
                  <BookCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Google Sheets 연결 상태: </span>
                    <span>정상 연결 완료</span>
                    <p className="text-[11px] text-emerald-700/90 mt-0.5">
                      Apps Script API(`?action=health` 및 `?action=books`) 통신이 검증되었습니다.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-center gap-3">
                  <button
                    onClick={handleRefresh}
                    type="button"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>도서 목록 새로고침</span>
                  </button>
                  <button
                    onClick={() => setIsConnectionInfoOpen(true)}
                    type="button"
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    시트 구조 안내
                  </button>
                </div>
              </div>
            ) : filteredBooks.length === 0 ? (
              /* Condition 2: Filter/Search returned zero results */
              <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-md mx-auto shadow-xs">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  검색 결과가 없습니다
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {onlyAvailable && isAllCopiesZero
                    ? '현재 모든 도서의 소장 권수가 0권으로 등록되어 있어 대출 가능 도서가 없습니다.'
                    : '입력하신 검색어 또는 선택한 조건과 일치하는 도서가 없습니다.'}
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('전체');
                      setOnlyAvailable(false);
                    }}
                    type="button"
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    검색 및 필터 초기화
                  </button>
                  {isAllCopiesZero && (
                    <button
                      onClick={() => setIsAppsScriptModalOpen(true)}
                      type="button"
                      className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-amber-800 hover:bg-amber-900 text-white transition-colors cursor-pointer"
                    >
                      해결 방법 보기
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Condition 3: Books grid */
              <div>
                <div className="flex items-center justify-between mb-4 px-1">
                  <p className="text-xs sm:text-sm text-slate-500">
                    총 <strong className="text-slate-800">{filteredBooks.length}</strong>권의 도서가 표시됩니다.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {filteredBooks.map((book) => (
                    <BookCard
                      key={String(book.book_id)}
                      book={book}
                      onClick={() => setSelectedBook(book)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} 열린도서관 · Google Sheets &amp; Google Apps Script 연동</p>
          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <button
              onClick={() => setIsAppsScriptModalOpen(true)}
              className="text-emerald-700 hover:text-emerald-800 font-semibold underline cursor-pointer"
            >
              Apps Script 백엔드 코드 (Code.gs)
            </button>
            <span>·</span>
            <button
              onClick={() => setIsConnectionInfoOpen(true)}
              className="hover:text-slate-700 underline cursor-pointer"
            >
              연동 가이드 및 상태
            </button>
          </div>
        </div>
      </footer>

      {/* Book Detail Modal */}
      <BookDetailModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onOpenAppsScriptGuide={() => setIsAppsScriptModalOpen(true)}
      />

      {/* Connection Info Modal */}
      <ConnectionInfoModal
        isOpen={isConnectionInfoOpen}
        onClose={() => setIsConnectionInfoOpen(false)}
        healthConnected={healthConnected}
        healthMessage={healthMessage}
        onRecheck={checkHealth}
        isChecking={isHealthChecking}
      />

      {/* Apps Script Code Modal */}
      <AppsScriptCodeModal
        isOpen={isAppsScriptModalOpen}
        onClose={() => setIsAppsScriptModalOpen(false)}
      />
    </div>
  );
}

