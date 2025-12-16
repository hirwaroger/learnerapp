class NotebookLMAPI {
  constructor(baseUrl = "https://ai-proxy.hdev.rw", apiKey = null) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  getHeaders() {
    const headers = {
      "Content-Type": "application/json"
    };
    if (this.apiKey) {
      headers["X-API-Key"] = this.apiKey;
    }
    return headers;
  }

  async chat(notebookId, prompt, enhance = true) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/chat`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          notebook_id: notebookId,
          prompt: prompt,
          enhance: enhance
        })
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Chat request failed: ${error.message}`);
    }
  }

  async chatOnly(notebookId, prompt) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/chat-only`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          notebook_id: notebookId,
          prompt: prompt
        })
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Chat-only request failed: ${error.message}`);
    }
  }

  async enhance(text, prompt = null) {
    try {
      const payload = { text };
      if (prompt) payload.prompt = prompt;

      const response = await fetch(`${this.baseUrl}/api/v1/enhance`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Enhancement request failed: ${error.message}`);
    }
  }

  async batchChat(notebookId, prompts, enhance = true) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/batch-chat`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          notebook_id: notebookId,
          prompts: prompts,
          enhance: enhance
        })
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Batch chat request failed: ${error.message}`);
    }
  }

  async generateQuiz(content) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/generate-quiz`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          content: content
        })
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Quiz generation failed: ${error.message}`);
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return await response.json();
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  async generateCharacter(prompt = null) {
    try {
      const payload = {};
      if (prompt) payload.prompt = prompt;

      const response = await fetch(`${this.baseUrl}/api/v1/generate-character`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Character generation failed: ${error.message}`);
    }
  }

  async generateVideo(userRequest, notebookId = null, character = null) {
    try {
      const payload = {
        user_request: userRequest
      };
      if (notebookId) payload.notebook_id = notebookId;
      if (character) payload.character = character;

      const response = await fetch(`${this.baseUrl}/api/v1/generate-video`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Video generation failed: ${error.message}`);
    }
  }

  async checkVideoStatus(filename) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/video-status/${filename}`, {
        method: "GET",
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Video status check failed: ${error.message}`);
    }
  }

  getVideoUrl(filename, download = false) {
    const baseUrl = `${this.baseUrl}/api/v1/video/${filename}`;
    if (download) {
      return `${baseUrl}?download=true`;
    }
    // Add cache-busting and headers for better streaming
    return `${baseUrl}?t=${Date.now()}`;
  }

  // Add method to check if video is accessible
  async testVideoAccess(filename) {
    try {
      const response = await fetch(this.getVideoUrl(filename), {
        method: 'HEAD',
        headers: this.getHeaders()
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async generatePodcast(notebookId, speakers = null) {
    try {
      const payload = { notebook_id: notebookId };
      if (speakers) payload.speakers = speakers;

      const response = await fetch(`${this.baseUrl}/api/v1/generate-podcast`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Podcast generation failed: ${error.message}`);
    }
  }
}

export default NotebookLMAPI;
