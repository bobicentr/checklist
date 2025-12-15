import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const apiKey = import.meta.env.VITE_KINOPOISK_API_KEY;

export const kinopoiskApiSlice = createApi({
    reducerPath: 'kinopoiskApi',
    // --- ИСПРАВЛЕНИЕ №2: prepareHeaders теперь ВНУТРИ fetchBaseQuery ---
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://kinopoiskapiunofficial.tech/',
        prepareHeaders: (headers) => {
            if (apiKey) {
                headers.set('X-API-KEY', apiKey); 
            }
            if (!headers.has('Content-Type')) {
                headers.set('Content-Type', 'application/json');
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        searchMovies: builder.query({
            query: ({ searchTerm, type }) => {
                let url = `/api/v2.2/films?keyword=${encodeURIComponent(searchTerm)}&page=1`;
                if (type && type.length > 0) {
                    // Используем forEach, чтобы пройтись по каждому элементу массива
                    type.forEach(mov_type => {
                        // Для каждого типа добавляем к URL соответствующий параметр
                        url += `&type=${mov_type}`;
                    });
                }
                return url
            },
            transformResponse: (response) => {
                return response.items || [];
            }
        })
    })
});

// --- ИСПРАВЛЕНИЕ №1: Экспортируем хук с ПРАВИЛЬНЫМ именем ---
// Оно генерируется из 'searchMovies' -> useLazySearchMoviesQuery
export const { useLazySearchMoviesQuery } = kinopoiskApiSlice;