// TMDB API 설정
const API_KEY = '2605e2d39b1ac3426d4b680d6d3e7037';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p';

// DOM 요소
const moviesGrid = document.getElementById('moviesGrid');
const loading = document.getElementById('loading');
const modal = document.getElementById('movieModal');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');
const header = document.querySelector('.header');
const sectionTitle = document.querySelector('.section-title');

// 히어로 배너 DOM 요소
const heroBanner = document.getElementById('heroBanner');
const heroBackdrop = document.getElementById('heroBackdrop');
const heroVideoContainer = document.getElementById('heroVideoContainer');
const heroVideo = document.getElementById('heroVideo');
const heroContent = document.getElementById('heroContent');
const heroMovieTitle = document.getElementById('heroMovieTitle');
const heroMovieOverview = document.getElementById('heroMovieOverview');
const heroMovieMeta = document.getElementById('heroMovieMeta');
const heroPlayBtn = document.getElementById('heroPlayBtn');
const heroInfoBtn = document.getElementById('heroInfoBtn');
const heroMuteBtn = document.getElementById('heroMuteBtn');

// 히어로 배너 상태
let heroMovie = null;
let heroVideoKey = null;
let isHeroMuted = true;
let heroVideoLoaded = false;

// 네비게이션 DOM 요소
const navHome = document.getElementById('navHome');
const navNowPlaying = document.getElementById('navNowPlaying');
const navPopular = document.getElementById('navPopular');
const navUpcoming = document.getElementById('navUpcoming');
const navGenre = document.getElementById('navGenre');
const genreDropdown = document.getElementById('genreDropdown');
const navLinks = document.querySelectorAll('.nav-links > li > a');

// 검색 관련 DOM 요소 (데스크톱)
const searchToggle = document.getElementById('searchToggle');
const navSearchExpand = document.getElementById('navSearchExpand');
const navSearchClose = document.getElementById('navSearchClose');
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');
const searchResults = document.getElementById('searchResults');
const keywordsSlider = document.getElementById('keywordsSlider');

// 검색 관련 DOM 요소 (모바일)
const searchOverlay = document.getElementById('searchOverlay');
const searchModalClose = document.getElementById('searchModalClose');
const mobileSearchInput = document.getElementById('mobileSearchInput');
const mobileSearchClear = document.getElementById('mobileSearchClear');
const mobileSearchResults = document.getElementById('mobileSearchResults');
const mobileKeywordsSlider = document.getElementById('mobileKeywordsSlider');

// 시네마틱 뷰어 DOM 요소
const cinematicViewer = document.getElementById('cinematicViewer');
const cinematicVideo = document.getElementById('cinematicVideo');
const cinematicInfo = document.getElementById('cinematicInfo');
const cinematicClose = document.getElementById('cinematicClose');
const cinematicLoading = document.getElementById('cinematicLoading');

// 비디오 캐시 (API 호출 최소화)
const videoCache = new Map();

// 검색 디바운스 타이머
let searchDebounceTimer;

// 검색 결과 캐시 (시네마틱 뷰어용)
let lastSearchResults = [];

// 인기 영화 키워드 캐시
let trendingMovies = [];
let currentKeywordIndex = 0;
const KEYWORDS_TO_SHOW = 5;
const KEYWORD_UPDATE_INTERVAL = 5000; // 5초마다 키워드 업데이트

// 현재 선택된 카테고리
let currentCategory = 'home';

// 현재 재생 중인 카드 (한 번에 하나만 재생)
let currentlyPlayingCard = null;
let currentStopFunction = null;

// 카테고리 설정
const categoryConfig = {
    home: {
        title: '🎬 Now Playing',
        heroTitle: '현재 상영 중인 영화',
        heroDesc: '지금 극장에서 만나볼 수 있는 최신 영화들을 확인하세요',
        fetchFn: 'fetchNowPlayingMovies'
    },
    nowPlaying: {
        title: '🎬 현재 상영작',
        heroTitle: '현재 상영 중인 영화',
        heroDesc: '지금 극장에서 만나볼 수 있는 최신 영화들을 확인하세요',
        fetchFn: 'fetchNowPlayingMovies'
    },
    popular: {
        title: '🔥 인기 영화',
        heroTitle: '인기 영화',
        heroDesc: '전 세계에서 가장 인기 있는 영화들을 확인하세요',
        fetchFn: 'fetchPopularMovies'
    },
    upcoming: {
        title: '📅 최신 영화',
        heroTitle: '개봉 예정 영화',
        heroDesc: '곧 개봉하는 기대작들을 미리 만나보세요',
        fetchFn: 'fetchUpcomingMovies'
    },
    allGenres: {
        title: '🎭 장르별 영화',
        heroTitle: '장르별 영화 모음',
        heroDesc: '다양한 장르의 인기 영화들을 한눈에 확인하세요',
        fetchFn: 'fetchAllGenresMovies'
    },
    korean: {
        title: '🇰🇷 한국 영화',
        heroTitle: '한국 영화',
        heroDesc: '대한민국 최고의 영화들을 만나보세요',
        fetchFn: 'fetchKoreanMovies'
    },
    foreign: {
        title: '🌍 해외 영화',
        heroTitle: '해외 영화',
        heroDesc: '전 세계 인기 해외 영화들을 확인하세요',
        fetchFn: 'fetchForeignMovies'
    }
};

// 장르 설정
const genreConfig = {
    28: { name: '액션', emoji: '🎬' },
    12: { name: '모험', emoji: '🗺️' },
    16: { name: '애니메이션', emoji: '🎨' },
    35: { name: '코미디', emoji: '😂' },
    80: { name: '범죄', emoji: '🔫' },
    99: { name: '다큐멘터리', emoji: '📹' },
    18: { name: '드라마', emoji: '🎭' },
    10751: { name: '가족', emoji: '👨‍👩‍👧' },
    14: { name: '판타지', emoji: '🧙' },
    36: { name: '시대극', emoji: '🏰' },
    27: { name: '공포', emoji: '👻' },
    10402: { name: '음악', emoji: '🎵' },
    9648: { name: '미스터리', emoji: '🔍' },
    10749: { name: '로맨스', emoji: '💕' },
    878: { name: 'SF', emoji: '🚀' },
    10770: { name: 'TV 영화', emoji: '📺' },
    53: { name: '스릴러', emoji: '😱' },
    10752: { name: '전쟁', emoji: '⚔️' },
    37: { name: '서부', emoji: '🤠' }
};

// 현재 선택된 장르
let currentGenre = null;

