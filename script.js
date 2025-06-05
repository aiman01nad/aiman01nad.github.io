let countdown;
let paused = false;
let remainingSeconds = 0;
let endTime = 0;
let currentPasta = "";
let currentMinutes = 0;
let totalSeconds = 0;

function setCircleProgress(percent) {
  const circle = document.getElementById("progressBar");
  const circumference = 2 * Math.PI * 60;
  const offset = circumference * (1 - percent);
  circle.style.strokeDashoffset = offset;
}

function startTimer(pasta, minutes, resume = false) {
  clearInterval(countdown);
  const title = document.getElementById("title");
  const timerDisplay = document.getElementById("timer");
  const pausePlayBtn = document.getElementById("pausePlayBtn");
  const restartBtn = document.getElementById("restartBtn");
  const doneSound = document.getElementById("doneSound");
  title.textContent = `${pasta} cooking...`;
  pausePlayBtn.style.display = "inline-block";
  restartBtn.style.display = "inline-block";
  pausePlayBtn.textContent = "Pause";
  paused = false;

  currentPasta = pasta;
  currentMinutes = minutes;
  totalSeconds = minutes * 60;

  if (!resume) {
    remainingSeconds = totalSeconds;
  }
  endTime = Date.now() + remainingSeconds * 1000;

  function updateTimer() {
    if (!paused) {
      remainingSeconds = Math.round((endTime - Date.now()) / 1000);
    }
    if (remainingSeconds <= 0) {
      clearInterval(countdown);
      timerDisplay.textContent = "🍝";
      title.textContent = `${pasta} is ready!`;
      doneSound.play();
      pausePlayBtn.style.display = "none";
      restartBtn.style.display = "inline-block";
      setCircleProgress(1);
      playBeep();
      if (navigator.vibrate) {
        navigator.vibrate([300, 100, 300]);
      }
      return;
    }
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    timerDisplay.textContent = `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    setCircleProgress((totalSeconds - remainingSeconds) / totalSeconds);
  }

  updateTimer();
  countdown = setInterval(updateTimer, 1000);
}

document.getElementById("pausePlayBtn").onclick = function () {
  const pausePlayBtn = document.getElementById("pausePlayBtn");
  if (!paused) {
    paused = true;
    clearInterval(countdown);
    pausePlayBtn.textContent = "Play";
  } else {
    paused = false;
    endTime = Date.now() + remainingSeconds * 1000;
    pausePlayBtn.textContent = "Pause";
    startTimer(currentPasta, currentMinutes, true);
  }
};

document.getElementById("restartBtn").onclick = function () {
  paused = false;
  document.getElementById("pausePlayBtn").textContent = "Pause";
  startTimer(currentPasta, currentMinutes);
};

async function fetchPastaMap() {
  const docRef = await fetch(
    "https://firestore.googleapis.com/v1/projects/pastatimer-25/databases/(default)/documents/timers/pasta"
  );
  const json = await docRef.json();
  const fields = json.fields || {};
  const result = {};
  for (let [key, val] of Object.entries(fields)) {
    result[key] = parseFloat(val.doubleValue || val.integerValue || "0");
  }
  return result;
}

window.onload = async function () {
  const params = new URLSearchParams(window.location.search);
  const timer = params.get("timer");

  const pastaMap = await fetchPastaMap();

  if (timer && pastaMap[timer.toLowerCase()]) {
    startTimer(timer, pastaMap[timer.toLowerCase()]);
    showPastaImage(timer.toLowerCase());
  }
};

function showPastaImage(pasta) {
  const photoContainer = document.getElementById("pastaPhoto");
  const knownPastas = ["spaghetti", "penne", "fusilli", "tagliatelle"];
  if (knownPastas.includes(pasta)) {
    photoContainer.innerHTML = `
      <img src="images/${pasta}.jpg" alt="${pasta}" />
      <span>${pasta.charAt(0).toUpperCase() + pasta.slice(1)}</span>
    `;
  } else {
    photoContainer.innerHTML = "";
  }
}

function playBeep() {
  const sound = document.getElementById("doneSound");
  sound.play();
}
