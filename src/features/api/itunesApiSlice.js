import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

export const itunesApiSlice = createApi({
    reducerPath: 'itunesapi',
    baseQuery: fetchBaseQuery({ baseUrl: '/' }),
    endpoints: (builder) => ({
        searchAlbums: builder.query({
            query: (searchTerm) => `/api-music/search?term=${encodeURIComponent(searchTerm)}&media=music&entity=album`,
        }),
        searchArtist: builder.query({
            query: (searchTerm) => `/api-music/search?term=${encodeURIComponent(searchTerm)}&media=music&entity=musicArtist`,
        }),
    })
})

export const {
    useLazySearchArtistQuery,
    useLazySearchAlbumsQuery
} = itunesApiSlice