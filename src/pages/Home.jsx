import { useGetMediaQuery } from '../features/api/apiSlice';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import MediaItem from '../components/MediaItem'

export default function Home() {
  const { data: media, isLoading } = useGetMediaQuery();

  return (
    // 1. p-4 для мобилок, sm:p-8 для экранов побольше
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8">
      {/* max-w-6xl даст чуть больше ширины для 4 колонок на больших экранах */}
      <div className="max-w-6xl mx-auto">
        
        {/* 2. Адаптивный хедер */}
        {/* flex-col (столбик) по умолчанию, sm:flex-row (строка) на планшетах и выше */}
        <div className="flex flex-col sm:flex-row bg-slate-900/70 justify-between items-center mb-6 sm:mb-8 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm gap-4">
          
          <h1 className="text-2xl sm:text-3xl font-bold">Чек-лист 🫡</h1>
          
          {/* 3. Группа кнопок */}
          {/* w-full на мобилке, чтобы кнопки растянулись. sm:w-auto — вернуть как было на компе */}
          <div className="flex w-full sm:w-auto gap-3">
            
            <Link to={"/addmedia"} className="flex-1 sm:flex-none">
               {/* w-full делает кнопку широкой на телефоне. flex-1 позволяет двум кнопкам поделить экран пополам */}
              <button className="w-full sm:w-auto px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/20 rounded-xl transition cursor-pointer text-center whitespace-nowrap">
                Добавить
              </button>
            </Link>
            
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
          // Сетка: 1 колонка на телефоне, 2 на планшете (sm), 3 на ноуте (lg), 4 на большом (xl)
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            
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
        )}
      </div>
    </div>
  );
}