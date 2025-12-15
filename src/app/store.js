import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import { apiSlice } from '../features/api/apiSlice'
import { omdbApiSlice } from '../features/api/omdbApiSlice'
import { kinopoiskApiSlice } from '../features/api/kinopoiskApiSlice'
import { shikimoriApiSlice } from '../features/api/shikimoriApiSlice'
import { gamesdbApiSlice } from '../features/api/gamesdbApiSlice'
import { itunesApiSlice } from '../features/api/itunesApiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [omdbApiSlice.reducerPath]: omdbApiSlice.reducer,
    [kinopoiskApiSlice.reducerPath]: kinopoiskApiSlice.reducer,
    [shikimoriApiSlice.reducerPath]: shikimoriApiSlice.reducer,
    [gamesdbApiSlice.reducerPath]: gamesdbApiSlice.reducer,
    [itunesApiSlice.reducerPath]: itunesApiSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
      .concat(omdbApiSlice.middleware)
      .concat(kinopoiskApiSlice.middleware)
      .concat(shikimoriApiSlice.middleware)
      .concat(gamesdbApiSlice.middleware)
      .concat(itunesApiSlice.middleware)
})