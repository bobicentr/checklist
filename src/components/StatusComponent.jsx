import { Pencil, CircleDashed, EyeClosed, Eye, BookmarkCheck, Trash2 } from "lucide-react";


function StatusComponent ({isStatusMenuOpen, setIsStatusMenuOpen, handleStatusChange, CurrentStatus}) {

    const statusConfig = {
            in_progress: { icon: Eye,           color: "text-blue-500",  label: "В процессе" },
            completed:   { icon: BookmarkCheck, color: "text-green-500", label: "Ознакомился" },
            dropped:     { icon: Trash2,        color: "text-red-500",   label: "Дропнул" },
        };

    return (
        <div className="relative">

            <>
                <button 
                    onClick={(e) => {
                    e.stopPropagation();
                    setIsStatusMenuOpen(!isStatusMenuOpen);
                    }}
                                data-open={isStatusMenuOpen}
                                className=" z-30 backdrop-blur-sm cursor-pointer transition-all
                                    p-2 sm:p-1.5 rounded-lg bg-slate-800/30 hover:bg-white/10"
                            >
                                {CurrentStatus && < CurrentStatus.icon className={`w-6 h-6 sm:w-5 sm:h-5 ${CurrentStatus.color}`} />}
                                {!CurrentStatus && <EyeClosed className="w-6 h-6 sm:w-5 sm:h-5" /> }  
                            </button>

                            {isStatusMenuOpen && (
                                <>
                                    {/* А) НЕВИДИМАЯ ПОДЛОЖКА (чтобы закрыть кликом вне) */}
                                    <div 
                                        className="fixed inset-0 z-40 cursor-default" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsStatusMenuOpen(false);
                                        }} 
                                    />
                                    <div className="
                                        absolute z-50 
                
                                        /* --- НАДЕЖНОЕ ПОЗИЦИОНИРОВАНИЕ СВЕРХУ --- */
                                        bottom-full /* 1. Прикрепить низ меню к верху родителя */
                                        mb-2       /* 2. Дать небольшой отступ */
                                        left-0     /* 3. Выровнять по левому краю */
                                         
                                        flex flex-col gap-1 p-1 
                                        min-w-35
                                        
                                        /* СТИЛЬ: Как у кнопки (Glassmorphism) */
                                        bg-slate-800/60 backdrop-blur-md 
                                        border border-white/10 
                                        rounded-xl shadow-2xl 
                                        
                                        animate-in fade-in zoom-in-95 duration-100 
                                    ">
                                        
                                        {Object.entries(statusConfig).map(([statusKey, config]) => {
                                            const { icon: Icon, color, label } = config;

                                            return (
                                                <button 
                                                    key={statusKey} 
                                                    onClick={(e) => {
                                                        handleStatusChange(statusKey);
                                                        e.stopPropagation();
                                                        setIsStatusMenuOpen(false);
                                                    }}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-gray-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                                                >
                                                    {/* Теперь используем переменные правильно */}
                                                    <Icon size={16} className={color} />
                                                    <span>{label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </>
                    </div>
    )
}

export default StatusComponent