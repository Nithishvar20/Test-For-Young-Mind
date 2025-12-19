
# Test for Young-Mind (Final v3)
Features:
- Tailwind + Framer Motion UI, colorful & animated, doodle background.
- 2x2 option matrix, central animated correct/incorrect prompt with quotes.
- WebAudio tones for correct/incorrect (no external audio files).
- Language toggle (EN/TA) affecting all UI text (pages, buttons, motivational messages) but NOT quiz question content (questions show both languages inline).
- Questions stored in src/assets/questions/grade{n}/{subject}_{level}.json. Place ~36 entries per file; app picks 10 random for each quiz.
Run locally:
1. npm install
2. npm run dev
3. Open http://localhost:5173/