// 현재 상영 중인 영화 가져오기
async function fetchNowPlayingMovies() {
    try {
        const response = await fetch(
            `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=ko-KR&page=1&region=KR`
        );
        
        if (!response.ok) {
            throw new Error('API 요청 실패');
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('영화 데이터를 가져오는 중 오류 발생:', error);
        return [];
    }
}

// 인기 영화 가져오기
async function fetchPopularMovies() {
    try {
        const response = await fetch(
            `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=ko-KR&page=1&region=KR`
        );
        
        if (!response.ok) {
            throw new Error('인기 영화 API 요청 실패');
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('인기 영화 데이터를 가져오는 중 오류 발생:', error);
        return [];
    }
}

// 개봉 예정 영화 가져오기
async function fetchUpcomingMovies() {
    try {
        const response = await fetch(
            `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=ko-KR&page=1&region=KR`
        );
        
        if (!response.ok) {
            throw new Error('개봉 예정 API 요청 실패');
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('개봉 예정 데이터를 가져오는 중 오류 발생:', error);
        return [];
    }
}

// 장르별 영화 가져오기
async function fetchMoviesByGenre(genreId) {
    try {
        // 다큐멘터리(99)는 인기순 + 평점 높은 것 위주로
        let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ko-KR&sort_by=popularity.desc&with_genres=${genreId}&page=1`;
        
        if (genreId === 99) {
            // 다큐멘터리: 인기 + 평점 6.5 이상
            url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ko-KR&sort_by=popularity.desc&with_genres=99&vote_average.gte=6.5&vote_count.gte=100&page=1`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('장르 영화 API 요청 실패');
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('장르 영화 데이터를 가져오는 중 오류 발생:', error);
        return [];
    }
}

// 한국 영화 가져오기
async function fetchKoreanMovies() {
    try {
        const response = await fetch(
            `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ko-KR&sort_by=popularity.desc&with_origin_country=KR&page=1`
        );
        
        if (!response.ok) {
            throw new Error('한국 영화 API 요청 실패');
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('한국 영화 데이터를 가져오는 중 오류 발생:', error);
        return [];
    }
}

// 해외 영화 가져오기 (미국 + 영국 중심)
async function fetchForeignMovies() {
    try {
        const response = await fetch(
            `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ko-KR&sort_by=popularity.desc&with_origin_country=US|GB&without_origin_country=KR&page=1`
        );
        
        if (!response.ok) {
            throw new Error('해외 영화 API 요청 실패');
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('해외 영화 데이터를 가져오는 중 오류 발생:', error);
        return [];
    }
}

// 모든 장르별 영화 가져오기
async function fetchAllGenresMovies() {
    const genreIds = Object.keys(genreConfig);
    const allGenreMovies = {};
    
    // 모든 장르에 대해 병렬로 영화 가져오기
    const promises = genreIds.map(async (genreId) => {
        const movies = await fetchMoviesByGenre(genreId);
        return { genreId: parseInt(genreId), movies: movies.slice(0, 6) }; // 각 장르당 6개
    });
    
    const results = await Promise.all(promises);
    
    results.forEach(result => {
        allGenreMovies[result.genreId] = result.movies;
    });
    
    // 한국영화와 해외영화도 추가
    const koreanMovies = await fetchKoreanMovies();
    const foreignMovies = await fetchForeignMovies();
    
    allGenreMovies['korean'] = koreanMovies.slice(0, 6);
    allGenreMovies['foreign'] = foreignMovies.slice(0, 6);
    
    return allGenreMovies;
}

// 인기 영화 가져오기 (트렌딩 - 키워드용)
async function fetchTrendingMovies() {
    try {
        const response = await fetch(
            `${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=ko-KR`
        );
        
        if (!response.ok) {
            throw new Error('트렌딩 API 요청 실패');
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('트렌딩 데이터를 가져오는 중 오류 발생:', error);
        return [];
    }
}

// 영화 검색
async function searchMovies(query) {
    try {
        const response = await fetch(
            `${BASE_URL}/search/movie?api_key=${API_KEY}&language=ko-KR&query=${encodeURIComponent(query)}&page=1`
        );
        
        if (!response.ok) {
            throw new Error('검색 API 요청 실패');
        }
        
        const data = await response.json();
        return data.results.slice(0, 8); // 최대 8개 결과만 표시
    } catch (error) {
        console.error('검색 중 오류 발생:', error);
        return [];
    }
}

// 영화 예고편 비디오 키 가져오기
async function fetchMovieVideo(movieId) {
    // 캐시에 있으면 캐시에서 반환
    if (videoCache.has(movieId)) {
        return videoCache.get(movieId);
    }
    
    try {
        const response = await fetch(
            `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=ko-KR`
        );
        
        if (!response.ok) {
            throw new Error('비디오 API 요청 실패');
        }
        
        const data = await response.json();
        
        // YouTube 예고편 찾기 (Trailer 또는 Teaser)
        let video = data.results.find(v => 
            v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        );
        
        // 한국어 예고편이 없으면 영어로 다시 시도
        if (!video) {
            const enResponse = await fetch(
                `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`
            );
            const enData = await enResponse.json();
            video = enData.results.find(v => 
                v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
            );
        }
        
        const videoKey = video ? video.key : null;
        videoCache.set(movieId, videoKey);
        return videoKey;
    } catch (error) {
        console.error('비디오 데이터를 가져오는 중 오류 발생:', error);
        videoCache.set(movieId, null);
        return null;
    }
}

// 영화 카드 생성
function createMovieCard(movie, index) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.style.animationDelay = `${index * 0.05}s`;
    card.dataset.movieId = movie.id;
    
    const posterPath = movie.poster_path 
        ? `${IMG_BASE_URL}/w500${movie.poster_path}`
        : null;
    
    const releaseDate = movie.release_date 
        ? new Date(movie.release_date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
        : '개봉일 미정';
    
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    
    card.innerHTML = `
        <div class="poster-container">
            ${posterPath 
                ? `<img class="movie-poster" src="${posterPath}" alt="${movie.title}" loading="lazy">`
                : `<div class="no-poster">🎬</div>`
            }
            <div class="video-container">
                <iframe class="movie-video" allowfullscreen allow="autoplay; encrypted-media"></iframe>
                <div class="video-loading">
                    <div class="video-spinner"></div>
                </div>
            </div>
            <div class="play-overlay">
                <div class="play-button" title="전체화면으로 보기">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <polyline points="9 21 3 21 3 15"></polyline>
                        <line x1="21" y1="3" x2="14" y2="10"></line>
                        <line x1="3" y1="21" x2="10" y2="14"></line>
                    </svg>
                </div>
                <span class="play-text">전체화면</span>
            </div>
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <div class="movie-rating">${rating}</div>
            <div class="movie-date">${releaseDate}</div>
        </div>
    `;
    
    // 호버/터치 이벤트 - 비디오 재생
    let hoverTimeout;
    let isVideoLoaded = false;
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // 비디오 정지 함수 (먼저 정의)
    const stopVideoPreview = () => {
        clearTimeout(hoverTimeout);
        
        const videoContainer = card.querySelector('.video-container');
        const iframe = card.querySelector('.movie-video');
        const videoLoading = card.querySelector('.video-loading');
        
        if (videoContainer) videoContainer.classList.remove('active');
        if (iframe) {
            iframe.classList.remove('loaded');
            // 비디오 완전 정지 (src 비우기)
            iframe.src = '';
        }
        if (videoLoading) {
            videoLoading.classList.remove('active');
            videoLoading.innerHTML = '<div class="spinner"></div>';
        }
        
        isVideoLoaded = false;
        
        // 현재 재생 중인 카드 초기화
        if (currentlyPlayingCard === card) {
            currentlyPlayingCard = null;
            currentStopFunction = null;
        }
    };
    
    // 비디오 재생 함수
    const startVideoPreview = async () => {
        // 이미 다른 카드가 재생 중이면 먼저 정지
        if (currentlyPlayingCard && currentlyPlayingCard !== card && currentStopFunction) {
            currentStopFunction();
        }
        
        // 현재 카드를 재생 중으로 설정
        currentlyPlayingCard = card;
        currentStopFunction = stopVideoPreview;
        
        const videoContainer = card.querySelector('.video-container');
        const iframe = card.querySelector('.movie-video');
        const videoLoading = card.querySelector('.video-loading');
        
        // 딜레이 후 비디오 로드 시작
        hoverTimeout = setTimeout(async () => {
            // 딜레이 후에도 이 카드가 현재 재생 카드인지 확인
            if (currentlyPlayingCard !== card) return;
            
            videoContainer.classList.add('active');
            videoLoading.classList.add('active');
            videoLoading.innerHTML = '<div class="spinner"></div>';
            
            const videoKey = await fetchMovieVideo(movie.id);
            
            // API 응답 후에도 이 카드가 현재 재생 카드인지 확인
            if (currentlyPlayingCard !== card) return;
            
            if (videoKey) {
                // 모바일에서는 음소거로 자동재생 (브라우저 정책)
                const muteParam = isMobile ? 1 : 0;
                iframe.src = `https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=${muteParam}&controls=0&modestbranding=1&rel=0&showinfo=0&playsinline=1&loop=1&playlist=${videoKey}&start=5`;
                isVideoLoaded = true;
                
                iframe.onload = () => {
                    // 로드 완료 후에도 이 카드가 현재 재생 카드인지 확인
                    if (currentlyPlayingCard === card) {
                        videoLoading.classList.remove('active');
                        iframe.classList.add('loaded');
                    }
                };
            } else {
                // 예고편이 없는 경우
                videoLoading.innerHTML = '<span class="no-video">예고편 없음</span>';
            }
        }, isMobile ? 300 : 600);
    };
    
    // 데스크톱: 마우스 이벤트
    if (!isMobile) {
        card.addEventListener('mouseenter', startVideoPreview);
        card.addEventListener('mouseleave', stopVideoPreview);
    }
    
    // 모바일: 터치 이벤트
    let touchStartTime = 0;
    let touchStartY = 0;
    let isTouchHold = false;
    let isScrolling = false;
    
    card.addEventListener('touchstart', (e) => {
        touchStartTime = Date.now();
        touchStartY = e.touches[0].clientY;
        isTouchHold = false;
        isScrolling = false;
        
        // 길게 누르면 프리뷰 재생 (스크롤 중이 아닐 때만)
        hoverTimeout = setTimeout(() => {
            if (!isScrolling) {
                isTouchHold = true;
                startVideoPreview();
            }
        }, 600); // 400ms -> 600ms로 늘려서 실수 방지
    }, { passive: true });
    
    card.addEventListener('touchend', (e) => {
        const touchDuration = Date.now() - touchStartTime;
        
        clearTimeout(hoverTimeout);
        
        if (isScrolling) {
            // 스크롤 중이었으면 아무것도 하지 않음
            isScrolling = false;
            return;
        }
        
        if (isTouchHold) {
            // 길게 눌렀다 뗀 경우 - 비디오 정지
            stopVideoPreview();
            isTouchHold = false;
        } else if (touchDuration < 300) {
            // 짧게 탭한 경우 (300ms 미만) - 시네마틱 뷰어 열기
            openCinematicViewer(movie);
        }
    }, { passive: true });
    
    card.addEventListener('touchmove', (e) => {
        // 터치 이동 거리 계산
        const touchMoveY = e.touches[0].clientY;
        const moveDistance = Math.abs(touchMoveY - touchStartY);
        
        // 10px 이상 이동하면 스크롤로 간주
        if (moveDistance > 10) {
            isScrolling = true;
            clearTimeout(hoverTimeout);
            if (isTouchHold) {
                stopVideoPreview();
                isTouchHold = false;
            }
        }
    }, { passive: true });
    
    // 클릭 시 시네마틱 뷰어 열기 (데스크톱)
    card.addEventListener('click', (e) => {
        if (isMobile) return; // 모바일은 터치 이벤트로 처리
        
        e.stopPropagation();
        stopVideoPreview();
        openCinematicViewer(movie);
    });
    
    return card;
}

// 영화 목록 렌더링
async function renderMovies(category = 'home', genreId = null) {
    try {
        // 현재 재생 중인 비디오 정지
        if (currentStopFunction) {
            currentStopFunction();
            currentlyPlayingCard = null;
            currentStopFunction = null;
        }
        
        // 히어로 배너 업데이트 (비동기로 별도 실행)
        initHeroBanner(category, genreId);
        
        // 로딩 표시
        if (loading) loading.classList.remove('hidden');
        if (moviesGrid) moviesGrid.innerHTML = '';
        
        let movies = [];
        let title = '🎬 Now Playing';
        
        // 장르 영화인 경우
        if (genreId && genreConfig[genreId]) {
            const genre = genreConfig[genreId];
            title = `${genre.emoji} ${genre.name} 영화`;
            movies = await fetchMoviesByGenre(genreId);
        } else if (category === 'allGenres') {
            // 모든 장르별 영화 표시
            const config = categoryConfig[category];
            title = config.title;
            
            // UI 업데이트
            if (sectionTitle) sectionTitle.textContent = title;
            
            // 모든 장르 영화 가져오기
            const allGenreMovies = await fetchAllGenresMovies();
            
            if (loading) loading.classList.add('hidden');
            
            // 장르별 섹션 렌더링
            renderAllGenresView(allGenreMovies);
            return;
        } else {
            // 일반 카테고리
            const config = categoryConfig[category];
            
            // config가 없으면 기본값 사용
            if (!config) {
                title = '🎬 Now Playing';
                movies = await fetchNowPlayingMovies();
            } else {
                title = config.title;
                
                // 해당 카테고리의 영화 가져오기
                switch (config.fetchFn) {
                    case 'fetchNowPlayingMovies':
                        movies = await fetchNowPlayingMovies();
                        break;
                    case 'fetchPopularMovies':
                        movies = await fetchPopularMovies();
                        break;
                    case 'fetchUpcomingMovies':
                        movies = await fetchUpcomingMovies();
                        break;
                    case 'fetchKoreanMovies':
                        movies = await fetchKoreanMovies();
                        break;
                    case 'fetchForeignMovies':
                        movies = await fetchForeignMovies();
                        break;
                    default:
                        movies = await fetchNowPlayingMovies();
                        break;
                }
            }
        }
        
        // UI 업데이트
        if (sectionTitle) sectionTitle.textContent = title;
        
        if (loading) loading.classList.add('hidden');
        
        if (movies.length === 0) {
            moviesGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-secondary);">
                    <p style="font-size: 1.2rem;">영화를 불러올 수 없습니다.</p>
                    <p style="margin-top: 0.5rem;">잠시 후 다시 시도해주세요.</p>
                </div>
            `;
            return;
        }
        
        movies.forEach((movie, index) => {
            const card = createMovieCard(movie, index);
            if (moviesGrid) moviesGrid.appendChild(card);
        });
        
    } catch (error) {
        console.error('영화 목록 렌더링 중 오류 발생:', error);
        if (loading) loading.classList.add('hidden');
        if (moviesGrid) {
            moviesGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-secondary);">
                    <p style="font-size: 1.2rem;">영화를 불러오는 중 오류가 발생했습니다.</p>
                    <p style="margin-top: 0.5rem;">페이지를 새로고침 해주세요.</p>
                </div>
            `;
        }
    }
}

// 모든 장르별 영화 뷰 렌더링
function renderAllGenresView(allGenreMovies) {
    moviesGrid.innerHTML = '';
    moviesGrid.classList.add('all-genres-view');
    
    const genreIds = Object.keys(genreConfig);
    let sectionIndex = 0;
    
    // 일반 장르 렌더링
    genreIds.forEach((genreId) => {
        const genre = genreConfig[genreId];
        const movies = allGenreMovies[genreId] || [];
        
        if (movies.length === 0) return;
        
        renderGenreSection(genre.emoji, genre.name, movies, genreId, sectionIndex, false);
        sectionIndex++;
    });
    
    // 한국영화 섹션
    if (allGenreMovies['korean'] && allGenreMovies['korean'].length > 0) {
        renderGenreSection('🇰🇷', '한국영화', allGenreMovies['korean'], 'korean', sectionIndex, true);
        sectionIndex++;
    }
    
    // 해외영화 섹션
    if (allGenreMovies['foreign'] && allGenreMovies['foreign'].length > 0) {
        renderGenreSection('🌍', '해외영화', allGenreMovies['foreign'], 'foreign', sectionIndex, true);
        sectionIndex++;
    }
}

// 장르 섹션 렌더링 헬퍼 함수
function renderGenreSection(emoji, name, movies, id, sectionIndex, isCategory) {
    // 장르 섹션 컨테이너
    const genreSection = document.createElement('div');
    genreSection.className = 'genre-section';
    genreSection.style.animationDelay = `${sectionIndex * 0.1}s`;
    
    // 장르 헤더
    const genreHeader = document.createElement('div');
    genreHeader.className = 'genre-section-header';
    genreHeader.innerHTML = `
        <h3 class="genre-section-title">${emoji} ${name}</h3>
        <button class="genre-more-btn" data-id="${id}" data-is-category="${isCategory}">
            더보기 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
    `;
    
    // 더보기 버튼 클릭 이벤트
    genreHeader.querySelector('.genre-more-btn').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        const btnId = btn.dataset.id;
        const isCat = btn.dataset.isCategory === 'true';
        
        if (isCat) {
            changeCategory(btnId);
        } else {
            changeGenre(parseInt(btnId));
        }
    });
    
    // 영화 리스트 (가로 스크롤)
    const moviesList = document.createElement('div');
    moviesList.className = 'genre-movies-list';
    
    movies.forEach((movie, index) => {
        const card = createMovieCard(movie, index);
        card.classList.add('genre-movie-card');
        moviesList.appendChild(card);
    });
    
    genreSection.appendChild(genreHeader);
    genreSection.appendChild(moviesList);
    moviesGrid.appendChild(genreSection);
}

// 카테고리 변경
function changeCategory(category) {
    if (currentCategory === category && !currentGenre) return;
    
    currentCategory = category;
    currentGenre = null;
    
    // 장르 뷰 클래스 제거
    moviesGrid.classList.remove('all-genres-view');
    
    // 네비게이션 활성화 상태 업데이트
    navLinks.forEach(link => link.classList.remove('active'));
    
    // 장르 드롭다운 내 활성화 제거
    if (genreDropdown) {
        genreDropdown.querySelectorAll('a').forEach(a => a.classList.remove('active'));
    }
    
    switch (category) {
        case 'home':
            navHome.classList.add('active');
            break;
        case 'nowPlaying':
            navNowPlaying.classList.add('active');
            break;
        case 'popular':
            navPopular.classList.add('active');
            break;
        case 'upcoming':
            navUpcoming.classList.add('active');
            break;
        case 'allGenres':
        case 'korean':
        case 'foreign':
            navGenre.classList.add('active');
            break;
    }
    
    // 모바일 탭바 동기화
    syncMobileTabBar(category);
    
    // 페이지 상단으로 스크롤 (카테고리 변경 시에만)
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // 영화 목록 다시 렌더링
    renderMovies(category);
}

// 장르 변경
function changeGenre(genreId) {
    if (currentGenre === genreId) return;
    
    currentGenre = genreId;
    currentCategory = 'genre';
    
    // 장르 뷰 클래스 제거
    moviesGrid.classList.remove('all-genres-view');
    
    // 네비게이션 활성화 상태 업데이트
    navLinks.forEach(link => link.classList.remove('active'));
    navGenre.classList.add('active');
    
    // 장르 드롭다운 내 활성화
    if (genreDropdown) {
        genreDropdown.querySelectorAll('a').forEach(a => {
            a.classList.remove('active');
            if (parseInt(a.dataset.genre) === genreId) {
                a.classList.add('active');
            }
        });
    }
    
    // 모바일에서 드롭다운 닫기
    const navDropdown = document.querySelector('.nav-dropdown');
    if (navDropdown) {
        navDropdown.classList.remove('active');
    }
    
    // 페이지 상단으로 스크롤 (장르 변경 시에만)
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // 영화 목록 다시 렌더링
    renderMovies('genre', genreId);
}

// 현재 선택된 검색 결과 인덱스
let selectedSearchIndex = -1;

// 검색 결과 렌더링
function renderSearchResults(movies) {
    lastSearchResults = movies; // 캐시 저장
    selectedSearchIndex = -1; // 선택 초기화
    
    if (movies.length === 0) {
        searchResults.innerHTML = `
            <div class="search-no-results">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="M21 21l-4.35-4.35"></path>
                </svg>
                <p>검색 결과가 없습니다</p>
            </div>
        `;
        return;
    }
    
    const resultsHTML = movies.map((movie, index) => {
        const posterPath = movie.poster_path 
            ? `${IMG_BASE_URL}/w92${movie.poster_path}`
            : null;
        const year = movie.release_date ? movie.release_date.split('-')[0] : '';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        
        return `
            <div class="search-result-item" data-movie-id="${movie.id}" data-index="${index}">
                ${posterPath 
                    ? `<img class="search-result-poster" src="${posterPath}" alt="${movie.title}">`
                    : `<div class="search-result-no-poster">🎬</div>`
                }
                <div class="search-result-info">
                    <div class="search-result-title">${movie.title}</div>
                    <div class="search-result-meta">
                        <span class="search-result-rating">★ ${rating}</span>
                        <span class="search-result-year">${year}</span>
                    </div>
                </div>
                <div class="search-result-play-hint">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    예고편 보기
                </div>
            </div>
        `;
    }).join('');
    
    searchResults.innerHTML = `
        <div class="search-results-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="M21 21l-4.35-4.35"></path>
            </svg>
            검색 결과 ${movies.length}개
        </div>
        ${resultsHTML}
        <div class="search-hint">
            <span><kbd>↑</kbd> <kbd>↓</kbd> 이동</span>
            <span><kbd>Enter</kbd> 선택</span>
            <span><kbd>Esc</kbd> 닫기</span>
        </div>
    `;
    
    // 검색 결과 클릭 이벤트 - 시네마틱 뷰어 열기
    searchResults.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const movieId = parseInt(item.dataset.movieId);
            const movie = movies.find(m => m.id === movieId);
            if (movie) {
                openCinematicViewer(movie);
                hideSearchResults();
                searchInput.value = '';
                searchClear.classList.remove('visible');
            }
        });
        
        // 마우스 호버 시 선택 상태 업데이트
        item.addEventListener('mouseenter', () => {
            const index = parseInt(item.dataset.index);
            updateSelectedSearchResult(index);
        });
    });
}

