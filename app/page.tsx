"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // État pour la visibilité
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [nom, setNom] = useState("");

  async function signInWithEmail(email: string, password: string) {
    const { data, error: loginerror } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    return { data, loginerror };
  }

  const handleLogin = async () => {
    setError("");
    if (!email) return setError("Merci de mettre un email");

    const { data, loginerror } = await signInWithEmail(email, password);

    if (data?.user != null) {
      localStorage.setItem("joueurEmail", email);
      router.push("/admin");
    } else {
      try {
        const resp = await supabase
          .from("joueur")
          .select("*")
          .eq("email", email)
          .single();

        if (resp.error) {
          setError("Mot de passe incorrect ou utilisateur non trouvé.");
          return;
        }

        if (resp.data) {
          localStorage.setItem("joueurEmail", email);
          router.push("/quiz");
        }
      } catch (err) {
        setError("Erreur lors de la connexion.");
      }
    }
  };

  const handleRegister = async () => {
    setError("");
    if (!nom || !email) return setError("Merci de remplir le nom et l'email");

    try {
      const check = await supabase
        .from("joueur")
        .select("id,email")
        .eq("email", email)
        .maybeSingle();

      if (check.data) {
        return setError("Ce joueur existe déjà, essayez de vous connecter.");
      }

      const insertResp = await supabase
        .from("joueur")
        .insert({ nom, email })
        .select()
        .single();

      if (insertResp.error) {
        setError(insertResp.error.message);
        return;
      }

      localStorage.setItem("joueurEmail", email);
      router.push("/quiz");
    } catch (err) {
      setError("Erreur lors de l'inscription.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
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

        {/* L'accordéon est fermé par défaut car pas de defaultValue */}
        <Accordion type="single" collapsible className="w-full mb-4">
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger className="py-2 text-sm text-white-500 hover:no-underline">
              Accès administrateur
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <Button className="w-full" onClick={isRegistering ? handleRegister : handleLogin}>
          {isRegistering ? "S'inscrire" : "Se connecter"}
        </Button>

        <p className="text-sm text-center mt-4 text-gray-500">
          {isRegistering ? (
            <>
              Déjà un compte ?{" "}
              <button onClick={() => setIsRegistering(false)} className="text-blue-500 underline">
                Connectez-vous
              </button>
            </>
          ) : (
            <>
              Nouveau joueur ?{" "}
              <button onClick={() => setIsRegistering(true)} className="text-blue-500 underline">
                Inscrivez-vous
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}