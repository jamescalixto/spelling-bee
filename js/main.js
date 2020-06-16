// Get entry container.
function element(el) {
  return document.getElementById(el);
}

// Reset cookie and create new game.
function resetGame() {
  function deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }
  deleteAllCookies();
  newGame(window.game.data);
  hideResetPopup();
}

// Generate new game given data and a seed.
function newGame(data, seed = 0) {
  window.game = new Object();
  window.game.data = data; // all words.
  window.game.pangram = getTargetPangram(window.game.data, seed); // the chosen pangram.
  window.game.current_score = 0; // current score.
  window.game.total_score = getTotalScore(
    window.game.data,
    window.game.pangram
  ); // total score that can be obtained.
  window.game.words = getWords(window.game.data, window.game.pangram); // valid words that can be entered into the puzzle.
  window.game.entered = new Array(); // words that have been entered into the puzzle.
  window.game.popup_active = false; // flag to indicate if popup is active.

  changeProgress(0); // reset progress bar to 0.
  addWordsToEntered();
  setUpDropdown();
  setUpScreenKeys(window.game.pangram, true);
  setUpProgressPopup();
}

// Test if a key is a letter.
function isLetter(key) {
  return (
    key.length == 1 && "ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(key.toUpperCase())
  );
}

// Save entered words to cookie.
function setCookie() {
  let entered_words = window.game.entered.join("|");
  document.cookie =
    "pangram=" +
    window.game.pangram +
    "; expires=" +
    getTomorrowDate().toUTCString();
  document.cookie =
    "entered=" + entered_words + "; expires=" + getTomorrowDate().toUTCString();
}

// Load entered words from cookie.
function getCookie() {
  let raw_cookie = document.cookie.split(";");
  if (document.cookie.length == 0) {
    return null;
  }
  let pangram = raw_cookie[0].slice(raw_cookie[0].indexOf("=") + 1);
  let entered_words = raw_cookie[1]
    .slice(raw_cookie[1].indexOf("=") + 1)
    .split("|");
  if (pangram == window.game.pangram) {
    return entered_words;
  } else {
    return null;
  }
}
