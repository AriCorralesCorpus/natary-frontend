import { useEffect } from "react";
import { API } from "../config";

export default function useEnVivo(alCambiar) {
  useEffect(() => {
    const fuente = new EventSource(`${API}/api/eventos`);
    fuente.onmessage = () => alCambiar();
    return () => fuente.close();
  }, []);
}