// Get entry container.
function element(el) {
  return document.getElementById(el);
}

// Reset cookie and create new game.
function resetGame() {
  deleteAllCookies();
  newGame(window.game.data);
  hideResetPopup();
}

// Generate new game given data and a seed.
function newGame(data) {
  window.game = new Object();
  window.game.data = data; // all words.
  window.game.pangram = getTargetPangram(window.game.data); // the chosen pangram.
  window.game.current_score = 0; // current score.
  window.game.total_score = getTotalScore(
    window.game.data,
    window.game.pangram
  ); // total score that can be obtained.
  window.game.words = getWords(window.game.data, window.game.pangram); // valid words that can be entered into the puzzle.
  window.game.entered = new Array(); // words that have been entered into the puzzle.
  window.game.popup_active = false; // flag to indicate if popup is active.
  window.game.show_all_popup = true; // flag to indicate whether we should show all popup.
  window.game.show_victory_popup = true; // flag to indicate whether we should show victory popup.

  changeProgress(0); // reset progress bar to 0.
  addWordsToEntered();
  setUpDropdown();
  setUpScreenKeys(window.game.pangram, true);
  setUpAboutPopup();
  setUpPrevPopup();
  setUpProgressPopup();
  setUpReturnPopup();
  setUpVictoryPopup();
  setUpAllPopup();

  if (returnPopupNotShownYet) {
    if (window.game.current_score != 0 && getRankNumber(window.game.current_score) != 0) {
      showReturnPopup();
    }
    returnPopupNotShownYet = false;
  }
}

// Test if a key is a letter.
function isLetter(key) {
  return (
    key.length == 1 && "ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(key.toUpperCase())
  );
}

// Get today's date with HH/MM/SS blanked out, plus some offset of days.
function getDateWithOffset(offset = 0) {
  let today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);
  let tomorrow = today.setDate(today.getDate() + offset);
  return new Date(tomorrow);
}

// Get the number of days between a provided date (defaulting to today) and January 1,
// 1970, taking an optional number of days as an offset.
function getDayNumber(offset = 0) {
  let d = getDateWithOffset(offset);
  let DAYS_TO_MILLISECONDS = 24 * 60 * 60 * 1000;
  return Math.floor(d.getTime() / DAYS_TO_MILLISECONDS);
}

// Save entered words to cookie.
function setCookie() {
  let entered_words = window.game.entered.join("|");
  document.cookie =
    window.game.pangram +
    "-entered=" +
    entered_words +
    "; expires=" +
    getDateWithOffset(2).toUTCString();
}

// Load entered words from cookie, with an offset to specify which day.
function getCookie(offset = 0) {
  let raw_cookie = document.cookie.split(";");
  if (document.cookie.length == 0) {
    return new Array();
  }
  for (cookie of raw_cookie) {
    let cookie_pangram = cookie.trim().split("-")[0];
    if (cookie_pangram == getTargetPangram(window.game.data, offset)) {
      return cookie.trim().split("=")[1].split("|");
    }
  }

  return new Array();
}

// Save dark mode cookie.
function setDarkCookie() {
  document.cookie =
    "!dark-entered=" +
    (document.body.classList.contains("dark") ? "dark" : "light") +
    "; expires=" +
    getDateWithOffset(365).toUTCString();
}

// Load dark mode cookie.
function getDarkCookie() {
  let raw_cookie = document.cookie.split(";");
  if (document.cookie.length == 0) {
    return;
  }
  for (cookie of raw_cookie) {
    let cookie_head = cookie.trim().split("-")[0];
    if (cookie_head == "!dark") {
      switchDarkMode(cookie.trim().split("=")[1]);
    }
  }
}

// Delete all cookies.
function deleteAllCookies() {
  var cookies = document.cookie.split(";");

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var eqPos = cookie.indexOf("=");
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}
