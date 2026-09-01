import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FreeMode, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import React from "react";

function ProductBanner({banners}) {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Add window resize listener to update slide widths dynamically
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Calculate slide width based on current window width
  const getSlideWidth = () => {
    if (windowWidth < 576) return "95%"; // smallPhone
    if (windowWidth < 768) return "55%"; // phone
    if (windowWidth < 992) return "50%"; // tablets
    if (windowWidth < 1200) return "45%"; // bigTablets
    if (windowWidth < 1400) return "40%"; // desktop
    return "35%"; // bigDesktop
  };

  // Create duplicated posts if there are fewer than 4
  // This ensures smooth looping with small datasets
  const getSlidesData = () => {
    // Add safety check for banners
    if (!banners || !Array.isArray(banners) || banners.length === 0) {
      return [];
    }

    if (banners.length >= 4) return banners;

    // Create duplicates with unique keys for React
    const duplicatedPosts = [...banners];
    const neededCopies = Math.ceil(4 / banners.length) - 1;

    for (let i = 0; i < neededCopies; i++) {
      banners.forEach((post, index) => {
        duplicatedPosts.push({
          ...post,
          id: `${post.id}-copy-${i}-${index}`, // Ensure unique key
        });
      });
    }
    return duplicatedPosts;
  };

  const slidesData = getSlidesData();

  // Add safety check before rendering
  if (!slidesData.length) {
    return null; // or return a loading state/placeholder
  }

  return (
    <div className="product-banner" id="blogs">

      <div className="product-banner__grid">
        <Swiper
          slidesPerView={"auto"}
          centeredSlides={true}
          spaceBetween={0}
          loop={true}
          loopedSlides={true} // Adjust looped slides
          initialSlide={0}
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={700}
          touchRatio={1}
          touchAngle={30}
          modules={[FreeMode, Autoplay]}
          className="mySwiper"
          wrapperClass="swiper-wrapper"
          cssMode={false}
          loopFillGroupWithBlank={true}
          loopAdditionalSlides={slidesData?.length > 3 ? 3 : slidesData?.length}
          centeredSlidesBounds={false}
          // grabCursor={true}
          watchSlidesProgress={true}
          observer={true}
          observeParents={true}
          resistance={true}
          resistanceRatio={0.85}
        >
          {slidesData.map((post) => (
            <SwiperSlide
              key={post.id}
              aria-label={`Product ${post.title}`}
              style={{
                width: getSlideWidth(),
                margin: "0 10px",
              }}
              // onClick={() => navigate(`/blogs/${post.name}`)}
            >
              <div className="product-card">
                <div
                  className="product-card__image"
                  style={{
                    background: `url(${post.image})`,
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default ProductBanner;