// 선택된 검색 결과 업데이트
function updateSelectedSearchResult(index) {
    const items = searchResults.querySelectorAll('.search-result-item');
    
    // 이전 선택 제거
    items.forEach(item => item.classList.remove('selected'));
    
    // 새 선택 적용
    if (index >= 0 && index < items.length) {
        selectedSearchIndex = index;
        items[index].classList.add('selected');
        
        // 스크롤 조정
        items[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
}

// 키보드로 검색 결과 네비게이션
function handleSearchKeydown(e) {
    if (!searchResults.classList.contains('active')) return;
    
    const items = searchResults.querySelectorAll('.search-result-item');
    if (items.length === 0) return;
    
    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            if (selectedSearchIndex < items.length - 1) {
                updateSelectedSearchResult(selectedSearchIndex + 1);
            } else {
                updateSelectedSearchResult(0); // 처음으로 순환
            }
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            if (selectedSearchIndex > 0) {
                updateSelectedSearchResult(selectedSearchIndex - 1);
            } else {
                updateSelectedSearchResult(items.length - 1); // 끝으로 순환
            }
            break;
            
        case 'Enter':
            e.preventDefault();
            if (selectedSearchIndex >= 0 && lastSearchResults[selectedSearchIndex]) {
                openCinematicViewer(lastSearchResults[selectedSearchIndex]);
                hideSearchResults();
                searchInput.value = '';
                searchClear.classList.remove('visible');
            } else if (lastSearchResults.length > 0) {
                // 선택된 것이 없으면 첫 번째 결과 선택
                openCinematicViewer(lastSearchResults[0]);
                hideSearchResults();
                searchInput.value = '';
                searchClear.classList.remove('visible');
            }
            break;
    }
}

// 검색 결과 표시
function showSearchResults() {
    searchResults.classList.add('active');
}

// 검색 결과 숨기기
function hideSearchResults() {
    searchResults.classList.remove('active');
}

// 검색 로딩 표시
function showSearchLoading() {
    searchResults.innerHTML = `
        <div class="search-loading">
            <div class="mini-spinner"></div>
            <span>검색 중...</span>
        </div>
    `;
    showSearchResults();
}

// 검색 입력 핸들러
function handleSearchInput(e) {
    const query = e.target.value.trim();
    
    // Clear 버튼 표시/숨김
    if (query.length > 0) {
        searchClear.classList.add('visible');
    } else {
        searchClear.classList.remove('visible');
        hideSearchResults();
        return;
    }
    
    // 디바운스 적용
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(async () => {
        if (query.length >= 1) {
            showSearchLoading();
            const results = await searchMovies(query);
            renderSearchResults(results);
        }
    }, 300);
}

// 트렌딩 키워드 렌더링
function renderTrendingKeywords() {
    if (trendingMovies.length === 0) return;
    
    // 현재 인덱스부터 KEYWORDS_TO_SHOW 개의 영화 선택
    const keywordsToShow = [];
    for (let i = 0; i < KEYWORDS_TO_SHOW; i++) {
        const index = (currentKeywordIndex + i) % trendingMovies.length;
        keywordsToShow.push(trendingMovies[index]);
    }
    
    const keywordsHTML = keywordsToShow.map((movie, i) => `
        <span class="keyword-tag" data-movie-id="${movie.id}" style="animation-delay: ${i * 0.1}s">
            ${movie.title}
        </span>
    `).join('');
    
    // 데스크톱 키워드 슬라이더
    if (keywordsSlider) {
        keywordsSlider.innerHTML = keywordsHTML;
        
        // 키워드 클릭 이벤트 - 바로 시네마틱 뷰어 열기
        keywordsSlider.querySelectorAll('.keyword-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const movieId = parseInt(tag.dataset.movieId);
                const movie = trendingMovies.find(m => m.id === movieId);
                if (movie) {
                    closeNavSearch();
                    openCinematicViewer(movie);
                }
            });
        });
    }
    
    // 모바일 키워드 슬라이더
    if (mobileKeywordsSlider) {
        mobileKeywordsSlider.innerHTML = keywordsHTML;
        
        // 키워드 클릭 이벤트
        mobileKeywordsSlider.querySelectorAll('.keyword-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const movieId = parseInt(tag.dataset.movieId);
                const movie = trendingMovies.find(m => m.id === movieId);
                if (movie) {
                    closeSearchOverlay();
                    openCinematicViewer(movie);
                }
            });
        });
    }
}

