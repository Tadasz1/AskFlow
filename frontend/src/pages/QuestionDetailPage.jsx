import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function QuestionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, authFetch, API_BASE } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadQuestionAndAnswers = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [questionData, answersData] = await Promise.all([
        fetch(`${API_BASE}/question/${id}`).then((r) => r.json()),
        user
          ? authFetch(`${API_BASE}/question/${id}/answers`)
          : fetch(`${API_BASE}/question/${id}/answers`).then((r) => r.json()),
      ]);
      if (questionData.message === 'Question not found') {
        navigate('/', { replace: true });
        return;
      }
      if (!questionData._id) {
        throw new Error(questionData.message || 'Failed to load question');
      }
      if (!Array.isArray(answersData)) {
        throw new Error('Failed to load answers');
      }
      setQuestion(questionData);
      setAnswers(answersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, user, authFetch, API_BASE, navigate]);

  useEffect(() => {
    loadQuestionAndAnswers();
  }, [loadQuestionAndAnswers]);

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerText.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await authFetch(`${API_BASE}/question/${id}/answers`, {
        method: 'POST',
        body: JSON.stringify({ answer_text: answerText.trim() }),
      });
      setAnswerText('');
      loadQuestionAndAnswers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm('Delete this answer?')) return;
    setError('');
    try {
      await authFetch(`${API_BASE}/answer/${answerId}`, {
        method: 'DELETE',
      });
      setAnswers((prev) => prev.filter((a) => a._id !== answerId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVote = async (answerId, value) => {
    if (!user) return;
    setError('');
    try {
      const data = await authFetch(`${API_BASE}/answer/${answerId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ value }),
      });
      setAnswers((prev) =>
        prev.map((a) =>
          a._id === answerId
            ? {
                ...a,
                gained_likes_number: data.gained_likes_number,
                userVote: data.userVote ?? null,
              }
            : a,
        ),
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton-card" />
        <div className="skeleton-card" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="page">
        <div className="card">
          <p>Question not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <button type="button" className="back-link" onClick={() => navigate(-1)}>
        ← Back to questions
      </button>

      <div className="layout-2col">
        <div className="layout-main">
          <section className="card">
            <h1 className="question-detail-title">{question.question_text}</h1>
            <div className="question-meta">
              <span>Asked by {question.user?.name || 'Unknown'}</span>
              <span>{answers.length} {answers.length === 1 ? 'answer' : 'answers'}</span>
            </div>
          </section>

          {error && <div className="alert alert-error">{error}</div>}

          <section className="answers-section">
            <h2>Answers</h2>
            {answers.length === 0 ? (
              <div className="card empty-card">
                <p>No answers yet. Be the first to share one.</p>
              </div>
            ) : (
              <ul className="answer-list">
                {answers.map((a) => (
                  <li key={a._id} className="answer-item card">
                    <div className="answer-main">
                      <p>{a.answer_text}</p>
                      <div className="answer-meta">
                        <span>By {a.user?.name || 'Unknown'}</span>
                        <span>{a.gained_likes_number || 0} votes</span>
                      </div>
                    </div>
                    <div className="answer-actions">
                      {user && (
                        <>
                          <button
                            type="button"
                            className={`vote-button vote-up ${a.userVote === 1 ? 'vote-button-active' : ''}`}
                            onClick={() => handleVote(a._id, 1)}
                            title="Upvote"
                          >
                            👍
                          </button>
                          <button
                            type="button"
                            className={`vote-button vote-down ${a.userVote === -1 ? 'vote-button-active' : ''}`}
                            onClick={() => handleVote(a._id, -1)}
                            title="Downvote"
                          >
                            👎
                          </button>
                        </>
                      )}
                      {user && user.id === a.user?._id && (
                        <button
                          type="button"
                          className="btn-link-danger"
                          onClick={() => handleDeleteAnswer(a._id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        <aside className="layout-side">
          <section className="card">
            {user ? (
              <>
                <h2 className="side-title">Your answer</h2>
                <form onSubmit={handleSubmitAnswer} className="form" noValidate>
                  <div className="form-field">
                    <label htmlFor="answer_text">Answer</label>
                    <textarea
                      id="answer_text"
                      rows={6}
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary full-width"
                    disabled={submitting || !answerText.trim()}
                  >
                    {submitting ? 'Posting...' : 'Post answer'}
                  </button>
                </form>
              </>
            ) : (
              <p className="page-subtitle">
                <Link to="/login">Log in</Link> to post an answer and vote.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

