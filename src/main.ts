import p5 from 'p5';
import './style.css';

const p = new p5((processing) => {
  processing.preload = preload;
  processing.setup = setup;
  processing.draw = draw;
  processing.keyPressed = keyPressed;
}, document.getElementById('app')!);

const MAX_WRONG_GUESSES = 7;

/** Word to guess */
const wordToGuess = 'Winterwald';

/**
 * Current word status
 *
 * At the beginning, this variable contains an underscore ("_")
 * for each character wordToGuess (e.g. "\_\_\_" if word to guess
 * is "ice"). If the user guesses a letter correctly, the
 * corresponding letter(s) are revealed in this variable
 * (e.g. "i\_\_" after guessing "i" in "ice").
 */
let currentWordStatus: string;

/** Font for text output */
let font: p5.Font;

/** Number of wrong guesses */
let wrongGuesses = 0;

/**
 * Value indicating whether the program still accepts keys
 *
 * Becomes false if the game is over.
 */
let acceptKeys = true;

/**
 * Get the initial value for currentWordStatus with underscores based on wordToGuess
 *
 * @param wordToGuess Word to guess
 *
 * @returns Initial value for currentWordStatus
 *
 * This function must return a string with the same length as wordToGuess.
 * If a character in wordToGuess is a letter, the corresponding character
 * in the return value must be an underscore. If a character in wordToGuess
 * is a space, the corresponding character in the return value must be a space.
 */
function getInitialCurrentWord(wordToGuess: string): string {
  let currentWordStatus = '';
  for (let i = 0; i < wordToGuess.length; i++) {
    if (wordToGuess[i] != ' ') {
      currentWordStatus += '_';
    } else {
      currentWordStatus += ' ';
    }
  }

  return currentWordStatus;
}

/**
 * Handles a guess from a user
 *
 * @param key Key that the user guessed
 * @param wordToGuess Word to guess
 * @param currentWordStatus Current word status
 *
 * @returns New value for currentWordStatus
 *
 * This function must return a new value for currentWordStatus based on the
 * key that the user guessed. If the key is in wordToGuess, the corresponding
 * characters in currentWordStatus must be revealed.
 */
function guessKey(
  key: string,
  wordToGuess: string,
  currentWordStatus: string
): string {
  const lowerKey = key.toLowerCase();

  let newCurrentWordStatus = '';
  for (let i = 0; i < wordToGuess.length; i++) {
    const lowerChar = wordToGuess[i].toLowerCase();
    if (lowerChar === lowerKey) {
      newCurrentWordStatus += wordToGuess[i];
    } else {
      newCurrentWordStatus += currentWordStatus[i];
    }
  }

  return newCurrentWordStatus;
}

function preload() {
  // Load the font from the web
  font = p.loadFont(
    'https://cddataexchange.blob.core.windows.net/images/SyneMono-Regular.ttf'
  );
}

function setup() {
  // Initially fill the currentWordStatus
  currentWordStatus = getInitialCurrentWord(wordToGuess);

  p.createCanvas(800, 500);
  p.angleMode(p.DEGREES);

  // Draw the screen one time
  p.redraw();
  p.noLoop(); // Stop calling draw() automatically
}

function draw() {
  p.background('white');

  if (currentWordStatus === wordToGuess) {
    // User has guessed the word correctly
    acceptKeys = false;
    drawResult(true, wrongGuesses);
  } else if (wrongGuesses === MAX_WRONG_GUESSES) {
    // User has reached 10 wrong guesses -> game over
    acceptKeys = false;
    drawResult(false, wrongGuesses);
  } else {
    // Game still running -> draw snowman
    drawSnowman(wrongGuesses);
    drawCurrentWordStatus(font, currentWordStatus);
  }
}

function keyPressed() {
  // If game is over, do not accept keys
  if (!acceptKeys) {
    return;
  }

  // Handle guess
  const newCurrentWordStatus = guessKey(p.key, wordToGuess, currentWordStatus);
  if (currentWordStatus === newCurrentWordStatus) {
    wrongGuesses++;
  }
  currentWordStatus = newCurrentWordStatus;

  // Refresh the screen one time
  p.redraw();
}

