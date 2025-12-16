# Extra API Endpoints

This document describes the additional endpoints added to the Public API for image generation, quiz generation, video generation, and podcast generation.

## Endpoints

### POST /api/v1/generate-image
Generates an image using Gemini based on a text prompt.

**Request Body:**
```json
{
  "prompt": "Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme"
}
```

**Response:**
```json
{
  "success": true,
  "image_base64": "base64-encoded-image-data"
}
```

### POST /api/v1/generate-quiz
Generates multiple-choice quiz questions from provided content using Gemini.

**Request Body:**
```json
{
  "content": "Your notebook content here..."
}
```

**Response:**
```json
{
  "success": true,
  "quiz": {
    "questions": [
      {
        "question": "What is the capital of France?",
        "options": ["Paris", "London", "Berlin", "Madrid"],
        "correct": "Paris"
      }
    ]
  }
}
```

### POST /api/v1/generate-character
Generates a character image using Gemini based on a prompt.

**Request Body:**
```json
{
  "prompt": "A friendly scientist with glasses"  // Optional, defaults to generic character prompt
}
```

**Response:**
```json
{
  "success": true,
  "character_image_base64": "base64-encoded-image-data"
}
```

### POST /api/v1/generate-video
Generates a video from a user request by creating a script via NotebookLM, enhancing it with Gemini, and generating the video with Veo.

**Request Body:**
```json
{
  "user_request": "Create a video about photosynthesis",
  "notebook_id": "your-notebook-id",  // Optional, defaults to placeholder
  "character": "A friendly scientist with glasses"  // Optional: text description or base64 image (e.g., "data:image/png;base64,...")
}
```

**Response:**
```json
{
  "success": true,
  "message": "Video generation started",
  "filename": "generated_video_123456.mp4",
  "status_url": "/api/v1/video-status/generated_video_123456.mp4",
  "script": "Original script from notebook...",
  "enhanced_script": "Enhanced script...",
  "character_description": "A friendly scientist with glasses"
}
```

### GET /api/v1/video-status/{filename}
Check the status of a video generation request.

**Response:**
```json
{
  "filename": "generated_video_123456.mp4",
  "status": "completed",  // "processing", "completed", or "failed"
  "created_at": 1234567890,
  "play_url": "/api/v1/video/generated_video_123456.mp4",  // Only present if completed
  "script_length": 2090,
  "enhanced_script_length": 380
}
```

### GET /api/v1/video/{filename}
Serve a completed video file for inline playback in browser.

**Query Parameters:**
- `download` (optional): Set to `true` to force download instead of inline playback.

**Response:** Binary video file (MP4) for streaming/playback.

**Example Usage:**
- For playback: `<video src="/api/v1/video/generated_video_123456.mp4" controls></video>`
- For download: `/api/v1/video/generated_video_123456.mp4?download=true`

### POST /api/v1/generate-podcast
Generates an audio podcast from a notebook's content using Gemini TTS with multi-speaker voices.

**Request Body:**
```json
{
  "notebook_id": "your-notebook-id",
  "speakers": {  // Optional custom speaker configuration
    "Joe": "Kore",
    "Jane": "Puck"
  }
}
```

**Response:**
```json
{
  "success": true,
  "audio": "base64-encoded-wav-audio-data",
  "script": "Joe: Welcome to...\nJane: Thanks for having me...",
  "format": "wav"
}
```

**Available Voice Names:**
- Kore
- Puck
- Charon
- Aoede
- Fenrir

**Example Usage:**
```javascript
// Play the audio in browser
const audioData = response.audio;
const audio = new Audio(`data:audio/wav;base64,${audioData}`);
audio.play();

// Download the audio
const byteCharacters = atob(audioData);
const byteNumbers = new Array(byteCharacters.length);
for (let i = 0; i < byteCharacters.length; i++) {
  byteNumbers[i] = byteCharacters.charCodeAt(i);
}
const byteArray = new Uint8Array(byteNumbers);
const blob = new Blob([byteArray], { type: 'audio/wav' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'podcast.wav';
link.click();
```
