<script lang="ts">
  import type { Post } from './types';
  import { Heart, MessageCircle, Share2 } from 'lucide-svelte';

  export let video: Post;

  let videoElement: HTMLVideoElement;
  let isPlaying: boolean = false;

  function togglePlayPause() {
    if (videoElement.paused) {
      videoElement.play();
      isPlaying = true;
    } else {
      videoElement.pause();
      isPlaying = false;
    }
  }

  // Simple format function for counts
  function formatCount(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
</script>

<div class="bg-zinc-900 rounded-lg overflow-hidden shadow-lg border border-zinc-800">
  <!-- Video Player Area -->
  <div class="relative w-full aspect-[9/16] bg-black flex items-center justify-center">
    <video
      bind:this={videoElement}
      src={video.video_url}
      poster={video.poster_url}
      loop
      muted
      playsinline
      class="absolute inset-0 w-full h-full object-cover"
      on:click={togglePlayPause}
    ></video>
    {#if !isPlaying}
      <div class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center cursor-pointer" on:click={togglePlayPause}>
        <svg class="w-16 h-16 text-white opacity-80" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
        </svg>
      </div>
    {/if}
  </div>

  <!-- Video Info & Actions -->
  <div class="p-4 flex justify-between items-end">
    <div class="flex-grow">
      <p class="font-semibold text-lg">@{video.user_id.substring(0, 8)}...</p>
      <p class="text-sm text-zinc-300 mt-1">{video.description}</p>
    </div>

    <div class="flex flex-col items-center space-y-4 ml-4">
      <button class="flex flex-col items-center text-zinc-300 hover:text-red-500 transition-colors">
        <Heart size={24} />
        <span class="text-xs mt-1">{formatCount(video.likes)}</span>
      </button>
      <button class="flex flex-col items-center text-zinc-300 hover:text-blue-400 transition-colors">
        <MessageCircle size={24} />
        <span class="text-xs mt-1">{formatCount(video.comments)}</span>
      </button>
      <button class="flex flex-col items-center text-zinc-300 hover:text-green-400 transition-colors">
        <Share2 size={24} />
        <span class="text-xs mt-1">{formatCount(video.shares)}</span>
      </button>
    </div>
  </div>
</div>