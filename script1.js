let Questions = [];
let currQuestion = 0;
let score = 0;
let userAnswers = [];
let timer;
let timeLeft = 40;

// Register & Login
async function register() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  alert(data.message);
}

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  alert(data.message);

  if (data.message === 'Login successful') {
    document.getElementById('auth').style.display = 'none';
    fetchQuestions();
  }
}

// Quiz Logic
const ques = document.getElementById("ques");

async function fetchQuestions() {
  try {
    const response = await fetch('https://opentdb.com/api.php?amount=10&container=18');
    if (!response.ok) {
      throw new Error(`Unable to fetch questions`);
    }
    const data = await response.json();
    Questions = data.results;
    currQuestion = 0;
    score = 0;
    userAnswers = [];
    document.getElementById("progressContainer").style.display = "block";
    document.getElementById("timer").style.display = "block";
    updateProgressBar();
    loadQues();
  } catch (error) {
    console.log(error);
    ques.innerHTML = `<h5 style='color: red'>${error}</h5>`;
  }
}

function loadQues() {
  clearInterval(timer);
  const opt = document.getElementById("opt");
  let currentQuestion = Questions[currQuestion].question;
  currentQuestion = currentQuestion.replace(/&quot;/g, '"').replace(/&#039;/g, "'");
  const questionNumber = currQuestion + 1;
  const totalQuestions = Questions.length;
  ques.innerText = `Question ${questionNumber} of ${totalQuestions}: ${currentQuestion}`;
  opt.innerHTML = "";

  const correctAnswer = Questions[currQuestion].correct_answer;
  const incorrectAnswers = Questions[currQuestion].incorrect_answers;
  const options = [correctAnswer, ...incorrectAnswers].sort(() => Math.random() - 0.5);

  options.forEach((option) => {
    option = option.replace(/&quot;/g, '"').replace(/&#039;/g, "'");
    const choicesdiv = document.createElement("div");
    const choice = document.createElement("input");
    const choiceLabel = document.createElement("label");
    choice.type = "radio";
    choice.name = "answer";
    choice.value = option;
    choiceLabel.textContent = option;
    choicesdiv.appendChild(choice);
    choicesdiv.appendChild(choiceLabel);
    opt.appendChild(choicesdiv);
  });

  startTimer();
}

function startTimer() {
  timeLeft = 40;
  updateTimerDisplay();
  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timer);
      nextQuestion();
    }
  }, 1000);
}

function updateTimerDisplay() {
  document.getElementById("timer").textContent = `Time Left: ${timeLeft}s`;
}

function updateProgressBar() {
  const progressBar = document.getElementById("progressBar");
  const progressLabel = document.getElementById("progressLabel");
  const progress = ((currQuestion + 1) / Questions.length) * 100;
  progressBar.style.width = `${progress}%`;
  progressLabel.textContent = `${Math.round(progress)}%`;
}

function checkAns() {
  clearInterval(timer);
  const selectedAns = document.querySelector('input[name="answer"]:checked');
  if (selectedAns) {
    userAnswers[currQuestion] = selectedAns.value;
    if (selectedAns.value === Questions[currQuestion].correct_answer) {
      score++;
    }
  } else {
    userAnswers[currQuestion] = null;
  }
  nextQuestion();
}

function nextQuestion() {
  clearInterval(timer);
  if (currQuestion < Questions.length - 1) {
    currQuestion++;
    updateProgressBar();
    loadQues();
  } else {
    updateProgressBar();
    showResult();
  }
}

function prevQuestion() {
  clearInterval(timer);
  if (currQuestion > 0) {
    currQuestion--;
    updateProgressBar();
    loadQues();
  }
}

function showResult() {
  document.getElementById("progressContainer").style.display = "none";
  document.getElementById("timer").style.display = "none";
  document.getElementById("opt").style.display = "none";
  document.getElementById("ques").style.display = "none";
  document.getElementById("btn").style.display = "none";
  disableButtons();
  loadScore();
}

function loadScore() {
  const totalScore = document.getElementById("score");
  totalScore.innerHTML = `<h2>You scored ${score} out of ${Questions.length}</h2>`;
  totalScore.innerHTML += `<h3>Review Summary:</h3>`;

  Questions.forEach((q, index) => {
    const correct = q.correct_answer;
    const user = userAnswers[index] ? userAnswers[index] : "No answer";
    const isCorrect = user === correct;
    totalScore.innerHTML += `
      <div style="margin-bottom: 10px; padding: 5px; border-bottom: 1px solid #ccc;">
        <strong>Q${index + 1}:</strong> ${q.question.replace(/&quot;/g,'"').replace(/&#039;/g,"'")}<br>
        <span style="color: ${isCorrect ? 'green' : 'red'};">Your Answer: ${user}</span><br>
        <span style="color: green;">Correct Answer: ${correct}</span>
      </div>
    `;
  });

  totalScore.innerHTML += score === Questions.length
    ? "<h2>Congratulations! Perfect score!</h2>"
    : score > Questions.length / 2
    ? "<h2>Good job! You scored above half!</h2>"
    : "<h2>Keep practicing to improve!</h2>";

  document.getElementById("restartBtn").style.display = "inline-block";
}

function disableButtons() {
  ["nxt", "prev", "btn"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.disabled = true;
      btn.style.display = "none";
    }
  });
}

function restartQuiz() {
  currQuestion = 0;
  score = 0;
  userAnswers = [];
  Questions = [];
  document.getElementById("progressContainer").style.display = "block";
  document.getElementById("timer").style.display = "block";
  ["nxt", "prev", "btn"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.disabled = false;
      btn.style.display = "inline-block";
    }
  });
  document.getElementById("opt").style.display = "block";
  document.getElementById("ques").style.display = "block";
  document.getElementById("btn").style.display = "inline-block";
  document.getElementById("score").innerHTML = "";
  document.getElementById("restartBtn").style.display = "none";
  fetchQuestions();
}
