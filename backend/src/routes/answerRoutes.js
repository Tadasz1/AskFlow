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