// 키워드 업데이트 (슬라이딩 효과)
function updateTrendingKeywords() {
    if (trendingMovies.length === 0) return;
    
    // 현재 키워드들에 업데이트 애니메이션 추가
    const currentTags = keywordsSlider.querySelectorAll('.keyword-tag');
    currentTags.forEach(tag => tag.classList.add('updating'));
    
    // 인덱스 이동
    currentKeywordIndex = (currentKeywordIndex + 1) % trendingMovies.length;
    
    // 짧은 딜레이 후 새 키워드 렌더링
    setTimeout(() => {
        renderTrendingKeywords();
    }, 300);
}

// 트렌딩 키워드 초기화
async function initTrendingKeywords() {
    trendingMovies = await fetchTrendingMovies();
    
    if (trendingMovies.length > 0) {
        renderTrendingKeywords();
        
        // 주기적으로 키워드 업데이트
        setInterval(updateTrendingKeywords, KEYWORD_UPDATE_INTERVAL);
    }
}

// ============================================
// 시네마틱 뷰어 (전체화면 예고편)
// ============================================

// 시네마틱 뷰어 열기
async function openCinematicViewer(movie) {
    // 데스크톱 검색창 닫기
    if (navSearchExpand && navSearchExpand.classList.contains('active')) {
        closeNavSearch();
    }
    
    // 모바일 검색 오버레이 닫기
    if (searchOverlay && searchOverlay.classList.contains('active')) {
        closeSearchOverlay();
    }
    
    // 뷰어 활성화
    cinematicViewer.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // 로딩 표시
    cinematicLoading.classList.remove('hidden');
    
    // 영화 정보 렌더링
    renderCinematicInfo(movie);
    
    // 예고편 로드
    const videoKey = await fetchMovieVideo(movie.id);
    const isMobileDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (videoKey) {
        // YouTube 전체화면 자동재생 (모바일은 음소거 상태로 시작, 사용자가 탭하면 소리 재생)
        // playsinline: 모바일에서 인라인 재생
        // enablejsapi: JavaScript API 활성화
        cinematicVideo.src = `https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=${isMobileDevice ? 1 : 0}&controls=1&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${videoKey}&playsinline=1&enablejsapi=1`;
        
        cinematicVideo.onload = () => {
            cinematicLoading.classList.add('hidden');
        };
    } else {
        // 예고편이 없는 경우 - 배경 이미지로 대체
        cinematicLoading.innerHTML = `
            <p style="font-size: 1.2rem;">예고편을 찾을 수 없습니다</p>
            <p style="margin-top: 0.5rem; opacity: 0.7;">영화 정보를 확인해주세요</p>
        `;
        
        // 배경에 백드롭 이미지 표시
        if (movie.backdrop_path) {
            cinematicVideo.style.display = 'none';
            const wrapper = document.querySelector('.cinematic-video-wrapper');
            wrapper.style.background = `url(${IMG_BASE_URL}/original${movie.backdrop_path}) center/cover no-repeat`;
        }
    }
}

