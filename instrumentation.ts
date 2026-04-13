export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { setupPostWorker } = await import('./workers/post-worker');
    setupPostWorker();
    console.log('✅ BullMQ Post Worker initialized');
  }
}
