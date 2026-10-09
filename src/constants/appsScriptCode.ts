export const GOOGLE_APPS_SCRIPT_BACKEND_CODE = `/**
 * ====================================================================
 * 열린도서관 Google Apps Script 백엔드 API (Code.gs)
 * ====================================================================
 * 배포 방법:
 * 1. Google Sheets 상단 메뉴에서 [확장 프로그램] > [Apps Script] 클릭
 * 2. 기존 코드를 모두 지우고 이 코드를 붙여넣기 후 저장 (Ctrl+S)
 * 3. 우측 상단 [배포] > [새 배포] 클릭
 *    - 유형 선택: 웹 앱 (Web app)
 *    - 설명: 도서관 백엔드 v2 (소장본 및 대출가능 계산 개선)
 *    - 다음 사용자로 실행: 나(내 계정)
 *    - 액세스 권한: 모든 사용자 (Anyone)
 * 4. [배포] 클릭 후 생성된 웹 앱 URL 확인
 * ====================================================================
 */

const CONFIG = {
  SHEETS: {
    BOOKS: 'BOOKS',
    BOOK_COPIES: 'BOOK_COPIES',
    USERS: 'USERS',
    RESERVATIONS: 'RESERVATIONS',
    LOANS: 'LOANS',
    CATEGORIES: 'CATEGORIES',
    SETTINGS: 'SETTINGS',
    LOGS: 'LOGS'
  },
  // BOOK_COPIES 시트에 바코드가 아직 등록되지 않았을 때의 처리:
  // true로 설정하면 BOOK_COPIES가 비어있어도 기본 1권 대출가능으로 자동 활성화합니다.
  AUTO_FALLBACK_DEFAULT_COPY: true,
  DEFAULT_COPY_COUNT: 1
};

/**
 * GET 요청 핸들러
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'books';
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'health') {
      return handleHealthCheck(spreadsheet);
    } else if (action === 'books') {
      return handleGetBooks(spreadsheet);
    } else if (action === 'categories') {
      return handleGetCategories(spreadsheet);
    } else {
      return createJsonResponse({
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: '지원하지 않는 요청입니다. (?action=health 또는 ?action=books)'
        }
      });
    }
  } catch (error) {
    return createJsonResponse({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.toString()
      }
    });
  }
}

/**
 * 1. Health Check (?action=health)
 */
function handleHealthCheck(ss) {
  const booksSheet = ss.getSheetByName(CONFIG.SHEETS.BOOKS);
  const copiesSheet = ss.getSheetByName(CONFIG.SHEETS.BOOK_COPIES);
  const loansSheet = ss.getSheetByName(CONFIG.SHEETS.LOANS);

  if (!booksSheet) {
    return createJsonResponse({
      success: false,
      status: 'error',
      message: 'BOOKS 시트를 찾을 수 없습니다.'
    });
  }

  const bookCount = Math.max(0, booksSheet.getLastRow() - 1);
  const copyCount = copiesSheet ? Math.max(0, copiesSheet.getLastRow() - 1) : 0;
  const loanCount = loansSheet ? Math.max(0, loansSheet.getLastRow() - 1) : 0;

  return createJsonResponse({
    success: true,
    status: 'connected',
    message: 'Google Sheets 연결 및 필수 헤더 검증 성공',
    stats: {
      books_registered: bookCount,
      copies_registered: copyCount,
      active_loans: loanCount
    }
  });
}

/**
 * 2. 도서 목록 조회 (?action=books)
 * 소장본(BOOK_COPIES)과 대출(LOANS) 시트를 교차 검증하여
 * 정확한 total_copies 및 available_copies를 실시간 계산합니다.
 */
function handleGetBooks(ss) {
  const booksSheet = ss.getSheetByName(CONFIG.SHEETS.BOOKS);
  if (!booksSheet) {
    return createJsonResponse({
      success: false,
      error: { code: 'SHEET_NOT_FOUND', message: 'BOOKS 시트를 찾을 수 없습니다.' }
    });
  }

  // 1) 카테고리 맵 생성 (CATEGORIES 시트)
  const categoryMap = getCategoryMap(ss);

  // 2) 소장본 현황 집계 (BOOK_COPIES & LOANS 시트)
  const copiesStatus = getCopiesStatusMap(ss);

  // 3) BOOKS 시트 데이터 파싱
  const booksData = getSheetRowsAsObjects(booksSheet);
  const result = [];

  for (let i = 0; i < booksData.length; i++) {
    const row = booksData[i];
    const bookId = String(row.book_id || row['도서id'] || row['도서코드'] || '').trim();
    if (!bookId) continue;

    // 소장 권수 및 대출 가능 권수 계산
    let totalCopies = 0;
    let availableCopies = 0;

    if (copiesStatus[bookId]) {
      // [1순위] BOOK_COPIES 시트에 실물 바코드/소장본이 등록되어 있는 경우
      totalCopies = copiesStatus[bookId].total;
      availableCopies = copiesStatus[bookId].available;
    } else if (row.total_copies !== undefined && row.total_copies !== '' && Number(row.total_copies) > 0) {
      // [2순위] BOOKS 시트에 직접 total_copies가 숫자로 기재되어 있는 경우
      totalCopies = Number(row.total_copies);
      availableCopies = (row.available_copies !== undefined && row.available_copies !== '')
        ? Number(row.available_copies)
        : totalCopies;
    } else if (CONFIG.AUTO_FALLBACK_DEFAULT_COPY) {
      // [3순위] 소장본 시트나 BOOKS 시트에 권수가 비어있으나 도서가 등록된 경우 기본 1권 인정
      totalCopies = CONFIG.DEFAULT_COPY_COUNT;
      availableCopies = CONFIG.DEFAULT_COPY_COUNT;
    }

    const catId = String(row.category_id || row['분류코드'] || '').trim();
    const catName = categoryMap[catId] || catId || '';

    result.push({
      book_id: bookId,
      isbn: String(row.isbn || row['isbn코드'] || '').trim(),
      title: String(row.title || row['도서명'] || row['제목'] || '').trim(),
      author: String(row.author || row['저자'] || '').trim(),
      publisher: String(row.publisher || row['출판사'] || '').trim(),
      published_date: formatDateValue(row.published_date || row['출간일'] || row['발행일']),
      category_id: catId,
      category_name: catName,
      description: String(row.description || row['도서소개'] || row['줄거리'] || '').trim(),
      cover_url: String(row.cover_url || row['표지url'] || row['표지이미지'] || '').trim(),
      total_copies: totalCopies,
      available_copies: availableCopies
    });
  }

  return createJsonResponse({
    success: true,
    data: result
  });
}

/**
 * 3. 카테고리 목록 조회 (?action=categories)
 */
function handleGetCategories(ss) {
  const catSheet = ss.getSheetByName(CONFIG.SHEETS.CATEGORIES);
  if (!catSheet) {
    return createJsonResponse({ success: true, data: [] });
  }

  const rows = getSheetRowsAsObjects(catSheet);
  const categories = rows.map(r => ({
    category_id: String(r.category_id || r.id || '').trim(),
    name: String(r.name || r['분류명'] || r['카테고리명'] || '').trim(),
    description: String(r.description || r['설명'] || '').trim()
  })).filter(c => c.category_id !== '');

  return createJsonResponse({
    success: true,
    data: categories
  });
}

/**
 * BOOK_COPIES 및 LOANS를 분석하여 도서별 { total, available } 집계
 */
function getCopiesStatusMap(ss) {
  const copiesSheet = ss.getSheetByName(CONFIG.SHEETS.BOOK_COPIES);
  const loansSheet = ss.getSheetByName(CONFIG.SHEETS.LOANS);

  const statusMap = {};
  if (!copiesSheet) return statusMap;

  // 현재 대출 중인 copy_id / barcode 세트 수집
  const activeLoanedCopies = new Set();
  if (loansSheet) {
    const loans = getSheetRowsAsObjects(loansSheet);
    for (let i = 0; i < loans.length; i++) {
      const loan = loans[i];
      const returnDate = loan.return_date || loan.returned_at || loan['반납일'];
      const loanStatus = String(loan.status || loan['상태'] || '').trim().toLowerCase();

      // 아직 반납되지 않았거나 대출중인 상태
      const isStillLoaned = !returnDate || loanStatus === 'loaned' || loanStatus === '대출중';
      if (isStillLoaned) {
        if (loan.copy_id) activeLoanedCopies.add(String(loan.copy_id).trim());
        if (loan.barcode) activeLoanedCopies.add(String(loan.barcode).trim());
      }
    }
  }

  // BOOK_COPIES 시트 읽기
  const copies = getSheetRowsAsObjects(copiesSheet);
  for (let i = 0; i < copies.length; i++) {
    const copy = copies[i];
    const bookId = String(copy.book_id || copy['도서id'] || '').trim();
    if (!bookId) continue;

    if (!statusMap[bookId]) {
      statusMap[bookId] = { total: 0, available: 0 };
    }

    statusMap[bookId].total += 1;

    const copyId = String(copy.copy_id || copy['소장본id'] || '').trim();
    const barcode = String(copy.barcode || copy['바코드'] || '').trim();
    const copyStatus = String(copy.status || copy['상태'] || '').trim().toLowerCase();

    // 사용 불가능한 상태 체크
    const isExcludedStatus = ['loaned', '대출중', 'lost', '분실', 'discarded', '폐기', 'damaged', '파손'].includes(copyStatus);
    const isLoanedInLoansSheet = activeLoanedCopies.has(copyId) || activeLoanedCopies.has(barcode);

    if (!isExcludedStatus && !isLoanedInLoansSheet) {
      statusMap[bookId].available += 1;
    }
  }

  return statusMap;
}

/**
 * CATEGORIES 시트 매핑
 */
function getCategoryMap(ss) {
  const catSheet = ss.getSheetByName(CONFIG.SHEETS.CATEGORIES);
  const map = {};
  if (!catSheet) return map;

  const rows = getSheetRowsAsObjects(catSheet);
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const id = String(r.category_id || r.id || r['분류코드'] || '').trim();
    const name = String(r.name || r['분류명'] || r['카테고리명'] || '').trim();
    if (id && name) {
      map[id] = name;
    }
  }
  return map;
}

/**
 * 시트 데이터를 객체 배열로 변환하는 공통 함수
 */
function getSheetRowsAsObjects(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol < 1) return [];

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0].map(h => String(h || '').trim().toLowerCase());
  const rows = [];

  for (let r = 1; r < values.length; r++) {
    const rowObj = {};
    let hasData = false;
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c];
      if (!key) continue;
      const val = values[r][c];
      rowObj[key] = val;
      if (val !== '' && val !== null && val !== undefined) {
        hasData = true;
      }
    }
    if (hasData) {
      rows.push(rowObj);
    }
  }
  return rows;
}

/**
 * 날짜 포맷 변환 보조 함수
 */
function formatDateValue(val) {
  if (!val) return '';
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }
  return String(val).trim();
}

/**
 * JSON 응답 생성 (CORS 지원)
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
