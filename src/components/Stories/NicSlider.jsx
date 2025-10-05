import React, { useState, useEffect, useRef } from 'react';

/**
 * @typedef {Object} VideoItem
 * @property {number|string} id - Unique identifier for the video
 * @property {string} title - Title of the video
 * @property {string} clinic - Name of the clinic
 * @property {string} views - View count text
 * @property {string} duration - Duration text
 * @property {string} image - Path to the video thumbnail image
 * @property {string} [youtubeId] - YouTube video ID (optional)
 */

/**
 * Enhanced YouTube Carousel Component
 * @param {Object} props - Component props
 * @param {VideoItem[]} [props.videos=[]] - Array of video items to display
 * @param {boolean} [props.showWatchingLabel=true] - Whether to show the watching label
 * @param {boolean} [props.showPlayButton=true] - Whether to show the play button
 * @param {boolean} [props.showOverlay=true] - Whether to show the overlay
 * @param {boolean} [props.showContent=true] - Whether to show the content
 * @param {boolean} [props.showDots=true] - Whether to show the dot indicators
 * @param {boolean} [props.adaptToImageRatio=true] - Whether to adapt to image ratio
 * @param {string} [props.imageShape='rectangle'] - Shape of the image
 * @param {number} [props.imageWidth=240] - Width of the image
 * @param {number|null} [props.imageHeight=400] - Height of the image
 * @param {string} [props.objectFit='fill'] - Object fit property for the image
 * @param {number} [props.autoSlideInterval=0] - Auto slide interval in milliseconds
 * @param {number} [props.initialSlide=1] - Initial active slide index
 * @returns {JSX.Element} - Rendered component
 */
