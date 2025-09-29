export interface Post {
  id: string;
  user_id: string; // Assuming a user ID for now
  description: string;
  poster_url: string; // Thumbnail for the video
  video_url: string; // Actual video URL
  likes: number;
  comments: number;
  shares: number;
  created_at: string;
}