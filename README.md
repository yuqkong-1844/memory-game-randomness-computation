🧠 Probability & Statistics Memory Game

This is a classic memory matching game built with HTML, Tailwind CSS, and pure JavaScript. The twist? Each successful match reveals a fun fact or story about a key concept, theorem, or historical figure in probability and statistics.

Play against the clock in single-player mode, or challenge a friend in the new two-player competitive mode!

🚀 Live Demo

You can play the live version of the game here:

[https://yuqkong-1844.github.io/memory-game-randomness-computation/index.html]

(Once your GitHub Pages deployment is complete, replace the text above with the actual live link.)

✨ Features

Educational Twist: Match pairs to unlock detailed pop-up stories about concepts like the Central Limit Theorem, Martingale, Ramsey Theory, and more.

Dual Mode Gameplay: Play the traditional single-player mode against the timer, or switch to the competitive Two-Player Mode to see who can find the most pairs.

Dedicated Exhibition: Explore all 20+ probability and statistics concepts in a clean, scrollable gallery format via the separate Exhibition Mode.

Multilingual Support: Toggle between English (EN) and Chinese (中文) for the story content.

Style Switcher: Change the visual theme of the cards (e.g., 'Original' to 'Colorful').

Responsive Design: Optimized for play on both desktop and mobile devices.

KaTeX Support: Story modals and the Exhibition page correctly render complex mathematical equations using KaTeX.

🕹️ How to Play (Memory Game - index.html)

Objective: The goal is to find all matching pairs of cards.

Flipping: Click on any two cards.

Match: If the two cards show the same image, they remain face up on the board, and you unlock the corresponding educational story.

No Match: If the cards don't match, they flip back over after a short delay.

Two-Player Mode: In this mode, players take turns. Finding a match grants the current player a point and allows them to take another turn. Failing to find a match ends the turn, and play passes to the next player. The player with the most pairs wins!

📜 Exhibition Mode (exhibition.html)

This dedicated page serves as an educational gallery. It displays all the probability and statistics concepts, images, and full-text explanations from the game in a clear, browsable format. It's a great resource for reviewing the material without playing the game.

🛠️ Technology Stack

This project is a completely client-side, static web application:

HTML5: Structure

Tailwind CSS: Styling and fully responsive layout

JavaScript (ES6): Game logic, state management, and DOM manipulation

KaTeX: Library used for rendering LaTeX mathematical notation in the story modals and exhibition page.

📂 Project Structure

The project includes two main pages: the interactive game and the educational gallery.

/
├── index.html                  # Main Memory Game page (Interactive)
├── memory_game.js              # Core JavaScript game logic and state management
├── exhibition.html             # The Educational Gallery page (Static content browser)
├── exhibition.js               # JavaScript logic for the Exhibition page (loading/rendering stories)
├── README.md                   # This file
├── images/                     # Folder for the 'Original' card images
├── images_v2/                  # Folder for the 'Colorful' card images
└── card_stories/               # Folder containing all educational content in JSON format
    ├── stories.json            # English card stories
    └── stories_cn.json         # Chinese card stories (if provided)
    ├── about_en.json           # English project/acknowledgement info
    └── about_cn.json           # Chinese project/acknowledgement info (if provided)


🤝 Contribution and Acknowledgements

The initial design and educational content concepts were based on the excellent work of students in the "Randomness & Computation" course.

If you have suggestions for new probability concepts to turn into cards, or if you spot an error in the logic or stories, please feel free to open an issue or submit a pull request!
