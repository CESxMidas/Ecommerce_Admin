import { memo } from "react";
import { FaStar } from "react-icons/fa";

import "./StarRating.css";

const STAR_COUNT = 5;

function StarRating({ rating, reviews, className = "" }) {
  const filledStars = Math.floor(rating);
  const rootClass = ["star-rating", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <span className="star-rating__value">{rating}</span>
      <div className="star-rating__stars" aria-hidden="true">
        {Array.from({ length: STAR_COUNT }, (_, index) => (
          <FaStar
            key={index}
            className={index < filledStars ? "star-rating__star--active" : ""}
          />
        ))}
      </div>
      {reviews != null && (
        <p className="star-rating__reviews">({reviews})</p>
      )}
    </div>
  );
}

export default memo(StarRating);
