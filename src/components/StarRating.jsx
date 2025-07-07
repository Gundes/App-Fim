
import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, maxRating = 10, size = 16, showNumber = true }) => {
  const stars = [];
  
  for (let i = 1; i <= maxRating; i++) {
    stars.push(
      <Star
        key={i}
        size={size}
        className={`${
          i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
        } transition-colors`}
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {stars}
      </div>
      {showNumber && (
        <span className="text-sm font-medium text-gray-300">
          {rating.toFixed(1)}/10
        </span>
      )}
    </div>
  );
};

export default StarRating;
