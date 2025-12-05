"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabaseClient";

const ADMIN_PASSWORD = "Mathys2.0";

type Reponse = {
    id: number;
    texte: string;
    bonne_reponse: boolean;
};

type Question = {
    id: number;
    texte: string;
    ordre: number;
    reponse: Reponse[];
};

export default function AdminPanel() {
    const [isAuth, setIsAuth] = useState(false);
    const [password, setPassword] = useState("");

    const [questions, setQuestions] = useState<Question[]>([]);
    const [newQuestion, setNewQuestion] = useState("");
    const [stats, setStats] = useState<any>(null);

    //  LOGIN
    function handleLogin() {
        if (password === ADMIN_PASSWORD) {
            setIsAuth(true);
            fetchQuestions();
            fetchStats();
        } else alert("Mot de passe incorrect");
    }

    //  Get all questions
    async function fetchQuestions() {
        const { data, error } = await supabase
            .from("question")
            .select("id, texte, ordre, reponse(id, texte, bonne_reponse)")
            .order("ordre", { ascending: true });

        if (!error && data) {
            const cleaned: Question[] = data.map((q) => ({
                ...q,
                reponse: (q.reponse ?? []) as Reponse[],
            }));
            setQuestions(cleaned);
        }
    }

    //  Stats globales
    async function fetchStats() {
        const { data, error } = await supabase.rpc("global_stats");

        if (error) {
            console.error("Erreur stats :", error);
        } else if (data && data.length > 0) {
            setStats(data[0]);
        } else {
            setStats({ total: 0, good: 0 });
        }
    }


    //  Ajouter une question
    async function addQuestion() {
        if (!newQuestion.trim()) return alert("Écris la question");

        const { error } = await supabase.from("question").insert({
            texte: newQuestion,
            ordre: questions.length + 1,
        });

        if (!error) {
            setNewQuestion("");
            fetchQuestions();
        }
    }

    //  Modifier texte question
    async function updateQuestion(id: number, texte: string) {
        await supabase.from("question").update({ texte }).eq("id", id);
        fetchQuestions();
    }

    //  Supprimer question
    async function deleteQuestion(id: number) {
        await supabase.from("question").delete().eq("id", id);
        fetchQuestions();
    }

    //  Drag & drop (ordre)
    async function reorder(up: boolean, index: number) {
        if (up && index === 0) return;
        if (!up && index === questions.length - 1) return;

        const q1 = questions[index];
        const q2 = questions[up ? index - 1 : index + 1];

        await supabase.from("question").update({ ordre: q2.ordre }).eq("id", q1.id);
        await supabase.from("question").update({ ordre: q1.ordre }).eq("id", q2.id);

        fetchQuestions();
    }

    //  Ajouter réponse
    async function addReponse(questionId: number) {
        await supabase.from("reponse").insert({
            texte: "Nouvelle réponse",
            bonne_reponse: false,
            question_id: questionId,
        });
        fetchQuestions();
    }

    //  Modifier réponse
    async function updateReponse(id: number, texte: string) {
        await supabase.from("reponse").update({ texte }).eq("id", id);
        fetchQuestions();
    }

    //  Toggle bonne réponse
    async function toggleBonneReponse(id: number, current: boolean) {
        await supabase.from("reponse").update({ bonne_reponse: !current }).eq("id", id);
        fetchQuestions();
    }

    //  Supprimer réponse
    async function deleteReponse(id: number) {
        await supabase.from("reponse").delete().eq("id", id);
        fetchQuestions();
    }


    //  UI


    if (!isAuth)
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="border p-6 rounded-xl w-full max-w-sm">
                    <h2 className="text-xl font-bold text-center mb-4">Admin</h2>
                    <Input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button className="w-full mt-4" onClick={handleLogin}>
                        Accéder
                    </Button>
                </div>
            </div>
        );

    return (
        <div className="p-10 space-y-10">
            <h1 className="text-3xl font-bold">Panneau d'administration</h1>

            {/* ➕ AJOUTER QUESTION */}
            <div className="border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-3">Ajouter une question</h2>

                <Textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Écris la question…"
                />

                <Button className="mt-4" onClick={addQuestion}>
                    Ajouter
                </Button>
            </div>

            {/*  LISTE DES QUESTIONS */}
            <div className="border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-3">Toutes les questions</h2>

                <div className="space-y-4">
                    {questions.map((q, i) => (
                        <div
                            key={q.id}
                            className="p-4 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
                        >
                            <div className="flex items-center justify-between">
                                <Input
                                    defaultValue={q.texte}
                                    onBlur={(e) => updateQuestion(q.id, e.target.value)}
                                    className="w-full"
                                />

                                <div className="flex gap-2 ml-4">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => reorder(true, i)}
                                    >
                                        ↑
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => reorder(false, i)}
                                    >
                                        ↓
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => deleteQuestion(q.id)}
                                    >
                                        Suppr
                                    </Button>
                                </div>
                            </div>

                            {/* Liste des réponses */}
                            <div className="mt-3 pl-4 border-l space-y-2">
                                {q.reponse.map((r: Reponse) => (
                                    <div key={r.id} className="flex items-center gap-2">
                                        <Input
                                            defaultValue={r.texte}
                                            onBlur={(e) => updateReponse(r.id, e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button
                                            variant={r.bonne_reponse ? "default" : "outline"}
                                            onClick={() => toggleBonneReponse(r.id, r.bonne_reponse)}
                                        >
                                            {r.bonne_reponse ? "✓" : "✗"}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => deleteReponse(r.id)}
                                        >
                                            Suppr
                                        </Button>
                                    </div>
                                ))}

                                <Button
                                    className="mt-2"
                                    variant="secondary"
                                    onClick={() => addReponse(q.id)}
                                >
                                    ➕ Ajouter une réponse
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/*  STATS */}
            <div className="border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-3">Statistiques</h2>

                {stats ? (
                    <div>
                        <p>Total réponses : {stats.total}</p>
                        <p>Bonnes réponses : {stats.good}</p>
                        <p>
                            Taux de réussite : {((stats.good / stats.total) * 100).toFixed(1)}%
                        </p>
                    </div>
                ) : (
                    <p>Chargement…</p>
                )}
            </div>
        </div>
    );
}
