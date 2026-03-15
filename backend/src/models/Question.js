/**
 * Question model: question_text, user (ref User), date. Indexes for listing by date and by user.
 */
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question_text: {
      type: String,
      required: true,
      trim: true,
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
  },
  { timestamps: true }
);

questionSchema.index({ createdAt: -1 });
questionSchema.index({ user: 1 });

// Virtual: count of answers (used when populating; we also compute in controller).
questionSchema.virtual('answersCount', {
  ref: 'Answer',
  localField: '_id',
  foreignField: 'question',
  count: true,
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;

