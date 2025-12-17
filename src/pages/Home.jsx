import { useGetMediaQuery } from '../features/api/apiSlice';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import MediaItem from '../components/MediaItem'
import FilterComponent from '../components/FilterComponent';
import {useSelector} from "react-redux";
import {useState} from "react";
import MediaModal from "../components/MediaModal";

export default function Home() {

  const [isModalOpen, setIsModalOpen] = useState(false);

  const category = useSelector((state) => state.filters.category);

  const { data: media, isLoading } = useGetMediaQuery({category});

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row bg-slate-900/70 justify-between items-center mb-6 sm:mb-8 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm gap-4">
          
          <h1 className="text-2xl sm:text-3xl font-bold">Чек-лист 🫡</h1>
          
          <div className="flex w-full sm:w-auto gap-3">
              
              <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/20 rounded-xl transition cursor-pointer text-center whitespace-nowrap">
                Добавить
              </button>
            
            <button 
              onClick={() => supabase.auth.signOut()}
              className="flex-1 sm:flex-none w-full sm:w-auto px-4 py-2 bg-red-600/10 text-red-400 hover:bg-red-600/20 border border-red-600/20 rounded-xl transition cursor-pointer whitespace-nowrap"
            >
              Выйти
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-500 py-10 animate-pulse">Загрузка...</div>
        ) : (
          <div className='flex flex-col items-start gap-6 lg:flex-row'>
            <FilterComponent />
            <div className="grid grid-cols-1 flex-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              
              {media?.length === 0 ? (
                  <div className="col-span-full text-center text-gray-500 py-10">
                      <p className="mb-2 text-xl">Список пуст...</p>
                      <p className="text-sm">Нажми "Добавить", чтобы начать!</p>
                  </div>
              ) : null}
              
              {media?.map((item) => (
                <MediaItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
      {isModalOpen && (
        <MediaModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}