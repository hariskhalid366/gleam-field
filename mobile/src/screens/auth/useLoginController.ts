import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function useLoginController() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [secure, setSecure] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const valid = /\S+@\S+\.\S+/.test(email) && password.length >= 6;
  const submit = async () => { setError(null); try { await login(email.trim(), password); } catch (error) { setError(error instanceof Error ? error.message : "Something went wrong. Try again."); } };
  return { values: { email, password, remember, secure, error, loading, valid }, functions: { setEmail, setPassword, setRemember, toggleSecure: () => setSecure((value) => !value), submit } };
}
