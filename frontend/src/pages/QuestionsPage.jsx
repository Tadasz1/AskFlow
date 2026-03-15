/**
 * Questions list page: loads questions (all/answered/unanswered), shows stats,
 * and lets logged-in users create or delete their own questions.
 */
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function QuestionsPage() {
  const { user, authFetch, API_BASE } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState('all'); // 'all' | 'answered' | 'unanswered'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [creating, setCreating] = useState(false);

  /** Fetches questions from API, optionally filtered by status. */
  const loadQuestions = useCallback(async (nextStatus = 'all') => {
    setLoading(true);
    setError('');
    try {
      const url =
        nextStatus === 'all'
          ? `${API_BASE}/questions`
          : `${API_BASE}/questions?status=${nextStatus}`;
      const data = await fetch(url).then((r) => r.json());
      if (!Array.isArray(data)) throw new Error('Failed to load questions');
      setQuestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  /** Switch filter and reload questions for that filter. */
  const handleFilterChange = (value) => {
    setStatus(value);
    loadQuestions(value);
  };

  /** POST new question (auth required); then clear input and refresh list. */
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setCreating(true);
    setError('');
    try {
      await authFetch(`${API_BASE}/question`, {
        method: 'POST',
        body: JSON.stringify({ question_text: newQuestion.trim() }),
      });
      setNewQuestion('');
      loadQuestions(status);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  /** DELETE question (owner only); confirm first, then remove from list. */
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Delete this question and all its answers?')) return;
    setError('');
    try {
      await authFetch(`${API_BASE}/question/${id}`, {
        method: 'DELETE',
      });
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Derived counts for the stats bar (client-side from current list).
  const totalCount = questions.length;
  const answeredCount = questions.filter((q) => (q.answersCount || 0) > 0).length;
  const unansweredCount = totalCount - answeredCount;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>All Questions</h1>
          <p className="page-subtitle">
            Ask and answer programming questions. Use filters to quickly find what you need.
          </p>
        </div>
        <div className="filter-group">
          <button
            type="button"
            className={`chip ${status === 'all' ? 'chip-active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`chip ${status === 'answered' ? 'chip-active' : ''}`}
            onClick={() => handleFilterChange('answered')}
          >
            Answered
          </button>
          <button
            type="button"
            className={`chip ${status === 'unanswered' ? 'chip-active' : ''}`}
            onClick={() => handleFilterChange('unanswered')}
          >
            Unanswered
          </button>
        </div>
      </div>

      <div className="layout-2col">
        <div className="layout-main">
          <section className="card stats-bar">
            <div className="stat-pill">
              <span className="stat-pill-label">Total</span>
              <span className="stat-pill-value">{totalCount}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-pill-label">Answered</span>
              <span className="stat-pill-value">{answeredCount}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-pill-label">Unanswered</span>
              <span className="stat-pill-value">{unansweredCount}</span>
            </div>
          </section>
          {error && <div className="alert alert-error">{error}</div>}
          {loading ? (
            <div className="skeleton-list">
              <div className="skeleton-card" />
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </div>
          ) : questions.length === 0 ? (
            <div className="card empty-card">
              <p>
                No questions yet.{' '}
                {user ? 'Be the first to ask something!' : 'Log in and start the discussion.'}
              </p>
            </div>
          ) : (
            <ul className="question-list">
              {questions.map((q) => (
                <li key={q._id} className="question-item card question-card">
                  <div className="question-stats">
                    <div className="stat">
                      <span className="stat-number">{q.answersCount || 0}</span>
                      <span className="stat-label">
                        {q.answersCount === 1 ? 'answer' : 'answers'}
                      </span>
                    </div>
                  </div>
                  <div className="question-main">
                    <Link to={`/questions/${q._id}`} className="question-title">
                      {q.question_text}
                    </Link>
                    <div className="question-meta">
                      <span>Asked by {q.user?.name || 'Unknown'}</span>
                    </div>
                  </div>
                  {user && user.id === q.user?._id && (
                    <button
                      type="button"
                      className="btn-link-danger"
                      onClick={() => handleDeleteQuestion(q._id)}
                    >
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <aside className="layout-side">
          <section className="card new-question-card">
            <h2 className="side-title">Ask a question</h2>
            {user ? (
              <form onSubmit={handleCreateQuestion} className="form" noValidate>
                <div className="form-field">
                  <label htmlFor="question_text">Title</label>
                  <textarea
                    id="question_text"
                    rows={3}
                    placeholder="What do you need help with?"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary full-width"
                  disabled={creating || !newQuestion.trim()}
                >
                  {creating ? 'Posting...' : 'Post question'}
                </button>
              </form>
            ) : (
              <p className="page-subtitle">
                <Link to="/login">Log in</Link> to ask a new question.
              </p>
            )}
          </section>
          <section className="card side-card">
            <h2 className="side-title">Tips for good questions</h2>
            <ul className="side-list">
              <li>Summarize the problem in a clear title.</li>
              <li>Describe what you tried and what you expected.</li>
              <li>Include any relevant code or error messages.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

