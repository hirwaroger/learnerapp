import React, { useState, useRef } from 'react';

const PodcastMaterials = ({ api, notebookId, topicTitle }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [podcastData, setPodcastData] = useState(null);
  const [speakers, setSpeakers] = useState({ Joe: 'Kore', Jane: 'Puck' });
  const [customSpeakers, setCustomSpeakers] = useState(false);
  const audioRef = useRef(null);

  const availableVoices = ['Kore', 'Puck', 'Charon', 'Aoede', 'Fenrir'];

  const generatePodcast = async () => {
    setIsGenerating(true);
    setError('');
    setPodcastData(null);

    try {
      const result = await api.generatePodcast(
        notebookId,
        customSpeakers ? speakers : null
      );

      if (result.success) {
        setPodcastData(result);
      } else {
        setError(result.error || 'Podcast generation failed');
      }
    } catch (error) {
      setError('Failed to generate podcast: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPodcast = () => {
    if (!podcastData?.audio) return;

    try {
      // Convert base64 to blob
      const byteCharacters = atob(podcastData.audio);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/wav' });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${topicTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_podcast.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to download podcast: ' + error.message);
    }
  };

  const updateSpeaker = (speakerName, voice) => {
    setSpeakers(prev => ({
      ...prev,
      [speakerName]: voice
    }));
  };

  const addSpeaker = () => {
    const newSpeakerName = `Speaker${Object.keys(speakers).length + 1}`;
    setSpeakers(prev => ({
      ...prev,
      [newSpeakerName]: availableVoices[Object.keys(prev).length % availableVoices.length]
    }));
  };

  const removeSpeaker = (speakerName) => {
    if (Object.keys(speakers).length <= 2) return; // Keep at least 2 speakers
    
    const newSpeakers = { ...speakers };
    delete newSpeakers[speakerName];
    setSpeakers(newSpeakers);
  };

  return (
    <div className="space-y-6">
      <div className="card p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">🎙️ Podcast Generator</h3>
          <p className="text-gray-600">Generate an audio podcast discussion about "{topicTitle}"</p>
        </div>

        {/* Speaker Configuration */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Podcast Speakers</h4>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={customSpeakers}
                onChange={(e) => setCustomSpeakers(e.target.checked)}
                className="text-indigo-600 rounded"
              />
              <span className="text-sm text-gray-700">Customize speakers</span>
            </label>
          </div>

          {customSpeakers && (
            <div className="space-y-4 bg-gray-50 rounded-lg p-6">
              {Object.entries(speakers).map(([name, voice]) => (
                <div key={name} className="flex items-center gap-4">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const newSpeakers = { ...speakers };
                      delete newSpeakers[name];
                      newSpeakers[e.target.value || name] = voice;
                      setSpeakers(newSpeakers);
                    }}
                    className="flex-1 input-field"
                    placeholder="Speaker name"
                    disabled={isGenerating}
                  />
                  <select
                    value={voice}
                    onChange={(e) => updateSpeaker(name, e.target.value)}
                    disabled={isGenerating}
                    className="input-field"
                  >
                    {availableVoices.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  {Object.keys(speakers).length > 2 && (
                    <button
                      onClick={() => removeSpeaker(name)}
                      disabled={isGenerating}
                      className="btn-danger px-3 py-2 text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={addSpeaker}
                disabled={isGenerating || Object.keys(speakers).length >= 5}
                className="btn-secondary w-full"
              >
                Add Speaker ({Object.keys(speakers).length}/5)
              </button>
            </div>
          )}

          {!customSpeakers && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-4 text-sm text-gray-700">
                <span className="font-medium">Default speakers:</span>
                <span>Joe (Kore voice)</span>
                <span>•</span>
                <span>Jane (Puck voice)</span>
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <div className="text-center">
          <button
            onClick={generatePodcast}
            disabled={isGenerating}
            className="btn-primary text-lg px-8 py-3"
          >
            {isGenerating ? (
              <>
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Podcast...
              </>
            ) : (
              '🎙️ Generate Podcast'
            )}
          </button>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Generated Podcast */}
      {podcastData && (
        <div className="card p-8">
          <h4 className="text-xl font-semibold text-gray-900 mb-6">🎉 Podcast Ready!</h4>
          
          <div className="space-y-6">
            {/* Audio Player */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl">🎧</div>
                <div>
                  <h5 className="font-semibold text-gray-900">{topicTitle} - Podcast</h5>
                  <p className="text-sm text-gray-600">AI-generated podcast discussion</p>
                </div>
              </div>
              
              <audio
                ref={audioRef}
                controls
                className="w-full"
                style={{ height: '54px' }}
              >
                <source
                  src={`data:audio/wav;base64,${podcastData.audio}`}
                  type="audio/wav"
                />
                Your browser does not support the audio element.
              </audio>
            </div>

            {/* Script Preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h5 className="font-semibold text-gray-900 mb-4">📝 Podcast Script</h5>
              <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                <div className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                  {podcastData.script}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={downloadPodcast}
                className="btn-secondary inline-flex items-center gap-2"
              >
                📥 Download Audio
              </button>
              <button
                onClick={() => {
                  setPodcastData(null);
                  setError('');
                }}
                className="btn-primary"
              >
                Generate Another Podcast
              </button>
            </div>

            {/* Technical Info */}
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Format:</span> {podcastData.format?.toUpperCase() || 'WAV'}
                </div>
                <div>
                  <span className="font-medium">Speakers:</span> {Object.keys(customSpeakers ? speakers : { Joe: 'Kore', Jane: 'Puck' }).length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PodcastMaterials;
