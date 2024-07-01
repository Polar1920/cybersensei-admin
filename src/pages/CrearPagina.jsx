import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPagina, getUltimoOrdenPaginaPorModuloId } from "../services/api";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function CrearPagina() {
  const { moduloId } = useParams();
  const [nombrePagina, setNombrePagina] = useState("");
  const [tipoPagina, setTipoPagina] = useState("");
  const [ordenPagina, setOrdenPagina] = useState(0);
  const [contenido, setContenido] = useState("");
  const [pregunta, setPregunta] = useState("");
  const [respuestas, setRespuestas] = useState([
    { texto: "Respuesta correcta por defecto", es_correcta: true },
    { texto: "Respuesta incorrecta por defecto", es_correcta: false },
  ]);
  const [seleccionado, setSeleccionado] = useState(false);
  const navigate = useNavigate();
  const quillRef = useRef(null);

  useEffect(() => {
    const fetchUltimoOrdenPagina = async () => {
      try {
        const ultimoOrden = await getUltimoOrdenPaginaPorModuloId(moduloId);
        setOrdenPagina(ultimoOrden + 1);
      } catch (error) {
        console.error("Error al obtener el último orden de página:", error);
      }
    };

    fetchUltimoOrdenPagina();
  }, [moduloId]);

  const insertImage = () => {
    const url = prompt("Ingresa la URL de la imagen:");
    if (url) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      quill.insertEmbed(range.index, "image", url);
    }
  };

  const agregarRespuesta = () => {
    const nuevaRespuesta = { texto: "", es_correcta: false };
    setRespuestas([...respuestas, nuevaRespuesta]);
  };

  const handleTipoPaginaSelect = (tipo) => {
    setTipoPagina(tipo);
    setSeleccionado(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      let contenidoAEnviar = contenido;
      if (tipoPagina === "quiz") {
        let contenidoQuiz = `q:${pregunta}`;
        respuestas.forEach((respuesta, index) => {
          contenidoQuiz += `|a:${respuesta.texto},${respuesta.es_correcta}`;
        });
        contenidoAEnviar = contenidoQuiz;
      }
      await createPagina({
        nombre: nombrePagina,
        modulo_id: moduloId,
        orden: ordenPagina,
        contenido0: contenidoAEnviar,
        tipo: tipoPagina,
      });
      navigate(`/modulos/${moduloId}/editar`);
    } catch (error) {
      console.error("Error al crear página:", error);
    }
  };

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline"],
        ["link"],
        ["video"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["image"],
        ["clean"],
      ],
    },
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "link",
    "image",
    "video",
    "list",
    "bullet",
  ];

  return (
    <div className="create-page">
      <h2 className="create-page__title">Crear Nueva Página</h2>
      <div className="create-page__content">
        {!seleccionado ? (
          <div className="create-page__select-type">
            <h3 className="create-page__type-title">Selecciona el Tipo de Página:</h3>
            <div className="create-page__type-items">
              <div
                onClick={() => handleTipoPaginaSelect("informacion")}
                className="create-page__type-item"
              >
                Información
              </div>
              <div
                onClick={() => handleTipoPaginaSelect("quiz")}
                className="create-page__type-item"
              >
                Quiz
              </div>
            </div>
          </div>
        ) : tipoPagina === "informacion" ? (
          <form onSubmit={handleSubmit} className="create-page__form">
            <div className="create-page__form-group">
              <label className="create-page__form-label">Nombre de la Página:</label>
              <input
                type="text"
                value={nombrePagina}
                onChange={(e) => setNombrePagina(e.target.value)}
                required
                className="create-page__form-input"
              />
            </div>
            <div className="create-page__form-group">
              <label className="create-page__form-label">Página #{ordenPagina}</label>
            </div>
            <div className="create-page__form-group">
              <label className="create-page__form-label">Contenido:</label>
              <ReactQuill
                key={tipoPagina}
                ref={quillRef}
                value={contenido}
                onChange={setContenido}
                modules={modules}
                formats={formats}
                placeholder="Escribe aquí el contenido..."
                className="create-page__editor"
              />
            </div>
            <div className="create-page__form-buttons">
              <button
                type="button"
                onClick={insertImage}
                className="create-page__button"
              >
                Insertar Imagen
              </button>
              <button type="submit" className="create-page__button">
                Crear Página
              </button>
            </div>
          </form>
        ) : tipoPagina === "quiz" ? (
          <form onSubmit={handleSubmit} className="create-page__form">
            <div className="create-page__form-group">
              <label className="create-page__form-label">Nombre de la Página:</label>
              <input
                type="text"
                value={nombrePagina}
                onChange={(e) => setNombrePagina(e.target.value)}
                required
                className="create-page__form-input"
              />
            </div>
            <div className="create-page__form-group">
              <label className="create-page__form-label">Página #{ordenPagina}</label>
            </div>
            <div className="create-page__form-group">
              <label className="create-page__form-label">Pregunta:</label>
              <input
                type="text"
                value={pregunta}
                onChange={(e) => setPregunta(e.target.value)}
                required
                className="create-page__form-input"
              />
            </div>
            <div className="create-page__form-group">
              <h3 className="create-page__form-label">Respuestas</h3>
              {respuestas.map((respuesta, index) => (
                <div key={index} className="create-page__form-group">
                  <label className="create-page__form-label">Respuesta {index + 1}:</label>
                  <input
                    type="text"
                    value={respuesta.texto}
                    onChange={(e) => {
                      const newRespuestas = [...respuestas];
                      newRespuestas[index].texto = e.target.value;
                      setRespuestas(newRespuestas);
                    }}
                    required
                    className="create-page__form-input"
                  />
                  <label className="create-page__form-label">¿Es correcta?</label>
                  <select
                    value={respuesta.es_correcta ? "true" : "false"}
                    onChange={(e) => {
                      const newRespuestas = [...respuestas];
                      newRespuestas[index].es_correcta = e.target.value === "true";
                      setRespuestas(newRespuestas);
                    }}
                    className="create-page__form-input"
                  >
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                </div>
              ))}
            </div>
            <div className="create-page__form-buttons">
              <button
                type="button"
                onClick={agregarRespuesta}
                className="create-page__button"
              >
                Agregar Respuesta
              </button>
              <button type="submit" className="create-page__button">
                Crear Pregunta
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}

export default CrearPagina;
