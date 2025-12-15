import React, { useState } from 'react';

const TextEnhancer = ({ api }) => {
  const [originalText, setOriginalText] = useState('');
  const [enhancementPrompt, setEnhancementPrompt] = useState('');
  const [enhancedText, setEnhancedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEnhance = async () => {
    if (!originalText.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await api.enhance(originalText, enhancementPrompt || null);
      if (result.success) {
        setEnhancedText(result.enhanced_text);
      } else {
        setError(result.error || 'Enhancement failed');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="text-enhancer">
      <h3>Text Enhancement</h3>
      
      <div className="enhancer-section">
        <label htmlFor="original-text">Original Text:</label>
        <textarea
          id="original-text"
          value={originalText}
          onChange={(e) => setOriginalText(e.target.value)}
          placeholder="Enter text to enhance..."
          rows={6}
          maxLength={10000}
        />
        <div className="char-count">
          {originalText.length}/10000 characters
        </div>
      </div>

      <div className="enhancer-section">
        <label htmlFor="enhancement-prompt">Enhancement Instructions (Optional):</label>
        <input
          id="enhancement-prompt"
          type="text"
          value={enhancementPrompt}
          onChange={(e) => setEnhancementPrompt(e.target.value)}
          placeholder="e.g., Make it more professional and detailed"
        />
      </div>

      <button 
        onClick={handleEnhance}
        disabled={!originalText.trim() || isLoading}
        className="enhance-btn"
      >
        {isLoading ? 'Enhancing...' : 'Enhance Text'}
      </button>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {enhancedText && (
        <div className="enhancer-section">
          <div className="enhanced-header">
            <label>Enhanced Text:</label>
            <button 
              onClick={() => copyToClipboard(enhancedText)}
              className="copy-btn"
            >
              Copy
            </button>
          </div>
          <div className="enhanced-text">
            {enhancedText}
          </div>
        </div>
      )}
    </div>
  );
};

export default TextEnhancer;
