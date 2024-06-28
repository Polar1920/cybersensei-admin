import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { updateModulo, getModuloById, getPaginasByModuloId } from '../services/api';
import './pages.css'

function EditarModulo() {
    const { moduloId } = useParams();
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [imagen, setImagen] = useState(null);
    const [paginas, setPaginas] = useState([]);
    const [imagenUrl, setImagenUrl] = useState(''); // Estado para almacenar la URL de la imagen
    const navigate = useNavigate();

    useEffect(() => {
        const fetchModulo = async () => {
            try {
                const modulo = await getModuloById(moduloId);
                setNombre(modulo.nombre);
                setDescripcion(modulo.descripcion);
                setImagenUrl(modulo.imagen); // Almacenar la URL de la imagen actual
                const paginasData = await getPaginasByModuloId(moduloId);
                setPaginas(paginasData);
            } catch (error) {
                console.error('Error al obtener el módulo:', error);
            }
        };

        fetchModulo();
    }, [moduloId]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            if (imagen) { // Verificar si hay una nueva imagen seleccionada
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
                await updateModulo(moduloId, { nombre, descripcion, imagen: imagenUrl }); // Mantener la URL actual si no se selecciona una nueva imagen
                navigate('/modulos');
            }
        } catch (error) {
            console.error('Error al actualizar el módulo:', error);
        }
    };

    return (
        <div className='module-edit'>
            <h2 className='module-edit__title'>Editar Módulo</h2>
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

            {/* Mostrar la imagen actual si existe */}
            {imagenUrl && (
                <div className='module-edit__current-image'>
                    <h3 className='module-edit__current-image-title'>Imagen Actual</h3>
                    <img className='module-edit__image' src={imagenUrl} alt="Imagen Actual" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                </div>
            )}

            <h3 className='module-edit__pages-title'>Páginas del Módulo</h3>
            <button className='module-edit__create-page' onClick={() => navigate(`/modulos/${moduloId}/paginas/crear`)}>Crear Nueva Página</button>
            <ul className='module-edit__pages-list'>
                {paginas.map((pagina) => (
                    <li key={pagina.id} className='module-edit__page-item'>
                        <Link to={`/modulos/${moduloId}/paginas/${pagina.id}/editar`} className='module-edit__page-link'>{pagina.nombre}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default EditarModulo;
