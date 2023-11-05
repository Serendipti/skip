// ==UserScript==
// @name         YouTube Ad Skip/Block
// @encoding     utf-8
// @description  Extension to watch for ads, and automatically seek and skip them.
// @match        *://*.youtube.com/*
// @exclude      *://music.youtube.com/*
// @exclude      *://*.music.youtube.com/*
// @compatible   safari
// @connect      youtube.com
// @grant        GM_addStyle
// @downloadURL  https://raw.githubusercontent.com/Serendipti/skip/main/safari_userscript.js
// @updateURL    https://raw.githubusercontent.com/Serendipti/skip/main/safari_userscript.js
// @run-at       document-end
// ==/UserScript==

chrome.runtime.onInstalled.addListener(function () {
  console.log("background");
});

function getVideoContainer() {
  const videoContainer = Array.from(
    document.getElementsByClassName("html5-video-container"),
  );
  return videoContainer.length > 0 ? videoContainer[0] : null;
}

function getVideoWrapper() {
  return getVideoContainer() ? getVideoContainer().parentNode : null;
}

function getVideoPlayer() {
  return getVideoContainer() ? getVideoContainer().firstChild : null;
}

function isAdShowing() {
  const wrapper = getVideoWrapper();
  return wrapper !== null
    ? wrapper !== undefined && String(wrapper.className).includes("ad-showing")
    : null;
}

function getSkipButton() {
  const skipAdButton = Array.from(
    document.getElementsByClassName("ytp-ad-skip-button ytp-button"),
  );
  return skipAdButton.length > 0 ? skipAdButton[0] : null;
}

function waitForPlayer() {
  if (getVideoPlayer()) {
    hookVideoPlayer();
  } else {
    setTimeout(() => {
      waitForPlayer();
    }, 200);
  }
}

function hookVideoPlayer() {
  const videoPlayer = getVideoPlayer();
  videoPlayer.addEventListener("timeupdate", () => {
    getSkipButton()?.click();
  });

  if (isAdShowing()) {
    videoPlayer.currentTime = videoPlayer.duration - 1;
    videoPlayer.pause();
    videoPlayer.play();
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    String(tab.url).includes("https://www.youtube.com/watch")
  ) {
    console.log("on youtube");
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: waitForPlayer,
    });
  }
});
