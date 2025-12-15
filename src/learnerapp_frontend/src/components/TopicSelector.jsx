import React from 'react';

const TopicSelector = ({ topics, isLoading, onSelectTopic }) => {
  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center gap-2 text-xl text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          Loading topics...
        </div>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-6">🎓</div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">No topics available yet</h3>
        <p className="text-gray-600">Please contact your administrator to add learning topics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-900 text-center">Choose a Learning Topic</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map(([notebookId, title]) => (
          <div
            key={notebookId}
            className="topic-card"
            onClick={() => onSelectTopic({ notebookId, title })}
          >
            <div className="text-3xl mb-4">📖</div>
            <h4 className="text-xl font-semibold text-gray-900 mb-4">{title}</h4>
            <div className="bg-gray-100 p-3 rounded-lg mb-4">
              <code className="text-xs text-gray-600 break-all font-mono">
                {notebookId}
              </code>
            </div>
            <div className="text-indigo-600 font-medium text-center">
              Click to start learning →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicSelector;
