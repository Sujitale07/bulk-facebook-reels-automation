import axios from 'axios';
import axiosRetry from 'axios-retry';
import fs from 'fs';
import FormData from 'form-data';

// Configure axios with retries for robust uploads
axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const FACEBOOK_GRAPH_URL = 'https://graph.facebook.com/v21.0';

export interface ReelsUploadResponse {
  video_id: string;
  upload_url: string;
}

export type ProgressCallback = (progress: number) => void;

export class FacebookReelsService {
  private pageAccessToken: string;
  private pageId: string;
  private isSimulator: boolean;

  constructor(pageId: string, pageAccessToken: string) {
    this.pageId = pageId;
    this.pageAccessToken = pageAccessToken;
    this.isSimulator = !pageId || !pageAccessToken || pageAccessToken === 'simulated';
  }

  /**
   * Step 1: Initialize the video reels upload session
   */
  async initializeUpload(): Promise<ReelsUploadResponse> {
    if (this.isSimulator) {
      console.log('[Meta Simulator] Initializing Reels upload...');
      await new Promise(r => setTimeout(r, 1000));
      return { 
        video_id: `sim_vid_${Date.now()}`, 
        upload_url: `https://sim-upload.facebook.com/sim_session_${Date.now()}` 
      };
    }

    const response = await axios.post(`${FACEBOOK_GRAPH_URL}/${this.pageId}/video_reels`, {
      upload_phase: 'start',
      access_token: this.pageAccessToken
    });

    return response.data;
  }

  /**
   * Step 2: Upload the video file components
   */
  async uploadVideo(uploadUrl: string, filePath: string, onProgress?: ProgressCallback): Promise<void> {
    if (this.isSimulator) {
      console.log(`[Meta Simulator] Uploading video from ${filePath} to URL ${uploadUrl}...`);
      if (onProgress) onProgress(50);
      await new Promise(r => setTimeout(r, 1000));
      if (onProgress) onProgress(100);
      return;
    }

    const stats = fs.statSync(filePath);
    let bytesSent = 0;
    
    // Create a stream that tracks progress
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (chunk) => {
      bytesSent += chunk.length;
      if (onProgress) {
        const progress = Math.round((bytesSent * 100) / stats.size);
        onProgress(progress);
      }
    });

    // Facebook expects the file in the body with specific headers
    try {
      await axios.post(uploadUrl, stream, {
        headers: {
          'Authorization': `OAuth ${this.pageAccessToken}`,
          'offset': 0,
          'file_size': stats.size,
          'X-Entity-Length': stats.size,
          'Content-Length': stats.size,
          'Content-Type': 'application/octet-stream',
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });
    } catch (error: any) {
      if (error.response) {
        console.error('❌ Facebook Binary Upload Error Data:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }

  /**
   * Step 3: Finish and Publish
   */
  async publishReel(videoId: string, description: string): Promise<string> {
    if (this.isSimulator) {
      console.log(`[Meta Simulator] Publishing Reel ${videoId} with description: ${description}`);
      await new Promise(r => setTimeout(r, 1500));
      return `sim_post_${Date.now()}`;
    }

    const response = await axios.post(`${FACEBOOK_GRAPH_URL}/${this.pageId}/video_reels`, {
      upload_phase: 'finish',
      video_id: videoId,
      video_state: 'PUBLISHED',
      description: description,
      access_token: this.pageAccessToken
    });

    return response.data.video_id || response.data.id;
  }
}
