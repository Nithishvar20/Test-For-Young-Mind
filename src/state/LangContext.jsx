// src/state/LangContext.jsx
import React, { createContext, useContext, useState } from "react";

const LangContext = createContext();

const strings = {
  EN: {
    // main navigation
    leaderboard: "Leaderboard",
    logout: "Logout",
    games: "Games",
    restart: "Restart",

    // core labels
    start: "Start Assessment",
    chooseDifficulty: "Choose Difficulty",
    selectGrade: "Select Grade",
    selectSubject: "Select Subject",
    home: "Home",
    result: "Result",
    youScored: "You scored",
    perfect: "Perfect! You're a star!",
    excellent: "Excellent work! You are mastering this.",
    good: "Good job! Keep practicing.",
    playWordPuzzle: "Word Search",
    english: "English",
    tamil: "Tamil",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    back: "Back",
    next: "Next",
    scoreLabel: "Score",
    streakLabel: "Streak",
    timeLabel: "Time left",
    selectLevel: "Select Level",

    // subjects
    subjects: {
      english: "English",
      tamil: "Tamil",
      maths: "Maths",
      science: "Science",
      social: "Social Science",
      physics: "Physics",
      chemistry: "Chemistry",
      biology: "Biology",
      computer_science: "Computer Science",
      programming: "Programming",
      commerce: "Commerce",
      economics: "Economics",
      accountancy: "Accountancy",
      applied_maths: "Applied Maths",
      business_maths: "Business Maths",
    },

    // difficulty levels
    levels: {
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
    },

    // ✅ level descriptions
    levelDescriptions: {
      easy:
        "Engage with 10 easy-level questions, each with a 20-second time limit. These questions are designed to assess your foundational knowledge and boost your confidence. Correct answers earn points, and you'll receive feedback after completing the quiz. Stay relaxed and think clearly to maximize your score. Regular practice will help you become more comfortable with the question format. Are you ready to showcase your skills? Let’s get started!.",
      medium:
        "Test your knowledge with 10 medium-level questions, each with a 30-second time limit. These questions challenge your understanding and enhance critical thinking. Correct answers earn points, while feedback is provided after completion. Prepare to think quickly and manage your time effectively!. Stay calm and focused to maximize your performance. Practice regularly to familiarize yourself with question types. Ready to take on the challenge? Let’s see how you score!.",
      hard:
        "Challenge yourself with 10 hard-level questions, each with a 45-second time limit. These questions are crafted to test your advanced knowledge and critical thinking skills. Correct answers will earn you points, and you'll receive detailed feedback upon completion. Stay focused and strategize your answers to maximize your score. Deep understanding and quick reasoning are essential for success. Are you ready to push your limits? Let’s dive in!.",
    },

    // level intros (title + subtitle)
    levelIntro: {
      beginnerTitle: "Beginner — Grade 6 - 8",
      beginnerSubtitle:
        "Explore beginner-level questions tailored for grades 6 to 8. These questions reinforce foundational concepts and build student confidence. Each question encourages critical thinking and problem-solving abilities essential for academic growth. Are you ready to take on the challenge? Let’s get started!",
      intermediateTitle: "Intermediate — Grade 9 & 10",
      intermediateSubtitle:
        "Challenge yourself with intermediate-level questions designed for students in grades 9 and 10. These questions delve deeper into core concepts and encourage critical thinking skills. Are you ready to test your knowledge? Let’s dive in!",
      advancedTitle: "Advanced — Grade 11 & 12",
      advancedSubtitle:
        "Take on the challenge with advanced-level questions crafted for students in grades 11 and 12. These questions push the boundaries of knowledge and require higher-order thinking skills. Are you prepared to push your limits? Let’s begin!",
    },

    // motivational grade cards
    gradeCard: {
      grade6: {
        title: "Grade 6",
        bullets: [
          "🌱 Small steps daily grow into big success.",
          "📘 Curiosity today builds wisdom for tomorrow.",
          "🌞 Consistency each day creates lasting strength.",
          "✌🏻 Learning every day unlocks hidden potential.",
        ],
        cta: "Go",
      },
      grade7: {
        title: "Grade 7",
        bullets: [
          "💪 Practice daily habits, progress will follow soon.",
          "✨ Celebrate little wins, they fuel big goals.",
          "🚴 Moving forward slowly still builds strong growth.",
          "📖 Reading every day strengthens focus and skills.",
        ],
        cta: "Go",
      },
      grade8: {
        title: "Grade 8",
        bullets: [
          "🚀 Challenging yourself daily grows inner strength.",
          "🧠 Clear thinking daily makes smarter decisions.",
          "🌟 Effort today shapes the future you want.",
          "🔥 Stay curious daily to unlock hidden power.",
        ],
        cta: "Go",
      },
      grade9: {
        title: "Grade 9",
        bullets: [
          "🎯 Set clear goals, progress comes stepwise daily.",
          "📈 Consistent effort daily beats sudden intensity.",
          "🔑 Hard work daily opens doors to success.",
          "⚡ Daily discipline fuels long-term powerful growth.",
        ],
        cta: "Go",
      },
      grade10: {
        title: "Grade 10",
        bullets: [
          "🏅 Aim high daily, success will surely follow.",
          "🔍 Practice curiosity daily to master new skills.",
          "💡 One idea daily can inspire lasting change.",
          "📚 Daily reading builds knowledge and inner strength.",
        ],
        cta: "Go",
      },
      grade11: {
        title: "Grade 11",
        bullets: [
          "🌟 Focus daily and build a strong foundation.",
          "🧭 Set goals daily, move forward with purpose.",
          "📚 Knowledge daily becomes wisdom for tomorrow.",
          "⚡ Daily effort powers tomorrow’s shining success.",
        ],
        cta: "Go",
      },
      grade12: {
        title: "Grade 12",
        bullets: [
          "🏆 Push harder daily, success is within reach.",
          "🚦 Plan wisely daily, then act with courage.",
          "🎓 Every challenge daily brings you closer ahead.",
          "🌍 Daily focus today builds a brighter tomorrow.",
        ],
        cta: "Go",
      },
    },

    // special messages
    surpriseGame: "🎉 Score 8 or more unlocks a Surprise Game! ✨",
    score: "Score",
    streak: "Streak",

    // ✅ helpers
    startLevelCTA: (label) => `Start ${label}`,
    gradeLabel: (g) => `Grade ${g}`,

    // choose mode page
    chooseMode: {
      title: "Choose Mode",
      quizModeTitle: "Quiz Mode",
      quizModeSubtitle: "Quizzes — Grades & Topics",
      quizModeDesc:
        "Challenge yourself with topic-based quizzes designed to strengthen your understanding and critical thinking.",
      labGamesTitle: "Lab Games",
      labGamesSubtitle: "Interactive Labs & Games",
      labGamesDesc:
        "Explore interactive lab simulations and mini-games that make science fun, creative and hands-on.",
      start: "Start Assessment",
    },

    // Games catalogue (added)
    games: {
      tic_tac_toe: {
        title: "Tic Tac Toe",
        subtitle: "Fun Game",
        description:
          "Tic Tac Toe is a simple two-player game played on a 3x3 grid - be the first to align three symbols in a row horizontally, vertically or diagonally",
        btn: "Play", // ✅ added
      },
      quiz_mode: {
        title: "Quiz Mode",
        subtitle: "Quizzes — Grades & Topics",
        description:
          "Challenge yourself with topic-based quizzes designed to strengthen your understanding and critical thinking.",
      },
      lab_games: {
        title: "Lab Games",
        subtitle: "Interactive Labs & Games",
        description:
          "Explore interactive lab simulations and mini-games that make science fun, creative and hands-on.",
        btn: "Open",
      },
      riddles_game: {
        title: "Riddles Game",
        subtitle: "Brain Teasers",
        description:
          "Solve fun riddles and test your thinking skills. Each riddle has hints and multiple chances — challenge yourself!",
        btn: "Open", // ✅ added
      },
      visual_memory: {
        title: "Visual Memory",
        subtitle: "Memory Game",
        description:
          "Visual Memory challenges you to recall and match visual patterns or sequences - sharpening your attention and memory",
        btn: "Play", // ✅ added
      },
      puzzlequest: {
        title: "PuzzleQuest",
        subtitle: "Word & Logic Puzzles",
        description:
          "Solve word clues, logic riddles and mini-puzzles. Each round gives a clue sentence describing the target word.",
      },
      sudoku: {
        title: "Sudoku",
        subtitle: "Logic Puzzle",
        description:
          "Fill the 9×9 grid so that each row, column, and 3×3 box contains digits 1 through 9, without repeating any number.",
      },
      arithmetica: {
        title: "ArithmeticA",
        subtitle: "Math Practice",
        description:
          "Arithmetica strengthens arithmetic skills through quick problems in addition, subtraction, multiplication and division.",
      },
      physics_lab: {
        title: "Physics Lab",
        subtitle: "Interactive Experiments",
        description:
          "Pendulum Pro, Circuit Lab, Spring–Mass Oscillator simulations with measurements and energy graphs.",
      },
      chemistry_lab: {
        title: "Chemistry Lab",
        subtitle: "Virtual Experiments",
        description:
          "Explore titrations, puzzles and virtual reactions in a safe virtual chemistry lab.",
      },
      biology_lab: {
        title: "Biology Lab",
        subtitle: "Cell & Life Sciences",
        description:
          "Simulations of ecosystems, genetics, and puzzles in an interactive environment.",
      },
      pendulum_pro: {
        title: "Pendulum Pro",
        subtitle: "Dynamics & Energy",
        description:
          "Nonlinear pendulum with damping, energy plots, RK4 integration and phase-space.",
      },
      circuit_lab: {
        title: "Circuit Lab",
        subtitle: "Electronics",
        description:
          "Build circuits with resistors, batteries, LEDs, switches & wires. LEDs glow when current flows.",
      },
      spring_mass: {
        title: "Spring–Mass Oscillator",
        subtitle: "Hooke's Law",
        description:
          "Spring–mass with damping, drag-to-set initial displacement, energy decomposition and phase-space.",
      },
      titration_lab: {
        title: "Titration Lab",
        subtitle: "Acid–Base",
        description: "Perform titrations and plot pH curves.",
      },
      periodic_table_puzzle: {
        title: "Periodic Table Puzzle",
        subtitle: "Elements & Groups",
        description:
          "Solve interactive puzzles based on the periodic table.",
      },
      mixing_lab: {
        title: "Mixing Lab",
        subtitle: "Reactions",
        description: "Combine solutions in a beaker and observe the reactions.",
      },
      food_chain: {
        title: "Food Chain Builder",
        subtitle: "Ecology",
        description: "Arrange organisms into correct food chains and webs.",
      },
      bio_scramble: {
        title: "Bio Scramble",
        subtitle: "Fun Puzzle",
        description: "Unscramble biology terms and concepts to learn interactively.",
      },
      photosynthesis_puzzle: {
        title: "Photosynthesis Puzzle",
        subtitle: "Plant Biology",
        description: "Balance equations and test knowledge with interactive puzzles.",
      },
    },
  },

  TA: {
    leaderboard: "லீடர்போர்டு",
    logout: "வெளியேறு",
    games: "விளையாட்டுகள்",
    restart: "மீண்டும்",

    start: "மதிப்பீட்டைத் தொடங்கு",
    chooseDifficulty: "சிரமத்தைத் தேர்வுசெய்க",
    selectGrade: "தரத்தைத் தேர்ந்தெடுக்கவும்",
    selectSubject: "பாடத்தைத் தேர்வுசெய்க",
    home: "முகப்பு",
    result: "முடிவு",
    youScored: "நீங்கள் மதிப்பெண் பெற்றீர்கள்",
    perfect: "சரியானது! நீங்கள் ஒரு நட்சத்திரம்!",
    excellent: "சிறந்த வேலை! நீங்கள் इसमें தேர்ச்சி பெறுகிறீர்கள்.",
    good: "நல்ல வேலை! தொடர்ந்து பயிற்சி செய்யுங்கள்.",
    playWordPuzzle: "சொல் தேடல்",
    english: "ஆங்கிலம்",
    tamil: "தமிழ்",
    beginner: "தொடக்கநிலை",
    intermediate: "இடைநிலை",
    advanced: "மேம்பட்டது",
    back: "மீண்டும்",
    next: "அடுத்து",
    scoreLabel: "ஸ்கோர்",
    streakLabel: "ஸ்ட்ரீக்",
    timeLabel: "இடது நேரம்",
    selectLevel: "நிலையைத் தேர்வுசெய்க",

    subjects: {
      english: "ஆங்கிலம்",
      tamil: "தமிழ்",
      maths: "கணிதம்",
      science: "அறிவியல்",
      social: "சமூக அறிவியல்",
      physics: "இயற்பியல்",
      chemistry: "வேதியியல்",
      biology: "உயிரியல்",
      computer_science: "கணினி அறிவியல்",
      programming: "நிரலாக்கம்",
      commerce: "வணிகம்",
      economics: "பொருளாதாரம்",
      accountancy: "கணக்கியல்",
      applied_maths: "பயன்பாட்டு கணிதம்",
      business_maths: "வணிக கணிதம்",
    },

    levels: {
      easy: "எளிதானது",
      medium: "நடுத்தரம்",
      hard: "கடினமானது",
    },

    // ✅ level descriptions
    levelDescriptions: {
      easy:
        "10 எளிய நிலை கேள்விகளுடன் ஈடுபடுங்கள், ஒவ்வொன்றும் 20-வினாடி நேர வரம்புடன். சரியான பதில்கள் புள்ளிகளைப் பெறுகின்றன. நிதானமாக இருங்கள் மற்றும் உங்கள் மதிப்பெண்ணை அதிகரிக்க தெளிவாக சிந்தியுங்கள். வழக்கமான பயி உங்கள் திறமைகளை வெளிப்படுத்த நீங்கள் தயாரா? தொடங்குவோம்!.",
      medium:
        "30-வினாடி நேர வரம்புடன் 10 நடுத்தர அளவிலான கேள்விகளுடன் உங்கள் அறிவைச் சோதிக்கவும்.சரியான பதில்கள் புள்ளிகளைப் பெறுகின்றன, அதே நேரத்தில் முடிந்த பிறகு கருத்து வழங்கப்படுகிறது. உங்கள் செயல்திறனை அதிகரிக்க அமைதியாகவும் கவனம் செலுத்தவும். கேள்வி வகைகளுடன் உங்களைப் பழக்கப்படுத்திக்கொள்ள தொடர்ந்து பயிற்சி செய்யுங்கள். சவாலை ஏற்கத் தயாரா? நீங்கள் எப்படி மதிப்பெண் பெறுகிறீர்கள் என்று பார்ப்போம்!.",
      hard:
        "45-வினாடி நேர வரம்புடன் 10 கடினமான நிலை கேள்விகளுடன் உங்களை சவால் விடுங்கள். இந்த கேள்விகள் உங்கள் மேம்பட்ட அறிவையும் விமர்சன சிந்தனைத் திறனையும் சோதிக்க வடிவமைக்கப்பட்டுள்ளன. சரியான பதில்கள் உங்களுக்குப் புள்ளிகளைப் பெற்றுத் தரும், மேலும் நீங்கள் முடித்தவுடன் விரிவான கருத்துகளைப் பெறுவீர்கள்.  வெற்றிக்கு ஆழமான புரிதலும் விரைவான பகுத்தறிவும் அவசியம். உங்கள் வரம்புகளைத் தாண்ட நீங்கள் தயாரா? இதில் முழுமையாக ஈடுபடுவோம்!.",
    },

    levelIntro: {
      beginnerTitle: "தொடக்கநிலை — 6 - 8 ஆம் வகுப்புகள்",
      beginnerSubtitle:
        "6 முதல் 8 ஆம் வகுப்பு வரை வடிவமைக்கப்பட்ட தொடக்க நிலை கேள்விகளை ஆராயுங்கள். இந்தக் கேள்விகள் அடிப்படைக் கருத்துக்களை வலுப்படுத்தி மாணவர்களின் நம்பிக்கை மற்றும் திறன்களை வளர்க்கின்றன. சவாலை ஏற்க நீங்கள் தயாரா? இணைக்கலாம்!",
      intermediateTitle: "இடைநிலை — 9 & 10 ஆக் வகுப்புகள்",
      intermediateSubtitle:
        "9 மற்றும் 10 ஆம் வகுப்புகளில் உள்ள மாணவர்களுக்காக வடிவமைக்கப்பட்ட இடைநிலை நிலை கேள்விகளுடன் உங்களை சவால் விடுங்கள். உங்கள் அறிவைச் சோதிக்க நீங்கள் தயாரா? உள்ளே நுழைவோம்!",
      advancedTitle: "மேம்பட்டது — 11 & 12 ஆக் வகுப்புகள்",
      advancedSubtitle:
        "11 மற்றும் 12 ஆம் வகுப்புகளில் உள்ள மாணவர்களுக்காக வடிவமைக்கப்பட்ட மேம்பட்ட நிலை கேள்விகளுடன் சவாலை ஏற்றுக்கொள்ளுங்கள். உங்கள் வரம்புகளைத் தள்ள நீங்கள் தயாரா? தொடங்குவோம்!",
    },

    gradeCard: {
      grade6: {
        title: "தரம் 6",
        bullets: [
          "🌱 தினமும் சிறிய அடிகள் பெரிய வெற்றியாக வளரும்.",
          "📘 இன்றைய ஆர்வம் நாளைக்கான ஞானத்தை உருவாக்குகிறது.",
          "🌞 ஒவ்வொரு நாளும் நிலைத்தன்மை நீடித்த வலிமையை உருவாக்குகிறது.",
        ],
        cta: "செல்லுங்கள்",
      },
      grade7: {
        title: "தரம் 7",
        bullets: [
          "💪 தினசரி பழக்கங்களைப் பயிற்சி செய்யுங்கள், முன்னேற்றம் விரைவில் வரும்.",
          "✨ சிறிய வெற்றிகளைக் கொண்டாடுங்கள், அவை பெரிய இலக்குகளைத் தூண்டுகின்றன.",
          "🚴 மெதுவாக முன்னேறுவது இன்னும் வலுவான வளர்ச்சியை உருவாக்குகிறது.",
        ],
        cta: "செல்லுங்கள்",
      },
      grade8: {
        title: "தரம் 8",
        bullets: [
          "🚀 தினமும் உங்களை நீங்களே சவால் செய்வது உள் வலிமையை வளர்க்கிறது.",
          "🧠 தினமும் தெளிவான சிந்தனை சிறந்த முடிவுகளை எடுக்கிறது.",
          "🌟 இன்றைய முயற்சி நீங்கள் விரும்பும் எதிர்காலத்தை வடிவமைக்கிறது.",
        ],
        cta: "செல்",
      },
      grade9: {
        title: "தரம் 9",
        bullets: [
          "🎯 தெளிவான இலக்குகளை அமைக்கவும், முன்னேற்றம் தினமும் படிப்படையாக வரும்.",
          "📈 தினசரி தொடர்ச்சியான முயற்சி திடீர் தீவிரத்தை வெல்லும்.",
          "🔑 தினசரி கடின உழைப்பு வெற்றிக்கான கதவுகளைத் திறக்கிறது.",
        ],
        cta: "செல்ல",
      },
      grade10: {
        title: "10 ஆம் வகுப்பு",
        bullets: [
          "🏅 தின마다 உயர்ந்த இலக்கை அடையுங்கள், வெற்றி நிச்சயமாக வரும்.",
          "🔍 புதிய திறன்களைப் பெற தினமும் ஆர்வத்தைப் பயிற்சி செய்யுங்கள்.",
          "💡 தினசரி ஒரு யோசனை நீடித்த மாற்றத்தைத் தூண்டும்.",
        ],
        cta: "செல்ல",
      },
      grade11: {
        title: "தரம் 11",
        bullets: [
          "🌟 தினமும் கவனம் செலுத்தி வலுவான அடித்தளத்தை உருவாக்குங்கள்.",
          "🧭 தினமும் இலக்குகளை நிர்ணயிக்கவும், நோக்கத்துடன் முன்னேறவும்.",
          "📚 தினசரி அறிவு நாளைக்கான ஞானமாக மாறும்.",
        ],
        cta: "செல்லுங்கள்",
      },
      grade12: {
        title: "தரம் 12",
        bullets: [
          "🏆 தினமும் கடினமாக உழையுங்கள், வெற்றி அடையக்கூடியது.",
          "🚦 தினமும் புத்திசாலித்தனமாகத் திட்டமிடுங்கள், பின்னர் தைரியத்துடன் செயல்படுங்கள்.",
          "🎓 தினமும் ஒவ்வொரு சவாலும் உங்களை முன்னோக்கி கொண்டு வருகிறது.",
        ],
        cta: "செல்லுங்கள்",
      },
    },

    surpriseGame:
      "🎉 8 அல்லது அதற்கு மேற்பட்ட மதிப்பெண்கள் ஒரு ஆச்சரிய விளையாட்டைத் திறக்கும்! ✨",
    score: "மதிப்பெண்",
    streak: "ஸ்ட்ரீக்",

    // ✅ helpers
    startLevelCTA: (label) => `${label} தொடங்கு`,
    gradeLabel: (g) => `தரம் ${g}`,

    // choose mode page (Tamil)
    chooseMode: {
      title: "முறையைத் தேர்வுசெய்க",
      quizModeTitle: "வினாடி வினா முறை",
      quizModeSubtitle: "வகுப்புகள் — தலைப்புகள்",
      quizModeDesc:
        "தலைப்புகளின் அடிப்படையில் வடிவமைக்கப்பட்ட வினாடி வினாக்களுடன் உங்களை சவால் விடுங்கள். இது உங்கள் புரிதலையும் விமர்சன சிந்தனையையும் வலுப்படுத்தும்.",
      labGamesTitle: "ஆய்வக விளையாட்டுகள்",
      labGamesSubtitle: "ஊடாடும் ஆய்வகங்கள் & விளையாட்டுகள்",
      labGamesDesc:
        "அறிவியலை வேடிக்கையாகவும், படைப்பாற்றலுடனும் மாற்றும் ஊடாடும் ஆய்வகங்கள் மற்றும் சிறிய விளையாட்டுகளை ஆராயுங்கள்.",
      start: "மதிப்பீட்டைத் தொடங்கு",
    },

    // Games catalogue (Tamil)
    games: {
      tic_tac_toe: {
        title: "டிக் டாக் டோ",
        subtitle: "வேடிக்கையான விளையாட்டு",
        description:
          "டிக் டாக் டோ என்பது 3x3 கட்டத்தில் விளையாடப்படும் ஒரு எளிய இரண்டு வீரர் விளையாட்டு - கிடைமட்டமாக, செங்குத்தாக அல்லது குறுக்காக ஒரு வரிசையில் மூன்று சின்னங்களை முதலில் சீரமைக்கவும்.",
        btn: "விளையாடு", // ✅ Tamil
      },
      lab_games: {
        title: "ஆய்வக விளையாட்டுகள்",
        subtitle: "ஊடாடும் ஆய்வகங்கள் & விளையாட்டுகள்",
        description:
          "அறிவியலை வேடிக்கையாகவும், படைப்பாற்றலுடனும், நடைமுறை ரீதியாகவும் மாற்றும் ஊடாடும் ஆய்வக உருவகப்படுத்துதல்கள் மற்றும் மினி-கேம்களை ஆராயுங்கள்.",
        instruction:
          "ஆய்வக விளையாட்டுகள்\nஊடாடும் சோதனைகளை ஆராய ஒரு ஆய்வகத்தைத் தேர்வுசெய்யவும்.",
        btn: "திற",
      },
      riddles_game: {
        title: "புதிர் விளையாட்டு",
        subtitle: "மூளை டீசர்கள்",
        description:
          "வேடிக்கையான புதிர்களைத் தீர்த்து உங்கள் சிந்தனைத் திறனை சோதிக்கவும். ஒவ்வொரு புதிரிலும் குறிப்புகள் மற்றும் பல வாய்ப்புகள் உள்ளன - உங்களை நீங்களே சவால் விடுங்கள்!",
        btn: "திற", // ✅ Tamil for "Open"
      },
      visual_memory: {
        title: "காட்சி நினைவகம்",
        subtitle: "நினைவக விளையாட்டு",
        description:
          "காட்சி நினைவகம் காட்சி வடிவங்கள் அல்லது வரிசைகளை நினைவுபடுத்தி பொருத்த உங்களை சவால் விடுகிறது - உங்கள் கவனத்தையும் நினைவாற்றலையும் கூர்மைப்படுத்துகிறது",
        btn: "விளையாடு",
      },
      puzzlequest: {
        title: "புதிர் தேடல்",
        subtitle: "சொல் & தர்க்க புதிர்கள்",
        description:
          "சொல் குறிப்புகள், தர்க்க புதிர்கள் மற்றும் மினி-புதிர்களைத் தீர்க்கவும். ஒவ்வொரு சுற்றிலும் இலக்கு வார்த்தையை விவரிக்கும் ஒரு குறிப்பு வாக்கியம் வழங்கப்படுகிறது.",
      },
      sudoku: {
        title: "சுடோகு",
        subtitle: "தர்க்க புதிர்",
        description:
          "ஒவ்வொரு வரிசை, நெடுவரிசை மற்றும் 3×3 பெட்டியிலும் 1 முதல் 9 வரையிலான இலக்கங்கள் இருக்கும் வகையில், எந்த எண்ணையும் திரும்பத் திரும்ப எழுதாமல், 9×9 கட்டத்தை நிரப்பவும்.",
      },
      arithmetica: {
        title: "எண்கணிதம்",
        subtitle: "கணிதப் பயிற்சி",
        description:
          "கூட்டல், கழித்தல், பெருக்கல் மற்றும் வகுத்தல் போன்ற விரைவான கணக்குகள் மூலம் எண்கணிதத் திறன்களை வலுப்படுத்துகிறது.",
      },
      physics_lab: {
        title: "இயற்பியல் ஆய்வகம்",
        subtitle: "ஊடாடும் பரிசோதனைகள்",
        description:
          "ஊடாடும் சோதனைகள், சுற்று ஆய்வகம், அளவீடுகள் மற்றும் ஆற்றல் வரைபடங்களுடன் "
      },
      chemistry_lab: {
        title: "வேதியியல் ஆய்வகம்",
        subtitle: "மெய்நிகர் பரிசோதனைகள்",
        description:
          "பாதுகாப்பான மெய்நிகர் வேதியியல் ஆய்வகத்தில் டைட்ரேஷன்கள், புதிர்கள் மற்றும் மெய்நிகர் எதிர்வினைகளை ஆராயுங்கள்.",
      },
      biology_lab: {
        title: "உயிரியல் ஆய்வகம்",
        subtitle: "செல் & வாழ்க்கை அறிவியல்",
        description:
          "ஊடாடும் சூழலில் சுற்றுச்சூழல் அமைப்புகள், மரபியல் மற்றும் புதிர்களின் உருவகப்படுத்துதல்கள்.",
      },
      pendulum_pro: {
        title: "பெண்டுலம் புரோ",
        subtitle: "டைனமிக்ஸ் & எனர்ஜி",
        description:
          "டம்பிங், எனர்ஜி ப்ளாட், ஆர்கே4 ஒருங்கிணைப்பு மற்றும் கட்ட-வெளியுடன் கூடிய நான்லினியர் ஊசல்.",
      },
      circuit_lab: {
        title: "சுற்று ஆய்வகம்",
        subtitle: "மின்னணுவியல்",
        description:
          "மின்னணு மின்தடையங்கள், பேட்டரிகள், LEDகள், சுவிட்சுகள் மற்றும் கம்பிகள் மூலம் சுற்றுகளை உருவாக்குங்கள். மின்னோட்டம் பாயும் போது LEDகள் ஒளிரும்.",
      },
      spring_mass: {
        title: "வசந்த-நிறை அலையியற்றி",
        subtitle: "ஹூக்கின் விதি",
        description:
          "தணிப்பு, இழுவை-க்கு-அமைவு ஆரம்ப இடப்பெயர்ச்சி, ஆற்றல் சிதைவு மற்றும் கட்ட-வெளியுடன் கூடிய வசந்த-நிறை.",
      },
      titration_lab: {
        title: "டைட்ரேஷன் ஆய்வகம்",
        subtitle: "அமில-காரம்",
        description: "டைட்ரேஷன்களைச் செய்து pH வளைவுகளைக் குறிக்கவும்.",
      },
      periodic_table_puzzle: {
        title: "தனிம அட்டவணை புதிர்",
        subtitle: "கூறுகள் & குழுக்கள்",
        description: "கால அட்டவணையின் அடிப்படையில் ஊடாடும் புதிர்களைத் தீர்க்கவும்.",
      },
      mixing_lab: {
        title: "கலவை ஆய்வகம்",
        subtitle: "வினைகள்",
        description: "ஒரு பீக்கரில் கரைசல்களை இணைத்து எதிர்வினைகளை கவனிக்கவும்.",
      },
      food_chain: {
        title: "உணவுச் சங்கிலியை உருவாக்குபவர்",
        subtitle: "சூழலியல்",
        description: "உயிரினங்களை சரியான உணவுச் சங்கிலிகள் மற்றும் வலைகளாக ஒழுங்குபடுத்துங்கள்.",
      },
      bio_scramble: {
        title: "பயோ ஸ்க்ராம்பிள்",
        subtitle: "வேடிக்கையான புதிர்",
        description: "உயிரியல் சொற்கள் மற்றும் கருத்துகளை ஊடாடும் வகையில் கற்றுக்கொள்ளுங்கள்.",
      },
      photosynthesis_puzzle: {
        title: "ஒளிச்சேர்க்கை புதிர்",
        subtitle: "தாவர உயிரியல்",
        description: "ஊடாடும் புதிர்களுடன் சமநிலை சமன்பாடுகள் மற்றும் அறிவைச் சோதிக்கவும்.",
      },
    },
  },
};

export function LangProvider({ children }) {
  const [lang, setLang] = useState("EN");
  function toggle() {
    setLang((l) => (l === "EN" ? "TA" : "EN"));
  }
  return (
    <LangContext.Provider value={{ lang, toggle, t: strings[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}