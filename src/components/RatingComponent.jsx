import { Angry, Annoyed, Star, CircleDashed, Smile } from "lucide-react";
import { useState } from "react";

function RatingComponent ({ CurrentRating, handleRatingChange }) {

    const [hoveredIndex, setHoveredIndex] = useState(0)
    const [savedIndex, setSavedIndex] = useState(CurrentRating - 1)
    const [isRatingMenuOpen, setIsRatingMenuOpen] = useState(false)
    const array = [1,2,3,4,5,6,7,8,9,10]

    return (
        <div className="relative">

            <>
                <button 
                    onClick={(e) => {
                    e.stopPropagation();
                    setIsRatingMenuOpen(!isRatingMenuOpen);
                    }}
                                data-open={isRatingMenuOpen}
                                className=" z-30 backdrop-blur-sm transition-all
                                    p-2 sm:p-1.5 rounded-lg bg-slate-800/30"
                            >

                                {CurrentRating ? (
                                    <div className="flex items-center">
                                        <span>{CurrentRating}/10</span>
                                        {CurrentRating <= 3 && <Angry className={`w-5 h-5 text-red-500`} />}
                                        {CurrentRating > 3 && CurrentRating <= 6 && <Annoyed className={`w-5 h-5 text-amber-500`} />}
                                        {CurrentRating > 6 && CurrentRating <=10 && <Smile className={`w-5 h-5 text-green-500`} />}
                                    </div>
                                ) : (
                                    <div className="flex">
                                        <span>??/10</span>
                                        <CircleDashed className="w-5 h-5 text-amber-500" />
                                    </div>
                                )}
                            </button>

                            {isRatingMenuOpen && (
                                <>
                                    {/* А) НЕВИДИМАЯ ПОДЛОЖКА (чтобы закрыть кликом вне) */}
                                    <div 
                                        className="fixed inset-0 z-40 cursor-default" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsRatingMenuOpen(false);
                                            setSavedIndex(CurrentRating - 1)
                                            setHoveredIndex(0)
                                        }} 
                                    />
                                    <div className="
                                        absolute z-50 
                
                                        /* --- НАДЕЖНОЕ ПОЗИЦИОНИРОВАНИЕ СВЕРХУ --- */
                                        bottom-full /* 1. Прикрепить низ меню к верху родителя */
                                        mb-2       /* 2. Дать небольшой отступ */
                                        right-0     /* 3. Выровнять по левому краю */
                                         
                                        flex gap-1 p-1 
                                        min-w-35
                                        
                                        /* СТИЛЬ: Как у кнопки (Glassmorphism) */
                                        bg-slate-800/60 backdrop-blur-md 
                                        border border-white/10 
                                        rounded-xl shadow-2xl 
                                        
                                        animate-in fade-in zoom-in-95 duration-100 
                                    ">
                                        {array.map((item, index) => {
                                            const isFilled = hoveredIndex !== 0 ? index <= hoveredIndex : index <= savedIndex
                                            return (
                                                <Star key={item} onMouseEnter={(e) => {
                                                    setHoveredIndex(index)
                                                    setSavedIndex(0)
                                                }} 
                                                onClick={(e) => {
                                                    handleRatingChange(item)
                                                    setIsRatingMenuOpen(false)
                                                    e.stopPropagation()
                                                }} 
                                                className={`text-amber-500 size={16} ${isFilled ? "fill-current" : ""}`}/>
                                            )
                                        })}
                                    </div>
                                </>
                            )}
                        </>
                    </div>
    )
}

export default RatingComponent