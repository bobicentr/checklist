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
                const searchLower = arg.toLowerCase(); // Приводим поиск к нижнему регистру
        
                results.forEach((item) => {
                    // 1. Базовая проверка на целостность данных
                    if (!item.collectionId || !item.collectionName || !item.artistName) return;
        
                    // 2. Проверка на дубликаты
                    if (seenIds.has(item.collectionId)) return;
        
                    // 3. ФИЛЬТР "ЛЕВЫХ" ФИТОВ
                    // Проверяем: содержится ли поисковое слово в Имени Артиста ИЛИ в Названии Альбома?
                    const artistMatch = item.artistName.toLowerCase().includes(searchLower);
                    const albumMatch = item.collectionName.toLowerCase().includes(searchLower);
        
                    // Если ни там, ни там нет совпадения — значит это какой-то левый фит, пропускаем
                    if (!artistMatch && !albumMatch) return;
        
                    // Если всё ок — добавляем
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