export function formatRelativeTime(timeVal) {
  // If it's a string from the mock data (e.g. "2 min ago", "Yesterday"), return it directly
  if (typeof timeVal === 'string') return timeVal;
  
  // If it's a timestamp (number)
  if (typeof timeVal === 'number') {
    const diff = Date.now() - timeVal;
    const min = 60 * 1000;
    const hr = 60 * min;
    const day = 24 * hr;

    if (diff < min) return 'Just now';
    if (diff < hr) return `${Math.floor(diff / min)} min ago`;
    if (diff < day) return `${Math.floor(diff / hr)} hrs ago`;
    if (diff < 2 * day) return 'Yesterday';
    
    return new Date(timeVal).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return 'Just now';
}
