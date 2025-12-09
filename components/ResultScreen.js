import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CATEGORY_LABELS = {
  9: "General Knowledge",
  11: "Movies",
  12: "Music",
  17: "Science",
  21: "Sports",
  22: "Geography",
  23: "History",
};

function getRank(score) {
  if (score >= 900) {
    return {
      title: "Mintea Supremă a Quiz-ului ",
      description:
        "Ai răspuns ca și cum Google te-ar suna pe tine când nu știe ceva.",
    };
  } else if (score >= 800) {
    return {
      title: "Enciclopedie Aproape Completă ",
      description:
        "Îți mai lipsesc câteva pagini, dar e clar că știi destule.",
    };
  } else if (score >= 700) {
    return {
      title: "Geek de Serviciu ",
      description:
        "Prietenii probabil deja te întreabă pe tine înainte să caute pe net.",
    };
  } else if (score >= 500) {
    return {
      title: "Jucător Serios de Trivia ",
      description:
        "Bază bună, cu încă puțin antrenament devii legendă.",
    };
  } else if (score >= 300) {
    return {
      title: "Explorator de Întrebări ",
      description:
        "Ai curaj, îți mai trebuie doar niște răspunsuri corecte în plus.",
    };
  } else if (score >= 0) {
    return {
      title: "Supraviețuitor de Quiz ",
      description:
        "Ai ieșit viu din quiz, ceea ce e un început promițător.",
    };
  } else {
    return {
      title: "Agentul Haosului de Răspunsuri ",
      description:
        "Ai reușit să enervezi până și punctajul. Respect pentru stil.",
    };
  }
}

function ResultScreen({ playerName, result, onBack }) {
  if (!result) return null;

  const { score, difficulty, category } = result;
  const rank = getRank(score);
  const maxScore = 1000;

  const difficultyLabel = difficulty
    ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    : "-";

  const categoryLabel = CATEGORY_LABELS[Number(category)] || "Other";

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Text style={styles.title}>Game Over</Text>
        <Text style={styles.subtitle}>
          Bine jucat, <Text style={styles.playerName}>{playerName}</Text>!
        </Text>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Scor final</Text>
          <Text style={styles.scoreValue}>
            {score}p / {maxScore}p
          </Text>
        </View>

        <View style={styles.rankBox}>
          <Text style={styles.rankLabel}>Rank-ul tău</Text>
          <Text style={styles.rankTitle}>{rank.title}</Text>
          <Text style={styles.rankDescription}>{rank.description}</Text>
        </View>

        <Text style={styles.meta}>
          Dificultate:{" "}
          <Text style={styles.metaStrong}>{difficultyLabel}</Text> • Categoria:{" "}
          <Text style={styles.metaStrong}>{categoryLabel}</Text>
        </Text>

        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default ResultScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
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
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#f9fafb",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#e5e7eb",
    textAlign: "center",
    marginBottom: 18,
  },
  playerName: {
    fontWeight: "800",
    color: "#60a5fa",
  },
  scoreBox: {
    alignItems: "center",
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 13,
    color: "#9ca3af",
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#facc15",
    marginTop: 4,
  },
  rankBox: {
    marginBottom: 18,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  rankLabel: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 4,
  },
  rankTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#a5b4fc",
    textAlign: "center",
    marginBottom: 4,
  },
  rankDescription: {
    fontSize: 13,
    color: "#cbd5f5",
    textAlign: "center",
  },
  meta: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 22,
  },
  metaStrong: {
    color: "#e5e7eb",
    fontWeight: "600",
  },
  backButton: {
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#3b82f6",
  },
  backButtonText: {
    color: "#f9fafb",
    fontWeight: "700",
    fontSize: 16,
  },
});
