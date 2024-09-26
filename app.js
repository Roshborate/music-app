let player;
let currentVideos = []; // Store search results to play next
let currentVideoIndex = 0; // Track which video is currently playing
let isLooping = false; // Loop status
const apiKey = 'AIzaSyCbdV5a1M8Hc6I3ivO4oNPUJ7T4knEkNXU'; // Replace with your YouTube Data API key

// Load the IFrame Player API
function onYouTubeIframeAPIReady() {
  player = new YT.Player('youtube-player', {
    height: '0',
    width: '0',
    videoId: '',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  document.getElementById('play-button').disabled = false;
  document.getElementById('pause-button').disabled = false;
  document.getElementById('volume-control').disabled = false;
  document.getElementById('loop-button').disabled = false;
  document.getElementById('next-button').disabled = false;

  // Start updating the seek bar
  setInterval(updateSeekBar, 1000);
}

// Track when video ends to either loop or play the next song
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    if (isLooping) {
      player.playVideo(); // Loop the same video
    } else {
      playNextVideo(); // Play the next video in the list
    }
  }
}

// Search for YouTube videos based on keyword
document.getElementById('search-button').addEventListener('click', function() {
  const keyword = document.getElementById('search-keyword').value;
  if (keyword) {
    searchYouTubeVideos(keyword);
  } else {
    alert("Please enter a search keyword");
  }
});

// Search YouTube API for videos
function searchYouTubeVideos(keyword) {
  fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(keyword)}&key=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      currentVideos = data.items; // Store the search results
      currentVideoIndex = 0; // Reset to the first video
      displaySearchResults(currentVideos);
      if (currentVideos.length > 0) {
        playVideo(currentVideos[0].id.videoId); // Play the first video
      }
    })
    .catch(error => console.error('Error fetching YouTube API:', error));
}

// Display search results in a list
function displaySearchResults(videos) {
  const resultsContainer = document.getElementById('search-results');
  resultsContainer.innerHTML = '';

  videos.forEach((video, index) => {
    const listItem = document.createElement('li');
    listItem.textContent = video.snippet.title;

    // When a video is clicked, play it immediately
    listItem.addEventListener('click', () => {
      currentVideoIndex = index; // Set current video index
      playVideo(video.id.videoId);  // Play the selected video
    });

    resultsContainer.appendChild(listItem);
  });
}

// Play the selected video
function playVideo(videoId) {
  player.loadVideoById(videoId);  // Load the selected video by ID
  player.playVideo();              // Play the video
}

// Play and pause buttons
document.getElementById('play-button').addEventListener('click', function() {
  player.playVideo();  // Play video on button click
});

document.getElementById('pause-button').addEventListener('click', function() {
  player.pauseVideo();  // Pause video on button click
});

// Volume control
document.getElementById('volume-control').addEventListener('input', function() {
  const volume = document.getElementById('volume-control').value;
  player.setVolume(volume);  // Adjust volume
});

// Seek bar
function updateSeekBar() {
  if (player && player.getDuration) {
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    document.getElementById('seek-bar').max = duration;
    document.getElementById('seek-bar').value = currentTime;
    document.getElementById('current-time').textContent = formatTime(currentTime);
    document.getElementById('total-duration').textContent = formatTime(duration);
  }
}

// Seek to new time
document.getElementById('seek-bar').addEventListener('input', function() {
  const newTime = document.getElementById('seek-bar').value;
  player.seekTo(newTime);
});

// Format time (mm:ss)
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Loop functionality
document.getElementById('loop-button').addEventListener('click', function() {
  isLooping = !isLooping;
  this.textContent = isLooping ? 'Loop: On' : 'Loop: Off'; // Toggle button text
});

// Play the next video in the search results
function playNextVideo() {
  currentVideoIndex++;
  if (currentVideoIndex < currentVideos.length) {
    const nextVideoId = currentVideos[currentVideoIndex].id.videoId;
    playVideo(nextVideoId);
  } else {
    // Fetch similar videos if at the end of the current list
    fetchSimilarVideos(currentVideos[currentVideoIndex - 1].id.videoId);
  }
}

// Fetch similar videos based on the current video
function fetchSimilarVideos(videoId) {
  fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&relatedToVideoId=${videoId}&key=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      if (data.items.length > 0) {
        currentVideos = data.items; // Update current videos with similar ones
        currentVideoIndex = 0; // Reset to the first video in the similar results
        playVideo(currentVideos[0].id.videoId); // Play the first similar video
      } else {
        alert("No similar videos found.");
      }
    })
    .catch(error => console.error('Error fetching similar YouTube API:', error));
}

// Play next video manually
document.getElementById('next-button').addEventListener('click', playNextVideo);
