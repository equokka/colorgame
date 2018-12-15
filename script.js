// the_color_game
// This script has to be loaded in with the "defer" attribute in the <script>

const MESSAGES = {
  "try_again": "Try Again!",
  "correct":   "Correct!",
  "play_again": "Play Again?"
};

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#Getting_a_random_integer_between_two_values_inclusive
/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 * @param {Number} min Lower bound
 * @param {Number} max Upper bound
 * @returns {Number} Random integer between min and max
 */
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Gets a random color in rgb format, ie rgb(20, 255, 0)
 * @returns {Color} A random color
 */
const getRandomColor = () => {
  return new Color(getRandomInt(0, 255),
                   getRandomInt(0, 255),
                   getRandomInt(0, 255));
};

// Color
const $display_red = document.querySelector("#color_display .red"),
    $display_green = document.querySelector("#color_display .green"),
     $display_blue = document.querySelector("#color_display .blue");
// Buttons
const $btn_new = document.getElementById("new"),
     $btn_easy = document.getElementById("easy"),
     $btn_hard = document.getElementById("hard");
// Message
const $msg = document.getElementById("msg");
// Header
const $header = document.getElementsByTagName("header")[0];
// Game container
const $game = document.getElementById("game");
// Game difficulty
let $difficulty = "hard";
// Correct answer
let $answer_color;
// Number of guesses
let $guesses = 0;

class Color {
  constructor(r, g, b) {
    if (typeof(r) !== "number" || 0 > r || r > 255) throw new Error("Invalid value for red");
    if (typeof(g) !== "number" || 0 > g || g > 255) throw new Error("Invalid value for green");
    if (typeof(b) !== "number" || 0 > b || b > 255) throw new Error("Invalid value for blue");

    this.red = r;
    this.green = g;
    this.blue = b;
  }
  get css() { return `rgb(${this.red}, ${this.green}, ${this.blue})`; }
}

/**
 * Update the color display at the top of the page with a new color.
 * @param {Color} color Color to update with
 */
const updateColorDisplay = (color) => {
  // Throw error if color is not a Color
  if (!(color instanceof Color)) throw new TypeError("Expected a Color");

  // Set it
  $display_red.textContent   = color.red;
  $display_green.textContent = color.green;
  $display_blue.textContent  = color.blue;
};

/**
 * Updates the message in the navbar to given value.
 * @param {any} msg Message
 */
const updateMessage = (msg) => $msg.textContent = msg;

/**
 * Creates a new game with the given difficulty.
 * @param {"easy"|"hard"} diff The difficulty type
 */
const updateDifficulty = (diff) => {
  // Throw error if the dificulty doesn't exist
  if (!(diff === "easy" || diff === "hard")) throw new Error("Value is not one of \"hard\" or \"easy\"");

  // Stop here if easy => easy or hard => hard
  if (diff === $difficulty) return;

  // Change difficulty
  $difficulty = diff;

  // Add "easy" class if on easy, hiding bottom three squares
  $game.classList.toggle("easy", $difficulty === "easy");

  // Remove or add "selected" class based on difficulty
  $btn_easy.classList.toggle("selected", $difficulty === "easy");
  $btn_hard.classList.toggle("selected", $difficulty === "hard");

  // Create a new game
  newGame();
};

/**
 * Resets and restarts the game, generating new colors.
 */
const newGame = () => {
  // Reset guesses counter
  $guesses = 0;

  // Clear message
  updateMessage("");

  // Reset header background color
  $header.style.backgroundColor = "transparent";

  // Remove "over" class
  $game.classList.toggle("over", false);

  // Represent game grid
  let squares = [1,2,3,4,5,6];

  // Don't bother with the last three if we're on easy mode
  if ($difficulty === "easy") squares.splice(3);

  // Restore opacity to all squares
  Array.from(document.getElementsByClassName("color"))
    .forEach(e => e.style.opacity = 1);

  let colors = [];

  // For each square...
  squares.forEach(n => {
    const s = document.getElementById("color_" + n);

    // Change to a random color
    let color = getRandomColor();
    s.style.backgroundColor = color.css;
    // Keep color
    colors.push(color);

    // Attach an event to each one
    s.onclick = () => {
      // "Try again"
      updateMessage(MESSAGES.try_again);

      // Fade out
      s.style.opacity = 0;

      // Increment guesses counter
      $guesses += 1;

      // If there's only one square left, you've lost:
      if (($difficulty === "easy" && $guesses === 2) ||
          ($difficulty === "hard" && $guesses === 5)) {
        // "Play again?"
        updateMessage(MESSAGES.play_again);

        // Change header background to answer color
        $header.style.backgroundColor = $answer_color.css;

        // Add "over" class
        $game.classList.toggle("over", true);

        // Remove all click events
        Array.from(document.getElementsByClassName("color"))
          .forEach(e => e.onclick = null);
      }
    };
  });

  // Now, pick a random square for the answer
  const answer = Math.floor(Math.random() * colors.length);
  $answer_color = colors[answer];

  // Update display with the correct color
  updateColorDisplay($answer_color);

  // Change click event on the correct square
  document.getElementById("color_" + (answer + 1)).onclick = () => {
    // Update message
    updateMessage(MESSAGES.correct);

    // Change header background to answer color
    $header.style.backgroundColor = $answer_color.css;

    // Add "over" class
    $game.classList.toggle("over", true);

    // Represent game grid
    let squares = [1,2,3,4,5,6];

    // Don't bother with the last three if we're on easy mode
    if ($difficulty === "easy") squares.splice(3);

    // On all squares...
    Array.from(document.getElementsByClassName("color"))
      .forEach(e => {
        // Restore opacity to all squares
        e.style.opacity = 1;

        // Set them all to the answer color
        e.style.backgroundColor = $answer_color.css;

        // Remove click event
        e.onclick = null;
      });
  };
};

// Events
$btn_new.onclick = newGame;
$btn_easy.onclick = () => updateDifficulty("easy");
$btn_hard.onclick = () => updateDifficulty("hard");


newGame();
