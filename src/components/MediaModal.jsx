import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
// useNavigate убрали, он тут не нужен
import { useAddMediaMutation, useUpdateMediaMutation } from "../features/api/apiSlice";
import { useLazySearchMoviesQuery } from "../features/api/kinopoiskApiSlice";
import { useLazySearchAlbumsQuery, useLazySearchArtistQuery } from "../features/api/itunesApiSlice"
import { useLazySearchGamesQuery, useLazySearchGameImagesQuery, useLazyGetGameByIdQuery, useLazyGetGenresListQuery } from "../features/api/gamesdbApiSlice";
import { useLazySearchAnimeQuery, useLazySearchMangaQuery, useLazySearchAnimeByIdQuery, useLazySearchMangaByIdQuery } from "../features/api/shikimoriApiSlice";

// ПРИНИМАЕМ PROP onClose
function MediaModal({ onClose, itemToEdit, setItemToEdit }) {
    const user = useSelector((state) => state.auth.user);
    const [addMedia, { isLoading: isAdding }] = useAddMediaMutation();
    
    // --- ТВОИ ХУКИ API (без изменений) ---
    const [triggerMovieSearch, { data: movieData, isFetching: isSearchingMovies }] = useLazySearchMoviesQuery();
    const [triggerAnimeSearch, { data: animeData, isLoading: isSearchingAnime }] = useLazySearchAnimeQuery();
    const [triggerMangaSearch, { data: mangaData, isLoading: isSearchingManga }] = useLazySearchMangaQuery();
    const [triggerMusicAlbumSearch, {data: musicAlbumData, isLoading: isSearchingAlbum}] = useLazySearchAlbumsQuery();
    const [triggerMusicArtistSearch, {data: musicArtistData, isLoading: isSearchingArtist}] = useLazySearchArtistQuery()
    const [triggerAnimeIdSearch] = useLazySearchAnimeByIdQuery();
    const [triggerMangaIdSearch] = useLazySearchMangaByIdQuery();
    const [triggerGamesSearch, { data: gamesData, isLoading: isSearchingGames }] = useLazySearchGamesQuery();
    const [triggerGameImagesSearch] = useLazySearchGameImagesQuery();
    const [triggerGameById] = useLazyGetGameByIdQuery();
    const [triggerGetGenresList] = useLazyGetGenresListQuery();
    const [triggerUpdateMedia, { isLoading: isUpdating }] = useUpdateMediaMutation();


    const [searchQuery, setSearchQuery] = useState(itemToEdit ? itemToEdit.title : '');
    const [isDisabled, setIsDisabled] = useState(itemToEdit ? true : false);
    const [itemPic, setItemPic] = useState(itemToEdit ? itemToEdit.poster_url : '');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'movie',
    });
    const [searchResults, setSearchResults] = useState([]);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [mediaObject, setMediaObject] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        formData.description = itemToEdit ? itemToEdit.description : '';
    }, [itemToEdit]);

    const handlers = useMemo(() => ({
        setMediaObj: setMediaObject,
        setIsProcessing: setIsProcessing,
        triggerAnimeById: triggerAnimeIdSearch,
        triggerMangaById: triggerMangaIdSearch,
        triggerGamesSearch: triggerGamesSearch,
        triggerGameImages: triggerGameImagesSearch,
        triggerGameById: triggerGameById,
        triggerGetGenresList: triggerGetGenresList,
    }), []); 

    const extractBoxart = (imagesResponse, gameId) => {
        if (!imagesResponse?.data?.images) return null;
        const images = imagesResponse.data.images[String(gameId)] || [];
        const boxart = images.find(i => i.type === 'boxart' && i.side === 'front') ||
            images.find(i => i.type === 'boxart') ||
            images.find(i => i.side === 'front') || images[0];
        const baseUrl = imagesResponse?.data?.base_url?.original;
        if (!boxart || !baseUrl) return null;
        return baseUrl + boxart.filename;
    };

    // --- ТВОЙ КОНФИГ (без изменений, свернул для краткости ответа, но код тот же) ---
    const categoryConfig = useMemo(() => ({
        movie: {
            triggerFunction: (searchTerm) => triggerMovieSearch({ searchTerm, type: ['FILM'] }),
            normalizeFunction: (movie) => ({ id: movie.kinopoiskId, title: movie.nameRu || movie.nameOriginal, year: movie.year, posterPreview: movie.posterUrlPreview, rawObject: movie }),
            toSendToDb: (finalTitle) => ({
                title: finalTitle, description: formData.description, category: formData.category, added_by: user.id,
                poster_url: mediaObject?.posterUrl || null,
                external_id: mediaObject?.kinopoiskId?.toString() || null,
                meta_data: mediaObject ? { ratingKinopoisk: mediaObject.ratingKinopoisk, year: mediaObject.year, genres: mediaObject.genres, countries: mediaObject.countries } : {}
            }),
            processSelection: (movie) => setMediaObject(movie.rawObject),
        },
        series: {
            triggerFunction: (searchTerm) => triggerMovieSearch({ searchTerm, type: ['TV_SERIES', 'MINI_SERIES'] }),
            normalizeFunction: (movie) => ({ id: movie.kinopoiskId, title: movie.nameRu || movie.nameOriginal, year: movie.year, posterPreview: movie.posterUrlPreview, rawObject: movie }),
            toSendToDb: (finalTitle) => ({
                title: finalTitle, description: formData.description, category: formData.category, added_by: user.id,
                poster_url: mediaObject?.posterUrl || null,
                external_id: mediaObject?.kinopoiskId?.toString() || null,
                meta_data: mediaObject ? { ratingKinopoisk: mediaObject.ratingKinopoisk, year: mediaObject.year, genres: mediaObject.genres, countries: mediaObject.countries } : {}
            }),
            processSelection: (series) => setMediaObject(series.rawObject),
        },
        anime: {
            triggerFunction: (searchTerm) => triggerAnimeSearch(searchTerm),
            normalizeFunction: (anime) => ({ id: anime.id, title: anime.russian || anime.name, year: anime.aired_on?.slice(0, 4) || 'N/A', posterPreview: 'https://shikimori.one/' + anime.image.preview, rawObject: anime }),
            toSendToDb: (finalTitle) => ({
                title: finalTitle, description: formData.description, category: formData.category, added_by: user.id,
                poster_url: 'https://shikimori.one/' + mediaObject?.image.original || null,
                external_id: mediaObject?.id?.toString() || null,
                meta_data: mediaObject ? { rating: mediaObject.score, year: mediaObject.aired_on?.slice(0, 4) || 'N/A', genres: mediaObject.genres?.map(g => ({ genre: g.russian })) || [] } : {}
            }),
            processSelection: async (anime, handlers) => {
                const oneItem = await handlers.triggerAnimeById(anime.id).unwrap();
                handlers.setMediaObj(oneItem);
            },
        },
        manga: {
            triggerFunction: (searchTerm) => triggerMangaSearch(searchTerm),
            normalizeFunction: (manga) => ({ id: manga.id, title: manga.russian || manga.name, year: manga.aired_on?.slice(0, 4) || 'N/A', posterPreview: 'https://shikimori.one/' + manga.image.preview, rawObject: manga }),
            toSendToDb: (finalTitle) => ({
                title: finalTitle, description: formData.description, category: formData.category, added_by: user.id,
                poster_url: 'https://shikimori.one/' + mediaObject?.image.original || null,
                external_id: mediaObject?.id?.toString() || null,
                meta_data: mediaObject ? { rating: mediaObject.score, year: mediaObject.aired_on?.slice(0, 4) || 'N/A', genres: mediaObject.genres?.map(g => ({ genre: g.russian })) || [] } : {}
            }),
            processSelection: async (manga, handlers) => {
                const oneItem = await handlers.triggerMangaById(manga.id).unwrap();
                handlers.setMediaObj(oneItem);
            },
        },
        game: {
            triggerFunction: (searchTerm) => triggerGamesSearch(searchTerm),
            normalizeFunction: (game) => ({ id: game.id, title: game.game_title, year: game.release_date?.slice(0, 4) || 'N/A', posterPreview: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTSADTNHgsEpuitRef-9GXTs8-DGReI6kmfQ&s', rawObject: game }),
            toSendToDb: (finalTitle) => ({
                title: finalTitle, description: formData.description, category: formData.category, added_by: user.id,
                poster_url: mediaObject?.posterUrl || null,
                external_id: mediaObject?.id?.toString() || null,
                meta_data: mediaObject ? { year: mediaObject.release_date?.slice(0, 4) || 'N/A', genres: mediaObject.genres?.map(g => ({ genre: g })) || [] } : {}
            }),
            processSelection: async (game, handlers) => {
                handlers.setIsProcessing(true);
                try {
                    handlers.setMediaObj(game.rawObject);
                    const [gameDetails, imagesResponse, allGenresList] = await Promise.all([
                        handlers.triggerGameById(game.id).unwrap(),
                        handlers.triggerGameImages(game.id).unwrap(),
                        handlers.triggerGetGenresList().unwrap().catch(() => [])
                    ]);
                    let posterUrl = extractBoxart(imagesResponse, game.id);
                    if (!posterUrl) { /* Fallback logic ... */ }
                    let genreNames = [];
                    if (gameDetails?.genres?.length && allGenresList?.length) {
                        genreNames = gameDetails.genres.map(genreId => {
                            const foundGenre = allGenresList.find(g => g.id === Number(genreId));
                            return foundGenre ? foundGenre.name : null;
                        }).filter(Boolean);
                    }
                    handlers.setMediaObj({ ...gameDetails, posterUrl, genres: genreNames });
                } catch (error) {
                    console.error('Ошибка выбора игры:', error);
                    handlers.setMediaObj({ ...game.rawObject, posterUrl: null, genres: [] });
                } finally {
                    handlers.setIsProcessing(false);
                }
            },
        },
        music_album: {
            triggerFunction: (searchTerm) => triggerMusicAlbumSearch( searchTerm ),
            normalizeFunction: (album) => ({ id: album.collectionId, title: album.collectionName  + ' от ' + album.artistName, year: album.releaseDate?.slice(0,4) || 'N/A', posterPreview: album.artworkUrl100, rawObject: album }),
            toSendToDb: (finalTitle) => ({
                title: finalTitle, description: formData.description, category: formData.category, added_by: user.id,
                poster_url: mediaObject?.artworkUrl100 ? mediaObject.artworkUrl100.replace('100x100bb', '600x600bb') : null,
                external_id: mediaObject?.collectionId?.toString() || null,
                meta_data: mediaObject ? { year: mediaObject.releaseDate?.slice(0,4) || 'N/A' } : {}
            }),
            processSelection: (album) => setMediaObject(album.rawObject),
        },
        music_artist: {
            triggerFunction: (searchTerm) => triggerMusicArtistSearch( searchTerm ),
            normalizeFunction: (artist) => ({ id: artist.artistId, title: artist.artistName, posterPreview: 'https://www.shutterstock.com/image-vector/minimalist-avatar-icon-blank-face-260nw-2536455943.jpg', rawObject: artist }),
            toSendToDb: (finalTitle) => ({
                title: finalTitle, description: formData.description, category: formData.category, added_by: user.id,
                poster_url: 'https://www.shutterstock.com/image-vector/minimalist-avatar-icon-blank-face-260nw-2536455943.jpg',
                external_id: mediaObject?.artistId?.toString() || null,
                meta_data: mediaObject ? { genres: mediaObject.primaryGenreName ? [{ genre: mediaObject.primaryGenreName }] : [] } : {}
            }),
            processSelection: (artist) => setMediaObject(artist.rawObject),
        }
    }), [user, formData, mediaObject]); 

    // --- USE EFFECTS (без изменений) ---
    useEffect(() => {
        if (!searchQuery.trim() || !isInputFocused) {
            setSearchResults([]);
            return;
        }
        const timerId = setTimeout(() => {
            categoryConfig[formData.category].triggerFunction(searchQuery);
        }, 800);
        return () => clearTimeout(timerId);
    }, [searchQuery, formData.category, isInputFocused, categoryConfig]);

    useEffect(() => {
        const dataMap = { movie: movieData, series: movieData, anime: animeData, manga: mangaData, game: gamesData, music_album: musicAlbumData, music_artist: musicArtistData};
        const currentData = dataMap[formData.category];
        if (isInputFocused && currentData) {
            const normalizedData = currentData.map(categoryConfig[formData.category].normalizeFunction);
            setSearchResults(normalizedData);
        } else {
            setSearchResults([]);
        }
    }, [musicArtistData, musicAlbumData, gamesData, movieData, animeData, mangaData, formData.category, isInputFocused, categoryConfig]);

    const handleResultSelect = (selectedItem) => {
        setFormData({ ...formData, title: selectedItem.title, description: `${selectedItem.title} (${selectedItem.year})` });
        setSearchQuery(selectedItem.title);
        categoryConfig[formData.category].processSelection(selectedItem, handlers);
        setIsInputFocused(false);
    };

    const handleFormChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalTitle = formData.title.trim() || searchQuery.trim();
        if (!finalTitle) return;

        const newItem = categoryConfig[formData.category].toSendToDb(finalTitle);

        try {
            if (itemToEdit) {
                await triggerUpdateMedia({ id: itemToEdit.id, description: formData.description, poster_url: itemPic }).unwrap();
                setItemToEdit(null);
            } else { 
                await addMedia(newItem).unwrap();
            }
            onClose();
        } catch (error) {
            console.error("Не поучилось:", error);
        }
    };

    const isSearching = isSearchingMovies || isSearchingAnime || isSearchingManga || isSearchingGames || isSearchingAlbum || isSearchingArtist;

    // --- ВОТ ТУТ НОВАЯ ВЁРСТКА ---
    return (
        // 1. BACKDROP (Фон на весь экран)
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            
            {/* 2. МОДАЛЬНОЕ ОКНО */}
            <div 
                className="relative w-full max-w-xl bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl 
                    flex flex-col gap-6 p-6 sm:p-8 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
                onClick={(e) => e.stopPropagation()} >
                <button 
                    onClick={onClose} 
                    className="absolute top-2 right-2 px-2 py-1 lg:px-3 lg:py-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700 rounded-lg transition">
                    ✕
                </button>

                {/* Заголовок */}
                <div>
                    <h2 className="text-2xl font-bold text-white">Добавить новую запись</h2>
                </div>

                {/* ФОРМА (Такая же как была) */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    
                    {/* Выбор категории */}
                    { !itemToEdit && <div>
                        <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-300">Категория</label>
                        <select id="category" value={formData.category} onChange={handleFormChange} className="bg-gray-800 border border-gray-700 text-white text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 transition-colors">
                            <option value="movie">Фильм</option>
                            <option value="series">Сериал</option>
                            <option value="anime">Аниме</option>
                            <option value="manga">Манга</option>
                            <option value="game">Игра</option>
                            <option value="music_album">Альбом</option>
                            <option value="music_artist">Муз-исполнитель</option>
                        </select>
                    </div>
                    }
                    

                    {/* Поиск */}
                    <div className="relative">
                        <label htmlFor="search-input" className="block mb-2 text-sm font-medium text-gray-300">Название</label>
                        <input 
                            type="text" id="search-input" value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsInputFocused(true)}
                            disabled={isDisabled}
                            onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                            className={`bg-gray-800 border border-gray-700 text-white text-sm rounded-xl 
                            focus:ring-blue-500 focus:border-blue-500 block w-full p-3 transition-colors 
                            placeholder-gray-500`}
                            placeholder="Начните вводить..." autoComplete="off" required 
                        />
                        
                        {/* Индикатор поиска */}
                        {isSearching && !itemToEdit && isInputFocused && <div className="absolute right-3 top-10 text-gray-400 text-xs animate-pulse">Ищем...</div>}
                        
                        {/* Выпадающий список результатов */}
                        {searchResults.length > 0 && !itemToEdit && isInputFocused && (
                            <ul className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
                                {searchResults.map((item) => (
                                    <li key={`${formData.category}-${item.id}`}
                                        className="p-3 hover:bg-gray-700 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-700/50 last:border-0"
                                        onClick={() => handleResultSelect(item)}>
                                        <img src={item.posterPreview} alt="poster" className="w-10 h-14 object-cover rounded-md bg-gray-900"/>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-white">{item.title}</span>
                                            <span className="text-xs text-gray-400">{item.year}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    { itemToEdit &&
                        <div>
                        <label htmlFor="item_pic" className="block mb-2 text-sm font-medium text-gray-300">Ссылка на фоточку</label>
                        <input 
                            type="text" id="item_pic" value={itemPic}
                            onChange={(e) => setItemPic(e.target.value)}
                            className={`bg-gray-800 border border-gray-700 text-white text-sm rounded-xl 
                            focus:ring-blue-500 focus:border-blue-500 block w-full p-3 transition-colors 
                            placeholder-gray-500`} autoComplete="off"  
                        />    
                    </div>
                    }
                    <div>
                        <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-300">Краткое описание</label>
                        <textarea 
                            id="description" rows="3" value={formData.description} onChange={handleFormChange}
                            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 transition-colors resize-none"
                            placeholder="Автоматически или вручную..."
                        ></textarea>
                    </div>

                    {/* Кнопки */}
                    <div className="flex gap-3 pt-2">
                         <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors"
                        >
                            Отмена
                        </button>
                        <button type="submit" disabled={isAdding || isProcessing}
                            className={`flex-2 text-white font-medium rounded-xl text-sm py-3 text-center transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed ${isProcessing ? 'bg-gray-700' : 'bg-blue-600 hover:bg-blue-500'}`}>
                            {isAdding ? 'Добавляем...' : isProcessing ? 'Загрузка...' : isUpdating ? 'Обновляется' : 'Добавить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default MediaModal;