import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
const api_key = import.meta.env.VITE_OMDB_API_KEY

export const omdbApiSlice = createApi({
    reducerPath: 'omdbapi',
    baseQuery: fetchBaseQuery({baseUrl: 'https://www.omdbapi.com/'}),
    endpoints: (builder) => ({
        searchMovies: builder.query({
            query: (searchTerm) => `?s=${encodeURIComponent(searchTerm)}&apikey=${api_key}`,
            transformResponse: (response) => {
                if (response.Response === "True") {
                    return response.Search; // Возвращаем только массив
                }
                return []; // Иначе возвращаем пустой массив
            }
        })
        
    })
})

export const { useLazySearchMoviesQuery } = omdbApiSlice