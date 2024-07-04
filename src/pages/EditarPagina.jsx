import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPaginaById, updatePagina } from "../services/api";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function EditarPagina() {
    const { moduloId, paginaId } = useParams();
    const [nombrePagina, setNombrePagina] = useState("");
    const [tipoPagina, setTipoPagina] = useState("");
    const [ordenPagina, setOrdenPagina] = useState(0);
    const [contenidoN, setContenidoN] = useState("");
    const [contenidoJA, setContenidoJA] = useState("");
    const [contenidoAM, setContenidoAM] = useState("");
    const [preguntaN, setPreguntaN] = useState("");
    const [respuestasN, setRespuestasN] = useState([]);
    const [preguntaJA, setPreguntaJA] = useState("");
    const [respuestasJA, setRespuestasJA] = useState([]);
    const [preguntaAM, setPreguntaAM] = useState("");
    const [respuestasAM, setRespuestasAM] = useState([]);
    const navigate = useNavigate();
    const quillRefN = useRef(null);
    const quillRefJA = useRef(null);
    const quillRefAM = useRef(null);

    useEffect(() => {
        const fetchPagina = async () => {
            try {
                const pagina = await getPaginaById(paginaId);
                setNombrePagina(pagina.nombre);
                setTipoPagina(pagina.tipo);
                setOrdenPagina(pagina.orden);
                if (pagina.tipo === "quiz") {
                    const [preguntaN, ...respuestasN] = pagina.contenido0.split("|").map(item => {
                        if (item.startsWith("q:")) return item.slice(2);
                        const [texto, es_correcta] = item.slice(2).split(",");
                        return { texto, es_correcta: es_correcta === "true" };
                    });
                    setPreguntaN(preguntaN);
                    setRespuestasN(respuestasN);

                    const [preguntaJA, ...respuestasJA] = pagina.contenido1.split("|").map(item => {
                        if (item.startsWith("q:")) return item.slice(2);
                        const [texto, es_correcta] = item.slice(2).split(",");
                        return { texto, es_correcta: es_correcta === "true" };
                    });
                    setPreguntaJA(preguntaJA);
                    setRespuestasJA(respuestasJA);

                    const [preguntaAM, ...respuestasAM] = pagina.contenido2.split("|").map(item => {
                        if (item.startsWith("q:")) return item.slice(2);
                        const [texto, es_correcta] = item.slice(2).split(",");
                        return { texto, es_correcta: es_correcta === "true" };
                    });
                    setPreguntaAM(preguntaAM);
                    setRespuestasAM(respuestasAM);
                } else {
                    setContenidoN(pagina.contenido0);
                    setContenidoJA(pagina.contenido1);
                    setContenidoAM(pagina.contenido2);
                }
            } catch (error) {
                console.error("Error al obtener los datos de la página:", error);
            }
        };

        fetchPagina();
    }, [paginaId]);

    const agregarRespuesta = (setRespuestas) => {
        const nuevaRespuesta = { texto: "", es_correcta: false };
        setRespuestas(prevRespuestas => [...prevRespuestas, nuevaRespuesta]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            let contenido0Enviar = contenidoN;
            let contenido1Enviar = contenidoJA;
            let contenido2Enviar = contenidoAM;

            if (tipoPagina === "quiz") {
                contenido0Enviar = generarContenidoQuiz(preguntaN, respuestasN);
                contenido1Enviar = generarContenidoQuiz(preguntaJA, respuestasJA);
                contenido2Enviar = generarContenidoQuiz(preguntaAM, respuestasAM);
            }

            await updatePagina(paginaId, {
                nombre: nombrePagina,
                modulo_id: moduloId,
                orden: ordenPagina,
                contenido0: contenido0Enviar,
                contenido1: contenido1Enviar,
                contenido2: contenido2Enviar,
                tipo: tipoPagina,
            });

            navigate(`/modulos/${moduloId}/editar`);
        } catch (error) {
            console.error("Error al actualizar la página:", error);
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
        <div className="edit-page">
            <h2 className="edit-page__title">Editar Página</h2>
            <div className="edit-page__content">
                {tipoPagina === "informacion" ? (
                    <form onSubmit={handleSubmit} className="edit-page__form">
                        <div className="edit-page__form-group">
                            <label className="edit-page__form-label">Nombre de la Página:</label>
                            <input
                                type="text"
                                value={nombrePagina}
                                onChange={(e) => setNombrePagina(e.target.value)}
                                required
                                className="edit-page__form-input"
                            />
                        </div>
                        <div className="edit-page__form-group">
                            <label className="edit-page__form-label">Página #{ordenPagina}</label>
                        </div>
                        <div className="edit-page__form-group">
                            <label className="edit-page__form-label">Contenido para Niños:</label>
                            <ReactQuill
                                ref={quillRefN}
                                value={contenidoN}
                                onChange={setContenidoN}
                                modules={modules}
                                formats={formats}
                                placeholder="Escribe aquí el contenido para niños..."
                                className="edit-page__editor"
                            />
                        </div>
                        <div className="edit-page__form-group">
                            <label className="edit-page__form-label">Contenido para Jóvenes-Adultos:</label>
                            <ReactQuill
                                ref={quillRefJA}
                                value={contenidoJA}
                                onChange={setContenidoJA}
                                modules={modules}
                                formats={formats}
                                placeholder="Escribe aquí el contenido para jóvenes-adultos..."
                                className="edit-page__editor"
                            />
                        </div>
                        <div className="edit-page__form-group">
                            <label className="edit-page__form-label">Contenido para Adultos-Mayores:</label>
                            <ReactQuill
                                ref={quillRefAM}
                                value={contenidoAM}
                                onChange={setContenidoAM}
                                modules={modules}
                                formats={formats}
                                placeholder="Escribe aquí el contenido para adultos mayores..."
                                className="edit-page__editor"
                            />
                        </div>
                        <div className="edit-page__form-buttons">
                            <button type="submit" className="edit-page__button">
                                Actualizar Página
                            </button>
                        </div>
                    </form>
                ) : tipoPagina === "quiz" ? (
                    <form onSubmit={handleSubmit} className="edit-page__form">
                        <div className="edit-page__form-group">
                            <label className="edit-page__form-label">Nombre de la Página:</label>
                            <input
                                type="text"
                                value={nombrePagina}
                                onChange={(e) => setNombrePagina(e.target.value)}
                                required
                                className="edit-page__form-input"
                            />
                        </div>
                        <div className="edit-page__form-group">
                            <label className="edit-page__form-label">Página #{ordenPagina}</label>
                        </div>
                        <div className="edit-page__form-group">
                            <label className="edit-page__form-label">Pregunta para Niños:</label>
                            <input
                                type="text"
                                value={preguntaN}
                                onChange={(e) => setPreguntaN(e.target.value)}
                                required
                                className="edit-page__form-input"
                            />
                            <label className="edit-page__form-label">Respuestas:</label>
                            {respuestasN.map((respuesta, index) => (
                                <div key={index} className="edit-page__form-group">
                                    <input
                                        type="text"
                                        value={respuesta.texto}
                                        onChange={(e) => {
                                            const nuevasRespuestas = [...respuestasN];
                                            nuevasRespuestas[index].texto = e.target.value;
                                            setRespuestasN(nuevasRespuestas);
                                        }}
                                        className="edit-page__form-input"
                                    />
                                    <label className="edit-page__form-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={respuesta.es_correcta}
                                            onChange={(e) => {
                                                const nuevasRespuestas = [...respuestasN];
                                                nuevasRespuestas[index].es_correcta = e.target.checked;
                                                setRespuestasN(nuevasRespuestas);
                                            }}
                                            className="edit-page__form-checkbox"
                                        />
                                        Correcta
                                    </label>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => agregarRespuesta(setRespuestasN)}
                                className="edit-page__button"
                            >
                                Agregar Respuesta
                            </button>
                        </div>
                        <div className="edit-page__form-group">
                            <label className="edit-page__form-label">Pregunta para Jóvenes-Adultos:</label>
                            <input
                                type="text"
                                value={preguntaJA}
                                onChange={(e) => setPreguntaJA(e.target.value)}
                                required
                                className="edit-page__form-input"
                            />
                            <label className="edit-page__form-label">Respuestas:</label>
                            {respuestasJA.map((respuesta, index) => (
                                <div key={index} className="edit-page__form-group">
                                    <input
                                        type="text"
                                        value={respuesta.texto}
                                        onChange={(e) => {
                                            const nuevasRespuestas = [...respuestasJA];
                                            nuevasRespuestas[index].texto = e.target.value;
                                            setRespuestasJA(nuevasRespuestas);
                                        }}
                                        className="edit-page__form-input"
                                    />
                                    <label className="edit-page__form-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={respuesta.es_correcta}
                                            onChange={(e) => {
                                                const nuevasRespuestas = [...respuestasJA];
                                                nuevasRespuestas[index].es_correcta = e.target.checked;
                                                setRespuestasJA(nuevasRespuestas);
                                            }}
                                            className="edit-page__form-checkbox"
                                        />
                                        Correcta
                                    </label>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => agregarRespuesta(setRespuestasJA)}
                                className="edit-page__button"
                            >
                                Agregar Respuesta
                            </button>
                        </div>
                        <div className="edit-page__form-group">
                            <label className="edit-page__form-label">Pregunta para Adultos-Mayores:</label>
                            <input
                                type="text"
                                value={preguntaAM}
                                onChange={(e) => setPreguntaAM(e.target.value)}
                                required
                                className="edit-page__form-input"
                            />
                            <label className="edit-page__form-label">Respuestas:</label>
                            {respuestasAM.map((respuesta, index) => (
                                <div key={index} className="edit-page__form-group">
                                    <input
                                        type="text"
                                        value={respuesta.texto}
                                        onChange={(e) => {
                                            const nuevasRespuestas = [...respuestasAM];
                                            nuevasRespuestas[index].texto = e.target.value;
                                            setRespuestasAM(nuevasRespuestas);
                                        }}
                                        className="edit-page__form-input"
                                    />
                                    <label className="edit-page__form-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={respuesta.es_correcta}
                                            onChange={(e) => {
                                                const nuevasRespuestas = [...respuestasAM];
                                                nuevasRespuestas[index].es_correcta = e.target.checked;
                                                setRespuestasAM(nuevasRespuestas);
                                            }}
                                            className="edit-page__form-checkbox"
                                        />
                                        Correcta
                                    </label>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => agregarRespuesta(setRespuestasAM)}
                                className="edit-page__button"
                            >
                                Agregar Respuesta
                            </button>
                        </div>
                        <div className="edit-page__form-buttons">
                            <button type="submit" className="edit-page__button">
                                Actualizar Página
                            </button>
                        </div>
                    </form>
                ) : null}
            </div>
        </div>
    );
}

export default EditarPagina;
