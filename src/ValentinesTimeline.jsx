import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Heart, Music, MessageCircleHeart, Stars, MapPin, Brain, Trophy, Check, X, AlertTriangle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";
import './App.css'
import { motion, AnimatePresence } from "framer-motion";

const defaultIcon = L.icon({
    iconUrl: markerIconPng,
    shadowUrl: markerShadowPng,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const heartIcon = L.divIcon({
    html: `
        <svg viewBox="0 0 24 24" width="24" height="24" fill="#FF3566" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
    `,
    className: "heart-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 24] // Anchors the icon at the bottom center
});

L.Marker.prototype.options.icon = heartIcon;

// Custom Alert Component


const TimelineMemoryGame = ({ photos, onComplete }) => {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [disabled, setDisabled] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [moves, setMoves] = useState(0);
    const [highScore, setHighScore] = useState(null);
    const elementRef = useRef(null);
  
    useEffect(() => {
      // Load high score from localStorage
      const storedHighScore = localStorage.getItem('memoryGameHighScore');
      if (storedHighScore) {
        setHighScore(parseInt(storedHighScore));
      }
    }, []);
  
    useEffect(() => {
      // Randomly select 6 photos from the larger pool
      const selectedPhotos = photos
        .sort(() => Math.random() - 0.5) // Shuffle the array
        .slice(0, 6); // Select the first 6
  
      // Create pairs of cards from selected photos
      const photoCards = selectedPhotos.flatMap((photo, index) => [
        { id: index * 2, imageUrl: photo.url, title: photo.title },
        { id: index * 2 + 1, imageUrl: photo.url, title: photo.title }
      ]);
  
      const shuffledCards = photoCards.sort(() => Math.random() - 0.5);
      setCards(shuffledCards);
    }, [photos]);
  
    useEffect(() => {
      // Scroll animation observer
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('opacity-100', 'translate-y-0');
              entry.target.classList.remove('opacity-0', 'translate-y-10');
            }
          });
        },
        { threshold: 0.1 }
      );
  
      if (elementRef.current) {
        observer.observe(elementRef.current);
      }
  
      return () => {
        if (elementRef.current) {
          observer.unobserve(elementRef.current);
        }
      };
    }, []);
  
    const handleCardClick = (id) => {
      if (disabled || flipped.includes(id) || matched.includes(id)) return;
  
      const newFlipped = [...flipped, id];
      setFlipped(newFlipped);
  
      if (newFlipped.length === 2) {
        setDisabled(true);
        setMoves(moves + 1); // Increment moves counter
        const [first, second] = newFlipped;
        const firstCard = cards.find((card) => card.id === first);
        const secondCard = cards.find((card) => card.id === second);
  
        if (firstCard.imageUrl === secondCard.imageUrl) {
          setMatched([...matched, first, second]);
          setFlipped([]);
          setDisabled(false);
  
          // Check if game is complete
          if (matched.length + 2 === cards.length) {
            if (onComplete) onComplete();
  
            // Check if new high score
            if (!highScore || moves + 1 < highScore) {
              setHighScore(moves + 1);
              localStorage.setItem('memoryGameHighScore', moves + 1);
            }
          }
        } else {
          setTimeout(() => {
            setFlipped([]);
            setDisabled(false);
          }, 1000);
        }
      }
    };
  
    const resetGame = () => {
      setIsStarted(false);
      setMatched([]);
      setFlipped([]);
      setMoves(0);
      const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
      setCards(shuffledCards);
    };
  
    return (
      <div
        ref={elementRef}
        className="opacity-0 translate-y-10 transition-all duration-1000 bg-white rounded-lg shadow-xl p-6 my-16 text-black"
      >
        <h3 className="text-2xl font-bold text-center mb-6">Наші фоточки🤩</h3>
        <div className="text-center mb-4">
          <p>К-сть ходів: <span className="font-bold">{moves}</span></p>
          <p>Найменша к-сть ходів: <span className="font-bold">{highScore ?? 'N/A'}</span></p>
        </div>
        {!isStarted ? (
          <div className="text-center">
            <p className="mb-4">Знайди пару нашим фото і згадай всі ці класні моменти</p>
            <button
              onClick={() => setIsStarted(true)}
              className="px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
            >
              Розпочати гру
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`card aspect-square cursor-pointer transition-transform duration-300 ${
                  flipped.includes(card.id) || matched.includes(card.id) ? 'flipped' : ''
                }`}
                onClick={() => handleCardClick(card.id)}
              >
                <div className="card-inner relative w-full h-full">
                  <div className="card-front bg-rose-100 flex items-center justify-center rounded-lg">
                    <Heart className="text-rose-500" size={32} />
                  </div>
                  <div className="card-back">
                    <img
                      src={card.imageUrl}
                      alt={card.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {matched.length === cards.length && (
          <div className="text-center mt-6">
            <h4 className="text-xl font-bold text-rose-500">Вітаюуюуюуюу! 🎉</h4>
            <p className="mt-2">Ти заметчила всі наші моменти! п.с. можеш спробувати ще раз, кожного разу фотки рандомляться</p>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors mt-4"
            >
              Зіграти ще раз
            </button>
          </div>
        )}
      </div>
    );
  };

  const TimelineEvent = ({
    date,
    title,
    description,
    pictures = [], // Array of image URLs
    imagePosition = 'left',
  }) => {
    const elementRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
  
    // Intersection Observer for animation
    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add(
                'opacity-100',
                'translate-y-0',
                'rotate-0',
                'scale-100'
              );
              entry.target.classList.remove(
                'opacity-0',
                'translate-y-10',
                'rotate-3',
                'scale-95'
              );
            }
          });
        },
        { threshold: 0.1 }
      );
  
      if (elementRef.current) {
        observer.observe(elementRef.current);
      }
  
      return () => {
        if (elementRef.current) {
          observer.unobserve(elementRef.current);
        }
      };
    }, []);
  
    // Open fullscreen viewer
    const openFullscreen = (index) => {
      setCurrentIndex(index);
      setIsFullscreen(true);
    };
  
    // Close fullscreen viewer
    const closeFullscreen = () => {
      setIsFullscreen(false);
    };
  
    const variants = {
        enter: (direction) => ({
          x: direction > 0 ? 100 : -100,
          opacity: 0,
        }),
        center: {
          x: 0,
          opacity: 1,
        },
        exit: (direction) => ({
          x: direction < 0 ? 100 : -100,
          opacity: 0,
        }),
      };
      
      const [direction, setDirection] = useState(0);
      
      const showNextImage = () => {
        setDirection(1);
        setCurrentIndex((prevIndex) =>
          prevIndex === pictures.length - 1 ? 0 : prevIndex + 1
        );
      };
      
      const showPrevImage = () => {
        setDirection(-1);
        setCurrentIndex((prevIndex) =>
          prevIndex === 0 ? pictures.length - 1 : prevIndex - 1
        );
      };
    // Tap or click navigation on sides
    const handleSideClick = (event) => {
      const { clientX, target } = event;
      const targetRect = target.getBoundingClientRect();
      const clickPosition = clientX - targetRect.left;
  
      if (clickPosition < targetRect.width / 2) {
        showPrevImage();
      } else {
        showNextImage();
      }
    };
  
    // Close fullscreen on Escape key
    const handleKeyDown = useCallback((event) => {
      if (event.key === 'Escape') {
        closeFullscreen();
      }
    }, []);
  
    useEffect(() => {
      if (isFullscreen) {
        window.addEventListener('keydown', handleKeyDown);
      } else {
        window.removeEventListener('keydown', handleKeyDown);
      }
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [isFullscreen, handleKeyDown]);
  
    return (
      <>
        <div
          ref={elementRef}
          className={`flex flex-col rounded-lg md:flex-row items-center gap-4 mb-16 opacity-0 translate-y-10 rotate-3 scale-95 transition-all duration-1000 ease-out  hover:shadow-xl ${
            imagePosition === 'right' ? 'md:flex-row-reverse' : ''
          }`}
        >
          <div className="w-full md:w-1/2 rounded-lg">
            <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
              {pictures.length > 0 ? (
                pictures.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`${title} ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg transition-transform duration-500 hover:scale-105 cursor-pointer"
                    onClick={() => openFullscreen(index)}
                  />
                ))
              ) : (
                <img
                  src="./assets/default_image.jpg"
                  alt={title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
            </div>
          </div>
          <div className="w-full md:w-1/2 text-center md:text-left p-4">
            <div className="text-rose-500 font-semibold mb-2">{date}</div>
            <h3 className="text-2xl font-bold mb-2 text-black">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>
  
        {/* Fullscreen Gallery */}

        

{/* Fullscreen Gallery */}
<AnimatePresence mode="wait" custom={direction}>
  {isFullscreen && (
    <motion.div
      className="fixed inset-0 z-50 backdrop-blur-lg bg-black/70 flex flex-col items-center justify-center"
      onClick={closeFullscreen}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.button
        className="absolute top-4 right-4 text-white text-3xl"
        onClick={(e) => {
          e.stopPropagation();
          closeFullscreen();
        }}
        whileHover={{ scale: 1.2, color: '#F87171' }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        &times;
      </motion.button>
      <motion.div
        className="relative flex items-center justify-center w-full h-full overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence custom={direction} mode="wait">
  <motion.img
    key={currentIndex}
    src={pictures[currentIndex]}
    alt={`Fullscreen ${currentIndex + 1}`}
    className="max-w-4xl max-h-[80vh] object-contain w-[96%] md:w-auto"
    onClick={(e) => e.stopPropagation()}
    custom={direction}
    variants={variants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{
      x: { type: "tween", duration: 0.3, ease: "easeInOut" },
      opacity: { duration: 0.3 },
    }}
  />
</AnimatePresence>
        <motion.button
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-400"
          onClick={(e) => {
            e.stopPropagation();
            showPrevImage();
          }}
          whileHover={{ scale: 1.3, color: '#F87171' }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          &#8249;
        </motion.button>
        <motion.button
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-400"
          onClick={(e) => {
            e.stopPropagation();
            showNextImage();
          }}
          whileHover={{ scale: 1.3, color: '#F87171' }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          &#8250;
        </motion.button>
      </motion.div>
      <motion.div
        className="w-full h-30 overflow-x-auto mt-4"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex justify-center gap-2 px-4">
          {pictures.map((url, index) => (
            <motion.img
              key={index}
              src={url}
              alt={`Thumbnail ${index + 1}`}
              className={`w-20 h-20 object-cover cursor-pointer rounded-lg border-2 transition-transform hover:scale-105 ${
                index === currentIndex
                  ? 'border-rose-500'
                  : 'border-transparent'
              }`}
              onClick={() => setCurrentIndex(index)}
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


      </>
    );
  };

// Custom Alert Component
const LoveNote = ({ onClose, children }) => (
    <div className="flex items-center justify-center w-full">
    <div className="max-w-lg mx-auto mb-8 mr-3 ml-3 bg-white border-2 border-rose-200 rounded-lg p-4 shadow-lg">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 text-rose-500 font-semibold">
                <Stars size={16} />
                Моя зіронько...
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>
        <div className="mt-2 text-gray-600 italic">{children}</div>
    </div>
    </div>
);

    // Quiz Component
    const RelationshipQuiz = () => {
        const [currentQuestion, setCurrentQuestion] = useState(0);
        const [score, setScore] = useState(0);
        const [showResult, setShowResult] = useState(false);
        const [selectedOption, setSelectedOption] = useState(null);
        const [isAnswered, setIsAnswered] = useState(false);
        const [showAlertOther, setShowAlertOther] = useState(false);
    
        const questions = [
        {
            question: "Проходиш опитування сама?",
            options: ["Та", "Ні"],
            correct: 0,
        },
        {
            question: "Твій улюблений колір білизни?",
            options: ["Чорний", "Червоний", "Рожевий", "Білий"],
            correct: 0,
        },
        {
            question: "Щоб ти вибрала?",
            options: [
            "Надягнути пов'язку на очі",
            "Надягнути пов'язку на партнера і взяти контроль",
            ],
            correct: 1,
        },
        {
            question: "Щоб ти вибрала?",
            options: ["Легкий spanking", "Лагідні кусання"],
            correct: 0,
        },
        {
            question: "Улюблене місце для лизання?",
            options: ["Лице", "Губи", "Соски", "Живіт", "Нижче"],
            correct: 2,
        },
        {
            question: "Щоб ти вибрала?",
            options: ["Масаж", "Танець"],
            correct: 0,
        },
        {
            question: "Який мейк мені б найбільше підійшов?",
            options: [
            "Природний і мінімальний",
            "Bold і гламурний",
            "Грайливий і кольоровий",
            "Немає preferenc'у",
            ],
            correct: 1,
        },
        {
            question: "Що ти найбільше цінуєш в житті?",
            options: [
            "Любов і щастя",
            "Кар'єрні цілі",
            "Сімейні зв'язки",
            "Проживати збалансовне життя",
            ],
            correct: 3,
        },
        {
            question: "Поцілунок під дощем?",
            options: ["Та", "хз", "Ні"],
            correct: 0,
        },
        {
            question: "Я тебе люблю",
            options: ["Та", "Ні"],
            correct: 0,
        },
        ];
    
        const handleAnswer = (optionIndex) => {
        if (isAnswered) return;
    
        setSelectedOption(optionIndex);
        setIsAnswered(true);
    
        if (optionIndex === questions[currentQuestion].correct) {
            setScore(score + 1);
        } else if (currentQuestion === 0) {
            setShowAlertOther(true);
        }
    
        setTimeout(() => {
            if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            } else {
            setShowResult(true);
            }
            setSelectedOption(null);
            setIsAnswered(false);
        }, 1500);
        };
    
        return (
        <div className="bg-white rounded-lg shadow-xl p-6 mb-16 relative">
            <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
            <Brain className="text-rose-500" />
            Наскільки добре ти все пам'ятаєш?
            </h3>
    
            <div className="mb-4">
            <p className="text-sm text-gray-500">
                Питання {currentQuestion + 1} з {questions.length}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <motion.div
                className="bg-rose-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
                />
            </div>
            </div>
    
            <AnimatePresence mode="wait">
            {!showResult ? (
                <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                >
                <p className="text-lg font-medium mb-4">
                    {questions[currentQuestion].question}
                </p>
                <div className="grid gap-3">
                    {questions[currentQuestion].options.map((option, index) => {
                    const isCorrect = index === questions[currentQuestion].correct;
                    const isChosen = index === selectedOption;
    
                    return (
                        <button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        className={`p-3 rounded-lg transition-colors text-left flex items-center gap-2 ${
                            isAnswered
                            ? isCorrect
                                ? "bg-green-100 text-green-600"
                                : isChosen
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-500"
                            : "bg-rose-50 hover:bg-rose-100"
                        }`}
                        disabled={isAnswered}
                        >
                        {isAnswered && (
                            <>
                            {isCorrect ? (
                                <Check className="text-green-600" />
                            ) : isChosen ? (
                                <X className="text-red-600" />
                            ) : (
                                <span className="w-6 h-6 inline-block" />
                            )}
                            </>
                        )}
                        {option}
                        </button>
                    );
                    })}
                </div>
                </motion.div>
            ) : (
                <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="text-center"
                >
                <Trophy className="mx-auto text-rose-500 mb-4" size={48} />
                <p className="text-xl font-bold">
                    Ти успішно відгадала {score} з {questions.length} питань!
                </p>
                </motion.div>
            )}
            </AnimatePresence>
    
            <AnimatePresence>
            {showAlertOther && (
                <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className=" z-9999 fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
                onClick={() => setShowAlertOther(false)}
                >
                <div className="bg-white rounded-lg p-4 shadow-xl text-center max-w-sm">
                    <AlertTriangle className="mx-auto text-rose-500 mb-2" size={32} />
                    <p className="font-bold text-lg">Попередження</p>
                    <p className="text-gray-600 mt-2">
                    Тут є досить відверті питання, тому be careful.
                    </p>
                </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
        );
    };


// Map Component
const LoveMap = () => {
    const places = [
        { 
            name: "Табір, Орявчик", 
            lat: 48.96534142111789, 
            lng: 23.282258839031734, 
            description: "Все почалось тут.."
        },
        { 
            name: "Антикіно", 
            lat: 49.8413590880882, 
            lng: 24.02889748010767, 
            description: "Дуже зручне місце для уважного перегляду фільмів" 
        },
        { 
            name: "Моя улюблена лавка", 
            lat: 49.84253531960455, 
            lng: 24.036686470233143, 
            description: "Ліхтар теж тут прикольний, найнадійніша гадалка" 
        },
        { 
            name: "Найкраща зупинка", 
            lat: 49.83824752332151, 
            lng: 24.034884082154992, 
            description: "Місце прощання і деколи зустрічі(після ЛНУ)" 
        },
        { 
            name: "Моя улюблена лавка", 
            lat: 49.84253531960455, 
            lng: 24.036686470233143, 
            description: "Ліхтар теж тут прикольний, найнадійніша гадалка" 
        },
        { 
            name: "OG місце зустрічі", 
            lat: 49.840479436809304, 
            lng: 24.02227523982687, 
            description: "Вдячний лну за те, що дав нам це місце" 
        },
        { 
            name: "Твій львівський дім", 
            lat: 49.870246755857224, 
            lng: 24.001763841679956, 
            description: "Заздрю Ярині" 
        },
        { 
            name: "Рандомний парк", 
            lat: 49.84804236476687,
            lng: 24.033735748973676, 
            description: "Класне місце, щоб почати триматись за руки не наосліп" 
        },
        { 
            name: "Личаківський цвинтар", 
            lat: 49.83256407685771, 
            lng: 24.056080268662466, 
            description: "Класне місце, щоб почати триматись за руки наосліп" 
        },
        { 
            name: "Teddy", 
            lat: 49.83684542942022, 
            lng: 24.02789816495955, 
            description: "Наш перший ресторан(їдальня в таборі не рахується :)  )" 
        },
        { 
            name: "Fest, Джипи на Леві", 
            lat: 49.85183380463662, 
            lng: 24.051810649328914, 
            description: "Наш перший концерт" 
        },
        { 
            name: "Celentano", 
            lat: 49.83722210776664, 
            lng: 24.03482778400648, 
            description: "Якщо ідей немає, то йдемо сюди)" 
        },
        { 
            name: "Майстерня моєї зіроньки", 
            lat: 49.84019829182452,
            lng: 24.03733003982694, 
            description: "Можна подивитись як ти наполегливо працюєш і на результати цієї праці" 
        },
        { 
            name: "Мальорка", 
            lat: 39.683538288398495, 
            lng: 2.7878648792580827 , 
            description: "Тут буде твоя картина 🥹🥹" 
        }
    ];

    return (
        <div className="bg-white rounded-lg shadow-xl p-6 mb-16">
            <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
                <MapPin className="text-rose-500" />
                Найкращі точки всесвіту
            </h3>
            <MapContainer 
            
    center={[49.843449634225635, 24.026052250504783]} 
    zoom={12} 
    style={{ 
        height: "400px", 
        width: "100%", 
        borderRadius: "0.5rem"
    }}
    >

               <TileLayer
    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    style={{
        filter: "hue-rotate(-20deg) brightness(1.1) saturate(0.7)"

    }}
    />
                {places.map((place, index) => (
                   <Marker 
                   key={index} 
                   position={[place.lat, place.lng]}
                   icon={heartIcon}
               >
               
                        <Popup>
                            <h4 className="font-bold">{place.name}</h4>
                            <p>{place.description}</p>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};


const Celebration = () => {
    const confettiPieces = Array(50).fill().map((_, i) => ({
        id: i,
        type: Math.random() > 0.5 ? 'heart' : 'circle',
        left: `${Math.random() * 100}vw`,
        size: Math.random() * 1 + 0.5,
        animationDuration: `${Math.random() * 2 + 1}s`,
        animationDelay: `${Math.random() * 0.5}s`
    }));

    return (
        <div className="fixed inset-0 z-50 pointer-events-none">
            {/* White background with congratulations text */}
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-rose-500 mb-2 animate-bounce">
                        УРАААААААА! 🎉
                    </h2>
                    <p className="text-xl text-rose-400">
                        Ти все правильно заметчила!
                    </p>
                </div>
            </div>

            {/* Falling hearts and circles */}
            {confettiPieces.map((piece) => (
                <div
                    key={piece.id}
                    className={`absolute top-0 animate-celebrate`}
                    style={{
                        left: piece.left,
                        transform: `scale(${piece.size})`,
                        animationDuration: piece.animationDuration,
                        animationDelay: piece.animationDelay
                    }}
                >
                    {piece.type === 'heart' ? (
                        <Heart 
                            size={24} 
                            className="text-rose-500" 
                            fill="currentColor"
                        />
                    ) : (
                        <div 
                            className="w-4 h-4 rounded-full bg-rose-400"
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

const ValentinesTimeline = () => {
    const [showLoveNote, setShowLoveNote] = useState(false);
    const [currentSong, setCurrentSong] = useState(null);
    const [showCelebration, setShowCelebration] = useState(false);
    
    const memoryGamePhotos = [
        { url: "https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9ipNdQZJLnkQSfd2Y7zl4Cox5NBgFhGHJbDZ3y", title: "Cube Room    " },
        { url: "https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9ic3W0wUFvq6Uva5szWnp8IxfrlDgXZhE2FTO3", title: "Camp" },
        { url: "https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9iMOt6HOT8TOtWm6F3x54ALiKudRJNGIESs9wr", title: "Nicholas" },
        { url: "https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9iMes2hWT8TOtWm6F3x54ALiKudRJNGIESs9wr", title: "Dressing" },
        { url: "https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9iSOmKJlr9MC8Ne42ygIc5Rspt7KzVJ0qQxPLA", title: "Concert" },
        { url: "https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9iGbpi4amiAQDsoI83r9mCdYy4JVeSX5GO1l0Z", title: "Concert" },
        { url: "https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9iqf8zST1ziPLFnmJvwKUYAGNVZITa0x4cE2OS", title: "Concert" },
        { url: "https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9i081Ek7FxsVBrb1iygTDQuFZcw3Jfh4LXWq0H", title: "Concert" },
        { url: "https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9idt1Ifv9VMKU7aTtEkxGfHBFq1iZACmyLRbuS", title: "Concert" },
        { url: "https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9idaZZxc9VMKU7aTtEkxGfHBFq1iZACmyLRbuS", title: "Concert" },
        { url: "https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9iS9A1dhjr9MC8Ne42ygIc5Rspt7KzVJ0qQxPL", title: "Concert" },
        { url: "https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9idcA2qQ9VMKU7aTtEkxGfHBFq1iZACmyLRbuS", title: "Concert" },
        { url: "https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9iVicBigsECeKgURcPlSEjoM2hzTGbXLvatd94", title: "Concert" },
        { url: "https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9ivzOmFgXrR1Xp0359UW7qZ4HoTDsewmF2jbBI", title: "Concert" },
        { url: "https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9iHcRo0nJDXigUMhk8rxCAlmVuo4YcEqQFJp9Z", title: "Feasm" }
    ];
    

    const handleGameComplete = () => {
        setShowCelebration(true);
        // Show celebration for longer duration
        setTimeout(() => setShowCelebration(false), 4000);
    };

    return (
        <div className="min-h-screen bg-pink-50 relative overflow-hidden">
                    {showCelebration && <Celebration />}
           
            {/* Rest of the existing components */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <Heart
                        key={i}
                        className="absolute text-rose-200 animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            opacity: 0.3
                        }}
                        size={24}
                    />
                ))}
            </div>

            <header className="text-center py-16 bg-gradient-to-b from-rose-100 to-pink-50">
                <Heart className="mx-auto text-rose-500 mb-4 animate-bounce" size={48} />
                <h1 className="text-4xl font-bold text-rose-600 mb-2">Історія нашого Love</h1>
                <p className="text-black-400 font-semi-bold p-2">Таймлайн спільних моментів до того, як спільним стало все життя</p>
                <button
                    onClick={() => setShowLoveNote(true)}
                    className="mt-4 flex items-center gap-2 mx-auto px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all hover:scale-105"
                >
                    <MessageCircleHeart size={20} />
                    Відкрити записку
                </button>
            </header>

            {showLoveNote && (
                <LoveNote onClose={() => setShowLoveNote(false)}>
                    Вітаю тебе, Насте, з днем Валентина! Мені дуже шкода, що нам не вдалось провести його сьогодні разом, тому відсвяткуємо його пізніше.
                    Попри це, я хотів нагадати тобі як тебе люблю і зробив такий дистанційний подарунок з нашою історією, фотками, картою місць(не тільки львівських), опитуванням і міні-грою. 
                    Надіюсь це хоч трохи тобі просвітить цей день, люблю тебе🫶
                </LoveNote>
            )}

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Timeline events */}
               <TimelineEvent
                    date="7 липня - 13 липня, 2024"
                    title="Літній англомовний табір"
                    description="Моя улюблена orange team і ще улюбленіша розмова біля багаття..."
                    pictures={["https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9ic3W0wUFvq6Uva5szWnp8IxfrlDgXZhE2FTO3","https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9iiEouiJLW6LPzucmUqkN7dBER024fFrYMZS1X"]}
                    imagePosition="left"
                />

                <TimelineEvent
                    date="8 серпня - 9 серпня, 2024"
                    title="Перший позатабірний контакт"
                    description="Ти проявляєш ініціативу, а я з відсутнім інтеренетом не можу адекватно на неї відкликнутись"
                    pictures={["https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9i0z89g5FxsVBrb1iygTDQuFZcw3Jfh4LXWq0H","https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9iAK4U4lE7QB1CsOXSht6lH7JGqzfo8UFxT3eu"]}
                    imagePosition="right"
                />

                <TimelineEvent
                    date="13 серпня, 2024"
                    title="Перше голосове"
                    description="1 з 3881"
                    pictures={["https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9iffrFuLGeYpWUtnQzxwK3jAVhcEokLiHRlZTG","https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9ikdUX8syQEbyaNR7uHOfv6SU4oBLWixFcnVge"]}
                    imagePosition="left"
                />
                <TimelineEvent
                    date="17 серпня, 2024"
                    title="Початок ери подкастів"
                    description="Перші (сумарно) 20+ хвилинні голосові. Пінг-понг подкастами продовжувався і в наступні місяці. p.s. 'постараюсь в наступних голосових бути лакончнішим'🤣🤣"
                    pictures={["https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9irD1w53duqHMJdlkRKGN41IhxADg7zmbZyTPX", "https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9ic3DdhPBvq6Uva5szWnp8IxfrlDgXZhE2FTO3"]}
                    imagePosition="right"
                />
                <TimelineEvent
                    date="8 вересня, 2024"
                    title="Спільний день народження"
                    description="Не найкраще я себе показав чи поводився під час цього святкування, але подарунки + слова з листа мені дуже зігріли серце"
                    pictures={["https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9i84OcdLNLPnJSX92uzmVY31rNjlHgMDCKbIwU","https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9iChRxKDi9NI3Z7QK21WkBHfwUSgROMA6PnqxF", "https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9ipNuV9DNnkQSfd2Y7zl4Cox5NBgFhGHJbDZ3y", "https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9ikQJVWojyQEbyaNR7uHOfv6SU4oBLWixFcnVg"]}
                    imagePosition="left"
                />
                <TimelineEvent
                    date="18 вересня - 3 жовтня, 2024"
                    title="Настолккииии"
                    description="Класний час щоб разом комфортно в компанії повеселитись"
                    pictures={["https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9ikfeZXQyQEbyaNR7uHOfv6SU4oBLWixFcnVge",
                    "https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9iL5Gzxycpvgj7WrJQthefb3O8AnR0Mqk1mFl4",
                     "https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9iqfZ6ty1ziPLFnmJvwKUYAGNVZITa0x4cE2OS",
                      "https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9iFbTDHSNMIcnb5zjvaLdSFgVst96u8WhUDQ7y",
                    "https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9iZpwqrlOFMroQnZUPIHVvyfbtTKD4RlNhX3g8",
                    "https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9iLE85t0cpvgj7WrJQthefb3O8AnR0Mqk1mFl4"
               
                    ]}
                    imagePosition="right"
                />
                <TimelineEvent
                    date="1 жовтня, 2024"
                    title="Перша прогулянка 1-на-1"
                    description="Я дууууже нервувався і переживав що після неї ти в мені розчаруєшся, що я занадто нудний подумаєш, але пройшло все суперово"
                    pictures={["https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9ivltURYXrR1Xp0359UW7qZ4HoTDsewmF2jbBI","https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9iH9li4WJDXigUMhk8rxCAlmVuo4YcEqQFJp9Z"]}
                    imagePosition="left"
                />
                 <TimelineEvent
                    date="20 жовтня, 2024"
                    title="Личаківський цвинтар"
                    description="Файно погуляли і вперше взялись за руки(завдяки твоїй геніальній ідеї)"
                    pictures={["https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9iIyQLJVwQwA2dXEv4sFHGbk51crpzxCuTMlDW","https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9iA6Tstj7QB1CsOXSht6lH7JGqzfo8UFxT3eup"]}
                    imagePosition="right"
                />
                  <TimelineEvent
                    date="9 листопада, 2024 - друге пришестя, ядерна війна, або просто смерть  "
                    title="Любов. Ми."
                    description="Найкраща сторінка мого життя вже чітко почалась тут"
                    pictures={["https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9ipDBg3nkQSfd2Y7zl4Cox5NBgFhGHJbDZ3ymO","https://ck4he7rpsa.ufs.sh/f/TIakBjb0DI9iveWBkrXrR1Xp0359UW7qZ4HoTDsewmF2jbBI"]}
                    imagePosition="left"
                />
                {/* Map Section */}
                <LoveMap />
                
                {/* Quiz Section */}
                <RelationshipQuiz />
                
                {/* Memory Game */}
                <TimelineMemoryGame 
                    photos={memoryGamePhotos}
                    onComplete={handleGameComplete}
                />
                
             
            </main>

            <footer className="text-center py-8 bg-gradient-to-t from-rose-100 to-pink-50">
                <Heart className="mx-auto text-rose-500 animate-pulse" size={32} />
                <p className="text-gray-600 mt-4">З днем кохання, Насте! ❤️</p>
            </footer>
        </div>
    );
};

export default ValentinesTimeline;