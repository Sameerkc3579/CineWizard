import { Movie, MovieDetails, TMDBResponse, Credits } from '@/types/tmdb';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

// Mock data for development when API Key is missing
const MOCK_MOVIES: Movie[] = [
    {
        id: 1,
        title: "Cyberpunk: Edgerunners (Mock)",
        original_title: "Cyberpunk: Edgerunners",
        overview: "In a dystopia riddled with corruption and cybernetic implants, a talented but reckless street kid strives to become a mercenary outlaw — an edgerunner.",
        poster_path: "/3Q0hd3y2q35e5d365d8.jpg", // Placeholder
        backdrop_path: "/54yOUEw958VHu90uIp00.jpg",
        release_date: "2022-09-13",
        vote_average: 8.6,
        vote_count: 1200,
        popularity: 95.5,
        genre_ids: [16, 878, 28],
        adult: false,
        video: false,
    },
    {
        id: 2,
        title: "Blade Runner 2049 (Mock)",
        original_title: "Blade Runner 2049",
        overview: "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who's been missing for thirty years.",
        poster_path: "/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
        backdrop_path: "/ilRyASD87jdCpR5y60Q.jpg",
        release_date: "2017-10-04",
        vote_average: 7.5,
        vote_count: 12000,
        popularity: 80.0,
        genre_ids: [878, 18, 53],
        adult: false,
        video: false,
    }
];

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    if (!API_KEY) {
        console.warn("TMDB_API_KEY is missing. Returning mock data.");
        // Return empty or mock based on endpoint expectation?
        // For now, if we are fetching a list, return mock list wrapped in TMDBResponse
        if (endpoint.includes('movie/popular') || endpoint.includes('trending') || endpoint.includes('search')) {
            return {
                page: 1,
                results: MOCK_MOVIES as unknown as T[], // A bit hacky but works for mock
                total_pages: 1,
                total_results: MOCK_MOVIES.length
            } as unknown as T;
        }
        throw new Error("TMDB API Key missing and no mock for this endpoint");
    }

    const queryParams = new URLSearchParams({
        api_key: API_KEY,
        language: 'en-US',
        ...params,
    });

    const res = await fetch(`${BASE_URL}${endpoint}?${queryParams.toString()}`, {
        next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
        throw new Error(`TMDB API Error: ${res.status} ${res.statusText}`);
    }

    return res.json();
}

export const tmdb = {
    getTrending: () => fetchTMDB<TMDBResponse<Movie>>('/trending/movie/day'),
    getPopular: () => fetchTMDB<TMDBResponse<Movie>>('/movie/popular'),
    getMovieDetails: (id: number) => fetchTMDB<MovieDetails>(`/movie/${id}`),
    getMovieCredits: (id: number) => fetchTMDB<Credits>(`/movie/${id}/credits`),
    getRecommendations: (id: number) => fetchTMDB<TMDBResponse<Movie>>(`/movie/${id}/recommendations`),
    searchMovies: (query: string) => fetchTMDB<TMDBResponse<Movie>>('/search/movie', { query }),
    getDiscover: (genreId: string) => fetchTMDB<TMDBResponse<Movie>>('/discover/movie', { with_genres: genreId, sort_by: 'popularity.desc' }),
    getMovieVideos: (id: number) => fetchTMDB<{ id: number; results: { key: string; site: string; type: string }[] }>(`/movie/${id}/videos`),

    getImageUrl: (path: string | null, size: 'w300' | 'w500' | 'w780' | 'original' = 'w500') => {
        if (!path) return '/placeholder-movie.png'; // Need a placeholder asset
        return `https://image.tmdb.org/t/p/${size}${path}`;
    }
};
