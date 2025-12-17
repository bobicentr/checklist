import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../../supabaseClient';
// Убрали useSelector — он здесь не нужен

export const apiSlice = createApi({
  // Убрали initialState — apiSlice это не место для хранения фильтров
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Media'],
  endpoints: (builder) => ({
    
    // Принимаем объект args, в котором лежат category и userId
    getMedia: builder.query({
      queryFn: async (args) => {
        const { category, userId } = args || {}; // Деструктуризация с защитой от undefined

        let query = supabase
            .from('media_items')
            .select('*, profiles(name)')
            .order('created_at', { ascending: false });

        // Логика фильтрации по Категории
        if (category && category !== 'all') {
          query = query.eq('category', category);
        }

        // Логика фильтрации по Юзеру (добавили под твой план)
        if (userId && userId !== 'all') {
          query = query.eq('added_by', userId); // Убедись, что колонка называется added_by
        }

        const { data, error } = await query;
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
      invalidatesTags: ['Media'],
    }),

    updateMedia: builder.mutation({
      queryFn: async ({ id, ...updates }) => { 
          const { data, error } = await supabase
              .from('media_items')
              .update(updates)
              .eq('id', id)
              .select();
          if (error) return { error };
          return { data };
        },
        invalidatesTags: ['Media'],
    }),
    deleteMedia: builder.mutation({
      queryFn: async (id) => {
        const {data, error} = await supabase
            .from('media_items')
            .delete()
            .eq('id', id)
            .select();
        if (error) return {error};
        return {data};
      },
      invalidatesTags: ['Media'],
    })
  }),
});

export const { useGetMediaQuery, useAddMediaMutation, useUpdateMediaMutation, useDeleteMediaMutation } = apiSlice;