<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { supabase } from '../supabase';
  import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

  const dispatch = createEventDispatcher();

  let description: string = '';
  let posterUrl: string = '';
  let videoFile: File | null = null;
  let isLoading: boolean = false;
  let error: string | null = null;
  let uploadProgress: number = 0;

  function handleVideoFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      videoFile = input.files[0];
    } else {
      videoFile = null;
    }
  }

  async function handleSubmit() {
    if (!description.trim() || !posterUrl.trim() || !videoFile) {
      error = 'Description, Poster URL, and a Video file are required.';
      return;
    }

    isLoading = true;
    error = null;
    uploadProgress = 0;

    try {
      // 1. Upload video to Supabase Storage
      const fileExtension = videoFile.name.split('.').pop();
      const filePath = `videos/${uuidv4()}-${Date.now()}.${fileExtension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, videoFile, {
          cacheControl: '3600',
          upsert: false,
          // You can add onUploadProgress here if needed for a more detailed progress bar
          // onUploadProgress: (event) => { uploadProgress = Math.round((event.loaded / event.total) * 100); }
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('Could not get public URL for the uploaded video.');
      }

      const video_url = publicUrlData.publicUrl;

      // 2. Insert post data into Supabase database
      const newPost = {
        id: uuidv4(),
        user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // Example UUID, replace with actual user ID from auth
        description: description.trim(),
        poster_url: posterUrl.trim(),
        video_url: video_url,
        likes: 0,
        comments: 0,
        shares: 0,
        created_at: new Date().toISOString(),
      };

      const { error: supabaseError } = await supabase
        .from('posts')
        .insert([newPost]);

      if (supabaseError) {
        throw supabaseError;
      }

      dispatch('postCreated', newPost);
      dispatch('close');
      description = '';
      posterUrl = '';
      videoFile = null;
    } catch (err: any) {
      console.error('Error creating post:', err.message);
      error = `Failed to create post: ${err.message}`;
    } finally {
      isLoading = false;
      uploadProgress = 0;
    }
  }

  function handleClose() {
    dispatch('close');
    description = '';
    posterUrl = '';
    videoFile = null;
    error = null;
    uploadProgress = 0;
  }
</script>

<div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4">
  <div class="bg-zinc-900 rounded-lg p-6 w-full max-w-md shadow-xl border border-zinc-800 relative">
    <h2 class="text-2xl font-bold mb-4 text-white">Create New Post</h2>
    <button
      on:click={handleClose}
      class="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    </button>

    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <div>
        <label for="description" class="block text-sm font-medium text-zinc-300 mb-1">Description</label>
        <textarea
          id="description"
          bind:value={description}
          rows="3"
          class="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
          placeholder="What's on your mind?"
          required
        ></textarea>
      </div>
      <div>
        <label for="posterUrl" class="block text-sm font-medium text-zinc-300 mb-1">Poster Image URL</label>
        <input
          type="url"
          id="posterUrl"
          bind:value={posterUrl}
          class="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:ring-red-500 focus:border-red-500"
          placeholder="https://example.com/your-video-poster.jpg"
          required
        />
        <p class="text-xs text-zinc-500 mt-1">This image will be shown before the video plays.</p>
      </div>
      <div>
        <label for="videoFile" class="block text-sm font-medium text-zinc-300 mb-1">Upload Video File</label>
        <input
          type="file"
          id="videoFile"
          accept="video/*"
          on:change={handleVideoFileChange}
          class="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600"
          required
          capture="user" <!-- Added capture attribute -->
        />
        {#if videoFile}
          <p class="text-xs text-zinc-400 mt-1">Selected: {videoFile.name}</p>
        {/if}
      </div>

      {#if error}
        <p class="text-red-500 text-sm">{error}</p>
      {/if}

      <button
        type="submit"
        class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {#if isLoading}
          Uploading & Posting...
        {:else}
          Post Video
        {/if}
      </button>
      {#if isLoading && uploadProgress > 0}
        <div class="w-full bg-zinc-700 rounded-full h-2.5 mt-2">
          <div class="bg-red-600 h-2.5 rounded-full" style="width: {uploadProgress}%"></div>
        </div>
        <p class="text-xs text-zinc-400 text-center mt-1">Uploading: {uploadProgress}%</p>
      {/if}
    </form>
  </div>
</div>