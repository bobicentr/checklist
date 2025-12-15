import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

export const itunesApiSlice = createApi({
    reducerPath: 'itunesapi',
    baseQuery: fetchBaseQuery({ baseUrl: '/' }),
    endpoints: (builder) => ({
        searchAlbums: builder.query({
            // Оставляем обычный запрос
            query: (searchTerm) => `/api-music/search?term=${encodeURIComponent(searchTerm)}&media=music&country=KZ`,
        
            // (response, meta, arg) -> arg это наш searchTerm
            transformResponse: (response, meta, arg) => {
                const results = response.results || [];
                const uniqueAlbums = [];
                const seenIds = new Set();
                
                // 1. Разбиваем поисковый запрос на отдельные слова
                // "code80 tears" -> ["code80", "tears"]
                const searchTerms = arg.toLowerCase().split(' ').filter(word => word.length > 0);
        
                results.forEach((item) => {
                    if (!item.collectionId || !item.collectionName || !item.artistName) return;
        
                    if (seenIds.has(item.collectionId)) return;
        
                    // 2. Создаем одну большую строку из Артиста и Названия альбома
                    const itemText = `${item.artistName} ${item.collectionName}`.toLowerCase();
        
                    // 3. ПРОВЕРКА: Все ли слова из запроса есть в этой строке?
                    // Если ищем "code80 tears", то и "code80", и "tears" должны быть в itemText
                    const isMatch = searchTerms.every(term => itemText.includes(term));
        
                    if (!isMatch) return;
        
                    seenIds.add(item.collectionId);
                    uniqueAlbums.push(item);
                });
        
                return uniqueAlbums;
            },
        }),
        searchArtist: builder.query({
            query: (searchTerm) => `/api-music/search?term=${encodeURIComponent(searchTerm)}&media=music&entity=musicArtist`,
            transformResponse: (response) => response.results,
        }),
    })
})

export const {
    useLazySearchArtistQuery,
    useLazySearchAlbumsQuery
} = itunesApiSlice