// 시네마틱 정보 렌더링
function renderCinematicInfo(movie) {
    const releaseDate = movie.release_date 
        ? new Date(movie.release_date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : '개봉일 미정';
    
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const voteCount = movie.vote_count ? movie.vote_count.toLocaleString() : '0';
    const year = movie.release_date ? movie.release_date.split('-')[0] : '';
    
    cinematicInfo.innerHTML = `
        <h1 class="cinematic-title">${movie.title}</h1>
        ${movie.original_title !== movie.title 
            ? `<p class="cinematic-original-title">${movie.original_title}</p>`
            : ''
        }
        <div class="cinematic-meta">
            <div class="cinematic-meta-item rating">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                ${rating} (${voteCount}명)
            </div>
            <div class="cinematic-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                ${releaseDate}
            </div>
            ${year ? `
            <div class="cinematic-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${year}년
            </div>
            ` : ''}
        </div>
        <p class="cinematic-overview">${movie.overview || '줄거리 정보가 없습니다.'}</p>
        <div class="cinematic-buttons">
            <button class="cinematic-btn cinematic-btn-primary" onclick="window.open('https://www.themoviedb.org/movie/${movie.id}', '_blank')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                상세 정보
            </button>
            <button class="cinematic-btn cinematic-btn-secondary" onclick="closeCinematicViewer()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                돌아가기
            </button>
        </div>
    `;
}

// 시네마틱 뷰어 닫기
function closeCinematicViewer() {
    cinematicViewer.classList.remove('active');
    document.body.style.overflow = '';
    
    // 비디오 정지
    cinematicVideo.src = '';
    cinematicVideo.style.display = '';
    
    // 배경 초기화
    const wrapper = document.querySelector('.cinematic-video-wrapper');
    wrapper.style.background = '';
    
    // 로딩 상태 초기화
    cinematicLoading.classList.remove('hidden');
    cinematicLoading.innerHTML = `
        <div class="cinematic-spinner"></div>
        <p>예고편을 불러오는 중...</p>
    `;
}

// 모달 열기 (기존 모달 - 필요시 사용)
function openModal(movie) {
    const backdropPath = movie.backdrop_path 
        ? `${IMG_BASE_URL}/w1280${movie.backdrop_path}`
        : movie.poster_path 
            ? `${IMG_BASE_URL}/w780${movie.poster_path}`
            : null;
    
    const releaseDate = movie.release_date 
        ? new Date(movie.release_date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : '개봉일 미정';
    
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const voteCount = movie.vote_count ? movie.vote_count.toLocaleString() : '0';
    
    modalBody.innerHTML = `
        ${backdropPath 
            ? `<img class="modal-backdrop" src="${backdropPath}" alt="${movie.title}">`
            : `<div class="modal-backdrop" style="background: linear-gradient(135deg, #2a2a2a, #1a1a1a); display: flex; align-items: center; justify-content: center; font-size: 4rem;">🎬</div>`
        }
        <div class="modal-details">
            <h2 class="modal-title">${movie.title}</h2>
            ${movie.original_title !== movie.title 
                ? `<p style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.9rem;">${movie.original_title}</p>`
                : ''
            }
            <div class="modal-meta">
                <span class="rating">★ ${rating} (${voteCount}명)</span>
                <span>📅 ${releaseDate}</span>
            </div>
            <p class="modal-overview">${movie.overview || '줄거리 정보가 없습니다.'}</p>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 모달 닫기
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// 이벤트 리스너
modalClose.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// 시네마틱 뷰어 닫기 버튼
cinematicClose.addEventListener('click', closeCinematicViewer);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (cinematicViewer.classList.contains('active')) {
            closeCinematicViewer();
        } else if (modal.classList.contains('active')) {
            closeModal();
        }
        if (searchResults.classList.contains('active')) {
            hideSearchResults();
        }
    }
});

