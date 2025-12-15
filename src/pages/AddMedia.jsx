import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAddMediaMutation } from "../features/api/apiSlice";
import { useLazySearchMoviesQuery } from "../features/api/kinopoiskApiSlice";
import { useLazySearchAlbumsQuery, useLazySearchArtistQuery } from "../features/api/itunesApiSlice"
import { useLazySearchGamesQuery, useLazySearchGameImagesQuery, useLazyGetGameByIdQuery, useLazyGetGenresListQuery } from "../features/api/gamesdbApiSlice";
import { useLazySearchAnimeQuery, useLazySearchMangaQuery, useLazySearchAnimeByIdQuery, useLazySearchMangaByIdQuery } from "../features/api/shikimoriApiSlice";

function AddMedia() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const [addMedia, { isLoading: isAdding }] = useAddMediaMutation();
    
    // API Hooks
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
    const [triggerGetGenresList] = useLazyGetGenresListQuery(); // <-- Новый триггер для списка

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'movie',
    });
    const [searchResults, setSearchResults] = useState([]);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [mediaObject, setMediaObject] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Handlers
    const handlers = useMemo(() => ({
        setMediaObj: setMediaObject,
        setIsProcessing: setIsProcessing,
        triggerAnimeById: triggerAnimeIdSearch,
        triggerMangaById: triggerMangaIdSearch,
        triggerGamesSearch: triggerGamesSearch,
        triggerGameImages: triggerGameImagesSearch,
        triggerGameById: triggerGameById,
        triggerGetGenresList: triggerGetGenresList, // <-- Добавили в handlers
    }), []); 

    // ИСПРАВЛЕННАЯ ФУНКЦИЯ (путь к base_url)
    const extractBoxart = (imagesResponse, gameId) => {
        if (!imagesResponse?.data?.images) return null;
        
        const images = imagesResponse.data.images[String(gameId)] || [];
        
        const boxart =
            images.find(i => i.type === 'boxart' && i.side === 'front') ||
            images.find(i => i.type === 'boxart') ||
            images.find(i => i.side === 'front') ||
            images[0];
    
        // ФИКС: url лежит в data.base_url, а не в include.boxart.base_url
        const baseUrl = imagesResponse?.data?.base_url?.original;
        
        if (!boxart || !baseUrl) return null;
        
        return baseUrl + boxart.filename;
    };

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
        
            normalizeFunction: (game) => ({
                id: game.id,
                title: game.game_title,
                year: game.release_date?.slice(0, 4) || 'N/A',
                posterPreview: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTSADTNHgsEpuitRef-9GXTs8-DGReI6kmfQ&s',
                rawObject: game,
            }),
        
            toSendToDb: (finalTitle) => ({
                title: finalTitle,
                description: formData.description,
                category: formData.category,
                added_by: user.id,
                poster_url: mediaObject?.posterUrl || null,
                external_id: mediaObject?.id?.toString() || null,
                meta_data: mediaObject ? {
                    year: mediaObject.release_date?.slice(0, 4) || 'N/A',
                    genres: mediaObject.genres?.map(g => ({ genre: g })) || []
                } : {}
            }),
        
            processSelection: async (game, handlers) => {
                handlers.setIsProcessing(true);
                try {
                    // Задаем базовое состояние, чтобы интерфейс не был пустым
                    handlers.setMediaObj(game.rawObject);

                    // 1. Получаем полные данные игры и сразу список ВСЕХ жанров
                    // Promise.all ускоряет процесс
                    const [gameDetails, imagesResponse, allGenresList] = await Promise.all([
                        handlers.triggerGameById(game.id).unwrap(),
                        handlers.triggerGameImages(game.id).unwrap(),
                        handlers.triggerGetGenresList().unwrap().catch(() => []) // Если упадет, жанров просто не будет
                    ]);
            
                    // 2. Достаем постер (с исправленным путем base_url)
                    let posterUrl = extractBoxart(imagesResponse, game.id);
            
                    // 3. Fallback для постера
                    if (!posterUrl) {
                        try {
                            const altGames = await handlers.triggerGamesSearch(game.game_title).unwrap();
                            for (const altGame of altGames) {
                                if (altGame.id === game.id) continue;
                                try {
                                    const altImages = await handlers.triggerGameImages(altGame.id).unwrap();
                                    const altPoster = extractBoxart(altImages, altGame.id);
                                    if (altPoster) {
                                        posterUrl = altPoster;
                                        break;
                                    }
                                } catch { continue; }
                            }
                        } catch (e) { console.warn("Fallback failed", e); }
                    }
            
                    // 4. Сопоставляем ID жанров с их именами из списка
                    let genreNames = [];
                    if (gameDetails?.genres?.length && allGenresList?.length) {
                        genreNames = gameDetails.genres.map(genreId => {
                            // Ищем в списке жанр с таким ID
                            const foundGenre = allGenresList.find(g => g.id === Number(genreId));
                            return foundGenre ? foundGenre.name : null;
                        }).filter(Boolean); // Убираем null, если жанр не найден
                    }
            
                    // 5. Финал
                    handlers.setMediaObj({
                        ...gameDetails,
                        posterUrl,
                        genres: genreNames
                    });
            
                } catch (error) {
                    console.error('Ошибка выбора игры:', error);
                    handlers.setMediaObj({
                        ...game.rawObject,
                        posterUrl: null,
                        genres: []
                    });
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
                poster_url: mediaObject?.artworkUrl100 
                ? mediaObject.artworkUrl100.replace('100x100bb', '600x600bb') 
                : null,
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
                meta_data: mediaObject ? { 
                    genres: mediaObject.primaryGenreName 
                        ? [{ genre: mediaObject.primaryGenreName }] 
                        : [] 
                } : {}
            }),
            processSelection: (artist) => setMediaObject(artist.rawObject),
        }
    }), [user, formData, mediaObject]); 

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
            await addMedia(newItem).unwrap();
            navigate('/');
        } catch (error) {
            console.error("Не удалось добавить запись:", error);
        }
    };

    const isSearching = isSearchingMovies || isSearchingAnime || isSearchingManga || isSearchingGames || isSearchingAlbum || isSearchingArtist;

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8 flex items-center justify-center">
            <form onSubmit={handleSubmit} className="w-full max-w-xl bg-gray-900 p-6 sm:p-8 rounded-xl shadow-2xl flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Добавить в список</h2>
                    <button type="button" onClick={() => navigate('/')} className="text-sm text-gray-400 hover:text-white transition-colors duration-200">Назад</button>
                </div>
                <div>
                    <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-300">Категория</label>
                    <select id="category" value={formData.category} onChange={handleFormChange} className="bg-gray-800 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-colors duration-200">
                        <option value="movie">Фильм</option>
                        <option value="series">Сериал</option>
                        <option value="anime">Аниме</option>
                        <option value="manga">Манга</option>
                        <option value="game">Игра</option>
                        <option value="music_album">Альбом</option>
                        <option value="music_artist">Муз-исполнитель</option>
                    </select>
                </div>
                <div className="relative">
                    <label htmlFor="search-input" className="block mb-2 text-sm font-medium text-gray-300">Название</label>
                    <input type="text" id="search-input" value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                        className="bg-gray-800 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-colors duration-200"
                        placeholder="Начните вводить для поиска..." autoComplete="off" required />
                    {isSearching && isInputFocused && <div className="absolute w-full mt-1 p-2 text-center text-gray-400 text-sm">Идет поиск...</div>}
                    {searchResults.length > 0 && isInputFocused && (
                        <ul className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {searchResults.map((item) => (
                                <li key={`${formData.category}-${item.id}`}
                                    className="p-3 hover:bg-gray-700 cursor-pointer text-sm flex items-center gap-3"
                                    onClick={() => handleResultSelect(item)}>
                                    <img src={item.posterPreview} alt="poster" className="w-10 h-14 object-cover rounded"/>
                                    <span>{item.title} ({item.year})</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div>
                    <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-300">Краткое описание</label>
                    <textarea id="description" rows="3" value={formData.description} onChange={handleFormChange}
                        className="bg-gray-800 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-colors duration-200"
                        placeholder="Заполнится автоматически при выборе из списка"></textarea>
                </div>
                <button type="submit" disabled={isAdding || isProcessing}
                    className={`w-full text-white font-medium rounded-lg text-sm px-5 py-3 text-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${isProcessing ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800'}`}>
                    {isAdding ? 'Добавление...' : isProcessing ? 'Загрузка данных об игре...' : 'Готово'}
                </button>
            </form>
        </div>
    );
}

export default AddMedia;