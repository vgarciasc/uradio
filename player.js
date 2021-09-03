//boilerplate youtube embedding stuff
var tag = document.createElement('script');
tag.id = "iframe-demo";
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player("pmradio-iframe-yt", {
    playerVars: { 'autoplay': 1, 'controls': 0 },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

var curr_video_idx = -1;
var curr_video_obj = null;
var off_air = false;

// initiates autoplay as soon as possible
function onPlayerReady(event) {
  autoplay();
}

function onPlayerStateChange(event) {
  // when video stops, start the next one
  if (event.data == 0) {
    onVideoStop();
  }

  // blocks pausing
  if (database.should_block_pauses && event.data == 2) {
    player.playVideo();
  }
}

function onVideoStop() {
  if (curr_video_idx > 0 && curr_video_idx < database.videos.length - 1) {
    playVideo(curr_video_idx + 1, database.videos[curr_video_idx + 1]);
  } else {
    autoplay();
  }
}

// plays a certain video
function playVideo(video_idx, video_obj) {
  [curr_video_idx, curr_video_obj] = [video_idx, video_obj];

  toggleOffAir(false);
  updateDomText();
  player.loadVideoById(video_obj.id, getCurrentTime() - video_obj.start_time);
}

function toggleOffAir(value) {
  off_air = value;
  updateDom();
}

// returns the current time (in seconds starting at 00:00:00)
function getCurrentTime() {
  var today = new Date();
  return today.getHours()*60*60 + today.getMinutes()*60 + today.getSeconds();
}

// runs the video that should be playing right now
function autoplay() {
  if (database.should_loop) {
    displaceScheduleToLoop();
  }

  var [video_idx, video_obj] = getCurrentVideo();
  if (video_idx == -2 || video_idx == -1) {
    toggleOffAir(true);
    setInterval(function() {
      if (off_air) {
        autoplay();
      }
    }, 10000);
  }

  if (video_obj != null) {
    playVideo(video_idx, video_obj)
  }
}

// returns the video that should be playing right now
function getCurrentVideo() {  
  var current_time = getCurrentTime();
  
  if (database.videos.length > 0 && current_time < database.videos[0].start_time) {
    // hasnt started yet today
    return [-2, null];
  }

  for (var i = 0; i < database.videos.length; i++) {
    var video_obj = database.videos[i];
    if (current_time < video_obj.start_time + video_obj.duration) {
      return [i, video_obj];
    }
  }

  // has already ended for today
  return [-1, null]
}

function displaceScheduleToLoop() {
  if (database.length == 0) {
    return;
  }

  var first_video = database.videos[0];
  var last_video = database.videos[database.videos.length - 1];
  var playlist_duration = last_video.start_time + last_video.duration - first_video.start_time;
  var current_time = getCurrentTime();
  var new_start_time = first_video.start_time;

  while (current_time < first_video.start_time) {
    new_start_time -= playlist_duration;
    updateStartTime(new_start_time);
  }

  while (current_time > last_video.start_time + last_video.duration) {
    new_start_time += playlist_duration;
    updateStartTime(new_start_time);
  }
}

function updateStartTime(start_time) {
  database.start_time = start_time;
  var curr_time = start_time;
  for (var i = 0; i < database.videos.length; i++) {
    var video = database.videos[i];
    video.start_time = curr_time;
    curr_time += video.duration;
  }
}

// updates DOM elements
function updateDom() {
  updateDomText();

  if (off_air) {
    if ($("#pmradio-off-air").length > 0) {
      $("#pmradio-iframe-yt").hide();
      $("#pmradio-off-air").show();
    }
  } else {
    if ($("#pmradio-off-air").length > 0) {
      $("#pmradio-iframe-yt").show();
      $("#pmradio-off-air").hide();
    }
  }
}

function updateDomText() {
  var str = "";
  if (off_air) {
    str = "[off-air]";
  } else {
    str = curr_video_obj.title
  }
  
  $("#pmradio-current-video").text(str);
}