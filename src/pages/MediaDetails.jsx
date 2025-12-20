import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from 'react'
import { useGetSingleMediaQuery, useUpsertReviewsMutation } from "../features/api/apiSlice"
import { useSelector } from 'react-redux'
import { selectUserId } from '../features/auth/authSlice'
import StatusComponent from "../components/StatusComponent"
import RatingComponent from "../components/RatingComponent"
import { Eye, BookmarkCheck, Trash2 } from "lucide-react";

function MediaDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const userId = useSelector(selectUserId);
    
    const { data: itemData, isLoading: isItemLoading } = useGetSingleMediaQuery(id);
    const [triggerUpsertReviews, { isLoading: isUpserting }] = useUpsertReviewsMutation();
    
    const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
    const [commentText, setCommentText] = useState('');

    const statusConfig = {
        in_progress: { icon: Eye,           color: "text-blue-500",  label: "В процессе" },
        completed:   { icon: BookmarkCheck, color: "text-green-500", label: "Ознакомился" },
        dropped:     { icon: Trash2,        color: "text-red-500",   label: "Дропнул" },
    };

    // Данные твоего отзыва
    const myReview = itemData?.reviews?.find(rev => rev.user_id === userId);
    const statusKey = myReview?.status; 
    const currentRating = myReview?.rating || 0;
    const currentStatusObj = statusKey ? statusConfig[statusKey] : null;

    useEffect(() => {
        if (myReview?.comment !== undefined) {
            setCommentText(myReview.comment || "");
        }
    }, [myReview]);

    // Твоя логика сохранения
    const handleReviewUpsert = async (newStatus, newRating, newComment) => {
        try {
            await triggerUpsertReviews({
                media_id: id,
                user_id: userId,
                status:  newStatus || statusKey || 'in_progress',
                rating:  newRating !== undefined ? newRating : (myReview?.rating || null),
                comment: newComment !== undefined ? newComment : (myReview?.comment || null)
            }).unwrap();
        } catch (err) {
            console.error("Ошибка сохранения:", err);
        }
    }

    if (isItemLoading) return <div className="bg-slate-950 text-white min-h-screen flex items-center justify-center font-bold italic tracking-widest">Загрузка...</div>

    return (
        <div className="bg-slate-950 text-slate-200 min-h-screen w-full relative pb-20">
            {/* ФОНОВЫЙ БЛЮР */}
            <div className="fixed inset-0 z-0">
                <img src={itemData?.poster_url} className="w-full h-full object-cover opacity-20 blur-[60px] scale-105" alt="" />
                <div className="absolute inset-0 bg-slate-950/40" />
            </div>
            
            <div className="relative z-10 max-w-5xl mx-auto px-4 pt-8">
                {/* Назад */}
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 mb-6 transition-colors">
                    ← Назад в библиотеку
                </button>

                {itemData ? (
                    <>
                        {/* ОСНОВНАЯ КАРТОЧКА (Редактирование) */}
                        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-6 md:p-10 mb-14">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                
                                <div className="md:col-span-4 lg:col-span-3">
                                    <img src={itemData.poster_url} className="w-full rounded-2xl shadow-2xl border border-white/5 object-cover aspect-2/3" alt="" />
                                </div>

                                <div className="md:col-span-8 lg:col-span-9 flex flex-col">
                                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                                        {itemData.title}
                                        {itemData.meta_data?.year && <span className="text-slate-500 font-normal ml-3">({itemData.meta_data.year})</span>}
                                    </h1>
                                    
                                    <div className="flex flex-wrap gap-2 mb-6 text-[10px] uppercase font-bold text-slate-500">
                                        {itemData.meta_data?.genres?.map((g, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-slate-800/50 rounded border border-white/5">
                                                {g.genre}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Описание</h3>
                                        <p className="text-slate-300 leading-relaxed text-base">{itemData.description || "Описания нет..."}</p>
                                        <div className="text-sm text-slate-500 italic">
                                            Добавлено: <span className="text-slate-300 font-bold not-italic">{itemData.profiles?.name}</span>
                                        </div>
                                    </div>

                                    {/* УПРАВЛЕНИЕ МОИМ ОТЗЫВОМ */}
                                    <div className="mt-auto pt-6 border-t border-white/5">
                                        <div className="flex flex-col sm:flex-row items-end gap-4">
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-[10px] text-slate-500 uppercase tracking-widest ml-1">Редактировать отзыв</span>
                                                <div className="flex w-full">
                                                    <textarea 
                                                        value={commentText} 
                                                        onChange={(e) => setCommentText(e.target.value)} 
                                                        className="bg-slate-800/40 h-11 p-3 rounded-l-xl border border-white/5 border-r-0 focus:bg-slate-800/60 outline-none transition-all w-full resize-none text-sm" 
                                                        placeholder="Напиши что-нибудь..." 
                                                    />
                                                    <button
                                                        onClick={() => handleReviewUpsert(undefined, undefined, commentText)}
                                                        className="h-11 px-5 bg-blue-600/20 border border-blue-500/30 text-xs font-bold text-blue-400 rounded-r-xl hover:bg-blue-600/40 transition-all uppercase"
                                                    >
                                                        ОК
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 pb-1">
                                                <StatusComponent 
                                                    isStatusMenuOpen={isStatusMenuOpen} 
                                                    setIsStatusMenuOpen={setIsStatusMenuOpen} 
                                                    handleStatusChange={(s) => handleReviewUpsert(s, undefined, undefined)} 
                                                    CurrentStatus={currentStatusObj} 
                                                />
                                                <RatingComponent 
                                                    CurrentRating={currentRating} 
                                                    handleRatingChange={(r) => handleReviewUpsert(undefined, r, undefined)} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ЛЕНТА ВСЕХ ОТЗЫВОВ */}
                        <div className="mt-12 max-w-4xl mx-auto px-2">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                                Что думают люди
                                <span className="text-sm font-normal text-slate-600">({itemData.reviews?.length || 0})</span>
                            </h3>

                            <div className="space-y-3">
                                {itemData.reviews?.map((review) => {
                                    const isMe = review.user_id === userId;
                                    const status = statusConfig[review.status];
                                    const StatusIcon = status?.icon;
                                    
                                    return (
                                        <div 
                                            key={review.id} 
                                            className={`
                                                bg-slate-900/40 border border-white/5 p-5 rounded-2xl flex gap-4 backdrop-blur-md transition-all
                                                ${isMe ? 'ring-1 ring-indigo-500/30 bg-indigo-500/5' : ''}
                                            `}
                                        >
                                            {/* Аватарка */}
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 border border-white/10 shrink-0">
                                                {review.profiles?.name?.charAt(0).toUpperCase()}
                                            </div>

                                            <div className="flex flex-col gap-1 w-full">
                                                {/* ШАПКА: Имя, Рейтинг и Статус теперь в одну линию без justify-between */}
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className={`font-bold ${isMe ? 'text-indigo-400' : 'text-slate-200'}`}>
                                                        {review.profiles?.name}
                                                    </span>
                                                    
                                                    {isMe && (
                                                        <span className="text-[9px] uppercase font-black bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/10">
                                                            Ты
                                                        </span>
                                                    )}

                                                    {review.rating && (
                                                        <span className="text-yellow-500 text-xs font-bold">⭐ {review.rating}</span>
                                                    )}

                                                    {/* СТАТУС: Теперь идет сразу после инфо, с небольшим разделителем */}
                                                    {status && (
                                                        <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight ${status.color} opacity-80 border-l border-white/10 pl-3 ml-1`}>
                                                            {StatusIcon && <StatusIcon size={12} />}
                                                            {status.label}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Текст комментария */}
                                                <p className="text-slate-400 text-sm leading-relaxed mt-1">
                                                    {review.comment || <span className="opacity-20 italic">Без комментария</span>}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 text-slate-500">Запись не найдена...</div>
                )}
            </div>
        </div>
    )
}

export default MediaDetails;