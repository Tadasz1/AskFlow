/**
 * Answer routes under /api: list (GET /question/:id/answers, optionalAuth),
 * create (POST /question/:id/answers, auth), delete (DELETE /answer/:id, auth), vote (POST /answer/:id/vote, auth).
 */
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuth');
const {
  createAnswerValidators,
  listAnswers,
  createAnswer,
  deleteAnswer,
  voteAnswer,
} = require('../controllers/answerController');

const router = express.Router();

router.get('/question/:id/answers', optionalAuth, listAnswers);
router.post('/question/:id/answers', authMiddleware, createAnswerValidators, createAnswer);
router.delete('/answer/:id', authMiddleware, deleteAnswer);
router.post('/answer/:id/vote', authMiddleware, voteAnswer);

module.exports = router;

