"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { motion, AnimatePresence } from "framer-motion"

import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  Moon,
  Sun
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Home() {
  const [questions, setQuestions] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const { setTheme } = useTheme()
  const [direction, setDirection] = useState<number>(0) // 1 = next, -1 = prev

  const ModeToggle = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative w-10 h-10 rounded-full transition-transform hover:scale-110"
        >
          <Sun className="absolute h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Changer le thème</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Clair</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Sombre</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>Système</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

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
      else setQuestions(data)
    }

    fetchQuestions()
  }, [])

  const handleClick = (reponse: any) => {
    alert(reponse.bonne_reponse ? "Bonne réponse !" : "Mauvaise réponse.")
  }

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setDirection(1)
      setCurrentIndex(currentIndex + 1)
    }
  }

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex(currentIndex - 1)
    }
  }

  const currentQuestion = questions[currentIndex]

  // Variants pour Framer Motion
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    })
  }

  return (
    <div className="w-full flex flex-col items-center mt-10 gap-6 relative">

      {/* Mode sombre */}
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>

      {/* Carte avec animation de slide */}
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
              <Card
                className="relative w-full
                           bg-white dark:bg-gray-800
                           text-gray-900 dark:text-gray-100
                           transition-colors duration-300"
              >
                {/* Boutons navigation */}
                <div className="absolute right-[-60px] top-1/2 -translate-y-1/2 flex flex-col gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextQuestion}
                    disabled={currentIndex >= questions.length - 1}
                    className="rounded-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 transition-colors duration-300 disabled:opacity-50"
                  >
                    <ArrowUpRightIcon />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevQuestion}
                    disabled={currentIndex <= 0}
                    className="rounded-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 transition-colors duration-300 disabled:opacity-50"
                  >
                    <ArrowDownLeftIcon />
                  </Button>
                </div>

                <CardHeader>
                  <CardTitle className="text-center">Question {currentIndex + 1}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-center">{currentQuestion.texte}</p>

                  {currentQuestion.reponses.map((reponse: any, index: number) => (
                    <Button
                      key={reponse.id}
                      onClick={() => handleClick(reponse)}
                      className="w-full justify-start mt-4
                                 bg-white dark:bg-gray-700
                                 text-gray-900 dark:text-gray-100
                                 border-gray-300 dark:border-gray-600
                                 transition-colors duration-300
                                 opacity-0 animate-fadeInUp
                                 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 dark:hover:shadow-blue-300/50"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {reponse.texte}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
