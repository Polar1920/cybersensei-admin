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

  // States for Información content
  const [contenidoN, setContenidoN] = useState("");
  const [contenidoJA, setContenidoJA] = useState("");
  const [contenidoAM, setContenidoAM] = useState("");

  // States for Quiz content
  const [preguntaN, setPreguntaN] = useState("");
  const [preguntaJA, setPreguntaJA] = useState("");
  const [preguntaAM, setPreguntaAM] = useState("");

  const [respuestasN, setRespuestasN] = useState([
    { texto: "Respuesta correcta por defecto", es_correcta: true },
    { texto: "Respuesta incorrecta por defecto", es_correcta: false },
  ]);
  const [respuestasJA, setRespuestasJA] = useState([
    { texto: "Respuesta correcta por defecto", es_correcta: true },
    { texto: "Respuesta incorrecta por defecto", es_correcta: false },
  ]);
  const [respuestasAM, setRespuestasAM] = useState([
    { texto: "Respuesta correcta por defecto", es_correcta: true },
    { texto: "Respuesta incorrecta por defecto", es_correcta: false },
  ]);

  const [seleccionado, setSeleccionado] = useState(false);
  const navigate = useNavigate();
  const quillRefN = useRef(null);
  const quillRefJA = useRef(null);
  const quillRefAM = useRef(null);

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

  const insertImage = (quillRef) => {
    const url = prompt("Ingresa la URL de la imagen:");
    if (url) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      quill.insertEmbed(range.index, "image", url);
    }
  };

  const agregarRespuesta = (setRespuestas) => {
    const nuevaRespuesta = { texto: "", es_correcta: false };
    setRespuestas((respuestas) => [...respuestas, nuevaRespuesta]);
  };

  const handleTipoPaginaSelect = (tipo) => {
    setTipoPagina(tipo);
    setSeleccionado(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (tipoPagina === "quiz") {
        const contenidoQuizN = generarContenidoQuiz(preguntaN, respuestasN);
        const contenidoQuizJA = generarContenidoQuiz(preguntaJA, respuestasJA);
        const contenidoQuizAM = generarContenidoQuiz(preguntaAM, respuestasAM);
        await createPagina({
          nombre: nombrePagina,
          modulo_id: moduloId,
          orden: ordenPagina,
          contenido0: contenidoQuizN,
          contenido1: contenidoQuizJA,
          contenido2: contenidoQuizAM,
          tipo: tipoPagina,
        });
      } else {
        await createPagina({
          nombre: nombrePagina,
          modulo_id: moduloId,
          orden: ordenPagina,
          contenido0: contenidoN,
          contenido1: contenidoJA,
          contenido2: contenidoAM,
          tipo: tipoPagina,
        });
      }
      navigate(`/modulos/${moduloId}/editar`);
    } catch (error) {
      console.error("Error al crear página:", error);
    }
  };

  const generarContenidoQuiz = (pregunta, respuestas) => {
    let contenidoQuiz = `q:${pregunta}`;
    respuestas.forEach((respuesta) => {
      contenidoQuiz += `|a:${respuesta.texto},${respuesta.es_correcta}`;
    });
    return contenidoQuiz;
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
              <label className="create-page__form-label">Contenido para Niños:</label>
              <ReactQuill
                key={`${tipoPagina}-ninos`}
                ref={quillRefN}
                value={contenidoN}
                onChange={setContenidoN}
                modules={modules}
                formats={formats}
                placeholder="Escribe aquí el contenido para niños..."
                className="create-page__editor"
              />
              {/*
              <button
                type="button"
                onClick={() => insertImage(quillRefAM)}
                className="create-page__button"
              >
                Insertar Imagen
              </button>
              */}
            </div>
            <div className="create-page__form-group">
              <label className="create-page__form-label">Contenido para Jóvenes-Adultos:</label>
              <ReactQuill
                key={`${tipoPagina}-jovenes-adultos`}
                ref={quillRefJA}
                value={contenidoJA}
                onChange={setContenidoJA}
                modules={modules}
                formats={formats}
                placeholder="Escribe aquí el contenido para jóvenes-adultos..."
                className="create-page__editor"
              />
              {/*
              <button
                type="button"
                onClick={() => insertImage(quillRefAM)}
                className="create-page__button"
              >
                Insertar Imagen
              </button>
              */}
            </div>
            <div className="create-page__form-group">
              <label className="create-page__form-label">Contenido para Adultos-Mayores:</label>
              <ReactQuill
                key={`${tipoPagina}-adultos-mayores`}
                ref={quillRefAM}
                value={contenidoAM}
                onChange={setContenidoAM}
                modules={modules}
                formats={formats}
                placeholder="Escribe aquí el contenido para adultos-mayores..."
                className="create-page__editor"
              />
              {/*
              <button
                type="button"
                onClick={() => insertImage(quillRefAM)}
                className="create-page__button"
              >
                Insertar Imagen
              </button>
              */}
            </div>
            <div className="create-page__form-buttons">
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
              <label className="create-page__form-label">Pregunta para Niños:</label>
              <input
                type="text"
                value={preguntaN}
                onChange={(e) => setPreguntaN(e.target.value)}
                required
                className="create-page__form-input"
              />
              <label className="create-page__form-label">Respuestas:</label>
              {respuestasN.map((respuesta, index) => (
                <div key={index} className="create-page__form-group">
                  <input
                    type="text"
                    value={respuesta.texto}
                    onChange={(e) => {
                      const nuevasRespuestas = [...respuestasN];
                      nuevasRespuestas[index].texto = e.target.value;
                      setRespuestasN(nuevasRespuestas);
                    }}
                    className="create-page__form-input"
                  />
                  <label className="create-page__form-checkbox-label">
                    <input
                      type="checkbox"
                      checked={respuesta.es_correcta}
                      onChange={(e) => {
                        const nuevasRespuestas = [...respuestasN];
                        nuevasRespuestas[index].es_correcta = e.target.checked;
                        setRespuestasN(nuevasRespuestas);
                      }}
                      className="create-page__form-checkbox"
                    />
                    Correcta
                  </label>
                </div>
              ))}
              <button
                type="button"
                onClick={() => agregarRespuesta(setRespuestasN)}
                className="create-page__button"
              >
                Agregar Respuesta
              </button>
            </div>
            <div className="create-page__form-group">
              <label className="create-page__form-label">Pregunta para Jóvenes-Adultos:</label>
              <input
                type="text"
                value={preguntaJA}
                onChange={(e) => setPreguntaJA(e.target.value)}
                required
                className="create-page__form-input"
              />
              <label className="create-page__form-label">Respuestas:</label>
              {respuestasJA.map((respuesta, index) => (
                <div key={index} className="create-page__form-group">
                  <input
                    type="text"
                    value={respuesta.texto}
                    onChange={(e) => {
                      const nuevasRespuestas = [...respuestasJA];
                      nuevasRespuestas[index].texto = e.target.value;
                      setRespuestasJA(nuevasRespuestas);
                    }}
                    className="create-page__form-input"
                  />
                  <label className="create-page__form-checkbox-label">
                    <input
                      type="checkbox"
                      checked={respuesta.es_correcta}
                      onChange={(e) => {
                        const nuevasRespuestas = [...respuestasJA];
                        nuevasRespuestas[index].es_correcta = e.target.checked;
                        setRespuestasJA(nuevasRespuestas);
                      }}
                      className="create-page__form-checkbox"
                    />
                    Correcta
                  </label>
                </div>
              ))}
              <button
                type="button"
                onClick={() => agregarRespuesta(setRespuestasJA)}
                className="create-page__button"
              >
                Agregar Respuesta
              </button>
            </div>
            <div className="create-page__form-group">
              <label className="create-page__form-label">Pregunta para Adultos-Mayores:</label>
              <input
                type="text"
                value={preguntaAM}
                onChange={(e) => setPreguntaAM(e.target.value)}
                required
                className="create-page__form-input"
              />
              <label className="create-page__form-label">Respuestas:</label>
              {respuestasAM.map((respuesta, index) => (
                <div key={index} className="create-page__form-group">
                  <input
                    type="text"
                    value={respuesta.texto}
                    onChange={(e) => {
                      const nuevasRespuestas = [...respuestasAM];
                      nuevasRespuestas[index].texto = e.target.value;
                      setRespuestasAM(nuevasRespuestas);
                    }}
                    className="create-page__form-input"
                  />
                  <label className="create-page__form-checkbox-label">
                    <input
                      type="checkbox"
                      checked={respuesta.es_correcta}
                      onChange={(e) => {
                        const nuevasRespuestas = [...respuestasAM];
                        nuevasRespuestas[index].es_correcta = e.target.checked;
                        setRespuestasAM(nuevasRespuestas);
                      }}
                      className="create-page__form-checkbox"
                    />
                    Correcta
                  </label>
                </div>
              ))}
              <button
                type="button"
                onClick={() => agregarRespuesta(setRespuestasAM)}
                className="create-page__button"
              >
                Agregar Respuesta
              </button>
            </div>
            <div className="create-page__form-buttons">
              <button type="submit" className="create-page__button">
                Crear Página
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}

export default CrearPagina;
