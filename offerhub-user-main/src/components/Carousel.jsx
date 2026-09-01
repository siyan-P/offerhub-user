import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "./ui/Skeleton";

function Carousel({ data, maxHeight, isBrand = false, isLoading, from }) {
  const navigate = useNavigate();

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    fade: true,
    cssEase: "ease-in-out",
    arrows: false,
    customPaging: () => <div className="custom-dot" />,
    dotsClass: "slick-dots custom-dots",
  };

  // A hero-shaped placeholder, so the fold doesn't collapse and then jump when
  // the banners arrive. Previously this rendered a full-screen grey overlay.
  if (isLoading) {
    return (
      <div className="carousel-container carousel-container--loading">
        <Skeleton className="carousel-skeleton" />
      </div>
    );
  }

  if (!data?.length) return null;

  return (
    <div className="carousel-container" style={{ maxHeight }}>
      <Slider {...settings}>
        {data.map((item, index) => {
          const image = isBrand ? item.brand?.bannerImage : item.image;
          const isClickable = from === "homepage";

          return (
            <div
              key={image || index}
              className="carousel-slide"
              onClick={isClickable ? () => navigate("/products") : undefined}
              role={isClickable ? "link" : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={
                isClickable
                  ? (event) => {
                      if (event.key === "Enter") navigate("/products");
                    }
                  : undefined
              }
            >
              <img
                src={image}
                alt={item.alt || item.title || "Promotional banner"}
                className="carousel-image"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : undefined}
                style={{ objectFit: from === "allproducts" ? "fill" : "cover" }}
              />
            </div>
          );
        })}
      </Slider>
    </div>
  );
}

export default Carousel;
