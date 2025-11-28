"use client"


import { ArrowDownLeftIcon } from "lucide-react"
import { ArrowUpRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [question, setQuestion] = useState<any>(null);
  useEffect(() => {
    async function fetchQuestion() {
      const { data, error } = await supabase
        .from('question')
        .select(`
            id,
            texte,
            reponses:reponse (
            id,
            texte,
            bonne_reponse
             )
          `)
        .limit(1);

      if (error) console.error(error);
      else setQuestion(data[0]); // On stocke la première question dans l’état
    }

    fetchQuestion();
  }, []);

  function handleClick(reponse: any) {
    if (reponse.bonne_reponse) {
      alert("Bonne réponse !");
    } else {
      alert("Mauvaise réponse.");
    }
  }

  return (
    <div className="w-full flex justify-center mt-10">

      <Card className="relative max-w-xl w-full">

        {/* Boutons à droite de la carte */}
        <div className="absolute right-[-60px] top-1/2 -translate-y-1/2 flex flex-col gap-4">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowUpRightIcon />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowDownLeftIcon />
          </Button>
        </div>

        {/* Contenu de la question */}
        <CardHeader>
          <CardTitle className="text-center">Question</CardTitle>
        </CardHeader>
        <CardContent>

          <p className="text-center">{question?.texte}</p>

          {question && question.reponses.map((reponse: any) => (
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
  );
}