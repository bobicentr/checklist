import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    category: 'all',
    userId: 'all',
}

const filterSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        setCategory: (state, action) => {
            state.category = action.payload;
        },
        setUserId: (state, action) => {
            state.userId = action.payload;
        },
    },
});

export const { setCategory, setUserId } = filterSlice.actions;

export const selectCategory = (state) => state.filters.category;
export const selectUserId = (state) => state.filters.userId;

export default filterSlice.reducer;
