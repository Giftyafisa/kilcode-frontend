import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';

function ReviewsSection({ code, onAddReview }) {
  const { user } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onAddReview({
        rating,
        comment,
        codeId: code.id,
        userId: user.id,
        timestamp: new Date().toISOString()
      });
      setShowReviewForm(false);
      setRating(5);
      setComment('');
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Reviews</h3>
        {!showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      <AnimatePresence>
        {showReviewForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-800/50 rounded-lg p-4 space-y-4"
            onSubmit={handleSubmitReview}
          >
            <div>
              <label className="block text-white mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-600'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white mb-2">Your Review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
                rows="4"
                placeholder="Share your experience with this code..."
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 rounded-lg ${
                  loading
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {code.reviews?.map((review) => (
          <motion.div
            key={review.id}
            variants={itemVariants}
            className="bg-gray-800/50 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {review.user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{review.user.name}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < review.rating ? 'text-yellow-400' : 'text-gray-600'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-gray-400 text-sm">
                      {new Date(review.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-gray-300">{review.comment}</p>
          </motion.div>
        ))}

        {(!code.reviews || code.reviews.length === 0) && (
          <div className="text-center py-8">
            <p className="text-gray-400">No reviews yet. Be the first to review!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default ReviewsSection; 