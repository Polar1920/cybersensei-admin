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
    const [contenido, setContenido] = useState("");
    const [pregunta, setPregunta] = useState("");
    const [respuestas, setRespuestas] = useState([]);
    const navigate = useNavigate();
    const quillRef = useRef(null);

    useEffect(() => {
        const fetchPagina = async () => {
            try {
                const pagina = await getPaginaById(paginaId);
                setNombrePagina(pagina.nombre);
                setTipoPagina(pagina.tipo);
                setOrdenPagina(pagina.orden);
                if (pagina.tipo === "quiz") {
                    const [pregunta, ...respuestas] = pagina.contenido0.split("|").map(item => {
                        if (item.startsWith("q:")) return item.slice(2);
                        const [texto, es_correcta] = item.slice(2).split(",");
                        return { texto, es_correcta: es_correcta === "true" };
                    });
                    setPregunta(pregunta);
                    setRespuestas(respuestas);
                } else {
                    setContenido(pagina.contenido0);
                }
            } catch (error) {
                console.error("Error al obtener los datos de la página:", error);
            }
        };

        fetchPagina();
    }, [paginaId]);

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

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            let contenidoAEnviar = contenido;
            if (tipoPagina === "quiz") {
                let contenidoQuiz = `q:${pregunta}`;
                respuestas.forEach((respuesta) => {
                    contenidoQuiz += `|a:${respuesta.texto},${respuesta.es_correcta}`;
                });
                contenidoAEnviar = contenidoQuiz;
            }
            await updatePagina(paginaId, {
                nombre: nombrePagina,
                orden: ordenPagina,
                contenido0: contenidoAEnviar,
                tipo: tipoPagina,
            });
            navigate(`/modulos/${moduloId}/editar`);
        } catch (error) {
            console.error("Error al actualizar la página:", error);
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
                            <label className="edit-page__form-label">Contenido:</label>
                            <ReactQuill
                                ref={quillRef}
                                value={contenido}
                                onChange={setContenido}
                                modules={modules}
                                formats={formats}
                                placeholder="Escribe aquí el contenido..."
                                className="edit-page__editor"
                            />
                        </div>
                        <div className="edit-page__form-buttons">
                            <button
                                type="button"
                                onClick={insertImage}
                                className="edit-page__button"
                            >
                                Insertar Imagen
                            </button>
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
                            <label className="edit-page__form-label">Pregunta:</label>
                            <input
                                type="text"
                                value={pregunta}
                                onChange={(e) => setPregunta(e.target.value)}
                                required
                                className="edit-page__form-input"
                            />
                        </div>
                        <div className="edit-page__form-group">
                            <h3 className="edit-page__form-label">Respuestas</h3>
                            {respuestas.map((respuesta, index) => (
                                <div key={index} className="edit-page__form-group">
                                    <label className="edit-page__form-label">Respuesta {index + 1}:</label>
                                    <input
                                        type="text"
                                        value={respuesta.texto}
                                        onChange={(e) => {
                                            const newRespuestas = [...respuestas];
                                            newRespuestas[index].texto = e.target.value;
                                            setRespuestas(newRespuestas);
                                        }}
                                        required
                                        className="edit-page__form-input"
                                    />
                                    <label className="edit-page__form-label">¿Es correcta?</label>
                                    <select
                                        value={respuesta.es_correcta ? "true" : "false"}
                                        onChange={(e) => {
                                            const newRespuestas = [...respuestas];
                                            newRespuestas[index].es_correcta = e.target.value === "true";
                                            setRespuestas(newRespuestas);
                                        }}
                                        className="edit-page__form-input"
                                    >
                                        <option value="true">Sí</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                        <div className="edit-page__form-buttons">
                            <button
                                type="button"
                                onClick={agregarRespuesta}
                                className="edit-page__button"
                            >
                                Agregar Respuesta
                            </button>
                            <button type="submit" className="edit-page__button">
                                Actualizar Pregunta
                            </button>
                        </div>
                    </form>
                ) : null}
            </div>
        </div>
    );
}

export default EditarPagina;
