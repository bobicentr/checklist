import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../../supabaseClient';
import { useSelector } from 'react-redux';

export const apiSlice = createApi({
  reducerPath: 'api',
  // fakeBaseQuery — потому что мы используем библиотеку supabase, а не обычный fetch
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Media'], // Метка, чтобы обновлять список при добавлении
  endpoints: (builder) => ({
    // Получить список (пока просто Select All)
    getMedia: builder.query({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('media_items')
          .select('*, profiles(name)')
          .order('created_at', { ascending: false });
        
        if (error) return { error };
        return { data };
      },
      providesTags: ['Media'],
    }),
    addMedia: builder.mutation({
      queryFn: async (newItem) => {
        const { data, error } = await supabase
          .from('media_items')
          .insert(newItem)
          .select();
    
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ['Media'], // Не забудь это, чтобы обновился список!
    }),
    updateMedia: builder.mutation({
      queryFn: async ({ id, ...updates }) => { // ПРАВИЛЬНО! 
          const { data, error } = await supabase
              .from('media_items')
              .update(updates) // Обновляем все поля, которые пришли в updates
              .eq('id', id)
              .select();
          if (error) return { error };
          return { data };
        },
        invalidatesTags: ['Media'],
    })
  }),
});

export const { useGetMediaQuery, useAddMediaMutation, useUpdateMediaMutation } = apiSlice;