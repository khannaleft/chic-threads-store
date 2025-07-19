import React, { useId } from 'react';

interface StarRatingProps {
  rating: number;
  totalStars?: number;
}

const StarIcon: React.FC<{ fill: string; stroke: string; }> = ({ fill, stroke }) => (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
    </svg>
);

const StarRating: React.FC<StarRatingProps> = ({ rating, totalStars = 5 }) => {
  const uniqueId = useId();

  const fullStarColor = "#f59e0b"; // amber-500
  const emptyStarColor = "#d1d5db"; // gray-300
  
  const stars = Array.from({ length: totalStars }, (_, i) => {
    const starIndex = i + 1;
    const isHalfStar = starIndex - 0.5 <= rating && starIndex > rating;
    
    let fill = "none";
    let stroke = emptyStarColor;
    const gradId = `${uniqueId}-grad-${starIndex}`;
    
    if (starIndex <= rating) {
      fill = fullStarColor;
      stroke = fullStarColor;
    } else if (isHalfStar) {
      fill = `url(#${gradId})`;
      stroke = fullStarColor;
    }
    
    return (
      <React.Fragment key={starIndex}>
        {isHalfStar && (
          <defs>
            <linearGradient id={gradId}>
              <stop offset="50%" stopColor={fullStarColor} />
              <stop offset="50%" stopColor={emptyStarColor} stopOpacity="1" />
            </linearGradient>
          </defs>
        )}
        <StarIcon fill={fill} stroke={stroke} />
      </React.Fragment>
    );
  });

  return <div className="flex items-center" role="img" aria-label={`Rating: ${rating.toFixed(1)} out of ${totalStars} stars`}>{stars}</div>;
};

export default StarRating;
