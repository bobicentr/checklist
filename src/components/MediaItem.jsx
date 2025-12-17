import { useUpdateMediaMutation, useDeleteMediaMutation } from '../features/api/apiSlice'
import { Star, BookmarkCheck, Trash2, Eye, EyeClosed, Annoyed, Angry, Smile, CircleDashed } from "lucide-react";
import { useState } from 'react';
import { MoreVertical, Pencil, Trash } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectUserId } from '../features/auth/authSlice';

function MediaItem({ item }) {
    const { meta_data } = item;
    const [updateMedia, {isLoading}] = useUpdateMediaMutation()
    const [deleteMedia, {isLoadingAfterDelete}] = useDeleteMediaMutation()
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const userId = useSelector(selectUserId);
    const isOwner = userId === item.added_by;
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
        movie:        { text: 'ФИЛЬМ' },
        series:       { text: 'СЕРИАЛ' },
        anime:        { text: 'АНИМЕ'},
        manga:        { text: 'МАНГА'},
        game:         { text: 'ИГРУЛЬКА'},
        music_album:  { text: 'МУЗЫЧКА'},
        music_artist: { text: 'МУЗЫКАНТ'}
    }

    // Вычисляем рейтинг (цифры)
    const ratingValue = meta_data?.rating || meta_data?.ratingKinopoisk || meta_data?.ratingImdb;
    const formattedRating = ratingValue ? Number(ratingValue).toFixed(1) : null;


    // Определяем текущую иконку статуса и оценки
    // Если статус не найден, берем null

    const CurrentCategory = mediaCategory[item.category]
    const CurrentStatus = statusConfig[localStatus]
    const CurrentFriendRating = friendRatingConfig[localRating];
    const author = item.profiles?.name || 'Нинаю'

    return (
        <div className="relative flex lg:flex-col md:h-full bg-slate-900 rounded-2xl border border-slate-800 shadow-lg overflow-hidden group hover:border-slate-700 transition-colors">

            {isOwner && (
                <>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(!isMenuOpen);
                        }}
                        data-open={isMenuOpen}
                        className="
                            absolute top-1 right-1 z-30 p-1 rounded-full 
                            bg-black/70  text-white backdrop-blur-sm transition-all
                            
                            /* ЛОГИКА ВИДИМОСТИ */
                            opacity-100                        /* Видно всегда на мобилках */
                            lg:opacity-0 lg:group-hover:opacity-100  /* На ПК только при наведении */
                            data-[open=true]:opacity-100       /* Если меню открыто - видно всегда */
                        "
                    >
                        <MoreVertical size={20} />
                    </button>

                    {isMenuOpen && (
                        <>
                            {/* А) НЕВИДИМАЯ ПОДЛОЖКА (чтобы закрыть кликом вне) */}
                            <div 
                                className="fixed inset-0 z-40 cursor-default" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMenuOpen(false);
                                }} 
                            />
                            <div className="
                                absolute top-10 right-2 z-50 
                                flex flex-col gap-1 p-1 
                                min-w-35
                                
                                /* СТИЛЬ: Как у кнопки (Glassmorphism) */
                                bg-black/70 backdrop-blur-md 
                                border border-white/10 
                                rounded-xl shadow-2xl 
                                
                                animate-in fade-in zoom-in-95 duration-100 origin-top-right
                            ">
                                
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(item);
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-gray-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                                >
                                    <Pencil size={16} className="text-blue-400" />
                                    Изменить
                                </button>

                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMenuOpen(false);
                                        setIsDeleteModalOpen(true);
                                    }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-gray-200 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors text-left"
                                >
                                    <Trash2 size={16} className="text-red-500" />
                                    Удалить
                                </button>
                            </div>
                        </>
                    )}
                </>
            )}
            
            <div className="relative w-28 shrink-0 lg:h-60 lg:w-full overflow-hidden">
                <img 
                    className="w-full h-full lg:object-cover lg:object-top"
                    src={item.poster_url} 
                    alt={item.title} 
                />

                {formattedRating && (
                    <div className="absolute bottom-10 left-2 lg:bottom-2 lg:right-2 lg:left-auto bg-black/70 backdrop-blur-md text-white text-sm sm:text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                        <span>{formattedRating}</span>
                        <Star className="w-4 h-4 sm:w-3 sm:h-3 text-yellow-400 fill-current" />
                    </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-white text-sm sm:text-xs font-bold px-2 py-1 rounded">
                        {CurrentCategory && 
                        <span>{CurrentCategory.text}</span>}
                </div>
            </div>

            {/* Контент */}
            <div className="flex flex-1  flex-col p-2 md:p-4">
                <h2 className="lg:text-xl text-lg font-bold text-white leading-tight mb-2 line-clamp-2">
                    {item.title}
                    {meta_data?.year && <span className="ml-2 font-normal text-slate-400">({meta_data.year})</span>}
                </h2>

                <p className="text-slate-400 lg:text-base text-sm uppercase">{parsedGenres}</p>
                
                <p className="text-slate-400 text-base sm:text-sm line-clamp-1 lg:line-clamp-3 mb-4 grow">
                    {item.description || "Описание отсутствует..."}
                </p>

                {/* ФУТЕР */}
                <div className="flex mt-auto text-sm justify-between items-center pt-3 border-t border-slate-800">
                    
                    <div className="flex gap-2 items-center">

                        {/* Иконка текущего статуса (если он есть) */}
                        {CurrentStatus && (
                            <button onClick={handleStatusChange} className={`cursor-pointer p-2 sm:p-1.5 rounded-lg bg-slate-800/30 ${CurrentStatus.color}`} title={CurrentStatus.label}>
                                <CurrentStatus.icon className="md:w-6 md:h-6 w-4 h-4" />
                            </button>
                        )}
                        
                        {/* Если статуса нет, можно показать заглушку (опционально) */}
                        {!CurrentStatus && (
                             <div className="p-2 sm:p-1.5 text-slate-600" title="Статус не выбран">
                                <CircleDashed className="w-6 h-6 sm:w-5 sm:h-5" />
                             </div>
                        )}
                    </div>
                    <p className="font-normal text-slate-400">Добавил {author}</p>
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
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 max-w-sm w-full text-center">
                        <h3 className="text-xl font-bold mb-4 text-white">Подтверждение действия</h3>
                        <p className="text-slate-400 mb-6">Вы точно хотите удалить запись "{item.title}"?</p>
                        <button 
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/20 rounded-xl transition"
                        >
                            Отмена
                        </button>
                        <button 
                            onClick={() => deleteMedia(item.id).then(() => setIsDeleteModalOpen(false))}
                            className="ml-4 px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/20 rounded-xl transition"
                        >
                            Удалить
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MediaItem;