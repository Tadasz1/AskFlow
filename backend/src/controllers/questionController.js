/**
 * Question controller: create, delete, get one, list all (with optional status filter).
 */
const { body, validationResult, query } = require('express-validator');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

const createQuestionValidators = [
  body('question_text').trim().notEmpty().withMessage('Question text is required'),
];

const listQuestionsValidators = [
  query('status').optional().isIn(['answered', 'unanswered']).withMessage('Invalid status filter'),
];

// Create question (auth required; user from req.user).
async function createQuestion(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { question_text } = req.body;
    const question = await Question.create({
      question_text,
      user: req.user._id,
      date: new Date(),
    });
    return res.status(201).json(question);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Delete question (owner only); also deletes all answers for that question.
async function deleteQuestion(req, res) {
  const { id } = req.params;
  try {
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    if (question.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed to delete this question' });
    }
    await Answer.deleteMany({ question: question._id });
    await question.deleteOne();
    return res.json({ message: 'Question deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Get single question by id with populated user and answersCount.
async function getQuestion(req, res) {
  const { id } = req.params;
  try {
    const question = await Question.findById(id)
      .populate('user', 'name email')
      .lean();
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    const answersCount = await Answer.countDocuments({ question: id });
    return res.json({ ...question, answersCount });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// List all questions; add answersCount per question; filter by status (answered/unanswered) if given.
async function listQuestions(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { status } = req.query;

  try {
    const questions = await Question.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .lean();

    const questionIds = questions.map((q) => q._id);
    const answersCounts = await Answer.aggregate([
      { $match: { question: { $in: questionIds } } },
      { $group: { _id: '$question', count: { $sum: 1 } } },
    ]);

    const countMap = new Map(answersCounts.map((a) => [a._id.toString(), a.count]));

    let result = questions.map((q) => ({
      ...q,
      answersCount: countMap.get(q._id.toString()) || 0,
    }));

    if (status === 'answered') {
      result = result.filter((q) => q.answersCount > 0);
    } else if (status === 'unanswered') {
      result = result.filter((q) => q.answersCount === 0);
    }

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = {
  createQuestionValidators,
  listQuestionsValidators,
  createQuestion,
  deleteQuestion,
  getQuestion,
  listQuestions,
};

