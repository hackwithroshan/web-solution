import React, { useState } from 'react';
import { Star, Loader } from 'lucide-react';
import Button from './Button';

interface FeedbackViewProps {
  chatType: 'bot' | 'live_chat';
  onSubmit: (rating: number, comment: string) => void;
  onSkip: () => void;
  isSubmitting: boolean;
}

const FeedbackView: React.FC<FeedbackViewProps> = ({ chatType, onSubmit, onSkip, isSubmitting }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0) {
      onSubmit(rating, comment);
    }
  };

  const title = `Rate your chat with our ${chatType === 'bot' ? 'Support Bot' : 'Agent'}`;

  return (
    <main className="flex-1 p-5 overflow-y-auto flex flex-col justify-center">
      <div className="text-center">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">Your feedback helps us improve.</p>

        <div className="flex justify-center my-5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="focus:outline-none"
              aria-label={`Rate ${star} out of 5 stars`}
            >
              <Star
                className={`w-8 h-8 cursor-pointer transition-colors ${
                  (hoverRating || rating) >= star
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        
        {rating > 0 && (
          <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-up-fast">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us more about your experience (optional)..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" disabled={isSubmitting || rating === 0} className="w-full">
              {isSubmitting ? <Loader className="animate-spin h-5 w-5 mx-auto" /> : 'Submit Feedback'}
            </Button>
          </form>
        )}
        
        <button onClick={onSkip} disabled={isSubmitting} className="text-sm text-gray-500 hover:underline mt-4">
          Skip
        </button>
      </div>
    </main>
  );
};

export default FeedbackView;