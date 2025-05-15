// script.js
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeRemaining = 30; // Default 30 seconds per question

const questionCountText = document.getElementById("question-count");
const questionText = document.getElementById("question");
const optionsContainer = document.getElementById("options");
const nextBtn = document.getElementById("nextBtn");
const resultBox = document.getElementById("result");
const timerElement = document.getElementById("timer");
const progressBar = document.getElementById("progress-bar");

fetch("quizquestion.json")
  .then(res => res.json())
  .then(data => {
    questions = data;
    // Randomize question order
    shuffleQuestions();
    showQuestion();
  })
  .catch(err => {
    console.error("Failed to load questions:", err);
    questionText.textContent = "Error loading quiz data.";
    nextBtn.disabled = true;
  });

// Fisher-Yates shuffle algorithm to randomize questions
function shuffleQuestions() {
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
}

function startTimer() {
  // Reset timer
  timeRemaining = 30; // 30 seconds per question
  updateTimerDisplay();
  
  // Clear any existing interval
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    
    // Update progress bar
    const percentage = (timeRemaining / 30) * 100;
    progressBar.style.width = `${percentage}%`;
    
    if (timeRemaining <= 10) {
      timerElement.classList.add("warning");
    } else {
      timerElement.classList.remove("warning");
    }
    
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      // Auto-select wrong answer when time runs out
      timeUp();
    }
  }, 1000);
}

function updateTimerDisplay() {
  timerElement.textContent = `Time: ${timeRemaining}s`;
}

function timeUp() {
  // Disable all option buttons
  Array.from(optionsContainer.children).forEach(btn => {
    btn.disabled = true;
  });
  
  // Highlight the correct answer
  const correctIndex = questions[currentQuestionIndex].answer;
  Array.from(optionsContainer.children)[correctIndex].style.backgroundColor = "#a4edba"; // green
  
  // Enable next button
  nextBtn.disabled = false;
}

function showQuestion() {
  clearOptions();
  
  // Update the progress bar container for the new question
  updateProgressBar();
  
  // Update the "Question X of Y" text
  questionCountText.textContent = 
    `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  
  // Grab the current question
  const q = questions[currentQuestionIndex];
  questionText.textContent = q.question;
  
  // Render each choice as a button
  q.options.forEach((optionText, idx) => {
    const btn = document.createElement("button");
    btn.textContent = optionText;
    btn.classList.add("option");
    btn.disabled = false;
    btn.addEventListener("click", () => checkAnswer(idx));
    optionsContainer.appendChild(btn);
  });
  
  // Start the timer for this question
  startTimer();
}

function updateProgressBar() {
  // Calculate progress percentage
  const progress = ((currentQuestionIndex) / questions.length) * 100;
  progressBar.style.width = `${progress}%`;
}

function checkAnswer(selectedIndex) {
  // Stop the timer
  clearInterval(timerInterval);
  
  const correctIndex = questions[currentQuestionIndex].answer;
  // Update score if correct
  if (selectedIndex === correctIndex) {
    score++;
  }
  
  // Highlight right/wrong
  Array.from(optionsContainer.children).forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === correctIndex) {
      btn.style.backgroundColor = "#a4edba";  // green for correct
    } else if (idx === selectedIndex) {
      btn.style.backgroundColor = "#f5a3a3";  // red for wrong
    }
  });
  
  // Enable the Next button once an answer has been chosen
  nextBtn.disabled = false;
}

function clearOptions() {
  // Remove all existing option buttons
  optionsContainer.innerHTML = "";
  // Disable Next until an answer is picked
  nextBtn.disabled = true;
}

nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  // If more questions remain, show next; otherwise show result
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    clearInterval(timerInterval); // Make sure timer is stopped
    showResult();
  }
});

function showResult() {
  document.querySelector(".quiz-box").innerHTML = `
    <h2>Your score: ${score} / ${questions.length}</h2>
    <button onclick="location.reload()">Try Again</button>
  `;
}