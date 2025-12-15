# Extra API Endpoints

This document describes the additional endpoints added to the Public API for image generation, quiz generation, and video generation.

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
