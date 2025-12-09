
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { decodeHtml } from "../utils/decodeHtml";

function QuizScreen({ playerName, difficulty, language, category, onGameEnd }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);

  const [fiftyUsed, setFiftyUsed] = useState(false);
  const [skipUsed, setSkipUsed] = useState(false);
  const [disabledAnswers, setDisabledAnswers] = useState([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const url = `https://opentdb.com/api.php?amount=10&type=multiple&category=${category}&difficulty=${difficulty}`;

        const res = await fetch(url);
        const data = await res.json();

       const final = data.results.map((q) => {
  const decodedQuestion = decodeHtml(q.question);
  const decodedCorrect = decodeHtml(q.correct_answer);
  const decodedIncorrect = q.incorrect_answers.map((a) => decodeHtml(a));

  return {
    question: decodedQuestion,
    answers: shuffle([...decodedIncorrect, decodedCorrect]),
    correct: decodedCorrect,
  };
});


        setQuestions(final);
      } catch (e) {
        console.error("Eroare API:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [difficulty, category]);

  function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  // animatie scor
  useEffect(() => {
    if (displayScore === score) return;

    const start = displayScore;
    const end = score;
    const duration = 400;
    const steps = 20;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep += 1;
      const progress = currentStep / steps;
      const value = Math.round(start + (end - start) * progress);
      setDisplayScore(value);

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score, displayScore]);

  const handleAnswer = useCallback(
    (answer) => {
      if (disabledAnswers.includes(answer)) return;

      setAnswered(true);
      setSelected(answer);

      const isCorrect = answer === questions[current]?.correct;

      setScore((prev) => {
        const updated = isCorrect ? prev + 100 : prev - 50;

        const isLast = current + 1 === questions.length;
        if (isLast) {
          // asteptam putin sa vada raspunsul, apoi aratam ecranul cu scorul
          setTimeout(() => {
            saveScore(updated);
            onGameEnd &&
              onGameEnd({
                score: updated,
                difficulty,
                category,
              });
          }, 1500);
        }

        return updated;
      });

      setTimeout(() => {
        const next = current + 1;
        if (next < questions.length) {
          setCurrent(next);
          setAnswered(false);
          setSelected(null);
          setTimeLeft(15);
          setDisabledAnswers([]);
        }
      }, 1500);
    },
    [questions, current, disabledAnswers, onGameEnd, difficulty, category]
  );

  // power-up 50/50
  function useFifty() {
    if (fiftyUsed) return;
    setFiftyUsed(true);

    const q = questions[current];
    const wrongAnswers = q.answers.filter((a) => a !== q.correct);

    const toDisable = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 2);
    setDisabledAnswers(toDisable);
  }

  // power-up Skip (+100p ca raspuns corect)
  function useSkip() {
    if (skipUsed) return;
    setSkipUsed(true);

    setAnswered(true);
    setSelected("SKIPPED");

    setScore((prev) => {
      const updated = prev + 100;

      const isLast = current + 1 === questions.length;
      if (isLast) {
        setTimeout(() => {
          saveScore(updated);
          onGameEnd &&
            onGameEnd({
              score: updated,
              difficulty,
              category,
            });
        }, 1500);
      }

      return updated;
    });

    setTimeout(() => {
      const next = current + 1;
      if (next < questions.length) {
        setCurrent(next);
        setAnswered(false);
        setSelected(null);
        setTimeLeft(15);
        setDisabledAnswers([]);
      }
    }, 1200);
  }

  // timer
  useEffect(() => {
    if (loading || answered) return;
    if (timeLeft === 0) {
      handleAnswer(null);
      return;
    }
    const t = setTimeout(() => setTimeLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, answered, loading, handleAnswer]);

  // salvare scor in localStorage (doar pe web - pe telefon ignoram ca sa nu crape)
  function saveScore(finalScore) {
    try {
      if (typeof localStorage === "undefined") {
        // suntem pe mobil / RN, nu pe web => nu salvam leaderboard
        return;
      }

      const mapCat = {
        9: "General Knowledge",
        11: "Movies",
        12: "Music",
        17: "Science",
        21: "Sports",
        22: "Geography",
        23: "History",
      };

      const scores =
        JSON.parse(localStorage.getItem("quizLeaderboard")) || [];

      const idx = scores.findIndex(
        (p) => p.name.toLowerCase() === playerName.toLowerCase()
      );

      const entry = {
        name: playerName,
        score: finalScore,
        difficulty,
        language: "en",
        category: mapCat[Number(category)] || "Other",
      };

      if (idx !== -1) {
        if (finalScore > scores[idx].score)
          scores[idx] = { ...scores[idx], ...entry };
        else
          scores[idx] = {
            ...scores[idx],
            difficulty,
            category: entry.category,
          };
      } else {
        scores.push(entry);
      }

      localStorage.setItem("quizLeaderboard", JSON.stringify(scores));
      localStorage.setItem("lastPlayer", playerName);
    } catch (e) {
      console.error("Eroare salvare scor:", e);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#60a5fa" />
      </View>
    );
  }

  const q = questions[current] || {};

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Text style={styles.playerName}>Player: {playerName}</Text>

        <View style={styles.scoreTimer}>
          <Text style={styles.timerText}>Time: {timeLeft}s</Text>
          <Text style={styles.scoreText}>Score: {displayScore}</Text>
        </View>

        <View style={styles.timeBar}>
          <View
            style={[
              styles.timeFill,
              {
                width: `${(timeLeft / 15) * 100}%`,
                backgroundColor: timeLeft <= 5 ? "#f97373" : "#60a5fa",
              },
            ]}
          />
        </View>

        <Text style={styles.questionText}>{q.question}</Text>

        <View style={styles.powerups}>
          <TouchableOpacity
            style={[styles.powerBtn, fiftyUsed && styles.powerBtnUsed]}
            onPress={useFifty}
            disabled={fiftyUsed}
          >
            <Text style={styles.powerBtnText}>50/50</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.powerBtn, skipUsed && styles.powerBtnUsed]}
            onPress={useSkip}
            disabled={skipUsed}
          >
            <Text style={styles.powerBtnText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.answers}>
          {q.answers?.map((a, i) => {
            const isCorrect = a === q.correct;
            const isSelected = a === selected;
            const isDisabled = disabledAnswers.includes(a);

            let btnStyle = [styles.answerBtn];
            if (isDisabled) btnStyle.push(styles.answerBtnDisabled);
            if (answered && isCorrect) btnStyle.push(styles.answerBtnCorrect);
            else if (answered && isSelected && !isCorrect)
              btnStyle.push(styles.answerBtnWrong);

            return (
              <TouchableOpacity
                key={i}
                style={btnStyle}
                disabled={isDisabled}
                onPress={() => !answered && handleAnswer(a)}
              >
                <Text style={styles.answerText}>{a}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.progressText}>
          Question {current + 1} / {questions.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    backgroundColor: "rgba(15, 23, 42, 0.93)",
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 10,
  },
  playerName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  scoreTimer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  timerText: {
    color: "#cbd5f5",
    fontSize: 14,
  },
  scoreText: {
    color: "#cbd5f5",
    fontSize: 14,
  },
  timeBar: {
    height: 6,
    backgroundColor: "#1f2937",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 16,
  },
  timeFill: {
    height: "100%",
    borderRadius: 999,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 18,
  },
  powerups: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  powerBtn: {
    flex: 1,
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    borderRadius: 999,
  },
  powerBtnUsed: {
    backgroundColor: "#374151",
  },
  powerBtnText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  answers: {
    gap: 10,
    marginBottom: 16,
  },
  answerBtn: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    borderRadius: 999,
    paddingHorizontal: 12,
  },
  answerBtnDisabled: {
    opacity: 0.4,
  },
  answerBtnCorrect: {
    backgroundColor: "#16a34a",
  },
  answerBtnWrong: {
    backgroundColor: "#ef4444",
  },
  answerText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  progressText: {
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
});

export default QuizScreen;
