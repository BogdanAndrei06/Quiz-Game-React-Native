import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// optiunile disponibile
const CATEGORY_OPTIONS = [
  { value: 9, label: "General Knowledge" },
  { value: 11, label: "Movies" },
  { value: 12, label: "Music" },
  { value: 17, label: "Science" },
  { value: 21, label: "Sports" },
  { value: 22, label: "Geography" },
  { value: 23, label: "History" },
];

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

function StartScreen({
  onStart,
  onStartVersus,
  difficulty,
  setDifficulty,
  category,
  setCategory,
  playerName,
  setPlayerName,
}) {
  const [error, setError] = useState("");

  const [showCategoryOptions, setShowCategoryOptions] = useState(false);
  const [showDifficultyOptions, setShowDifficultyOptions] = useState(false);

  function getCategoryLabel() {
    const found = CATEGORY_OPTIONS.find((c) => c.value === category);
    return found ? found.label : "Choose category";
  }

  function getDifficultyLabel() {
    const found = DIFFICULTY_OPTIONS.find((d) => d.value === difficulty);
    return found ? found.label : "Choose difficulty";
  }

  function handleClick() {
    if (!playerName.trim()) {
      setError("Please enter your name!");
      return;
    }
    setError("");

    const fixedName =
      playerName.trim().charAt(0).toUpperCase() +
      playerName.trim().slice(1).toLowerCase();

    // inchidem orice dropdown inainte de start
    setShowCategoryOptions(false);
    setShowDifficultyOptions(false);

    onStart(fixedName, difficulty, "en", category);
  }

  function handleVersusClick() {
    if (onStartVersus) {
      // folosim dificultatea si categoria selectate
      onStartVersus(difficulty, category);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quizly</Text>

      <View style={styles.stack}>
        <TextInput
          placeholder="Enter your name"
          value={playerName}
          onChangeText={setPlayerName}
          style={styles.input}
          placeholderTextColor="#9ca3af"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* CATEGORY */}
        <Text style={styles.label}>Category:</Text>
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() => {
            setShowCategoryOptions((v) => !v);
            setShowDifficultyOptions(false);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.selectText}>{getCategoryLabel()}</Text>
        </TouchableOpacity>

        {showCategoryOptions && (
          <View style={styles.dropdown}>
            <ScrollView nestedScrollEnabled>
              {CATEGORY_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setCategory(opt.value);
                    setShowCategoryOptions(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dropdownItemText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* DIFFICULTY */}
        <Text style={styles.label}>Difficulty:</Text>
        <TouchableOpacity
          style={styles.selectBox}
          onPress={() => {
            setShowDifficultyOptions((v) => !v);
            setShowCategoryOptions(false);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.selectText}>{getDifficultyLabel()}</Text>
        </TouchableOpacity>

        {showDifficultyOptions && (
          <View style={styles.dropdown}>
            {DIFFICULTY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.dropdownItem}
                onPress={() => {
                  setDifficulty(opt.value);
                  setShowDifficultyOptions(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownItemText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.startButton} onPress={handleClick}>
          <Text style={styles.startButtonText}>Start Game</Text>
        </TouchableOpacity>

        {onStartVersus && (
          <TouchableOpacity
            style={[styles.startButton, styles.versusButton]}
            onPress={handleVersusClick}
          >
            <Text style={styles.startButtonText}>Start 1 vs 1</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default StartScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(15,23,42,0.85)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.5)",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#f9fafb",
    textAlign: "center",
    marginBottom: 20,
  },
  stack: {
    gap: 12,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.5)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#e5e7eb",
    backgroundColor: "rgba(15,23,42,0.8)",
  },
  error: {
    color: "#fecaca",
    fontSize: 12,
  },
  label: {
    color: "#e5e7eb",
    fontSize: 13,
    marginTop: 6,
  },
  selectBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.5)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(15,23,42,0.6)",
  },
  selectText: {
    color: "#e5e7eb",
    fontSize: 14,
  },
  dropdown: {
    marginTop: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.5)",
    backgroundColor: "rgba(15,23,42,0.95)",
    maxHeight: 180,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dropdownItemText: {
    color: "#e5e7eb",
    fontSize: 14,
  },
  buttonWrapper: {
    marginTop: 24,
    alignItems: "center",
  },
  startButton: {
    width: 180,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#4b8df7",
    justifyContent: "center",
    alignItems: "center",
  },
  startButtonText: {
    color: "#f9fafb",
    fontWeight: "700",
    fontSize: 16,
  },
  versusButton: {
    marginTop: 10,
    backgroundColor: "#f97316",
  },
});
