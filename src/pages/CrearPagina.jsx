import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPagina, getUltimoOrdenPaginaPorModuloId } from '../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Importar estilos base de Quill

function CrearPagina() {
    const { moduloId } = useParams();
    const [tipoPagina, setTipoPagina] = useState('');
    const [ordenPagina, setOrdenPagina] = useState(0);
    const [contenido, setContenido] = useState(''); // Estado del contenido Quill
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
            await createPagina({ modulo_id: moduloId, orden: ordenPagina, contenido: contenido, tipo: tipoPagina });
            navigate(`/modulos/${moduloId}`);
        } catch (error) {
            console.error('Error al crear página:', error);
        }
    };

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
                        <ReactQuill
                            value={contenido}
                            onChange={setContenido}
                            placeholder="Escribe aquí el contenido..."
                        />
                    </div>
                    <button type="submit">Crear Página</button>
                </form>
            )}
        </div>
    );
}

export default CrearPagina;
