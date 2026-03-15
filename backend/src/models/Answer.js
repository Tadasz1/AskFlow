/**
 * Answer model: answer_text, question (ref Question), user (ref User), date, votes array.
 * Each vote has user and value (1 or -1). Virtual gained_likes_number sums vote values.
 */
const mongoose = require('mongoose');

// Embedded schema for one vote (user + 1 or -1).
const voteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    value: {
      type: Number,
      enum: [1, -1],
      required: true,
    },
  },
  { _id: false }
);

const answerSchema = new mongoose.Schema(
  {
    answer_text: {
      type: String,
      required: true,
      trim: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    votes: [voteSchema],
  },
  { timestamps: true }
);

answerSchema.index({ question: 1, createdAt: -1 });
answerSchema.index({ user: 1 });

// Sum of all vote values for this answer (computed in controller too for list response).
answerSchema.virtual('gained_likes_number').get(function gainedLikesNumber() {
  if (!this.votes || this.votes.length === 0) return 0;
  return this.votes.reduce((sum, v) => sum + v.value, 0);
});

const Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer;