// 검색 이벤트 리스너
// 데스크톱 검색 이벤트
if (searchInput) {
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('keydown', handleSearchKeydown);
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length > 0) {
            showSearchResults();
        }
    });
}

if (searchClear) {
    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.classList.remove('visible');
        hideSearchResults();
        selectedSearchIndex = -1;
        searchInput.focus();
    });
}

// 모바일 검색 이벤트
if (mobileSearchInput) {
    mobileSearchInput.addEventListener('input', (e) => {
        handleMobileSearchInput(e);
    });
    mobileSearchInput.addEventListener('keydown', (e) => {
        handleMobileSearchKeydown(e);
    });
}

if (mobileSearchClear) {
    mobileSearchClear.addEventListener('click', () => {
        mobileSearchInput.value = '';
        mobileSearchClear.classList.remove('visible');
        if (mobileSearchResults) {
            mobileSearchResults.innerHTML = '';
            mobileSearchResults.classList.remove('active');
        }
        mobileSearchInput.focus();
    });
}

// 모바일 검색 입력 핸들러
let mobileSearchDebounceTimer;
function handleMobileSearchInput(e) {
    const query = e.target.value.trim();
    
    // X 버튼 표시/숨김
    if (mobileSearchClear) {
        if (query.length > 0) {
            mobileSearchClear.classList.add('visible');
        } else {
            mobileSearchClear.classList.remove('visible');
        }
    }
    
    // 디바운스
    clearTimeout(mobileSearchDebounceTimer);
    
    if (query.length < 2) {
        if (mobileSearchResults) {
            mobileSearchResults.innerHTML = '';
            mobileSearchResults.classList.remove('active');
        }
        return;
    }
    
    mobileSearchDebounceTimer = setTimeout(async () => {
        const movies = await searchMovies(query);
        renderMobileSearchResults(movies);
    }, 300);
}

// 모바일 검색 결과 렌더링
function renderMobileSearchResults(movies) {
    if (!mobileSearchResults) return;
    
    if (movies.length === 0) {
        mobileSearchResults.innerHTML = `
            <div class="search-no-results">
                <p>검색 결과가 없습니다</p>
            </div>
        `;
        mobileSearchResults.classList.add('active');
        return;
    }
    
    mobileSearchResults.innerHTML = movies.slice(0, 8).map(movie => {
        const posterPath = movie.poster_path 
            ? `${IMG_BASE_URL}/w92${movie.poster_path}`
            : 'https://via.placeholder.com/92x138/1a1a24/666?text=No+Image';
        const year = movie.release_date ? movie.release_date.substring(0, 4) : '';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        
        return `
            <div class="search-result-item" data-movie-id="${movie.id}">
                <img src="${posterPath}" alt="${movie.title}" class="search-result-poster">
                <div class="search-result-info">
                    <div class="search-result-title">${movie.title}</div>
                    <div class="search-result-meta">${year} · ⭐ ${rating}</div>
                </div>
            </div>
        `;
    }).join('');
    
    mobileSearchResults.classList.add('active');
    
    // 클릭 이벤트
    mobileSearchResults.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', async () => {
            const movieId = parseInt(item.dataset.movieId);
            const movie = movies.find(m => m.id === movieId);
            if (movie) {
                closeSearchOverlay();
                openCinematicViewer(movie);
            }
        });
    });
}

// 모바일 검색 키보드 핸들러
function handleMobileSearchKeydown(e) {
    if (e.key === 'Enter') {
        const firstResult = mobileSearchResults?.querySelector('.search-result-item');
        if (firstResult) {
            firstResult.click();
        }
    }
}

// 스크롤 시 헤더 스타일 변경 (throttle 적용으로 성능 최적화)
let headerScrollTicking = false;
window.addEventListener('scroll', () => {
    if (!headerScrollTicking) {
        window.requestAnimationFrame(() => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            headerScrollTicking = false;
        });
        headerScrollTicking = true;
    }
}, { passive: true });

// 네비게이션 이벤트 리스너
navHome.addEventListener('click', (e) => {
    e.preventDefault();
    changeCategory('home');
});

navNowPlaying.addEventListener('click', (e) => {
    e.preventDefault();
    changeCategory('nowPlaying');
});

navPopular.addEventListener('click', (e) => {
    e.preventDefault();
    changeCategory('popular');
});

navUpcoming.addEventListener('click', (e) => {
    e.preventDefault();
    changeCategory('upcoming');
});

// 장르 드롭다운 이벤트
if (navGenre) {
    navGenre.addEventListener('click', (e) => {
        e.preventDefault();
        const navDropdown = navGenre.closest('.nav-dropdown');
        
        // 모바일에서는 드롭다운 토글
        if (window.innerWidth <= 768) {
            navDropdown.classList.toggle('active');
        } else {
            // 데스크톱에서는 모든 장르 페이지로 이동
            changeCategory('allGenres');
            navDropdown.classList.remove('active');
        }
    });
}

