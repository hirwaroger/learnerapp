import React, { useState, useEffect } from 'react';

const VideoMaterials = ({ api, actor, notebookId, topicTitle }) => {
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [videoStatus, setVideoStatus] = useState(null);
  const [pollInterval, setPollInterval] = useState(null);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      const charactersData = await actor.getCharacters();
      setCharacters(charactersData);
    } catch (error) {
      setError('Failed to load characters: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateVideo = async () => {
    if (!selectedCharacter || !videoPrompt.trim()) {
      setError('Please select a character and enter a video prompt');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedVideo(null);
    setVideoStatus(null);

    try {
      const result = await api.generateVideo(
        videoPrompt,
        notebookId,
        selectedCharacter.description
      );

      if (result.success) {
        setGeneratedVideo(result);
        setVideoStatus({
          filename: result.filename,
          status: 'processing',
          message: result.message
        });
        
        // Start polling for status
        startStatusPolling(result.filename);
        setVideoPrompt('');
      } else {
        setError(result.error || 'Video generation failed');
        setIsGenerating(false);
      }
    } catch (error) {
      setError('Failed to generate video: ' + error.message);
      setIsGenerating(false);
    }
  };

  const startStatusPolling = (filename) => {
    const interval = setInterval(async () => {
      try {
        const statusResult = await api.checkVideoStatus(filename);
        setVideoStatus(statusResult);

        if (statusResult.status === 'completed') {
          clearInterval(interval);
          setIsGenerating(false);
          
          // Test video accessibility
          setTimeout(async () => {
            const isAccessible = await api.testVideoAccess(filename);
            if (!isAccessible) {
              console.warn('Video may not be accessible for streaming');
            }
          }, 1000);
        } else if (statusResult.status === 'failed') {
          clearInterval(interval);
          setError('Video generation failed');
          setIsGenerating(false);
        }
      } catch (error) {
        console.error('Status check failed:', error);
      }
    }, 3000); // Poll every 3 seconds

    setPollInterval(interval);
  };

  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  if (isLoading) {
    return (
      <div className="card p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Characters...</h3>
        <p className="text-gray-600">Preparing video materials for you</p>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="text-6xl mb-4">🎭</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Characters Available</h3>
        <p className="text-gray-600">Please contact your administrator to add video characters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">🎬 Video Materials</h3>
          <p className="text-gray-600">Generate educational videos about "{topicTitle}"</p>
        </div>

        {/* Character Selection */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Presenter</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {characters.map((character) => (
              <div
                key={character.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  selectedCharacter?.id === character.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedCharacter(character)}
              >
                <div className="text-center">
                  <img
                    src={`data:image/png;base64,${character.imageBase64}`}
                    alt={character.name}
                    className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
                  />
                  <h5 className="font-medium text-gray-900">{character.name}</h5>
                  <p className="text-xs text-gray-600 mt-1">{character.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Video Prompt */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            What video would you like to create?
          </label>
          <textarea
            value={videoPrompt}
            onChange={(e) => setVideoPrompt(e.target.value)}
            placeholder={`e.g., "Explain the key concepts of ${topicTitle} in simple terms" or "Create a tutorial about practical applications"`}
            disabled={isGenerating}
            className="w-full h-32 input-field resize-none"
            maxLength={500}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {videoPrompt.length}/500 characters
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center">
          <button
            onClick={generateVideo}
            disabled={isGenerating || !selectedCharacter || !videoPrompt.trim()}
            className="btn-primary text-lg px-8 py-3"
          >
            {isGenerating ? (
              <>
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {videoStatus?.status === 'processing' ? 'Processing Video...' : 'Starting Generation...'}
              </>
            ) : (
              '🎬 Generate Video'
            )}
          </button>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Video Generation Status */}
      {videoStatus && (
        <div className="card p-8">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">🎬 Video Generation Status</h4>
          
          <div className="space-y-4">
            {/* Status Progress */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-4 h-4 rounded-full ${
                  videoStatus.status === 'processing' ? 'bg-yellow-500 animate-pulse' :
                  videoStatus.status === 'completed' ? 'bg-green-500' :
                  'bg-red-500'
                }`}></div>
                <span className="font-medium text-gray-900 capitalize">{videoStatus.status}</span>
              </div>

              <div className="space-y-2 text-sm text-gray-700">
                <div>
                  <span className="font-medium">Video ID:</span>
                  <span className="ml-2">{videoStatus.filename}</span>
                </div>
                {videoStatus.created_at && (
                  <div>
                    <span className="font-medium">Started:</span>
                    <span className="ml-2">{new Date(videoStatus.created_at * 1000).toLocaleString()}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium">Character:</span>
                  <span className="ml-2">{selectedCharacter?.name}</span>
                </div>
              </div>

              {videoStatus.status === 'processing' && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Creating your video...</span>
                    <span>This may take a few minutes</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                  <div className="mt-2 text-center text-sm text-gray-500">
                    Please keep this page open while your video is being generated
                  </div>
                </div>
              )}
            </div>

            {/* Video Player - Only show when completed */}
            {videoStatus.status === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h5 className="text-lg font-semibold text-green-900 mb-4">✅ Video Ready!</h5>
                
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4 relative">
                  <video
                    controls
                    className="w-full h-full"
                    poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23000'/%3E%3Ctext x='50' y='50' fill='%23fff' text-anchor='middle' dy='.3em'%3E▶️%3C/text%3E%3C/svg%3E"
                    preload="metadata"
                    onError={(e) => {
                      console.error('Video playback error:', e);
                      // Fallback to download link
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  >
                    <source src={api.getVideoUrl(videoStatus.filename)} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Fallback download prompt */}
                  <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 text-white">
                    <div className="text-center">
                      <p className="mb-4">Video cannot be played in browser</p>
                      <a
                        href={api.getVideoUrl(videoStatus.filename, true)}
                        download={videoStatus.filename}
                        className="inline-flex items-center px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100"
                      >
                        📥 Download Video
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <a
                    href={api.getVideoUrl(videoStatus.filename, true)}
                    download={videoStatus.filename}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    📥 Download Video
                  </a>
                  <button
                    onClick={() => {
                      setVideoStatus(null);
                      setGeneratedVideo(null);
                      setSelectedCharacter(null);
                    }}
                    className="btn-primary"
                  >
                    Generate Another Video
                  </button>
                </div>

                {/* Video Info */}
                <div className="mt-4 pt-4 border-t border-green-200">
                  <div className="text-sm text-green-700 space-y-1">
                    <div>
                      <span className="font-medium">Topic:</span> {generatedVideo?.topic || topicTitle}
                    </div>
                    <div>
                      <span className="font-medium">Generated:</span> {new Date(videoStatus.created_at * 1000).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {videoStatus.status === 'failed' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h5 className="font-semibold text-red-900 mb-2">❌ Video Generation Failed</h5>
                <p className="text-red-800 mb-4">
                  The video generation process encountered an error. This can happen due to content restrictions or technical issues.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setVideoStatus(null);
                      setGeneratedVideo(null);
                      setError('');
                    }}
                    className="btn-primary"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => {
                      setVideoStatus(null);
                      setGeneratedVideo(null);
                      setSelectedCharacter(null);
                      setError('');
                    }}
                    className="btn-secondary"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoMaterials;
