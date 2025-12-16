// components/VersusScreen.js
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { decodeHtml } from "../utils/decodeHtml";

const TOTAL_QUESTIONS = 10;

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function VersusScreen({ difficulty, category, onExit }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const url = `https://opentdb.com/api.php?amount=${TOTAL_QUESTIONS}&type=multiple&category=${category}&difficulty=${difficulty}`;
        const res = await fetch(url);
        const data = await res.json();

        const final = data.results.map((q) => {
          const question = decodeHtml(q.question);
          const correct = decodeHtml(q.correct_answer);
          const incorrect = q.incorrect_answers.map((a) => decodeHtml(a));
          return {
            question,
            correct,
            answers: shuffle([...incorrect, correct]),
          };
        });

        setQuestions(final);
        setError("");
      } catch (e) {
        console.error("Eroare API 1v1:", e);
        setError("Nu am putut încărca întrebările. Încearcă din nou.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [difficulty, category]);

  const activePlayer = currentIndex % 2 === 0 ? 1 : 2;

  function handleAnswer(answer) {
    if (answered || gameFinished) return;
    const q = questions[currentIndex];
    if (!q) return;

    setSelectedAnswer(answer);
    setAnswered(true);

    const isCorrect = answer === q.correct;
    const delta = isCorrect ? 100 : -50;

    if (activePlayer === 1) {
      setP1Score((prev) => prev + delta);
    } else {
      setP2Score((prev) => prev + delta);
    }

    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= questions.length) {
        setGameFinished(true);
      } else {
        setCurrentIndex(nextIndex);
        setSelectedAnswer(null);
        setAnswered(false);
      }
    }, 900);
  }

  function renderQuestionAndAnswers() {
    const q = questions[currentIndex];
    if (!q) return null;

    return (
      <>
        <Text style={styles.questionText}>{q.question}</Text>
        <View style={styles.answers}>
          {q.answers.map((ans, idx) => {
            const isCorrect = ans === q.correct;
            const isSelected = ans === selectedAnswer;

            let btnStyle = [styles.answerBtn];
            if (answered && isCorrect) {
              btnStyle.push(styles.answerBtnCorrect);
            } else if (answered && isSelected && !isCorrect) {
              btnStyle.push(styles.answerBtnWrong);
            }

            return (
              <TouchableOpacity
                key={idx}
                style={btnStyle}
                disabled={answered}
                onPress={() => handleAnswer(ans)}
              >
                <Text style={styles.answerText}>{ans}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.progressText}>
          Întrebarea {currentIndex + 1} / {questions.length} •{" "}
          {activePlayer === 1 ? "Player 1 la rând" : "Player 2 la rând"}
        </Text>
      </>
    );
  }

  function renderPlayerPanel(playerNumber, isActive) {
    const isPlayerOne = playerNumber === 1;
    const playerScore = isPlayerOne ? p1Score : p2Score;
    const otherScore = isPlayerOne ? p2Score : p1Score;

    const label = isPlayerOne ? "Player 1" : "Player 2";

    const isWinner = gameFinished && playerScore > otherScore;
    const isDraw = gameFinished && p1Score === p2Score;

    return (
      <View style={styles.playerPanel}>
        <Text style={styles.playerLabel}>{label}</Text>
        <Text style={styles.playerScore}>{playerScore}p</Text>

        {gameFinished ? (
          <>
            {isDraw ? (
              <Text style={styles.resultText}>Egalitate 🤝</Text>
            ) : isWinner ? (
              <Text style={styles.resultText}>Câștigător 🏆</Text>
            ) : (
              <Text style={styles.resultText}>Nice try 😅</Text>
            )}
          </>
        ) : isActive ? (
          <>
            <Text style={styles.turnText}>Rândul tău!</Text>
            {renderQuestionAndAnswers()}
          </>
        ) : (
          <>
            <Text style={styles.waitText}>Rândul adversarului...</Text>
          </>
        )}

        {!isActive && !gameFinished && (
          <View style={styles.inactiveOverlay}>
            <Text style={styles.inactiveText}>Rândul adversarului</Text>
          </View>
        )}
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#60a5fa" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.backButton} onPress={onExit}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Jumătatea de sus - Player 1 */}
      <View style={styles.half}>
        {renderPlayerPanel(1, activePlayer === 1)}
      </View>

      {/* Separator vizual */}
      <View style={styles.separator} />

      {/* Jumătatea de jos - Player 2 (rotită 180°) */}
      <View style={styles.half}>
        <View style={styles.rotated}>
          {renderPlayerPanel(2, activePlayer === 2)}
        </View>
      </View>

      {gameFinished && (
        <View style={styles.bottomBar}>
          <Text style={styles.summaryText}>
            P1: {p1Score}p • P2: {p2Score}p
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={onExit}>
            <Text style={styles.backButtonText}>Back to menu</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default VersusScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  half: {
    flex: 1,
    justifyContent: "center",
  },
  separator: {
    height: 8,
  },
  rotated: {
    transform: [{ rotate: "180deg" }],
  },
  playerPanel: {
    backgroundColor: "rgba(15, 23, 42, 0.96)",
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  playerLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e5e7eb",
    textAlign: "center",
  },
  playerScore: {
    fontSize: 16,
    fontWeight: "700",
    color: "#facc15",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f9fafb",
    textAlign: "center",
    marginBottom: 12,
  },
  answers: {
    gap: 8,
    marginBottom: 10,
  },
  answerBtn: {
    backgroundColor: "#111827",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  answerBtnCorrect: {
    backgroundColor: "#16a34a",
  },
  answerBtnWrong: {
    backgroundColor: "#ef4444",
  },
  answerText: {
    color: "#f9fafb",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  progressText: {
    color: "#9ca3af",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  turnText: {
    color: "#4ade80",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 8,
  },
  waitText: {
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
  resultText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 6,
  },
  inactiveOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  inactiveText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomBar: {
    position: "absolute",
    bottom: 14,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryText: {
    color: "#e5e7eb",
    fontSize: 13,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#3b82f6",
  },
  backButtonText: {
    color: "#f9fafb",
    fontWeight: "700",
    fontSize: 13,
  },
  errorText: {
    color: "#fecaca",
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
});
