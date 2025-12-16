import React, { useState, useEffect } from 'react';
import TopicSelector from './TopicSelector';
import ChatInterface from './ChatInterface';
import Quiz from './Quiz';
import VideoMaterials from './VideoMaterials';
import PodcastMaterials from './PodcastMaterials';
import { learnerapp_backend } from 'declarations/learnerapp_backend';

const UserDashboard = ({ api, actor, user }) => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeMode, setActiveMode] = useState('chat'); // 'chat', 'quiz', 'video', or 'podcast'
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const topicsData = await learnerapp_backend.getTopics();
      setTopics(topicsData);
    } catch (error) {
      console.error('Failed to load topics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Welcome, {user.name}!</h2>
        <p className="text-xl text-gray-600">Select a topic to start learning</p>
      </div>

      {selectedTopic ? (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setSelectedTopic(null)}
                className="btn-secondary flex items-center gap-2"
              >
                ← Back to Topics
              </button>
              <h3 className="text-2xl font-semibold text-gray-900">{selectedTopic.title}</h3>
              <div></div>
            </div>

            {/* Mode Toggle */}
            <div className="mt-6 flex justify-center">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  className={`flex items-center gap-2 py-2 px-6 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeMode === 'chat' 
                      ? 'bg-white text-indigo-700 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveMode('chat')}
                >
                  💬 Chat
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-2 py-2 px-6 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeMode === 'quiz' 
                      ? 'bg-white text-indigo-700 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveMode('quiz')}
                >
                  🧠 Quiz
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-2 py-2 px-6 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeMode === 'video' 
                      ? 'bg-white text-indigo-700 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveMode('video')}
                >
                  🎬 Video
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-2 py-2 px-6 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeMode === 'podcast' 
                      ? 'bg-white text-indigo-700 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveMode('podcast')}
                >
                  🎙️ Podcast
                </button>
              </div>
            </div>
          </div>

          {activeMode === 'chat' && (
            <ChatInterface 
              api={api} 
              actor={actor}
              notebookId={selectedTopic.notebookId}
              user={user}
            />
          )}

          {activeMode === 'quiz' && (
            <Quiz 
              api={api}
              notebookId={selectedTopic.notebookId}
              topicTitle={selectedTopic.title}
              user={user}
            />
          )}

          {activeMode === 'video' && (
            <VideoMaterials 
              api={api}
              actor={actor}
              notebookId={selectedTopic.notebookId}
              topicTitle={selectedTopic.title}
            />
          )}

          {activeMode === 'podcast' && (
            <PodcastMaterials 
              api={api}
              notebookId={selectedTopic.notebookId}
              topicTitle={selectedTopic.title}
            />
          )}
        </div>
      ) : (
        <TopicSelector 
          topics={topics}
          isLoading={isLoading}
          onSelectTopic={setSelectedTopic}
        />
      )}
    </div>
  );
};

export default UserDashboard;
