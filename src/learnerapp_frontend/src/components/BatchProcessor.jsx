import React, { useState } from 'react';

const BatchProcessor = ({ api, notebookId }) => {
  const [prompts, setPrompts] = useState(['']);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [enhance, setEnhance] = useState(true);

  const addPrompt = () => {
    if (prompts.length < 10) {
      setPrompts([...prompts, '']);
    }
  };

  const updatePrompt = (index, value) => {
    const newPrompts = [...prompts];
    newPrompts[index] = value;
    setPrompts(newPrompts);
  };

  const removePrompt = (index) => {
    if (prompts.length > 1) {
      setPrompts(prompts.filter((_, i) => i !== index));
    }
  };

  const processBatch = async () => {
    const validPrompts = prompts.filter(p => p.trim());
    if (!validPrompts.length || !notebookId) return;

    setIsLoading(true);
    setResults([]);

    try {
      const result = await api.batchChat(notebookId, validPrompts, enhance);
      setResults(result.results || []);
    } catch (error) {
      setResults([{
        prompt: 'Error',
        success: false,
        error: error.message
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'batch_results.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="batch-processor">
      <h3>Batch Processing</h3>

      <div className="batch-controls">
        <label className="enhance-toggle">
          <input
            type="checkbox"
            checked={enhance}
            onChange={(e) => setEnhance(e.target.checked)}
          />
          Enable AI Enhancement
        </label>
        <button onClick={addPrompt} disabled={prompts.length >= 10}>
          Add Prompt ({prompts.length}/10)
        </button>
      </div>

      <div className="prompts-list">
        {prompts.map((prompt, index) => (
          <div key={index} className="prompt-row">
            <span className="prompt-number">{index + 1}.</span>
            <input
              type="text"
              value={prompt}
              onChange={(e) => updatePrompt(index, e.target.value)}
              placeholder={`Question ${index + 1}...`}
              disabled={isLoading}
            />
            {prompts.length > 1 && (
              <button 
                onClick={() => removePrompt(index)}
                className="remove-btn"
                disabled={isLoading}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      <button 
        onClick={processBatch}
        disabled={!notebookId || isLoading || !prompts.some(p => p.trim())}
        className="process-btn"
      >
        {isLoading ? 'Processing...' : 'Process Batch'}
      </button>

      {results.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <h4>Results</h4>
            <button onClick={exportResults} className="export-btn">
              Export JSON
            </button>
          </div>
          
          <div className="results-list">
            {results.map((result, index) => (
              <div key={index} className={`result-item ${result.success ? 'success' : 'error'}`}>
                <div className="result-prompt">
                  <strong>Q{index + 1}:</strong> {result.prompt}
                </div>
                {result.success ? (
                  <div className="result-response">
                    <div className="response-content">
                      {result.enhanced_response || result.original_response}
                    </div>
                    {result.enhanced_response && result.original_response && (
                      <details className="original-response">
                        <summary>View original response</summary>
                        <div>{result.original_response}</div>
                      </details>
                    )}
                  </div>
                ) : (
                  <div className="result-error">
                    Error: {result.error || 'Failed to process'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchProcessor;