/**
 * Draws the result text
 *
 * @param win False if the user has reached 10 wrong guesses, otherwise true
 *
 * Draws the result text on the screen. If the user has lost (10 wrong guesses),
 * the text must be "Game Over" in red.
 *
 * If the user has guessed the word correctly, the text must be:
 *
 * * "No wrong guesses!" if number of wrong guesses is zero.
 * * "One wrong guess!" if number of wrong guesses is one.
 * * "n wrong guesses" otherwise ("n" is number of wrong guesses).
 */
function drawResult(win: boolean, wrongGuesses: number) {
  p.push();
  p.textAlign(p.CENTER, p.CENTER);
  if (win) {
    p.fill('green');
  } else {
    p.fill('red');
  }
  p.noStroke();
  p.textSize(65);
  p.textFont(font);
  let message = 'Game Over';
  if (win) {
    switch (wrongGuesses) {
      case 0:
        message = 'No wrong guesses!';
        break;
      case 1:
        message = 'One wrong guess!';
        break;
      default:
        message = `${wrongGuesses} wrong guesses.`;
        break;
    }
  }
  p.text(message, p.width / 2, p.height / 2);
  p.pop();
}

/**
 * Draw the snowman
 *
 * Leave out some parts of the snowman depending on the number of
 * wrong guesses. Note that the left out parts are additive. That means
 * if 3 wrong guesses are made, the parts for 1, 2, and 3 wrong guesses
 * should be left out.
 *
 * * 1 wrong: Buttons
 * * 2 wrong: Mouth
 * * 3 wrong: Nose
 * * 4 wrong: Eyes
 * * 5 wrong: Hat
 * * 6 wrong: Top body part
 * * 7 wrong: GAME OVER
 */
function drawSnowman(numberOfWrongGuesses: number) {
  // Set center of X axis
  p.translate(130, 0);

  // Body
  p.push();
  p.stroke('black');
  p.strokeWeight(2);
  p.fill('aliceblue');
  if (numberOfWrongGuesses < 7) {
    p.circle(0, 350, 250);
  }
  if (numberOfWrongGuesses < 6) {
    p.circle(0, 175, 150);
  }
  p.pop();

  // Eyes
  if (numberOfWrongGuesses < 4) {
    p.push();
    p.noStroke();
    p.fill('black');
    p.circle(-25, 150, 25);
    p.circle(25, 150, 25);
    p.pop();
  }

  // Nose
  if (numberOfWrongGuesses < 3) {
    p.push();
    p.noStroke();
    p.fill('orange');
    p.triangle(0, 195, 0, 165, 40, 180);
    p.pop();
  }

  // Mouth
  if (numberOfWrongGuesses < 2) {
    p.push();
    p.fill('black');
    p.translate(0, 180);
    p.rotate(45);
    let start = 0;
    for (let i = 0; i < 6; i++) {
      p.circle(40, 0, 12);
      p.rotate(18);
    }
    p.pop();
  }

  // Buttons
  if (numberOfWrongGuesses < 1) {
    p.push();
    for (let i = 0; i < 6; i++) {
      p.noStroke();
      p.fill('black');
      p.circle(0, 275, 15);
      p.translate(0, 25);
    }
    p.pop();
  }

  // Hat
  if (numberOfWrongGuesses < 5) {
    p.push();
    p.noStroke();
    p.fill('black');
    p.rect(-85, 110, 170, 10);
    p.rect(-50, 50, 100, 60);
    p.pop();
  }
}

/**
 * Draws the current word status
 *
 * @param font Font to use
 * @param currentWordStatus Current word status
 *
 * Draws the current word status on the screen.
 */
function drawCurrentWordStatus(font: any, currentWordStatus: string) {
  p.push();
  p.textAlign(p.LEFT, p.BOTTOM);
  p.translate(225, 0);

  // Draw current word status
  p.fill('dodgerblue');
  p.noStroke();
  p.textSize(45);
  p.textFont(font);
  p.text(currentWordStatus, 0, 250);
  p.pop();
}
