<script lang="ts">
  import { Home, Search, PlusSquare, MessageSquare, User } from 'lucide-svelte';
  import VideoCard from './lib/VideoCard.svelte';
  import PostModal from './lib/PostModal.svelte';
  import { supabase } from './supabase';
  import type { Post } from './lib/types';
  import { onMount } from 'svelte';

  let posts: Post[] = [];
  let showPostModal: boolean = false;
  let isLoadingPosts: boolean = true;
  let fetchError: string | null = null;

  async function fetchPosts() {
    isLoadingPosts = true;
    fetchError = null;
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      posts = data || [];
    } catch (err: any) {
      console.error('Error fetching posts:', err.message);
      fetchError = `Failed to load posts: ${err.message}`;
    } finally {
      isLoadingPosts = false;
    }
  }

  onMount(() => {
    fetchPosts();
  });

  function handlePostCreated(event: CustomEvent<Post>) {
    // Add the new post to the beginning of the list
    posts = [event.detail, ...posts];
  }
</script>

<main class="min-h-screen bg-black text-white flex flex-col items-center py-4 pb-20">
  <h1 class="text-3xl font-bold mb-6">Silo TikTok Feed</h1>

  {#if isLoadingPosts}
    <p class="text-zinc-400">Loading posts...</p>
  {:else if fetchError}
    <p class="text-red-500">{fetchError}</p>
    <button on:click={fetchPosts} class="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md">Retry</button>
  {:else if posts.length === 0}
    <p class="text-zinc-400">No posts yet. Be the first to create one!</p>
  {:else}
    <div class="w-full max-w-md space-y-8">
      {#each posts as post (post.id)}
        <VideoCard video={post} />
      {/each}
    </div>
  {/if}

  <div style="position: fixed; bottom: 16px; right: 16px; background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); padding: 6px 12px; border-radius: 9999px; font-size: 12px; color: #333; border: 1px solid rgba(0, 0, 0, 0.1); box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 1000;">Built with ⚡️ Silo</div>
</main>

<nav class="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 flex justify-around items-center h-16 z-50">
  <button class="flex flex-col items-center text-white text-xs">
    <Home size={24} />
    <span class="mt-1">Home</span>
  </button>
  <button class="flex flex-col items-center text-zinc-400 hover:text-white text-xs transition-colors">
    <Search size={24} />
    <span class="mt-1">Discover</span>
  </button>
  <button class="flex flex-col items-center text-white text-xs bg-red-600 p-2 rounded-md" on:click={() => showPostModal = true}>
    <PlusSquare size={24} />
  </button>
  <button class="flex flex-col items-center text-zinc-400 hover:text-white text-xs transition-colors">
    <MessageSquare size={24} />
    <span class="mt-1">Inbox</span>
  </button>
  <button class="flex flex-col items-center text-zinc-400 hover:text-white text-xs transition-colors">
    <User size={24} />
    <span class="mt-1">Profile</span>
  </button>
</nav>

{#if showPostModal}
  <PostModal on:close={() => showPostModal = false} on:postCreated={handlePostCreated} />
{/if}

<style lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  body {
    @apply bg-black;
  }
</style>