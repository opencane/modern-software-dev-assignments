# prompts

## week5 

### use agent team to generate plans for task

```
read @docs/TASKS.md, create a agent team to solve this: starting from the 8th task, for each task, make sure you understand it, then make a plan to solve the task, save the plan to `docs/task<number>_plan.md`(for example, the 8th plan is `docs/task8_plan.md`)
```

### implement each task

```
read @docs/task2_plan.md, make sure you understand it fully, then implement it. Make a todo list to track the progress. Make sure your implementation consider both frontend ans backend. Add unit tests for new feature. Verify that all the tests pass

read @docs/task4_plan.md, make sure you understand it fully, then implement it. Make a todo list to track the progress. Make sure your implementation consider both frontend ans backend. Add unit tests for new feature. Verify that all the tests pass

read @docs/task3_plan.md, make sure you understand it fully, then implement it. Make a todo list to track the progress. Make sure your implementation consider both frontend ans backend. Add unit tests for new feature. Verify that all the tests pass

read @docs/task5_plan.md, make sure you understand it fully, then implement it. Make a todo list to track the progress. Make sure your implementation consider both frontend ans backend. Add unit tests for new feature. Verify that all the tests pass

read @docs/task6_plan.md, make sure you understand it fully, then implement it. Make a todo list to track the progress. Make sure your implementation consider both frontend ans backend. Add unit tests for new feature. Verify that all the tests pass

read @docs/task7_plan.md, make sure you understand it fully, then implement it. Make a todo list to track the progress. Make sure your implementation consider both frontend ans backend. Add unit tests for new feature. Verify that all the tests pass

read @docs/task8_plan.md, make sure you understand it fully, then implement it. Make a todo list to track the progress. Make sure your implementation consider both frontend ans backend. Add unit tests for new feature. Verify that all the tests pass

read @docs/task9_plan.md, make sure you understand it fully, then implement it. Make a todo list to track the progress. Make sure your implementation consider both frontend ans backend. Add unit tests for new feature. Verify that all the tests pass
```

## week6

```
examine 
SQL Injection with FastAPI issue at @backend/app/routers/action_items.py:33, make sure you understand the issue fully. Add unit tests for this issue. Then fix it. Use agents if necessary
SQL Injection with FastAPI issue at @backend/app/routers/notes.py:33 and @backend/app/routers/action_items.py:37, make sure you understand the issue fully. Add unit tests for this issue. Then fix it.
  
examine Code Injection with FastAPI issue at @backend/app/routers/notes.py:104, make sure you understand the issue fully. Add unit tests for this issue. Then fix it. Use agents if necessary

examine SQL Injection with SQLAlchemy issue at @backend/app/routers/notes.py:72, make sure you understand the issue fully. Add unit tests for this issue. Then fix it. Use agents if necessary

```

## week7

```markdown
# task1: Add additional API endpoints and implement proper input validation and error handling.
analysis code first, then design a plan for this task: add CRUD support to the notes, cover both frontend and backend, add unit tests for this feature, ensure proper input validation and error handling. Save the plan to `docs/task1_plan.md`

# task2: Enhance the action item extraction functionality with more sophisticated pattern recognition and analysis.
analysis code about action item extraction first, then design a plan for this task: enhance the action item extraction functionality with more sophisticated pattern recognition, add unit tests for this feature, ensure proper error handling. Save the plan to `docs/task2_plan.md`

# task3: Create new database models with relationships and update the application to support them.
```

## week8

```
I want to build a 2048 game. Help me create a prompt for `bolt.new` platform，based on the following
requirements:
- 2048 basic functionalities
- persistent game state in browser, even if the page reload, you can still continue
- when there's no available move, the game is over. you can start over by clicking new game
- keep a top 10 highest record, including the user name and time
```