// 장르 아이템 클릭/터치 이벤트
if (genreDropdown) {
    genreDropdown.querySelectorAll('a').forEach(genreLink => {
        // 클릭 및 터치 핸들러
        const handleGenreSelect = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // 드롭다운 닫기 (공통) - closeGenreDropdown 함수 사용
            closeGenreDropdown();
            
            // 카테고리 (한국영화/해외영화)
            const category = genreLink.dataset.category;
            if (category) {
                // 약간의 딜레이 후 카테고리 변경 (드롭다운 닫힘 애니메이션 후)
                setTimeout(() => {
                    changeCategory(category);
                    syncMobileTabBar('allGenres');
                }, 100);
                return;
            }
            
            // 장르
            const genreId = parseInt(genreLink.dataset.genre);
            if (genreId) {
                // 약간의 딜레이 후 장르 변경 (드롭다운 닫힘 애니메이션 후)
                setTimeout(() => {
                    changeGenre(genreId);
                    syncMobileTabBar('allGenres');
                }, 100);
            }
        };
        
        // 클릭 이벤트 (데스크톱)
        genreLink.addEventListener('click', handleGenreSelect);
        
        // 터치 이벤트 (모바일) - touchend로 처리
        genreLink.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleGenreSelect(e);
        }, { passive: false });
    });
}

// 로고 클릭 시 홈으로
document.querySelector('.logo').addEventListener('click', () => {
    changeCategory('home');
});

// 장르 드롭다운 닫기 함수 (전역)
function closeGenreDropdown() {
    const navDropdown = document.querySelector('.nav-dropdown');
    const wrapper = document.querySelector('.genre-dropdown-wrapper');
    
    if (!navDropdown || !navDropdown.classList.contains('active')) {
        return; // 이미 닫혀있으면 아무것도 안함
    }
    
    if (wrapper) {
        // 부드러운 사라짐 애니메이션
        wrapper.style.opacity = '0';
        wrapper.style.transform = 'translateY(calc(100% + 70px))';
        wrapper.style.visibility = 'hidden';
    }
    
    // 애니메이션 후 클래스 제거
    setTimeout(() => {
        if (navDropdown) {
            navDropdown.classList.remove('active');
        }
        if (wrapper) {
            wrapper.style.opacity = '';
            wrapper.style.transform = '';
            wrapper.style.visibility = '';
        }
        // body 스크롤 복구 및 오버레이 제거
        document.body.style.overflow = '';
        document.body.classList.remove('genre-dropdown-open');
    }, 300);
}

// 장르 드롭다운 열기 함수
function openGenreDropdown() {
    const navDropdown = document.querySelector('.nav-dropdown');
    const wrapper = document.querySelector('.genre-dropdown-wrapper');
    
    if (navDropdown) {
        navDropdown.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.body.classList.add('genre-dropdown-open');
        
        // 모바일에서 직접 스타일 적용 (CSS 우선순위 문제 해결)
        if (wrapper && window.innerWidth <= 768) {
            wrapper.style.opacity = '1';
            wrapper.style.visibility = 'visible';
            wrapper.style.transform = 'translateY(0)';
        }
    }
}

// 장르 드롭다운 닫기 버튼 (모바일)
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('genreDropdownClose');
    if (closeBtn) {
        // 모든 이벤트 타입에 대응
        ['click', 'touchstart', 'pointerdown'].forEach(eventType => {
            closeBtn.addEventListener(eventType, (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                closeGenreDropdown();
            }, { passive: false, capture: true });
        });
    }
});

// 드롭다운 외부 클릭 시 닫기
document.addEventListener('click', (e) => {
    const navDropdown = document.querySelector('.nav-dropdown');
    if (navDropdown && !navDropdown.contains(e.target)) {
        navDropdown.classList.remove('active');
    }
});

// 검색 오버레이 열기
// 모바일 여부 확인
function isMobileDevice() {
    return window.innerWidth <= 768;
}

// 데스크톱: 네비게이션 바 위 검색창 열기
function openNavSearch() {
    if (navSearchExpand) {
        navSearchExpand.classList.add('active');
        setTimeout(() => {
            searchInput.focus();
        }, 300);
    }
}

// 데스크톱: 네비게이션 바 위 검색창 닫기
function closeNavSearch() {
    if (navSearchExpand) {
        navSearchExpand.classList.remove('active');
        if (searchInput) {
            searchInput.value = '';
            searchInput.blur();
        }
        if (searchClear) searchClear.classList.remove('visible');
        if (searchResults) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('active');
        }
    }
}

// 모바일: 검색 오버레이 열기
function openSearchOverlay() {
    if (searchOverlay) {
        searchOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            if (mobileSearchInput) mobileSearchInput.focus();
        }, 300);
    }
}

// 모바일: 검색 오버레이 닫기
function closeSearchOverlay() {
    if (searchOverlay) {
        searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    if (mobileSearchInput) mobileSearchInput.value = '';
    if (mobileSearchClear) mobileSearchClear.classList.remove('visible');
    if (mobileSearchResults) {
        mobileSearchResults.innerHTML = '';
        mobileSearchResults.classList.remove('active');
    }
}

// 검색 토글 버튼 클릭
if (searchToggle) {
    searchToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isMobileDevice()) {
            // 모바일: 오버레이 모달
            openSearchOverlay();
        } else {
            // 데스크톱: 네비게이션 바 위 확장
            openNavSearch();
        }
    });
}

// 데스크톱: 검색창 닫기 버튼
if (navSearchClose) {
    navSearchClose.addEventListener('click', () => {
        closeNavSearch();
    });
}

// 모바일: 검색 모달 닫기 버튼
if (searchModalClose) {
    searchModalClose.addEventListener('click', () => {
        closeSearchOverlay();
    });
}

// 모바일: 오버레이 배경 클릭 시 닫기
if (searchOverlay) {
    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
            closeSearchOverlay();
        }
    });
}

// ESC 키로 검색 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (navSearchExpand && navSearchExpand.classList.contains('active')) {
            closeNavSearch();
        }
        if (searchOverlay && searchOverlay.classList.contains('active')) {
            closeSearchOverlay();
        }
    }
});

// 데스크톱: 검색창 외부 클릭 시 닫기
document.addEventListener('click', (e) => {
    if (navSearchExpand && navSearchExpand.classList.contains('active')) {
        // 검색창 내부 클릭이 아닌 경우에만 닫기
        if (!navSearchExpand.contains(e.target) && !searchToggle.contains(e.target)) {
            closeNavSearch();
        }
    }
});

