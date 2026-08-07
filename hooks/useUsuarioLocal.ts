"use client";

import { useEffect, useState } from "react";

const KEY = "edersa_usuario_local";

/**
 * Fase inicial sin login: el operario ingresa su nombre una vez y queda
 * guardado en el dispositivo. Cuando se active Auth (fase futura), este
 * hook se reemplaza por el usuario de la sesión de Supabase Auth sin
 * tocar el resto de la app (los componentes solo consumen `usuario`).
 */
export function useUsuarioLocal() {
  const [usuario, setUsuarioState] = useState<string | null>(null);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    const guardado = window.localStorage.getItem(KEY);
    setUsuarioState(guardado);
    setCargado(true);
  }, []);

  function setUsuario(nombre: string) {
    window.localStorage.setItem(KEY, nombre);
    setUsuarioState(nombre);
  }

  return { usuario, setUsuario, cargado };
}
