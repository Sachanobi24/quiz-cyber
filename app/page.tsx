"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

const ADMIN_EMAIL = "admin";
const ADMIN_PASSWORD = "Mathys2.0";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [nom, setNom] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!email) return setError("Merci de mettre un email");

    // LOGIN ADMIN
    if (email === ADMIN_EMAIL) {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem("joueurEmail", email);
        router.push("/admin");
      } else {
        setError("Mot de passe admin incorrect");
      }
      return;
    }

    // LOGIN JOUEUR
    const { data } = await supabase
      .from("joueur")
      .select("*")
      .eq("email", email)
      .single();

    if (data) {
      // Joueur existe
      localStorage.setItem("joueurEmail", email);
      router.push("/quiz");
    } else {
      setError("Joueur non trouvé. Veuillez vous inscrire.");
    }
  };

  const handleRegister = async () => {
    setError("");

    if (!nom || !email) return setError("Merci de remplir le nom et l'email");

    // Vérifie si le joueur existe déjà
    const { data: existing } = await supabase
      .from("joueur")
      .select("*")
      .eq("email", email)
      .single();

    if (existing) {
      return setError("Ce joueur existe déjà, essayez de vous connecter.");
    }

    // Ajoute le joueur à la table joueur
    const { error } = await supabase.from("joueur").insert({
      nom,
      email
    });

    if (error) {
      setError("Erreur lors de l'inscription.");
    } else {
      localStorage.setItem("joueurEmail", email);
      router.push("/quiz");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="border p-8 rounded-xl shadow-lg w-full max-w-sm bg-white dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isRegistering ? "Inscription" : "Connexion"}
        </h2>

        {isRegistering && (
          <Input
            type="text"
            placeholder="Nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="mb-4"
          />
        )}

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4"
        />

        {email === ADMIN_EMAIL && !isRegistering && (
          <Input
            type="password"
            placeholder="Mot de passe admin"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
          />
        )}

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {isRegistering ? (
          <Button className="w-full" onClick={handleRegister}>
            S'inscrire
          </Button>
        ) : (
          <Button className="w-full" onClick={handleLogin}>
            Se connecter
          </Button>
        )}

        <p className="text-sm text-center mt-4 text-gray-500">
          {isRegistering ? (
            <span>
              Vous avez déjà un compte ?{" "}
              <button
                className="text-blue-500 underline"
                onClick={() => setIsRegistering(false)}
              >
                Connectez-vous
              </button>
            </span>
          ) : (
            <span>
              Nouveau joueur ?{" "}
              <button
                className="text-blue-500 underline"
                onClick={() => setIsRegistering(true)}
              >
                Inscrivez-vous
              </button>
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
