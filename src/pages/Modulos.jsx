import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getModulos } from "../services/api";
import "./pages.css";

function Modulos() {
  const [modulos, setModulos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModulos = async () => {
      try {
        const data = await getModulos(); // Llama a la función getModulos
        setModulos(data); // Actualiza el estado con los módulos obtenidos
      } catch (error) {
        console.error("Error al cargar módulos:", error);
        // Manejo de errores (mostrar mensaje al usuario)
      }
    };

    fetchModulos();
  }, []); // Asegúrate de que el efecto se ejecute solo una vez al montar el componente

  return (
    <div class="modules-container">
      <h2 class="modules-title">Módulos</h2>
      <button
        class="modules-create-button"
        onClick={() => navigate("/modulos/crear")}
      >
        Crear Nuevo Módulo
      </button>
      <ul class="modules-list">
        {modulos.map((modulo) => (
          <li key={modulo.id} class="modules-list-item">
            <Link to={`/modulos/${modulo.id}/editar`} class="modules-list-link">
              {modulo.nombre}
            </Link>
            {/* Enlace para editar el módulo */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Modulos;
