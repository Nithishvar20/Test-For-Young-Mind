## 🧠 Young-Mind – Interactive Quiz Platform (Final v3)

**Young-Mind** is a colorful, animated, and student-friendly quiz application designed to make learning engaging through motion, sound, and bilingual support.

## ✨ Key Features

* 🎨 **Modern UI** built with **Tailwind CSS** and **Framer Motion**

  * Colorful design with animated transitions
  * Doodle-style background for a playful learning experience

* 🧩 **2×2 Answer Matrix**

  * Clear and intuitive option layout
  * Central animated prompt showing **Correct / Incorrect** feedback
  * Motivational quotes displayed after each answer

* 🔊 **Web Audio Feedback**

  * Built-in audio tones for correct and incorrect answers
  * No external audio files required

* 🌐 **Bilingual Interface (EN / TA)**

  * Full language toggle for:

    * Pages
    * Buttons
    * Instructions
    * Motivational messages
  * Quiz questions are shown in **both English and Tamil together** (not affected by toggle)

* 📚 **Structured Question Management**

  * Questions stored as JSON files:

  * Each file contains approximately **36 questions**
  * The app **randomly selects 10 questions** per quiz session

## 🛠️ Tech Stack

* ⚛️ React
* 🎨 Tailwind CSS
* 🎞 Framer Motion
* 🔊 Web Audio API
* ⚡ Vite

## 📂 Project Structure (Simplified)

```
src/
 ├─ assets/
 │   └─ questions/
 │       └─ grade{n}/
 │           └─ subject_level.json
 ├─ components/
 ├─ pages/
 ├─ hooks/
 └─ utils/
```

## 🎯 Project Goals

* Encourage **active learning** through interaction
* Provide a **bilingual-friendly experience** for young learners
* Make assessments **fun, motivating, and visually engaging**


