import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../../supabaseClient';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Media'],
  endpoints: (builder) => ({
    
    getMedia: builder.query({
      queryFn: async (args) => {
        const { category } = args || {}; // Деструктуризация с защитой от undefined

        let query = supabase
            .from('media_items')
            .select('*, profiles(name), reviews(*)')
            .order('created_at', { ascending: false });

        if (category && category !== 'all') {
          query = query.eq('category', category);
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
    }),
    getReviews: builder.query({
      queryFn: async (id) => {
        const {data, error} = await supabase
            .from('reviews')
            .select('*')
            .eq('media_id', id);
        if (error) return (error)
        return {data}
      },
      invalidatesTags: ['Media']
    }),
    upsertReviews: builder.mutation({
      queryFn: async (mediaReview) => {
        const { data, error } = await supabase
          .from('reviews')
          .upsert(mediaReview, {
            onConflict: 'user_id, media_id' // <--- КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ
          })
          .select();
          
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ['Media'],
    }),
  }),
});

export const { useGetMediaQuery, useAddMediaMutation, useUpdateMediaMutation, 
useDeleteMediaMutation, useGetReviewsQuery, useUpsertReviewsMutation } = apiSlice;