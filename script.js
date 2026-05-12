// State management
let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let laps = [];
let isRunning = false;

// DOM Elements
const hoursDisplay = document.getElementById('hours');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const msDisplay = document.getElementById('milliseconds');

const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const lapBtn = document.getElementById('lap-btn');
const exportBtn = document.getElementById('export-btn');
const themeToggle = document.getElementById('theme-toggle');
const lapsList = document.getElementById('laps-list');
const lapSound = document.getElementById('lap-sound');

// Helper Functions
function formatTime(time) {
    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time % 3600000) / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = time % 1000;

    return {
        h: String(hours).padStart(2, '0'),
        m: String(minutes).padStart(2, '0'),
        s: String(seconds).padStart(2, '0'),
        ms: String(milliseconds).padStart(3, '0')
    };
}

function updateDisplay() {
    const time = isRunning ? Date.now() - startTime + elapsedTime : elapsedTime;
    const formatted = formatTime(time);

    hoursDisplay.textContent = formatted.h;
    minutesDisplay.textContent = formatted.m;
    secondsDisplay.textContent = formatted.s;
    msDisplay.textContent = formatted.ms;
}

function startTimer() {
    if (isRunning) return;

    isRunning = true;
    startTime = Date.now();

    timerInterval = setInterval(updateDisplay, 10);

    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    lapBtn.disabled = false;
}

function pauseTimer() {
    if (!isRunning) return;

    isRunning = false;
    elapsedTime += Date.now() - startTime;
    clearInterval(timerInterval);

    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    lapBtn.disabled = true;
}

function resetTimer() {
    pauseTimer();
    elapsedTime = 0;
    laps = [];
    updateDisplay();
    renderLaps();

    lapBtn.disabled = true;
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
}

function addLap() {
    if (!isRunning) return;

    const currentTotalTime = Date.now() - startTime + elapsedTime;
    const lapTime = currentTotalTime;

    // Prevent duplicate laps if needed (though with ms it's unlikely unless double clicked)
    if (laps.length > 0 && laps[0].time === lapTime) return;

    laps.unshift({
        id: Date.now(),
        time: lapTime,
        formatted: formatTime(lapTime)
    });

    // Play sound
    lapSound.currentTime = 0;
    lapSound.play().catch(e => console.log('Audio play prevented', e));

    renderLaps();
}

function renderLaps() {
    lapsList.innerHTML = '';
    laps.forEach((lap, index) => {
        const li = document.createElement('li');
        li.className = 'lap-item';

        const actualIndex = laps.length - index;

        li.innerHTML = `
            <span class="lap-number">Lap ${actualIndex}</span>
            <span class="lap-time">${lap.formatted.h}:${lap.formatted.m}:${lap.formatted.s}.${lap.formatted.ms}</span>
        `;
        lapsList.appendChild(li);
    });
}

function exportLaps() {
    if (laps.length === 0) {
        alert('No laps to export!');
        return;
    }

    const content = laps
        .map((lap, index) => `Lap ${laps.length - index}: ${lap.formatted.h}:${lap.formatted.m}:${lap.formatted.s}.${lap.formatted.ms}`)
        .reverse()
        .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stopwatch_laps_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme', !isDark);
    themeToggle.textContent = isDark ? '🌓' : '☀️';
}

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
lapBtn.addEventListener('click', addLap);
exportBtn.addEventListener('click', exportLaps);
themeToggle.addEventListener('click', toggleTheme);

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    if (key === ' ') { // Space
        e.preventDefault();
        isRunning ? pauseTimer() : startTimer();
    } else if (key === 'l') {
        addLap();
    } else if (key === 'r') {
        resetTimer();
    }
});

// Initial display
updateDisplay();
