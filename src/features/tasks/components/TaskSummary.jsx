function TaskSummary({ summary, loading, disabled, onGenerate }) {
  return (
    <section className="task-summary" aria-labelledby="summary-heading">
      <h2 id="summary-heading">AI summary</h2>
      <button type="button" disabled={disabled} onClick={onGenerate}>
        {loading ? 'Generating summary...' : 'Generate AI summary'}
      </button>
      <div aria-live="polite">
        {summary && <p className="summary-text">{summary}</p>}
      </div>
    </section>
  )
}

export default TaskSummary
