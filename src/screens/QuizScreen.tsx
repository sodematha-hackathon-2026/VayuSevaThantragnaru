import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useLanguage } from "../context/LanguageContext";
import { t, translations } from "../utils/translations";

type QuizItem = {
  id: string;
  question: string;
  options: string[];
  answer: string;
  shuffledOptions: string[];
};

const shuffleArray = <T,>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export default function QuizScreen() {
  const { language } = useLanguage();
  const [quizItems, setQuizItems] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showScore, setShowScore] = useState(false);

  const buildQuizItems = () => {
    const rawItems = translations[language].quiz.items;
    return shuffleArray(rawItems).map((item) => ({
      ...item,
      shuffledOptions: shuffleArray(item.options),
    }));
  };

  const resetQuiz = useCallback(
    (rebuild: boolean) => {
      setCurrentIndex(0);
      setAnswers({});
      setShowScore(false);
      setQuizItems(rebuild ? buildQuizItems() : []);
    },
    [language]
  );

  useFocusEffect(
    useCallback(() => {
      resetQuiz(true);
      return () => resetQuiz(false);
    }, [resetQuiz])
  );

  const currentItem = quizItems[currentIndex];
  const selected = currentItem ? answers[currentItem.id] : undefined;
  const isCorrect = selected && currentItem ? selected === currentItem.answer : false;
  const totalScore = useMemo(() => {
    return quizItems.reduce((sum, item) => sum + (answers[item.id] === item.answer ? 1 : 0), 0);
  }, [answers, quizItems]);

  const optionStyles = useMemo(
    () => ({
      correct: styles.optionCorrect,
      wrong: styles.optionWrong,
      selected: styles.optionSelected,
    }),
    []
  );

  const handleSelect = (option: string) => {
    if (!currentItem || selected) return;
    setAnswers((prev) => ({ ...prev, [currentItem.id]: option }));
  };

  const goNext = () => {
    if (!selected) return;
    if (currentIndex >= quizItems.length - 1) {
      setShowScore(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const retakeQuiz = () => {
    setAnswers({});
    setCurrentIndex(0);
    setShowScore(false);
    setQuizItems(buildQuizItems());
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("quiz.title", language)}</Text>
        <Text style={styles.subtitle}>{t("quiz.subtitle", language)}</Text>
      </View>

      {showScore ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("quiz.scoreTitle", language)}</Text>
          <Text style={styles.scoreText}>
            {t("quiz.scoreText", language, { score: totalScore, total: quizItems.length })}
          </Text>
          <TouchableOpacity style={styles.retakeBtn} onPress={retakeQuiz}>
            <Text style={styles.retakeText}>{t("quiz.retake", language)}</Text>
          </TouchableOpacity>
        </View>
      ) : currentItem ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{`Q${currentIndex + 1}. ${currentItem.question}`}</Text>
          {currentItem.shuffledOptions.map((option) => {
            const isSelected = selected === option;
            const isOptionCorrect = option === currentItem.answer;
            const showResult = Boolean(selected);
            const optionStateStyle = showResult
              ? isOptionCorrect
                ? optionStyles.correct
                : isSelected
                  ? optionStyles.wrong
                  : null
              : isSelected
                ? optionStyles.selected
                : null;

            return (
              <TouchableOpacity
                key={option}
                style={[styles.optionRow, optionStateStyle]}
                onPress={() => handleSelect(option)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
              >
                <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                  {isSelected ? <Text style={styles.checkboxTick}>✓</Text> : null}
                </View>
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            );
          })}

          {selected ? (
            <Text style={[styles.answerText, isCorrect ? styles.answerCorrect : styles.answerWrong]}>
              {t("quiz.answerLabel", language)}: {currentItem.answer}
            </Text>
          ) : null}
        </View>
      ) : null}

      {!showScore ? (
        <TouchableOpacity
          style={[styles.nextBtn, !selected && styles.nextBtnDisabled]}
          onPress={goNext}
          disabled={!selected}
          accessibilityRole="button"
        >
          <Text style={styles.nextText}>{t("common.next", language)}</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5E3CE" },
  content: { paddingBottom: 40 },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", color: "#3B2416" },
  subtitle: { fontSize: 13, color: "#7A5A45", marginTop: 4 },
  card: {
    backgroundColor: "#FFF4E6",
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2C3A4",
  },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#3B2416", marginBottom: 6 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2C3A4",
    backgroundColor: "#FFF8F0",
    marginTop: 8,
  },
  optionSelected: {
    borderColor: "#C96A2B",
    backgroundColor: "#FCE6D2",
  },
  optionCorrect: {
    borderColor: "#1B7A3C",
    backgroundColor: "#E4F4EA",
  },
  optionWrong: {
    borderColor: "#A32E2E",
    backgroundColor: "#F9E6E6",
  },
  optionText: { fontSize: 13, color: "#3B2416", flex: 1 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#A56A46",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: "#C96A2B", borderColor: "#C96A2B" },
  checkboxTick: { color: "#fff", fontWeight: "800" },
  answerText: { fontSize: 12, marginTop: 10, fontWeight: "700" },
  answerCorrect: { color: "#1B7A3C" },
  answerWrong: { color: "#A32E2E" },
  scoreText: { fontSize: 14, color: "#3B2416", marginTop: 8, fontWeight: "700" },
  nextBtn: {
    marginTop: 16,
    marginHorizontal: 20,
    backgroundColor: "#C96A2B",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtnDisabled: { opacity: 0.6 },
  nextText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  retakeBtn: {
    marginTop: 12,
    backgroundColor: "#3B2416",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  retakeText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});