const EnhancedYouTubeCarousel = ({ 
  videos = [], 
  showWatchingLabel = true,
  showPlayButton = true,
  showOverlay = true,
  showContent = true,
  showDots = true,
  adaptToImageRatio = true,
  imageShape = 'rectangle', // Default olarak dikdörtgene ayarlandı
  imageWidth = 240, // Changed from 280px to 240px for desktop view
  imageHeight = 400, // Set default height to 400px
  objectFit = 'fill',
  autoSlideInterval = 0,
  initialSlide = 1
}) => {
  const [activeSlide, setActiveSlide] = useState(initialSlide);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoSlideInterval > 0);
  const [isHovered, setIsHovered] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200); // Default value for SSR
  const [touchStart, setTouchStart] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const imageRefs = useRef([]);
  
  // Default videos if none provided
  const defaultVideos = [
    {
      id: 1,
      title: '5 Months After Hair Transplant',
      clinic: 'DHI Hair Transplant',
      views: '555K Viewer',
      duration: '46.50 Minute',
      image: '/Journey/videoStories.webp',
      youtubeId: 'dQw4w9WgXcQ'
    },
    {
      id: 2,
      title: '5 Months After Hair Transplant',
      clinic: 'DHI Hair Transplant',
      views: '555K Viewer',
      duration: '46.50 Minute',
      image: '/Journey/videoStories.webp',
      youtubeId: 'jNQXAC9IVRw'
    },
    {
      id: 3,
      title: '5 Months After Hair Transplant',
      clinic: 'DHI Hair Transplant',
      views: '555K Viewer',
      duration: '46.50 Minute',
      image: '/Journey/videoStories.webp',
      youtubeId: 'KYniUCGPGLs'
    },
    {
      id: 4,
      title: '1 Year After FUE Transplant',
      clinic: 'FUE Hair Transplant',
      views: '423K Viewer',
      duration: '38.20 Minute',
      image: '/Journey/videoStories.webp',
      youtubeId: 'LdF2RcelrKk'
    },
    {
      id: 5,
      title: 'My Hair Transplant Journey',
      clinic: 'Sapphire Hair Transplant',
      views: '612K Viewer',
      duration: '52.15 Minute',
      image: '/Journey/videoStories.webp',
      youtubeId: 'xW2oNpNrKac'
    }
  ];
  
  const videosToDisplay = videos.length > 0 ? videos : defaultVideos;
  
  // YouTube video açma fonksiyonu
  const openYouTubeVideo = (videoId) => {
    if (!videoId) return;
    
    const container = document.getElementById('video-container');
    const iframe = document.getElementById('youtube-iframe');
    
    if (!container || !iframe) {
      console.error("Video container or iframe not found");
      return;
    }
    
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&fs=1`;
    container.style.display = 'block';
    document.body.style.overflow = 'hidden';
  };
  
  // Video kapatma fonksiyonu
  const closeVideo = () => {
    const container = document.getElementById('video-container');
    const iframe = document.getElementById('youtube-iframe');
    
    if (!container || !iframe) return;
    
    iframe.src = '';
    container.style.display = 'none';
    document.body.style.overflow = 'auto';
  };
  
  useEffect(() => {
    // Reset image refs when videos change
    imageRefs.current = Array(videosToDisplay.length).fill().map(() => React.createRef());
    
    // Preload images to get dimensions faster
    if (videosToDisplay.length > 0 && typeof window !== 'undefined') {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
          ratio: img.naturalHeight / img.naturalWidth
        });
      };
      img.src = videosToDisplay[0].image;
    }
    
    // ESC tuşu için event listener
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        closeVideo();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [videosToDisplay]);
  
  // Update on container width change for proper positioning
  useEffect(() => {
    if (containerRef.current) {
      const updateContainerWidth = () => {
        setWindowWidth(window.innerWidth);
      };
      
      if (typeof ResizeObserver !== 'undefined') {
        const resizeObserver = new ResizeObserver(updateContainerWidth);
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
      }
    }
  }, [containerRef.current]);
  
  // Initialize window width and handle resize
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      // Set initial width
      setWindowWidth(window.innerWidth);
      
      // Add resize handler
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  
  // Function to update image dimensions when images load
  const handleImageLoad = (index) => {
    if (imageRefs.current[index] && imageRefs.current[index].current) {
      const image = imageRefs.current[index].current;
      const { naturalWidth, naturalHeight } = image;
      
      setImageDimensions({
        width: naturalWidth,
        height: naturalHeight,
        ratio: naturalHeight / naturalWidth
      });
    }
  };
  
  // Auto-rotate slides when not hovered
  useEffect(() => {
    let interval;
    if (isAutoPlaying && !isHovered && autoSlideInterval > 0) {
      interval = setInterval(() => {
        handleNext();
      }, autoSlideInterval || 4000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovered, videosToDisplay.length, autoSlideInterval]);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    if (touchStart) {
      const currentTouch = e.touches[0].clientX;
      const diff = touchStart - currentTouch;
      
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          handleNext();
        } else {
          handlePrev();
        }
        setTouchStart(null);
      }
    }
  };
  
  const handleNext = () => {
    setActiveSlide((prevSlide) => {
      const nextSlide = (prevSlide + 1) % videosToDisplay.length;
      return nextSlide;
    });
  };
  
  const handlePrev = () => {
    setActiveSlide((prevSlide) => {
      const prevIndex = (prevSlide - 1 + videosToDisplay.length) % videosToDisplay.length;
      return prevIndex;
    });
  };
  
  // Calculate responsive dimensions based on props and actual image dimensions
  const calculateDimensions = () => {
    // Set base width from props or default by screen size
    let baseWidth = imageWidth;
    if (!baseWidth) {
      if (windowWidth <= 480) {
        baseWidth = Math.min(windowWidth * 0.85, 280);
      } else if (windowWidth <= 768) {
        baseWidth = Math.min(windowWidth * 0.85, 360);
      } else if (windowWidth <= 1024) {
        baseWidth = 420;
      } else {
        baseWidth = 480;
      }
    }
    
    // Calculate height based on image shape prop - her zaman dikdörtgen olacak
    let baseHeight;
    
    if (imageHeight) {
      // Use explicit height if provided
      baseHeight = imageHeight;
    } else {
      // Dikdörtgen için 16:9 oranı yerine daha yüksek bir oran kullan (3:4 oranı)
      baseHeight = baseWidth * (4/3);
    }
    
    // Ensure images are tall enough on mobile - artırılmış yükseklik değerleri
    if (windowWidth <= 480) {
      baseHeight = Math.max(baseHeight, 240); // 180'den 240'a yükseltildi
    } else {
      baseHeight = Math.max(baseHeight, 320); // 220'den 320'e yükseltildi
    }
    
    // Aktif olmayan slaytlar için daha küçük boyutlar
    const smallerWidth = baseWidth * (windowWidth <= 480 ? 0.9 : 0.85);
    const smallerHeight = baseHeight * (windowWidth <= 480 ? 0.9 : 0.85);
    
    return {
      baseWidth,
      baseHeight,
      smallerWidth,
      smallerHeight
    };
  };
  
  const dimensions = calculateDimensions();
  
  const styles = {
    container: {
      width: '100%',
      margin: '0 auto',
      padding: 0,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      maxWidth: '100%',
      overflow: 'hidden',
      marginTop: windowWidth <= 480 ? '0' : 'auto',
      marginBottom: windowWidth <= 480 ? '0' : 'auto'
    },
    carouselWrapper: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: windowWidth <= 480 ? '0' : '12px',
      padding: 0,
      height: 'auto', 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: windowWidth <= 480 ? '5px' : windowWidth <= 768 ? '15px' : '0px',
      maxWidth: '100%'
    },
    videoModal: {
      display: 'none',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      zIndex: 1000
    },
    videoIframe: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      height: '90%'
    },
    closeButton: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      color: 'white',
      fontSize: '24px',
      cursor: 'pointer',
      background: 'rgba(0, 0, 0, 0.5)',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1001
    },
    slideContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.5s ease',
      position: 'relative'
    },
    slidesWrapper: {
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: windowWidth <= 480 ? dimensions.baseHeight * 1.1 : // Adjusted for 400px height
             windowWidth <= 768 ? dimensions.baseHeight * 1.15 : 
             dimensions.baseHeight * 1.1,
      marginBottom: windowWidth <= 480 ? '5px' : windowWidth <= 768 ? '10px' : '55px',
      overflow: 'hidden', // Changed to hidden to prevent horizontal scrolling
      perspective: '1200px', // 3D efekti için perspektif ekledik
      padding: '25px 0', // Add padding to prevent shadow clipping
    },
    slide: (index) => {
      const diff = Math.abs(activeSlide - index);
      const isActive = activeSlide === index;
      
      // Aktif slayt büyük, diğerleri küçük olsun
      const scale = isActive ? 1.1 : 0.9;
      
      // Mobile layout
      if (windowWidth <= 480) {
        const containerWidth = containerRef.current ? containerRef.current.offsetWidth : windowWidth;
        const slideWidth = Math.min(dimensions.baseWidth * 0.9, containerWidth * 0.75);
        const slideHeight = dimensions.baseHeight * 0.95; // Daha yüksek bir oran
        const visiblePortion = containerWidth * 0.12;
        
        let translateX = 0;
        
        if (index < activeSlide) {
          translateX = -slideWidth - visiblePortion;
        } else if (index > activeSlide) {
          translateX = slideWidth + visiblePortion;
        }
        
        return {
          transition: 'all 0.6s cubic-bezier(0.33, 1, 0.68, 1)', // Daha yumuşak geçiş
          position: 'absolute',
          borderRadius: '8px',
          overflow: 'visible', // overflow visible olarak değiştirildi
          width: slideWidth,
          height: slideHeight,
          opacity: diff > 1 ? 0.3 : 1,
          transform: `translateX(${translateX}px) scale(${isActive ? scale : 0.9})`, // Aktif slaytı büyüt
          zIndex: isActive ? 30 : 20 - diff,
          pointerEvents: 'auto',
          left: '50%',
          marginLeft: `-${slideWidth / 2}px`,
          filter: isActive ? 'brightness(1.1)' : 'brightness(0.85)', // Aktif olanı daha parlak yap
          boxShadow: isActive ? '0 8px 30px rgba(0, 0, 0, 0.3)' : 'none', // Aktif slayda gölge ekledik
        };
      }
      // Tablet design
      else if (windowWidth <= 768) {
        const containerWidth = containerRef.current ? containerRef.current.offsetWidth : windowWidth;
        const slideWidth = Math.min(dimensions.baseWidth, containerWidth * 0.7);
        const slideHeight = dimensions.baseHeight;
        
        return {
          transition: 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)', // Daha animasyonlu geçiş
          position: 'absolute',
          borderRadius: '10px',
          overflow: 'visible', // overflow visible olarak değiştirildi
          width: slideWidth,
          height: slideHeight,
          opacity: diff > 1 ? 0.2 : 1,
          transform: `translateX(${(index - activeSlide) * 220}px) scale(${isActive ? scale : 0.85})`, // Aktif slaytı büyüt
          zIndex: isActive ? 30 : 20 - diff,
          filter: isActive ? 'brightness(1.15) contrast(1.05)' : 'brightness(0.8)', // Kontrast artırıldı
          cursor: isActive ? 'default' : 'pointer',
          transformOrigin: 'center center',
          boxShadow: isActive ? '0 10px 40px rgba(0, 0, 0, 0.25)' : 'none', // Aktif slayda gölge ekledik
        };
      }
      
      // Desktop design - geliştirilmiş efektlerle
      return {
        transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)', // Yaylı hareket efekti
        position: 'absolute',
        borderRadius: '12px',
        overflow: 'visible', // overflow visible olarak değiştirildi
        width: dimensions.baseWidth,
        height: dimensions.baseHeight,
        opacity: diff > 1 ? 0.3 : 1,
        transform: `translateX(${(index - activeSlide) * Math.max(dimensions.baseWidth * 0.9, 280)}px) 
                   scale(${isActive ? scale : 0.85}) 
                   ${!isActive ? `rotateY(${(index - activeSlide) * 10}deg)` : ''}`, // 3D efekti ekle
        zIndex: isActive ? 30 : 20 - diff,
        filter: isActive ? 'brightness(1.1) contrast(1.05)' : 'brightness(0.75)',
        cursor: isActive ? 'default' : 'pointer',
        transformOrigin: 'center center',
        boxShadow: isActive ? '0 12px 45px rgba(0, 0, 0, 0.2)' : 'none', // Aktif slayda gölge ekledik
      };
    },
    videoCard: {
      position: 'relative',
      width: '100%',
      height: '100%',
      borderRadius: windowWidth <= 480 ? '8px' : '12px',
      overflow: 'visible', // Değiştirildi: overflow visible olarak ayarlandı
      userSelect: 'none',
      cursor: 'pointer',
    },
    videoImage: {
      width: '100%',
      height: '100%',
      objectFit: objectFit,
      objectPosition: 'center center',
      transition: 'transform 0.5s ease', // Resmin kendi animasyonu
      display: 'block',
      borderRadius: windowWidth <= 480 ? '8px' : '12px', // Resme de border radius ekledik
    },
    overlay: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.8) 80%)',
      display: showOverlay ? 'block' : 'none',
      zIndex: 1,
      borderRadius: windowWidth <= 480 ? '8px' : '12px', // Video card ile aynı border radius değeri
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    contentWrapper: {
      position: 'absolute',
      inset: 0,
      display: showContent ? 'flex' : 'none',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: windowWidth <= 480 ? '10px' : windowWidth <= 768 ? '14px' : '20px',
      zIndex: 2
    },
    topBar: {
      position: 'absolute',
      top: windowWidth <= 480 ? '8px' : windowWidth <= 768 ? '12px' : '20px',
      left: windowWidth <= 480 ? '8px' : windowWidth <= 768 ? '12px' : '20px',
      right: windowWidth <= 480 ? '8px' : windowWidth <= 768 ? '12px' : '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    watchingLabel: {
      display: showWatchingLabel ? 'flex' : 'none',
      alignItems: 'center',
      color: 'white',
      fontWeight: 600,
      fontSize: windowWidth <= 480 ? '9px' : windowWidth <= 768 ? '11px' : '14px',
      padding: windowWidth <= 480 ? '2px 6px' : windowWidth <= 768 ? '3px 8px' : '6px 12px',
      borderRadius: '100px',
      background: 'rgba(0,0,0,0.5)'
    },
    audioIcon: {
      height: windowWidth <= 480 ? '10px' : windowWidth <= 768 ? '12px' : '20px',
      width: windowWidth <= 480 ? '10px' : windowWidth <= 768 ? '12px' : '20px',
      marginLeft: windowWidth <= 480 ? '3px' : windowWidth <= 768 ? '4px' : '6px',
      color: 'white'
    },
    contentBottom: {
      display: 'flex',
      flexDirection: 'column',
      gap: windowWidth <= 480 ? '1px' : windowWidth <= 768 ? '3px' : '8px',
      width: '100%',
      alignItems: 'flex-start'
    },
    title: {
      color: 'white',
      fontSize: windowWidth <= 480 ? '12px' : windowWidth <= 768 ? '14px' : '18px',
      fontWeight: 'bold',
      margin: 0,
      textShadow: '0 1px 3px rgba(0,0,0,0.6)',
      textAlign: 'left'
    },
    clinic: {
      color: 'white',
      fontSize: windowWidth <= 480 ? '10px' : windowWidth <= 768 ? '12px' : '14px',
      fontWeight: 'bold',
      margin: 0,
      opacity: 0.9,
      textShadow: '0 1px 2px rgba(0,0,0,0.5)',
      textAlign: 'left'
    },
    statsRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: windowWidth <= 480 ? '5px' : windowWidth <= 768 ? '8px' : '12px',
      width: '100%'
    },
    stats: {
      display: 'flex',
      alignItems: 'center',
      color: 'white',
      fontSize: windowWidth <= 480 ? '8px' : windowWidth <= 768 ? '10px' : '13px',
      opacity: 0.8,
      padding: '0',
      margin: '0'
    },
    separator: {
      margin: '0 4px'
    },
    // Play button'u sağ alt köşede, kısmen dışarıda ve önde olacak şekilde konumlandırdık
    playButton: {
      display: showPlayButton ? 'flex' : 'none',
      width: windowWidth <= 480 ? '40px' : windowWidth <= 768 ? '48px' : '60px',
      height: windowWidth <= 480 ? '40px' : windowWidth <= 768 ? '48px' : '60px',
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'transform 0.3s ease',
      transform: 'scale(1)',
      position: 'absolute',
      right: windowWidth <= 480 ? '-5px' : windowWidth <= 768 ? '-10px' : '-15px',
      bottom: windowWidth <= 480 ? '-5px' : windowWidth <= 768 ? '-10px' : '-15px',
      zIndex: 50,
      '&:hover': {
        transform: 'scale(1.15)'
      }
    },
    playIcon: {
      width: '100%',
      height: '100%',
      objectFit: 'contain'
    },
    dotIndicator: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      marginTop: windowWidth <= 480 ? '2px' : windowWidth <= 768 ? '8px' : '20px',
      gap: windowWidth <= 480 ? '6px' : '12px',
      padding: windowWidth <= 480 ? '2px 0' : '10px 0',
      zIndex: 40
    },
    dotIndicatorDot: (isActive) => ({
      width: windowWidth <= 480 ? '6px' : '8px',
      height: windowWidth <= 480 ? '6px' : '8px',
      borderRadius: '50%',
      background: isActive ? '#007bff' : '#dddddd',
      transition: 'all 0.4s ease', // Smooth dot transition
      cursor: 'pointer',
      transform: isActive ? 'scale(1.3)' : 'scale(1)', // Aktif dot büyütüldü
      opacity: isActive ? 1 : 0.6,
      border: isActive ? '1px solid #007bff' : '1px solid #ccc'
    })
  };

  return (
    <>
      {/* YouTube video modal */}
      <div id="video-container" style={styles.videoModal}>
        <div style={styles.closeButton} onClick={closeVideo}>✖</div>
        <iframe 
          id="youtube-iframe" 
          style={styles.videoIframe}
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowFullScreen
        ></iframe>
      </div>
      
      {/* Carousel component */}
      <div style={styles.container} ref={containerRef}>
        <div 
          style={styles.carouselWrapper} 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => setTouchStart(null)}
        >
          <div style={styles.slidesWrapper}>
            {videosToDisplay.map((video, index) => {
              const isActive = activeSlide === index;
              
              return (
                <div
                  key={`slide-${video.id}-${index}`}
                  style={styles.slide(index)}
                  onClick={() => {
                    if (index !== activeSlide) {
                      setActiveSlide(index);
                    } else if (video.youtubeId) {
                      openYouTubeVideo(video.youtubeId);
                    }
                  }}
                >
                  <div style={styles.videoCard}>
                    <img loading="lazy" 
                      ref={imageRefs.current[index]}
                      src={video.image} 
                      alt={video.title} 
                      style={{
                        ...styles.videoImage,
                        transform: isActive ? 'scale(1.0)' : 'scale(1)' // No scaling for active slide
                      }}
                      onLoad={() => handleImageLoad(index)}
                    />
                    <div style={styles.overlay} />
                    
                    <div style={styles.contentWrapper}>
                      <div style={styles.topBar}>
                        <div style={styles.watchingLabel}>
                          <span>Watching</span>
                          <svg style={styles.audioIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.657 6.343a8 8 0 010 11.314M6.174 6.174a8 8 0 0111.652 0M7.757 7.757a5 5 0 017.486 0" />
                          </svg>
                        </div>
                      </div>
                      
                      <div style={styles.contentBottom}>
                        <h3 style={styles.title}>{video.title}</h3>
                        {video.clinic && <h4 style={styles.clinic}>{video.clinic}</h4>}
                        
                        <div style={styles.statsRow}>
                          <div style={{...styles.stats, marginLeft: '0'}}>
                            {video.views && <span>{video.views}</span>}
                            {video.views && video.duration && <span style={styles.separator}>•</span>}
                            {video.duration && <span>{video.duration}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {video.youtubeId && (
                      <div 
                        style={styles.playButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (video.youtubeId) {
                            openYouTubeVideo(video.youtubeId);
                          }
                        }}
                      >
                        <img loading="lazy" 
                          src="/videothumbnamils/youtbe-short.png" 
                          alt="YouTube Shorts" 
                          style={styles.playIcon}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Dot indicators */}
        {showDots && (
          <div style={styles.dotIndicator}>
            {videosToDisplay.map((_, index) => (
              <div
                key={`dot-${index}`}
                style={styles.dotIndicatorDot(activeSlide === index)}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default EnhancedYouTubeCarousel;
