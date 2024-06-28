import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPagina, getUltimoOrdenPaginaPorModuloId } from '../services/api';
import { Editor, EditorState, RichUtils, convertToRaw, AtomicBlockUtils, CompositeDecorator } from 'draft-js';
import 'draft-js/dist/Draft.css'; // Importar estilos base de Draft.js

function CrearPagina() {
    const { moduloId } = useParams();
    const [tipoPagina, setTipoPagina] = useState('');
    const [ordenPagina, setOrdenPagina] = useState(0);
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty()); // Estado del editor Draft.js
    const [seleccionado, setSeleccionado] = useState(false); // Estado para controlar si se ha seleccionado un tipo de página
    const navigate = useNavigate(); // Hook para navegar a otras rutas

    useEffect(() => {
        const fetchUltimoOrdenPagina = async () => {
            try {
                const ultimoOrden = await getUltimoOrdenPaginaPorModuloId(moduloId);
                setOrdenPagina(ultimoOrden + 1);
            } catch (error) {
                console.error('Error al obtener el último orden de página:', error);
            }
        };

        fetchUltimoOrdenPagina();
    }, [moduloId]);

    const handleTipoPaginaSelect = (tipo) => {
        setTipoPagina(tipo);
        setSeleccionado(true); // Marcar como seleccionado al elegir un tipo de página
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            // Convertir el contenido del editor a formato JSON para guardar en la base de datos
            const contentState = editorState.getCurrentContent();
            const rawContentState = convertToRaw(contentState);
            const jsonContent = JSON.stringify(rawContentState);

            await createPagina({ modulo_id: moduloId, orden: ordenPagina, contenido: jsonContent, tipo: tipoPagina });
            navigate(`/modulos/${moduloId}`);
        } catch (error) {
            console.error('Error al crear página:', error);
        }
    };

    const handleEditorChange = (newEditorState) => {
        setEditorState(newEditorState);
    };

    // Función para manejar el formato del texto en el editor
    const handleKeyCommand = (command) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            handleEditorChange(newState);
            return 'handled';
        }
        return 'not-handled';
    };

    // Función para aplicar estilos al texto seleccionado
    const toggleInlineStyle = (style) => {
        handleEditorChange(RichUtils.toggleInlineStyle(editorState, style));
    };

    // Función para cambiar el tipo de bloque de texto
    const toggleBlockType = (blockType) => {
        handleEditorChange(RichUtils.toggleBlockType(editorState, blockType));
    };

    // Función para insertar una imagen por URL
    const insertImage = (url) => {
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity('IMAGE', 'IMMUTABLE', { src: url });
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
        setEditorState(
            AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ')
        );
    };

    // Función para insertar un video por URL
    const insertVideo = (url) => {
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity('VIDEO', 'IMMUTABLE', { src: url });
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
        setEditorState(
            AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ')
        );
    };

    // Componente de previsualización de imagen
    const ImageComponent = ({ contentState, entity }) => {
        const { src } = contentState.getEntity(entity).getData();
        return <img src={src} alt="Imágen insertada" style={{ maxWidth: '100%' }} />;
    };

    // Componente de previsualización de video
    const VideoComponent = ({ contentState, entity }) => {
        const { src } = contentState.getEntity(entity).getData();
        return (
            <video controls style={{ maxWidth: '100%' }}>
                <source src={src} type="video/mp4" />
                Tu navegador no soporta el video.
            </video>
        );
    };

    // Decorator para renderizar entidades personalizadas (imagen y video)
    const decorator = new CompositeDecorator([
        {
            strategy: (contentBlock, callback) => {
                contentBlock.findEntityRanges(
                    (character) => {
                        const entityKey = character.getEntity();
                        return (
                            entityKey !== null &&
                            contentState.getEntity(entityKey).getType() === 'IMAGE'
                        );
                    },
                    callback
                );
            },
            component: (props) => <ImageComponent {...props} contentState={editorState.getCurrentContent()} />,
        },
        {
            strategy: (contentBlock, callback) => {
                contentBlock.findEntityRanges(
                    (character) => {
                        const entityKey = character.getEntity();
                        return (
                            entityKey !== null &&
                            contentState.getEntity(entityKey).getType() === 'VIDEO'
                        );
                    },
                    callback
                );
            },
            component: (props) => <VideoComponent {...props} contentState={editorState.getCurrentContent()} />,
        },
    ]);

    // Barra de herramientas con estilos, tipos de bloque, imágenes y videos
    const Toolbar = () => (
        <div className="toolbar">
            <button onClick={() => toggleInlineStyle('BOLD')}>Bold</button>
            <button onClick={() => toggleInlineStyle('ITALIC')}>Italic</button>
            <button onClick={() => toggleInlineStyle('UNDERLINE')}>Underline</button>
            <button onClick={() => toggleBlockType('header-one')}>Header 1</button>
            <button onClick={() => toggleBlockType('header-two')}>Header 2</button>
            <button onClick={() => toggleBlockType('header-three')}>Header 3</button>
            <button onClick={() => toggleBlockType('unordered-list-item')}>Unordered List</button>
            <button onClick={() => toggleBlockType('ordered-list-item')}>Ordered List</button>
            <button onClick={() => {
                const url = window.prompt('Enter the URL of the image:');
                if (url) {
                    insertImage(url);
                }
            }}>Insert Image</button>
            <button onClick={() => {
                const url = window.prompt('Enter the URL of the video:');
                if (url) {
                    insertVideo(url);
                }
            }}>Insert Video</button>
        </div>
    );

    // Renderizado condicional para mostrar el selector de tipo de página o el formulario de creación
    return (
        <div>
            <h2>Crear Nueva Página</h2>
            {!seleccionado ? (
                <div>
                    <h3>Selecciona el Tipo de Página:</h3>
                    <div className="tipo-pagina-selector">
                        <div onClick={() => handleTipoPaginaSelect('inicio')} className="tipo-pagina-item">
                            Inicio
                        </div>
                        <div onClick={() => handleTipoPaginaSelect('informacion')} className="tipo-pagina-item">
                            Información
                        </div>
                        <div onClick={() => handleTipoPaginaSelect('quiz')} className="tipo-pagina-item">
                            Quiz
                        </div>
                        <div onClick={() => handleTipoPaginaSelect('prueba')} className="tipo-pagina-item">
                            Prueba
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Orden de Página:</label>
                        <input
                            type="number"
                            value={ordenPagina}
                            readOnly
                        />
                    </div>
                    <div>
                        <label>Contenido:</label>
                        <Toolbar /> {/* Barra de herramientas */}
                        <div className="editor-container">
                            <Editor
                                editorState={editorState}
                                onChange={handleEditorChange}
                                handleKeyCommand={handleKeyCommand}
                                placeholder="Escribe aquí el contenido..."
                                customDecorators={decorator} // Aplicar el decorador con los componentes de imagen y video
                                contentState={editorState.getCurrentContent()} // Asegurando que contentState esté disponible
                            />
                        </div>
                    </div>
                    <button type="submit">Crear Página</button>
                </form>
            )}
        </div>
    );
}

export default CrearPagina;
