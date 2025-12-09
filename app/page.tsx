"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { motion, AnimatePresence } from "framer-motion"

import { ArrowDownLeftIcon, ArrowUpRightIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Reponse {
  id: number
  texte: string
  bonne_reponse: boolean
}

interface Question {
  id: number
  texte: string
  reponses: Reponse[]
  attempts: number
  completed: boolean
}

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [failedQuestions, setFailedQuestions] = useState<Question[]>([])
  const [direction, setDirection] = useState<number>(0)
  const [quizFinished, setQuizFinished] = useState<boolean>(false)

  useEffect(() => {
    async function fetchQuestions() {
      const { data, error } = await supabase
        .from("question")
        .select(`
          id,
          texte,
          reponses:reponse (
            id,
            texte,
            bonne_reponse
          )
        `)

      if (error) console.error(error)
      else {
        const formatted = data.map((q: any) => ({
          ...q,
          attempts: 0,
          completed: false
        }))
        setQuestions(formatted)
      }
    }
    fetchQuestions()
  }, [])

  const handleClick = (reponse: Reponse) => {
    const currentQ = { ...questions[currentIndex] }
    currentQ.attempts += 1

    if (reponse.bonne_reponse) {
      alert(`Bonne réponse ! ✅ Tentatives: ${currentQ.attempts}`)
      currentQ.completed = true
    } else {
      alert(`Mauvaise réponse ❌ Tentatives: ${currentQ.attempts}`)
      if (!failedQuestions.find(q => q.id === currentQ.id) && !currentQ.completed) {
        setFailedQuestions([...failedQuestions, currentQ])
      }
    }

    // Mettre à jour la question courante
    const updatedQuestions = [...questions]
    updatedQuestions[currentIndex] = currentQ
    setQuestions(updatedQuestions)

    nextQuestion()
  }

  const nextQuestion = () => {
    let next = currentIndex + 1

    if (next < questions.length) {
      setDirection(1)
      setCurrentIndex(next)
    } else if (failedQuestions.length > 0) {
      // Repasse uniquement les questions non complétées
      const toRetry = failedQuestions.filter(q => !q.completed)
      if (toRetry.length > 0) {
        setQuestions(toRetry.map(q => ({ ...q })))
        setFailedQuestions([])
        setCurrentIndex(0)
        setDirection(1)
      } else {
        setQuizFinished(true)
      }
    } else {
      setQuizFinished(true)
    }
  }

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex(currentIndex - 1)
    }
  }

  if (questions.length === 0) return <p>Chargement...</p>

  if (quizFinished) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-10">
        <h2 className="text-center text-2xl font-bold mb-6">Tableau des scores</h2>
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border border-gray-300 dark:border-gray-600 p-2">Question</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2">Tentatives</th>
              <th className="border border-gray-300 dark:border-gray-600 p-2">Bonne réponse</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => {
              const bonneReponse = q.reponses.find(r => r.bonne_reponse)?.texte || ""
              return (
                <tr key={q.id} className="text-center">
                  <td className="border border-gray-300 dark:border-gray-600 p-2">{q.texte}</td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2">{q.attempts}</td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2">{bonneReponse}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="text-center mt-6">
          <Button
            onClick={() => {
              // Réinitialiser le quiz
              const resetQuestions = questions.map(q => ({ ...q, attempts: 0, completed: false }))
              setQuestions(resetQuestions)
              setFailedQuestions([])
              setCurrentIndex(0)
              setQuizFinished(false)
            }}
          >
            Recommencer le quiz
          </Button>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 300 : -300, opacity: 0, scale: 0.95 })
  }

  return (
    <div className="w-full flex flex-col items-center mt-10 gap-6 relative">
      <div className="relative w-full max-w-xl">
        <AnimatePresence custom={direction} mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Card className="relative w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <div className="absolute right-[-60px] top-1/2 -translate-y-1/2 flex flex-col gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextQuestion}
                    disabled={currentIndex >= questions.length - 1 && failedQuestions.length === 0}
                  >
                    <ArrowUpRightIcon />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevQuestion}
                    disabled={currentIndex <= 0}
                  >
                    <ArrowDownLeftIcon />
                  </Button>
                </div>

                <CardHeader>
                  <CardTitle className="text-center">Question {currentIndex + 1}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-center">{currentQuestion.texte}</p>

                  {currentQuestion.reponses.map((reponse: Reponse) => (
                    <Button
                      key={reponse.id}
                      onClick={() => handleClick(reponse)}
                      className="w-full justify-start mt-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 transition-colors duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      {reponse.texte}
                    </Button>
                  ))}

                  <p className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">
                    Tentatives sur cette question : {currentQuestion.attempts}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
