/**
 * Answer controller: list answers for a question, create, delete, vote (up/down).
 */
const { body, validationResult } = require('express-validator');
const Answer = require('../models/Answer');
const Question = require('../models/Question');

const createAnswerValidators = [
  body('answer_text').trim().notEmpty().withMessage('Answer text is required'),
];

// List answers for question id; if user is logged in (optionalAuth), include userVote per answer.
async function listAnswers(req, res) {
  const { id } = req.params;
  const userId = req.user && req.user._id ? req.user._id.toString() : null;
  try {
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answers = await Answer.find({ question: id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const mapped = answers.map((a) => {
      const gained = a.votes?.length
        ? a.votes.reduce((sum, v) => sum + v.value, 0)
        : 0;
      const userVote = userId && a.votes?.length
        ? (a.votes.find((v) => v.user.toString() === userId) || {}).value ?? null
        : null;
      const { votes, ...rest } = a;
      return {
        ...rest,
        gained_likes_number: gained,
        userVote: userVote === 1 || userVote === -1 ? userVote : null,
      };
    });

    return res.json(mapped);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Create answer for question (auth required).
async function createAnswer(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { answer_text } = req.body;

  try {
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = await Answer.create({
      answer_text,
      question: question._id,
      user: req.user._id,
      date: new Date(),
    });

    return res.status(201).json(answer);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Delete answer (owner only).
async function deleteAnswer(req, res) {
  const { id } = req.params;

  try {
    const answer = await Answer.findById(id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }
    if (answer.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed to delete this answer' });
    }
    await answer.deleteOne();
    return res.json({ message: 'Answer deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Toggle or set vote: value 1 = upvote, -1 = downvote. Same value again removes vote.
async function voteAnswer(req, res) {
  const { id } = req.params;
  const { value } = req.body;

  if (value !== 1 && value !== -1) {
    return res.status(400).json({ message: 'Value must be 1 or -1' });
  }

  try {
    const answer = await Answer.findById(id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const existingIndex = answer.votes.findIndex(
      (v) => v.user.toString() === req.user._id.toString()
    );

    if (existingIndex >= 0) {
      if (answer.votes[existingIndex].value === value) {
        answer.votes.splice(existingIndex, 1);
      } else {
        answer.votes[existingIndex].value = value;
      }
    } else {
      answer.votes.push({ user: req.user._id, value });
    }

    await answer.save();

    const gainedLikes =
      answer.votes && answer.votes.length > 0
        ? answer.votes.reduce((sum, v) => sum + v.value, 0)
        : 0;
    const currentVote = answer.votes.find(
      (v) => v.user.toString() === req.user._id.toString()
    );
    const userVote = currentVote ? currentVote.value : null;

    return res.json({
      id: answer._id,
      gained_likes_number: gainedLikes,
      userVote,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = {
  createAnswerValidators,
  listAnswers,
  createAnswer,
  deleteAnswer,
  voteAnswer,
};

