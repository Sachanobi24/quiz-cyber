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
        .select('*')
        .limit(1);

      if (error) console.error(error);
      else setQuestion(data[0]); // On stocke la première question dans l’état
    }

    fetchQuestion();
  }, []);

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
      </CardContent>

    </Card>
  </div>
);

}