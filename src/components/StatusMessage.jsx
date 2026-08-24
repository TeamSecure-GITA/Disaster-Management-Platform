import React from "react";

const CONTENT = {
  loading: {
    icon: "⏳",
    title: "Loading...",
    message: "Please wait while we load the information.",
  },
  empty: {
    icon: "📭",
    title: "No Data Available",
    message: "There is currently no information to display.",
  },
  error: {
    icon: "⚠️",
    title: "Something went wrong",
    message: "We couldn't load this information.",
  },
};

function StatusMessage({
  type = "loading",
  title,
  message,
  buttonText,
  onRetry,
}) {
  const current = React.useMemo(() => CONTENT[type] || CONTENT.loading, [type]);

  return (
    <div className={`status-message status-${type}`}>
      <div className="status-icon">{current.icon}</div>

      <h2>{title || current.title}</h2>

      <p>{message || current.message}</p>

      {buttonText && onRetry && (
        <button
          className="status-button"
          onClick={onRetry}
        >
          🔄 {buttonText}
        </button>
      )}
    </div>
  );
}

export default StatusMessage;
