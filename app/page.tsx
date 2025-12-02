"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"

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
  const [question, setQuestion] = useState<any>(null)
  const { setTheme } = useTheme()   // mode sombre ici ✔️

  // ModeToggle intégré dans la page
  const ModeToggle = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
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
    async function fetchQuestion() {
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
        .limit(1)

      if (error) console.error(error)
      else setQuestion(data[0])
    }

    fetchQuestion()
  }, [])

  function handleClick(reponse: any) {
    alert(reponse.bonne_reponse ? "Bonne réponse !" : "Mauvaise réponse.")
  }

  return (
    <div className="w-full flex flex-col items-center mt-10 gap-6">

      
      <ModeToggle />

      <Card className="relative max-w-xl w-full">

       
        <div className="absolute right-[-60px] top-1/2 -translate-y-1/2 flex flex-col gap-4">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowUpRightIcon />
          </Button>

          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowDownLeftIcon />
          </Button>
        </div>

        <CardHeader>
          <CardTitle className="text-center">Question</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-center">{question?.texte}</p>

          {question &&
            question.reponses.map((reponse: any) => (
              <Button
                key={reponse.id}
                onClick={() => handleClick(reponse)}
                className="w-full justify-start mt-4"
                variant="outline"
              >
                {reponse.texte}
              </Button>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
