"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Sun, Moon } from "lucide-react";

interface Reponse { id: number; texte: string; bonne_reponse: boolean; }
interface Question { id: number; texte: string; reponses: Reponse[]; attempts: number; completed: boolean; }

interface Feedback { message: string; type: "success" | "error"; }

export default function Quiz() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [failedQuestions, setFailedQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const { setTheme } = useTheme();

  // ⚡ Toggle jour/nuit
  const ModeToggle = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative w-10 h-10 rounded-full transition-transform hover:scale-110">
          <Sun className="absolute h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Clair</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Sombre</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>Système</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  useEffect(() => {
    async function fetchQuestions() {
      const { data, error } = await supabase.from("question")
        .select(`id, texte, reponses:reponse(id, texte, bonne_reponse)`);
      if (!error && data) {
        const formatted = data.map((q) => ({ ...q, attempts: 0, completed: false }));
        setQuestions(formatted);
      }
    }
    fetchQuestions();
  }, []);

  const showFeedback = (msg: string, type: "success" | "error") => {
    setFeedback({ message: msg, type });
    setTimeout(() => setFeedback(null), 1500);
  };

  const handleClick = (r: Reponse) => {
    const currentQ = questions[currentIndex];
    currentQ.attempts += 1;
    if (r.bonne_reponse) {
      currentQ.completed = true;
      showFeedback("Bonne réponse ✅", "success");
      setScore((s) => s + 1);
      setQuestions(questions.filter(q => !q.completed));
      setFailedQuestions(failedQuestions.filter(q => q.id !== currentQ.id));
    } else {
      showFeedback("Mauvaise réponse ❌", "error");
      if (!failedQuestions.find(q => q.id === currentQ.id)) setFailedQuestions([...failedQuestions, currentQ]);
    }

    // Prochaine question
    if (questions.length > 1) {
      setCurrentIndex(prev => Math.min(prev + 1, questions.length - 1));
    } else if (failedQuestions.length > 0) {
      const retryQs = [...failedQuestions];
      setQuestions(retryQs);
      setFailedQuestions([]);
      setCurrentIndex(0);
    } else {
      setQuizFinished(true);
      saveScore();
    }
  };

  const saveScore = async () => {
    const joueurId = Number(localStorage.getItem("joueurId"));
    const joueurName = localStorage.getItem("joueurName") || "Anonyme";
    const totalAttempts = [...questions, ...failedQuestions].reduce((sum, q) => sum + q.attempts, 0);
    const firstTrySuccess = [...questions, ...failedQuestions].filter(q => q.attempts === 1).length;
    const totalQuestions = [...questions, ...failedQuestions].length;
    const pctFirstTry = Math.round((firstTrySuccess / totalQuestions) * 100);

    await supabase.from("classement").insert({
      joueur_id: joueurId,
      nom: joueurName,
      tentatives_total: totalAttempts,
      pourcentage_premier_coup: pctFirstTry,
      date_partie: new Date(),
      temps: 0
    });
  };

  if (quizFinished) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-10 text-center">
        <h2 className="text-2xl font-bold mb-4">🎉 Quiz terminé !</h2>
        <p className="text-lg mb-4">Score : {score}</p>
        <Button onClick={() => location.reload()}>Recommencer</Button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return <p>Chargement…</p>;

  return (
    <div className="w-full flex flex-col items-center mt-10 gap-6 relative">
      <div className="absolute top-4 right-4"><ModeToggle /></div>
      {feedback && <motion.div className={`px-4 py-2 rounded-md text-white font-semibold ${feedback.type === "success" ? "bg-green-500" : "bg-red-500"}`}>{feedback.message}</motion.div>}

      <Card className="p-5 w-full max-w-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <CardHeader>
          <CardTitle className="text-center">Question {currentIndex + 1}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">{currentQ.texte}</p>
          <div className="space-y-2 mt-4">
            {currentQ.reponses.map((r) => (
              <Button
                key={r.id}
                onClick={() => handleClick(r)}
                className="w-full justify-start mt-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 transition-colors duration-300 opacity-0 animate-fadeInUp hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 dark:hover:shadow-blue-300/50"
              >
                {r.texte}
              </Button>
            ))}
          </div>
          <p className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">Tentatives sur cette question : {currentQ.attempts}</p>
        </CardContent>
      </Card>
    </div>
  );
}
