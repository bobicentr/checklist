import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
const api_key = import.meta.env.VITE_OMDB_API_KEY

export const shikimoriApiSlice = createApi({
    reducerPath: 'shikimoriapi',
    baseQuery: fetchBaseQuery({baseUrl: 'https://shikimori.one/api/'}),
    endpoints: (builder) => ({
        searchAnime: builder.query({
            query: (searchTerm) => `/animes?search=${encodeURIComponent(searchTerm)}&limit=20`,
        }),
        searchManga: builder.query({
            query: (searchTerm) => `/mangas?search=${encodeURIComponent(searchTerm)}&limit=20`,
        }),
        searchAnimeById: builder.query({
            query: (id) => `/animes/${encodeURIComponent(id)}`
        }),
        searchMangaById: builder.query({
            query: (id) => `/mangas/${encodeURIComponent(id)}`
        }),
    })
})

export const { useLazySearchAnimeQuery, useLazySearchMangaQuery, useLazySearchAnimeByIdQuery, useLazySearchMangaByIdQuery } = shikimoriApiSlice