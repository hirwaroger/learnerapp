import React, { useState, useEffect } from 'react';

const AdminDashboard = ({ api, actor, user }) => {
  const [activeTab, setActiveTab] = useState('topics');
  const [topics, setTopics] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [newTopic, setNewTopic] = useState({ notebookId: '', title: '' });
  const [newCharacter, setNewCharacter] = useState({ name: '', description: '', prompt: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatingCharacter, setGeneratingCharacter] = useState(false);

  useEffect(() => {
    loadTopics();
    loadCharacters();
  }, []);

  const loadTopics = async () => {
    try {
      setIsLoading(true);
      const topicsData = await actor.getTopics();
      setTopics(topicsData);
    } catch (error) {
      setError('Failed to load topics: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCharacters = async () => {
    try {
      const charactersData = await actor.getCharacters();
      setCharacters(charactersData);
    } catch (error) {
      setError('Failed to load characters: ' + error.message);
    }
  };

  const addTopic = async () => {
    if (!newTopic.notebookId.trim() || !newTopic.title.trim()) {
      setError('Please fill in both notebook ID and title');
      return;
    }

    try {
      setIsLoading(true);
      const principal = user.identity.getPrincipal();
      const result = await actor.addTopic(principal, newTopic.notebookId, newTopic.title);
      
      if (result) {
        await loadTopics(); // Reload topics from backend
        setNewTopic({ notebookId: '', title: '' });
        setError('');
      } else {
        setError('Failed to add topic. Not authorized.');
      }
    } catch (error) {
      setError('Failed to add topic: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeTopic = async (notebookId) => {
    try {
      setIsLoading(true);
      const principal = user.identity.getPrincipal();
      const result = await actor.removeTopic(principal, notebookId);
      
      if (result) {
        await loadTopics(); // Reload topics from backend
      } else {
        setError('Failed to remove topic. Not authorized.');
      }
    } catch (error) {
      setError('Failed to remove topic: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCharacter = async () => {
    if (!newCharacter.name.trim() || !newCharacter.description.trim()) {
      setError('Please fill in character name and description');
      return;
    }

    setGeneratingCharacter(true);
    setError('');

    try {
      const prompt = newCharacter.prompt || `A ${newCharacter.description}`;
      const result = await api.generateCharacter(prompt);

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate character');
      }

      // Store in backend
      const characterId = Date.now().toString();
      const principal = user.identity.getPrincipal();
      const addResult = await actor.addCharacter(
        principal, 
        characterId, 
        newCharacter.name, 
        newCharacter.description, 
        result.character_image_base64
      );

      if (addResult) {
        await loadCharacters();
        setNewCharacter({ name: '', description: '', prompt: '' });
      } else {
        setError('Failed to save character. Not authorized.');
      }

    } catch (error) {
      setError('Failed to generate character: ' + error.message);
    } finally {
      setGeneratingCharacter(false);
    }
  };

  const removeCharacter = async (characterId) => {
    try {
      setIsLoading(true);
      const principal = user.identity.getPrincipal();
      const result = await actor.removeCharacter(principal, characterId);
      
      if (result) {
        await loadCharacters();
      } else {
        setError('Failed to remove character. Not authorized.');
      }
    } catch (error) {
      setError('Failed to remove character: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
        <p className="text-xl text-gray-600">Manage learning topics and video characters</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
            activeTab === 'topics' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('topics')}
        >
          📚 Topics
        </button>
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
            activeTab === 'characters' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('characters')}
        >
          🎭 Characters
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {activeTab === 'topics' ? (
        <>
          {/* Add Topic Section */}
          <div className="card p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Add New Topic</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notebook ID
                </label>
                <input
                  type="text"
                  placeholder="e.g., 4b68205f-0bc9-4acf-90b1-58ab224ee0c4"
                  value={newTopic.notebookId}
                  onChange={(e) => setNewTopic({...newTopic, notebookId: e.target.value})}
                  disabled={isLoading}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., JavaScript Fundamentals"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                  disabled={isLoading}
                  className="input-field"
                />
              </div>
              <button 
                onClick={addTopic} 
                disabled={isLoading} 
                className="btn-primary bg-green-600 hover:bg-green-700 whitespace-nowrap"
              >
                {isLoading ? 'Adding...' : 'Add Topic'}
              </button>
            </div>
          </div>

          {/* Topics List */}
          <div className="card p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Current Topics ({topics.length})
            </h3>
            {topics.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">No topics added yet</h4>
                <p className="text-gray-600">Add your first topic using the form above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topics.map(([notebookId, title]) => (
                  <div key={notebookId} className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{title}</h4>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">
                        {notebookId}
                      </code>
                    </div>
                    <button 
                      onClick={() => removeTopic(notebookId)}
                      className="btn-danger"
                      disabled={isLoading}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Add Character Section */}
          <div className="card p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Create New Character</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Character Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Dr. Science"
                    value={newCharacter.name}
                    onChange={(e) => setNewCharacter({...newCharacter, name: e.target.value})}
                    disabled={generatingCharacter}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., friendly scientist with glasses"
                    value={newCharacter.description}
                    onChange={(e) => setNewCharacter({...newCharacter, description: e.target.value})}
                    disabled={generatingCharacter}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visual Prompt (Optional)
                </label>
                <textarea
                  placeholder="Detailed appearance description for AI generation..."
                  value={newCharacter.prompt}
                  onChange={(e) => setNewCharacter({...newCharacter, prompt: e.target.value})}
                  disabled={generatingCharacter}
                  className="input-field h-20 resize-none"
                />
              </div>
              <button 
                onClick={generateCharacter} 
                disabled={generatingCharacter || !newCharacter.name.trim() || !newCharacter.description.trim()}
                className="btn-primary bg-purple-600 hover:bg-purple-700"
              >
                {generatingCharacter ? 'Generating Character...' : '🎭 Generate Character'}
              </button>
            </div>
          </div>

          {/* Characters List */}
          <div className="card p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Video Characters ({characters.length})
            </h3>
            {characters.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎭</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">No characters created yet</h4>
                <p className="text-gray-600">Create your first character using the form above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {characters.map((character) => (
                  <div key={character.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="text-center mb-4">
                      <img
                        src={`data:image/png;base64,${character.imageBase64}`}
                        alt={character.name}
                        className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border-4 border-purple-200"
                      />
                      <h4 className="text-lg font-semibold text-gray-900">{character.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{character.description}</p>
                    </div>
                    <button 
                      onClick={() => removeCharacter(character.id)}
                      className="btn-danger w-full"
                      disabled={isLoading}
                    >
                      Remove Character
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
