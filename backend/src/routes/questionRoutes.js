/**
 * Question routes under /api: list (GET /questions), get one (GET /question/:id),
 * create (POST /question, auth), delete (DELETE /question/:id, auth).
 */
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  createQuestionValidators,
  listQuestionsValidators,
  createQuestion,
  deleteQuestion,
  getQuestion,
  listQuestions,
} = require('../controllers/questionController');

const router = express.Router();

router.get('/questions', listQuestionsValidators, listQuestions);
router.get('/question/:id', getQuestion);
router.post('/question', authMiddleware, createQuestionValidators, createQuestion);
router.delete('/question/:id', authMiddleware, deleteQuestion);

module.exports = router;

