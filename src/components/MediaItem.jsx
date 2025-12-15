import { useUpdateMediaMutation } from '../features/api/apiSlice'
import { Star, BookmarkCheck, Trash2, Eye, EyeClosed, Annoyed, Angry, Smile, CircleDashed } from "lucide-react";
import { useState } from 'react';

function MediaItem({ item }) {
    const { meta_data } = item;
    const [updateMedia, {isLoading}] = useUpdateMediaMutation()


    const parsedGenres = meta_data?.genres?.map(genresItem => genresItem.genre).slice(0,2).join(' • ')


    const statusConfig = {
        planned:     { icon: EyeClosed,     color: "text-slate-500", label: "Буду смотреть" },
        in_progress: { icon: Eye,           color: "text-blue-500",  label: "Смотрю" },
        completed:   { icon: BookmarkCheck, color: "text-green-500", label: "Просмотрено" },
        dropped:     { icon: Trash2,        color: "text-red-500",   label: "Брошено" },
    };

    const friendRatingConfig = {
        like:    { icon: Smile,   color: "text-green-500" },
        dislike: { icon: Angry,   color: "text-red-500" },
        neutral: { icon: Annoyed, color: "text-yellow-500" },
    };

    const [localStatus, setLocalStatus] = useState(item.status)
    const [localRating, setLocalRating] = useState(item.friend_rating)


        // Функция, которая объединяет все обновления
        const handleUpdate = async (updates) => {
            await updateMedia({ id: item.id, ...updates });
        };

        const handleStatusChange = async () => {
            const keys = Object.keys(statusConfig);
            const currentIndex = keys.indexOf(localStatus);
            const nextIndex = (currentIndex + 1) % keys.length;
            const nextStatus = keys[nextIndex];
        
            setLocalStatus(nextStatus);
        
            try {
                await handleUpdate({ status: nextStatus });
            } catch {
                setLocalStatus(keys[currentIndex]);
            }
        };
        
        const handleRatingChange = async () => {
            const ratings = Object.keys(friendRatingConfig);
            const currentIndex = ratings.indexOf(localRating);
            const nextIndex = (currentIndex + 1) % ratings.length;
            const nextRating = ratings[nextIndex];
        
            setLocalRating(nextRating);
        
            try {
                await handleUpdate({ friend_rating: nextRating });
            } catch {
                setLocalRating(ratings[currentIndex]);
            }
        };
    

    const mediaCategory = {
        movie:      { text: 'ФИЛЬМ' },
        series:     { text: 'СЕРИАЛ' },
        anime:      { text: 'АНИМЕ'},
        manga:      { text: 'МАНГА'},
        game:       { text: 'ИГРУЛЬКА'}
    }

    // Вычисляем рейтинг (цифры)
    const ratingValue = meta_data?.rating || meta_data?.ratingKinopoisk || meta_data?.ratingImdb;
    const formattedRating = ratingValue ? Number(ratingValue).toFixed(1) : null;


    // Определяем текущую иконку статуса и оценки
    // Если статус не найден, берем null

    const CurrentCategory = mediaCategory[item.category]
    const CurrentStatus = statusConfig[localStatus]
    const CurrentFriendRating = friendRatingConfig[localRating];

    return (
        <div className="relative flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 shadow-lg overflow-hidden group hover:border-slate-700 transition-colors">
            
            {/* Картинка */}
            <div className="relative h-64 sm:h-60 w-full overflow-hidden">
                <img 
                    className="w-full h-full object-cover object-top"
                    src={item.poster_url} 
                    alt={item.title} 
                />
                
                {formattedRating && (
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-white text-sm sm:text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                        <span>{formattedRating}</span>
                        <Star className="w-4 h-4 sm:w-3 sm:h-3 text-yellow-400 fill-current" />
                    </div>
                )}
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white text-sm sm:text-xs font-bold px-2 py-1 rounded">
                        {CurrentCategory && 
                        <span>{CurrentCategory.text}</span>}
                </div>
            </div>

            {/* Контент */}
            <div className="flex flex-col grow p-4">
                <h2 className="text-xl sm:text-lg font-bold text-white leading-tight mb-2 line-clamp-2">
                    {item.title}
                    <span className="ml-2 font-normal text-slate-400">({meta_data.year})</span>
                </h2>

                <p className="text-slate-400 text-base sm:text-sm uppercase">{parsedGenres}</p>
                
                <p className="text-slate-400 text-base sm:text-sm line-clamp-3 mb-4 grow">
                    {item.description || "Описание отсутствует..."}
                </p>

                {/* ФУТЕР */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                    
                    <div className="flex gap-2 items-center">

                        {/* Иконка текущего статуса (если он есть) */}
                        {CurrentStatus && (
                            <button onClick={handleStatusChange} className={`cursor-pointer p-2 sm:p-1.5 rounded-lg bg-slate-800/30 ${CurrentStatus.color}`} title={CurrentStatus.label}>
                                <CurrentStatus.icon className="w-6 h-6 sm:w-5 sm:h-5" />
                            </button>
                        )}
                        
                        {/* Если статуса нет, можно показать заглушку (опционально) */}
                        {!CurrentStatus && (
                             <div className="p-2 sm:p-1.5 text-slate-600" title="Статус не выбран">
                                <CircleDashed className="w-6 h-6 sm:w-5 sm:h-5" />
                             </div>
                        )}
                    </div>  
                    {/* ПРАВАЯ ЧАСТЬ: Оценка друга */}
                    <div className="flex gap-2">
                         {CurrentFriendRating && (
                             <button onClick={handleRatingChange} className={`cursor-pointer p-2 sm:p-1.5 rounded-lg bg-slate-800/30 ${CurrentFriendRating.color}`}>
                                <CurrentFriendRating.icon className="w-6 h-6 sm:w-5 sm:h-5" />
                             </button>
                         )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MediaItem;