// 히어로 배너 초기화
async function initHeroBanner(category = 'home', genreId = null) {
    try {
        let movies = [];
        
        // 카테고리에 맞는 영화 가져오기
        if (genreId) {
            // 특정 장르
            movies = await fetchMoviesByGenre(genreId);
        } else {
            switch (category) {
                case 'home':
                case 'nowPlaying':
                    movies = await fetchNowPlayingMovies();
                    break;
                case 'popular':
                    movies = await fetchPopularMovies();
                    break;
                case 'upcoming':
                    movies = await fetchUpcomingMovies();
                    break;
                case 'allGenres':
                    movies = await fetchPopularMovies();
                    break;
                case 'korean':
                    movies = await fetchKoreanMovies();
                    break;
                case 'foreign':
                    movies = await fetchForeignMovies();
                    break;
                default:
                    movies = await fetchNowPlayingMovies();
            }
        }
        
        if (movies.length === 0) return;
        
        // 가장 인기 있는 영화 선택 (backdrop이 있는 것 우선)
        heroMovie = movies.find(m => m.backdrop_path) || movies[0];
        
        // 배경 이미지 설정
        const backdropUrl = heroMovie.backdrop_path 
            ? `${IMG_BASE_URL}/original${heroMovie.backdrop_path}`
            : `${IMG_BASE_URL}/original${heroMovie.poster_path}`;
        
        if (heroBackdrop) {
            heroBackdrop.style.backgroundImage = `url(${backdropUrl})`;
        }
        
        // 영화 정보 표시
        if (heroMovieTitle) {
            heroMovieTitle.textContent = heroMovie.title;
        }
        
        if (heroMovieOverview) {
            const overview = heroMovie.overview || '줄거리 정보가 없습니다.';
            heroMovieOverview.textContent = overview.length > 200 
                ? overview.substring(0, 200) + '...' 
                : overview;
        }
        
        if (heroMovieMeta) {
            const rating = heroMovie.vote_average ? heroMovie.vote_average.toFixed(1) : 'N/A';
            const year = heroMovie.release_date ? heroMovie.release_date.substring(0, 4) : '';
            heroMovieMeta.innerHTML = `
                <span class="hero-rating">⭐ ${rating}</span>
                <span class="hero-year">${year}</span>
            `;
        }
        
        // 예고편 로드
        heroVideoKey = await fetchMovieVideo(heroMovie.id);
        
        if (heroVideoKey && heroVideo) {
            // 자동 재생 (음소거 상태로 시작 - 모바일/데스크톱 모두 자동재생 가능)
            // playsinline: iOS에서 인라인 재생 허용
            // enablejsapi: JavaScript API 활성화
            heroVideo.src = `https://www.youtube.com/embed/${heroVideoKey}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&playsinline=1&loop=1&playlist=${heroVideoKey}&start=10&enablejsapi=1`;
            heroVideoLoaded = true;
            
            // 비디오 로드 후 컨테이너 표시
            heroVideo.onload = () => {
                if (heroVideoContainer) {
                    heroVideoContainer.classList.add('loaded');
                }
            };
            
            // 3초 후 비디오 컨테이너 표시 (로딩 시간 고려)
            setTimeout(() => {
                if (heroVideoContainer) {
                    heroVideoContainer.classList.add('loaded');
                }
            }, 3000);
        }
        
    } catch (error) {
        console.error('히어로 배너 초기화 오류:', error);
    }
}

// 히어로 배너 음소거 토글
function toggleHeroMute() {
    if (!heroVideoKey || !heroVideo) return;
    
    isHeroMuted = !isHeroMuted;
    
    // iframe src 업데이트 (mute 파라미터 변경)
    const muteParam = isHeroMuted ? 1 : 0;
    heroVideo.src = `https://www.youtube.com/embed/${heroVideoKey}?autoplay=1&mute=${muteParam}&controls=0&modestbranding=1&rel=0&showinfo=0&playsinline=1&loop=1&playlist=${heroVideoKey}&start=10&enablejsapi=1`;
    
    // 버튼 아이콘 변경
    if (heroMuteBtn) {
        const muteIcon = heroMuteBtn.querySelector('.mute-icon');
        const unmuteIcon = heroMuteBtn.querySelector('.unmute-icon');
        
        if (isHeroMuted) {
            muteIcon.style.display = 'block';
            unmuteIcon.style.display = 'none';
        } else {
            muteIcon.style.display = 'none';
            unmuteIcon.style.display = 'block';
        }
    }
}

// 히어로 배너 이벤트 리스너
if (heroMuteBtn) {
    heroMuteBtn.addEventListener('click', toggleHeroMute);
}

if (heroPlayBtn) {
    heroPlayBtn.addEventListener('click', () => {
        if (heroMovie) {
            openCinematicViewer(heroMovie);
        }
    });
}

if (heroInfoBtn) {
    heroInfoBtn.addEventListener('click', () => {
        if (heroMovie) {
            openCinematicViewer(heroMovie);
        }
    });
}

// 히어로 배너 클릭 시 시네마틱 뷰어 열기 (모바일 스크롤 구분)
if (heroBanner) {
    let heroTouchStartY = 0;
    let heroTouchStartTime = 0;
    let heroIsScrolling = false;
    
    // 터치 시작
    heroBanner.addEventListener('touchstart', (e) => {
        heroTouchStartY = e.touches[0].clientY;
        heroTouchStartTime = Date.now();
        heroIsScrolling = false;
    }, { passive: true });
    
    // 터치 이동 (스크롤 감지)
    heroBanner.addEventListener('touchmove', (e) => {
        const moveDistance = Math.abs(e.touches[0].clientY - heroTouchStartY);
        if (moveDistance > 10) {
            heroIsScrolling = true;
        }
    }, { passive: true });
    
    // 터치 종료
    heroBanner.addEventListener('touchend', (e) => {
        const touchDuration = Date.now() - heroTouchStartTime;
        
        // 스크롤 중이 아니고, 짧은 탭이고, 버튼이 아닌 경우에만
        if (!heroIsScrolling && touchDuration < 300 && !e.target.closest('button') && heroMovie) {
            openCinematicViewer(heroMovie);
        }
    }, { passive: true });
    
    // 데스크톱 클릭
    heroBanner.addEventListener('click', (e) => {
        // 모바일에서는 터치 이벤트로 처리
        if ('ontouchstart' in window) return;
        
        // 버튼 클릭이 아닌 경우에만
        if (!e.target.closest('button') && heroMovie) {
            openCinematicViewer(heroMovie);
        }
    });
}

// 모바일 탭바 이벤트
const mobileTabBar = document.getElementById('mobileTabBar');
const mobileGenreDropdown = document.querySelector('.genre-dropdown-wrapper');

if (mobileTabBar) {
    const tabItems = mobileTabBar.querySelectorAll('.tab-item');
    
    tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;
            
            // 장르 탭 클릭 시 드롭다운 토글
            if (category === 'allGenres') {
                const navDropdown = document.querySelector('.nav-dropdown');
                if (navDropdown) {
                    const isActive = navDropdown.classList.contains('active');
                    
                    if (isActive) {
                        // 닫기
                        closeGenreDropdown();
                    } else {
                        // 열기
                        openGenreDropdown();
                    }
                }
                // 활성화 상태 업데이트
                tabItems.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                return;
            }
            
            // 다른 탭 클릭 시 드롭다운 닫기
            closeGenreDropdown();
            
            // 활성화 상태 업데이트
            tabItems.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 데스크톱 네비게이션도 동기화
            navLinks.forEach(link => link.classList.remove('active'));
            
            // 카테고리 변경
            changeCategory(category);
        });
    });
}

// 카테고리 변경 시 탭바도 동기화하는 함수
function syncMobileTabBar(category) {
    if (!mobileTabBar) return;
    
    const tabItems = mobileTabBar.querySelectorAll('.tab-item');
    tabItems.forEach(tab => {
        if (tab.dataset.category === category) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

// 모바일 스크롤 프로그레스 바
const scrollProgressBar = document.getElementById('scrollProgressBar');

function updateScrollProgress() {
    if (!scrollProgressBar) return;
    
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;
    
    scrollProgressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
}

// 스크롤 이벤트 (throttle 적용 + passive로 성능 최적화)
let scrollTicking = false;
window.addEventListener('scroll', () => {
    if (!scrollTicking) {
        window.requestAnimationFrame(() => {
            updateScrollProgress();
            scrollTicking = false;
        });
        scrollTicking = true;
    }
}, { passive: true });

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initHeroBanner();
    renderMovies('home');
    initTrendingKeywords();
    updateScrollProgress(); // 초기 스크롤 위치 반영
});
