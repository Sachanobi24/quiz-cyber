"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface Reponse {
  id: number;
  texte: string;
  bonne_reponse: boolean;
}

interface Question {
  id: number;
  texte: string;
  reponses: Reponse[];
  attempts: number;
  completed: boolean;
  isRetry?: boolean;
}

interface Feedback {
  message: string;
  type: "success" | "error";
}

export default function Quiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [failedQuestions, setFailedQuestions] = useState<Question[]>([]);
  const [answered, setAnswered] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [theme, setTheme] = useState<string>("light");

  useEffect(() => {
    async function fetchQuestions() {
      const { data, error } = await supabase
        .from("question")
        .select(`id, texte, reponses:reponse(id, texte, bonne_reponse)`);

      if (error) {
        console.error(error);
        return;
      }

      const formatted: Question[] = data.map((q: any) => ({
        ...q,
        attempts: 0,
        completed: false,
      }));

      setQuestions(formatted);
    }

    fetchQuestions();
  }, []);

  const showFeedback = (message: string, type: "success" | "error") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 1500);
  };

  const handleClick = (reponse: Reponse) => {
    if (!questions[currentIndex]) return;

    const updatedQuestions = [...questions];
    const updatedFailed = [...failedQuestions];
    const currentQ = { ...updatedQuestions[currentIndex] };
    currentQ.attempts += 1;

    if (reponse.bonne_reponse) {
      currentQ.completed = true;
      showFeedback("Bonne réponse ! ✅", "success");
      setScore(prev => prev + 1);
      setAnswered(prev => [...prev, currentQ.id]);
      const newQuestions = updatedQuestions.filter(q => q.id !== currentQ.id);
      const newFailed = updatedFailed.filter(q => q.id !== currentQ.id);
      setQuestions(newQuestions);
      setFailedQuestions(newFailed);
    } else {
      showFeedback("Mauvaise réponse ❌", "error");
      if (!updatedFailed.find(q => q.id === currentQ.id)) updatedFailed.push(currentQ);
      setFailedQuestions(updatedFailed);
    }

    // Si plus de questions restantes, retry des questions ratées
    if (updatedQuestions.length > 0) {
      setCurrentIndex(prev => (prev >= updatedQuestions.length ? updatedQuestions.length - 1 : prev));
    } else if (updatedFailed.length > 0) {
      const retryQs = updatedFailed.map(q => ({ ...q, isRetry: true }));
      setQuestions(retryQs);
      setFailedQuestions([]);
      setCurrentIndex(0);
    } else {
      setQuizFinished(true);
    }
  };

  if (quizFinished) {
    return (
      <div className={`min-h-screen p-6 ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"}`}>
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">🎉 Quiz terminé !</h2>
          <p className="mb-4">Score : {score}</p>
          <Button
            onClick={() => {
              const allQs = [...questions, ...failedQuestions].map(q => ({ ...q, attempts: 0, completed: false }));
              setQuestions(allQs);
              setFailedQuestions([]);
              setAnswered([]);
              setScore(0);
              setQuizFinished(false);
              setCurrentIndex(0);
            }}
          >
            Rejouer
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return <p className={`min-h-screen p-6 ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"}`}>Chargement...</p>;

  return (
    <div className={`min-h-screen p-6 transition ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"}`}>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? "🌙 Nuit" : "☀️ Jour"}</Button>
      </div>

      <div className="max-w-xl mx-auto">
        <AnimatePresence>
          <motion.div key={currentQuestion.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className={`p-4 rounded-2xl mb-4 ${currentQuestion.isRetry ? "bg-orange-100 dark:bg-orange-600" : "bg-white dark:bg-gray-800"}`}>
              <CardHeader>
                <CardTitle>Question {currentIndex + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{currentQuestion.texte}</p>
                {currentQuestion.reponses.map(r => (
                  <Button key={r.id} className="w-full mb-2" onClick={() => handleClick(r)}>
                    {r.texte}
                  </Button>
                ))}
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mt-2 p-2 rounded text-center font-semibold ${
                      feedback.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}
                  >
                    {feedback.message}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
