// App.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";

import QuizScreen from "./components/QuizScreen";
import ResultScreen from "./components/ResultScreen";
import StartScreen from "./components/StartScreen";
import VersusScreen from "./components/VersusScreen";

// fundalul aplicatiei
const backgroundImg = require("./assets/fundal.jpg");

export default function App() {
  const [playerName, setPlayerName] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState("easy");
  const [category, setCategory] = useState(9);

  // informatii despre ultimul meci incheiat (scor + dif + categorie)
  const [lastResult, setLastResult] = useState(null);

  // modul 1 vs 1
  const [versusStarted, setVersusStarted] = useState(false);

  // incarcam ultimul nume de player din AsyncStorage
  useEffect(() => {
    async function loadLastPlayer() {
      try {
        const stored = await AsyncStorage.getItem("lastPlayer");
        if (stored) setPlayerName(stored);
      } catch (e) {
        console.log("Eroare la citirea lastPlayer:", e);
      }
    }
    loadLastPlayer();
  }, []);

  // pornire joc single player
  function handleStart(name, diff, lang, cat) {
    setPlayerName(name);
    setDifficulty(diff);
    setCategory(cat);
    setLastResult(null);
    setVersusStarted(false);
    setGameStarted(true);
  }

  // cand se termina jocul single player: afisam ecranul de scor
  function handleGameEnd(result) {
    // result = { score, difficulty, category }
    setGameStarted(false);
    setLastResult(result);
  }

  // back de pe pagina de scor -> inapoi la StartScreen
  function handleBackFromResult() {
    setLastResult(null);
  }

  // pornire mod 1 vs 1
  function handleStartVersus(diff, cat) {
    setGameStarted(false);
    setLastResult(null);
    setDifficulty(diff);
    setCategory(cat);
    setVersusStarted(true);
  }

  // iesire din mod 1 vs 1
  function handleExitVersus() {
    setVersusStarted(false);
  }

  return (
    <ImageBackground
      source={backgroundImg}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.appContainer}>
            <View style={styles.mainContent}>
              {versusStarted ? (
                <VersusScreen
                  difficulty={difficulty}
                  category={category}
                  onExit={handleExitVersus}
                />
              ) : (
                <>
                  {!gameStarted && !lastResult && (
                    <StartScreen
                      onStart={handleStart}
                      onStartVersus={() =>
                        handleStartVersus(difficulty, category)
                      }
                      difficulty={difficulty}
                      setDifficulty={setDifficulty}
                      category={category}
                      setCategory={setCategory}
                      playerName={playerName}
                      setPlayerName={setPlayerName}
                    />
                  )}

                  {gameStarted && (
                    <QuizScreen
                      playerName={playerName}
                      difficulty={difficulty}
                      language="en"
                      category={category}
                      onGameEnd={handleGameEnd}
                    />
                  )}

                  {!gameStarted && lastResult && (
                    <ResultScreen
                      playerName={playerName}
                      result={lastResult}
                      onBack={handleBackFromResult}
                    />
                  )}
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexGrow: 1,
  },
  appContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)", // overlay peste fundal
    paddingBottom: 24,
  },
  mainContent: {
    padding: 16,
    flex: 1,
    justifyContent: "center",
  },
});
