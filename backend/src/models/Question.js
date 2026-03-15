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

questionSchema.virtual('answersCount', {
  ref: 'Answer',
  localField: '_id',
  foreignField: 'question',
  count: true,
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;

