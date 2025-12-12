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
    console.log("handleLogin", { email });

    if (!email) return setError("Merci de mettre un email");

    if (email === ADMIN_EMAIL) {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem("joueurEmail", email);
        router.push("/admin");
      } else {
        setError("Mot de passe admin incorrect");
      }
      return;
    }

    try {
      const resp = await supabase
        .from("joueur")
        .select("*")
        .eq("email", email)
        .single();

      console.log("supabase login response:", resp);

      if (resp.error) {
        // erreur précisée par supabase
        setError(resp.error.message || "Erreur Supabase lors de la recherche");
        return;
      }

      if (resp.data) {
        localStorage.setItem("joueurEmail", email);
        router.push("/quiz");
      } else {
        setError("Joueur non trouvé. Veuillez vous inscrire.");
      }
    } catch (err) {
      console.error("Exception login:", err);
      setError("Erreur lors de la requête. Voir console devtools.");
    }
  };

  const handleRegister = async () => {
    setError("");
    console.log("handleRegister", { nom, email });

    if (!nom || !email) return setError("Merci de remplir le nom et l'email");

    try {
      // vérifie si existe
      const check = await supabase
        .from("joueur")
        .select("id,email")
        .eq("email", email)
        .maybeSingle(); // peut retourner null

      console.log("check existing:", check);

      if (check.error) {
        setError(check.error.message || "Erreur Supabase lors de la vérif.");
        return;
      }

      if (check.data) {
        return setError("Ce joueur existe déjà, essayez de vous connecter.");
      }

      // insert et demander la ligne insérée (.select())
      const insertResp = await supabase
        .from("joueur")
        .insert({
          nom,
          email,
          // si ta table a des colonnes obligatoires, ajoute-les ici :
          // date_inscription: null,
          // created_at: new Date().toISOString(),
        })
        .select()
        .single();

      console.log("insertResp:", insertResp);

      if (insertResp.error) {
        setError(insertResp.error.message || "Erreur lors de l'inscription.");
        return;
      }

      localStorage.setItem("joueurEmail", email);
      router.push("/quiz");
    } catch (err) {
      console.error("Exception register:", err);
      setError("Erreur lors de la requête d'inscription. Voir console.");
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