### prompt for `bolt.new`
```
Project: 2048 Game with Persistence & Leaderboard

  Description:
  Build a fully functional 2048 puzzle game as a single-page web application.

  Core Features:

  1. Gameplay
    - Classic 4x4 grid where tiles slide in 4 directions (arrow keys or swipe on mobile)
    - Merge same numbers (2+2=4, 4+4=8, etc.) when tiles collide
    - New random tile (2 or 4) spawns after each valid move
    - Score increases when tiles merge
  2. Persistence
    - Save current game state (grid, score) to localStorage after every move
    - Restore game on page reload so player can continue
    - Save game start timestamp for time tracking
  3. Game Over
    - Detect when no moves are possible (no empty cells AND no adjacent matching tiles)
    - Display "Game Over" overlay with final score and time
    - "New Game" button to restart
  4. Leaderboard (Top 10)
    - Track top 10 highest scores
    - Store: player name, score, time elapsed (in seconds)
    - Persist leaderboard in localStorage
    - Display current run's time during gameplay
    - Prompt for name when game ends with a top-10 score

  UI Requirements:
  - Clean, modern aesthetic with smooth tile animations
  - Display current score and best score
  - Show timer during gameplay
  - Responsive design (works on mobile and desktop)
  ```

  ### MERN stack prompt
  
  ```
  Project: 2048 Game (MERN Stack)

  Tech Stack: MongoDB, Express, React, Node.js

  Description:
  Build a fully functional 2048 puzzle game with a persistent leaderboard.

  Backend (Node.js/Express + MongoDB):

  1. API Endpoints
    - GET /api/leaderboard - Get top 10 scores
    - POST /api/leaderboard - Submit new score (name, score, time)
    - Use MongoDB to store leaderboard data
  2. Database Schema (MongoDB)
    - Collection: leaderboard
    - Fields: name (string), score (number), time (number - seconds), createdAt (date)
    - Keep only top 10 highest scores

  Frontend (React):

  1. Gameplay
    - 4x4 grid with arrow key and swipe controls
    - Tile merging logic (2+2=4, 4+4=8, etc.)
    - Score tracking
  2. Local Persistence
    - Save game state to localStorage after each move
    - Restore on page reload so player can continue
  3. Game Over
    - Detect when no moves available
    - Show "Game Over" with final score and time
    - "New Game" button to restart
  4. Leaderboard Integration
    - Fetch and display top 10 from MongoDB on game load
    - After game ends, if score qualifies for top 10, prompt for name and submit to backend
    - Show current game time during gameplay

  UI:
  - Modern design with smooth animations
  - Current score, best score, and timer display
  - Responsive (mobile + desktop)
  ```

  ### Nestjs stack prompt

  ```
  Project: 2048 Game (Next.js + Node/NestJS)

  Tech Stack: Next.js (App Router), Node.js (or NestJS), MongoDB

  Description:
  Build a fully functional 2048 puzzle game with a persistent leaderboard.

  Backend (Node.js/NestJS + MongoDB):

  1. API Endpoints
    - GET /api/leaderboard - Get top 10 scores
    - POST /api/leaderboard - Submit new score (name, score, time)
    - Connect to MongoDB for data persistence
  2. Database Schema (MongoDB)
    - Collection: leaderboard
    - Fields: name (string), score (number), time (number - seconds), createdAt (date)
    - Keep only top 10 highest scores

  Frontend (Next.js with App Router):

  1. Gameplay
    - 4x4 grid with arrow key and swipe/touch controls
    - Tile merging logic (2+2=4, 4+4=8, etc.)
    - Real-time score tracking
  2. Local Persistence
    - Save game state to localStorage after each move
    - Restore game on page reload to continue playing
  3. Game Over Detection
    - Detect when no empty cells AND no adjacent matching tiles
    - Display "Game Over" overlay with final score and elapsed time
    - "New Game" button to restart
  4. Leaderboard
    - Fetch top 10 scores from API on page load
    - During gameplay, show current elapsed time
    - On game over, if score qualifies for top 10, prompt for name and submit to backend
    - Display leaderboard with name, score, and time

  UI/UX:
  - Clean, modern aesthetic with smooth tile animations
  - Display: current score, best score, timer
  - Responsive design (works on desktop and mobile)
  - Use Tailwind CSS for styling (recommended for Next.js)
  ```

  ### Flask + Vanilla JS prompt

  ```
Project: 2048 Game

  Tech Stack: Flask (Python), Vanilla JavaScript, MongoDB

  Description:
  Build a fully functional 2048 puzzle game with a persistent leaderboard.

  Backend (Flask + MongoDB):

  1. API Endpoints
    - GET /api/leaderboard - Get top 10 scores
    - POST /api/leaderboard - Submit new score (name, score, time)
    - Connect to MongoDB using Flask-PyMongo or similar
  2. Database Schema (MongoDB)
    - Collection: leaderboard
    - Fields: name (string), score (number), time (number - seconds), createdAt (date)
    - Keep only top 10 highest scores

  Frontend (Vanilla JS + HTML + CSS):

  1. Gameplay
    - 4x4 grid with arrow key controls (and swipe/touch for mobile)
    - Tile merging logic (2+2=4, 4+4=8, etc.)
    - Real-time score tracking
  2. Local Persistence
    - Save game state to localStorage after each move
    - Restore game on page reload to continue playing
  3. Game Over Detection
    - Detect when no empty cells AND no adjacent matching tiles
    - Display "Game Over" overlay with final score and elapsed time
    - "New Game" button to restart
  4. Leaderboard Integration
    - Fetch top 10 scores from API on page load
    - Show current elapsed time during gameplay
    - On game over, if score qualifies for top 10, prompt for name and submit to backend
    - Display leaderboard with name, score, and time

  UI/UX:
  - Clean, modern design with smooth tile animations
  - Display: current score, best score, timer
  - Responsive design (works on desktop and mobile)
  - Use vanilla CSS or a lightweight framework

  Project Structure:
  /project
    ├── app.py              # Flask backend
    ├── requirements.txt    # Python dependencies
    ├── static/
    │   ├── index.html      # Main HTML file
    │   ├── style.css       # Styles
    │   └── game.js         # Game logic
    └── templates/
        └── index.html      # Or serve from static
  ```