import { useDispatch, useSelector } from "react-redux";
// Не забудь импортировать селектор!
import { setCategory, selectCategory } from "../features/filters/filterSlice"; 

// Выносим список категорий в массив (Clean Code)
const CATEGORIES = [
    { id: 'all', label: 'Все' },
    { id: 'movie', label: 'Фильмы' },
    { id: 'series', label: 'Сериалы' },
    { id: 'anime', label: 'Аниме' },
    { id: 'manga', label: 'Манга' },
    { id: 'game', label: 'Игры' },
    { id: 'music_album', label: 'Альбом' },
    { id: 'music-artist', label: 'Артист' },
];

function FilterComponent() {
    const dispatch = useDispatch();
    
    // 1. Читаем, какая категория сейчас выбрана в Redux
    const currentCategory = useSelector(selectCategory);

    const changeCategory = (category) => {
        dispatch(setCategory(category));
    }

    return (
        <ul className="flex gap-2 snap-x overflow-x-auto bg-slate-900 rounded-2xl border 
        border-slate-800 p-2 w-full scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent
        lg:flex-col lg:sticky lg:top-4 lg:w-fit lg:overflow-visible lg:h-fit">
            
            {/* 2. Пробегаемся по массиву и рисуем кнопки */}
            {CATEGORIES.map((cat) => {
                // Проверяем, активна ли эта кнопка
                const isActive = currentCategory === cat.id;

                return (
                    <li key={cat.id} className="shrink-0 w-1/3 md:w-auto md:justify-between snap-center">
                        <button 
                            onClick={() => changeCategory(cat.id)}
                            // 3. Условные стили
                            className={`
                                px-4 py-2 rounded-xl text-lg font-medium transition-all duration-200
                                ${isActive 
                                    ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/20' // Стиль АКТИВНОЙ
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' // Стиль ОБЫЧНОЙ
                                }
                            `}
                        >
                            {cat.label}
                        </button>
                    </li>
                )
            })}
        </ul>
    )
}

export default FilterComponent;