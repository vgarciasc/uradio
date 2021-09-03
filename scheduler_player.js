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

function onPlayerReady() {
	$("#pmradio-iframe-yt").hide();
}

function onPlayerStateChange(event) {

}

function playVideoById(video_id) {
	$("#pmradio-iframe-yt").show();
	player.loadVideoById(video_id);
}