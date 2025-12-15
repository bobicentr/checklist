import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const api_key = import.meta.env.VITE_GAMESDB_API_KEY;

export const gamesdbApiSlice = createApi({
    reducerPath: 'gamesdbapi',
    baseQuery: fetchBaseQuery({ baseUrl: '/' }),
    endpoints: (builder) => ({
        searchGames: builder.query({
            query: (searchTerm) => `/api-games/v1/Games/ByGameName?apikey=${api_key}&name=${encodeURIComponent(searchTerm)}`,
            transformResponse: (response) => {
                // Фильтруем только PC игры (platform === 1)
                return (response?.data?.games || []).filter(game => game.platform === 1);
            },
        }),
        searchGameImages: builder.query({
            query: (id) => `/api-games/v1/Games/Images?apikey=${api_key}&games_id=${id}&filter[type]=boxart`,
        }),
        
        // Получение деталей игры
        getGameById: builder.query({
            query: (id) => {
                const fields = 'rating,genres,overview,developers,publishers';
                return `/api-games/v1/Games/ByGameID?apikey=${api_key}&id=${id}&fields=${fields}`;
            },
            transformResponse: (response) => response.data.games[0] || null,
        }),

        // НОВЫЙ ЭНДПОИНТ: Получаем ВЕСЬ список жанров
        getGenresList: builder.query({
            query: () => `/api-games/v1/Genres?apikey=${api_key}`,
            transformResponse: (response) => {
                const genresData = response?.data?.genres;
                // Защита: если жанры пришли как Объект, превращаем в Массив
                if (!Array.isArray(genresData) && typeof genresData === 'object' && genresData !== null) {
                    return Object.values(genresData);
                }
                return genresData || [];
            },
        }),
    })
});

// ОБЯЗАТЕЛЬНО проверьте, что экспортируете useLazyGetGenresListQuery (PLURAL, список)
export const {
    useLazySearchGamesQuery,
    useLazySearchGameImagesQuery,
    useLazyGetGameByIdQuery,
    useLazyGetGenresListQuery // <-- ВАЖНО: Новый хук
} = gamesdbApiSlice;