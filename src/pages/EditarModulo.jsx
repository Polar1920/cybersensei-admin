import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { updateModulo, getModuloById, getPaginasByModuloId, updatePagina } from '../services/api';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './pages.css';

const ItemType = 'PAGE';

const DraggablePage = ({ pagina, index, movePage }) => {
    const ref = React.useRef(null);
    const [, drop] = useDrop({
        accept: ItemType,
        hover(item) {
            if (item.index !== index) {
                movePage(item.index, index);
                item.index = index;
            }
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: ItemType,
        item: { id: pagina.id, index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    drag(drop(ref));

    return (
        <div ref={ref} className='module-edit__page-item' style={{ opacity: isDragging ? 0.5 : 1 }}>
            <Link to={`/modulos/${pagina.modulo_id}/paginas/${pagina.id}/editar`} className='module-edit__page-link'>
                {pagina.nombre}
            </Link>
        </div>
    );
};

function EditarModulo() {
    const { moduloId } = useParams();
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [imagen, setImagen] = useState(null);
    const [paginas, setPaginas] = useState([]);
    const [imagenUrl, setImagenUrl] = useState('');
    const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchModulo = async () => {
            try {
                const modulo = await getModuloById(moduloId);
                setNombre(modulo.nombre);
                setDescripcion(modulo.descripcion);
                setImagenUrl(modulo.imagen);
                const paginasData = await getPaginasByModuloId(moduloId);
                setPaginas(paginasData.sort((a, b) => a.orden - b.orden));
            } catch (error) {
                console.error('Error al obtener el módulo:', error);
            }
        };

        fetchModulo();
    }, [moduloId]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            if (imagen) {
                const formData = new FormData();
                formData.append('image', imagen);
                formData.append('key', 'f4aae0b2cc8a3351c09bebb9e5c452fc');

                const imgbbResponse = await fetch('https://api.imgbb.com/1/upload', {
                    method: 'POST',
                    body: formData,
                });
                const imgbbData = await imgbbResponse.json();
 
                if (imgbbResponse.ok) {
                    await updateModulo(moduloId, { nombre, descripcion, imagen: imgbbData.data.url });
                    navigate('/modulos');
                } else {
                    console.error('Error al subir la imagen a ImgBB:', imgbbData.error.message);
                }
            } else {
                await updateModulo(moduloId, { nombre, descripcion, imagen: imagenUrl });
                navigate('/modulos');
            }
        } catch (error) {
            console.error('Error al actualizar el módulo:', error);
        }
    };

    const toggleFormVisibility = () => {
        setShowForm(!showForm);
    };

    const movePage = (fromIndex, toIndex) => {
        const updatedPaginas = Array.from(paginas);
        const [removed] = updatedPaginas.splice(fromIndex, 1);
        updatedPaginas.splice(toIndex, 0, removed);
        setPaginas(updatedPaginas);
        savePageOrder(updatedPaginas);
    };

    const savePageOrder = async (updatedPaginas) => {
        try {
            for (let i = 0; i < updatedPaginas.length; i++) {
                const pagina = updatedPaginas[i];
                await updatePagina(pagina.id, { ...pagina, orden: i + 1 });
            }
            toast.success('¡Reordenamiento exitoso!', {
                position: toast.POSITION.TOP_RIGHT,
                autoClose: 3000,
            });
        } catch (error) {
            console.error('Error al guardar el orden de las páginas:', error);
        }
    };

    return (
        <div className='module-edit'>
            {imagenUrl && (
                <div className='module-edit__current-image'>
                    <h2 className='module-edit__title'>{nombre}</h2>
                    <img className='module-edit__image' src={imagenUrl} alt="Imagen Actual" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                    <button className='module-edit__toggle-form' onClick={toggleFormVisibility}>
                        {showForm ? 'Ocultar Formulario' : 'Editar Módulo'}
                    </button>
                </div>
            )}

            {showForm && (
                <form className='module-edit__form' onSubmit={handleSubmit}>
                    <div className='module-edit__group'>
                        <label className='module-edit__label' htmlFor="nombre">Nombre:</label>
                        <input
                            type="text"
                            id="nombre"
                            className='module-edit__input'
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                    </div>
                    <div className='module-edit__group'>
                        <label className='module-edit__label' htmlFor="descripcion">Descripción:</label>
                        <textarea
                            id="descripcion"
                            className='module-edit__textarea'
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                        />
                    </div>
                    <div className='module-edit__group'>
                        <label className='module-edit__label' htmlFor="imagen">Imagen:</label>
                        <input
                            type="file"
                            id="imagen"
                            className='module-edit__input-file'
                            onChange={(e) => setImagen(e.target.files[0])}
                            accept="image/*"
                        />
                    </div>
                    <button className='module-edit__submit' type="submit">Actualizar Módulo</button>
                </form>
            )}

            <div className='module-edit__details'>
                <p className='module-edit__description'>{descripcion}</p>
                <h3 className='module-edit__pages-title'>Páginas del Módulo</h3>
                <button className='module-edit__create-page' onClick={() => navigate(`/modulos/${moduloId}/paginas/crear`)}>
                    Crear Nueva Página
                </button>
                <DndProvider backend={HTML5Backend}>
                    <div className='module-edit__pages-list'>
                        {paginas.map((pagina, index) => (
                            <DraggablePage key={pagina.id} pagina={pagina} index={index} movePage={movePage} />
                        ))}
                    </div>
                </DndProvider>
            </div>

            <ToastContainer />
        </div>
    );
}

export default EditarModulo;
