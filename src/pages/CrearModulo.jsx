import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createModulo } from '../services/api';
import './pages.css'

function CrearModulo() {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const navigate = useNavigate(); // Hook para navegar a otras rutas
    const [imagen, setImagen] = useState(null); // Estado para almacenar el archivo de imagen

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const formData = new FormData();
            formData.append('image', imagen); // Agrega la imagen al FormData
            formData.append('key', 'f4aae0b2cc8a3351c09bebb9e5c452fc'); // Agrega tu clave de API de ImgBB

            // Sube la imagen a ImgBB
            const imgbbResponse = await fetch('https://api.imgbb.com/1/upload', {
                method: 'POST',
                body: formData,
            });
            const imgbbData = await imgbbResponse.json();

            if (imgbbResponse.ok) {
                // Si la subida fue exitosa, crea el módulo con la URL de la imagen
                await createModulo({ nombre, descripcion, imagen: imgbbData.data.url });
                navigate('/modulos');
            } else {
                console.error('Error al subir la imagen a ImgBB:', imgbbData.error.message);
                // Manejo de errores
            }
        } catch (error) {
            console.error('Error al crear módulo:', error);
        }
    };

    return (
        <div className='module-form'>
            <h2 className='module-form__title'>Crear Nuevo Módulo</h2>
            <form className='module-form__form' onSubmit={handleSubmit}>
                <div className='module-form__group'>
                    <label className='module-form__label' htmlFor="nombre">Nombre:</label>
                    <input
                        type="text"
                        id="nombre"
                        className='module-form__input'
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                </div>
                <div className='module-form__group'>
                    <label className='module-form__label' htmlFor="descripcion">Descripción:</label>
                    <textarea
                        id="descripcion"
                        className='module-form__textarea'
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    />
                </div>
                <div className='module-form__group'>
                    <label className='module-form__label' htmlFor="imagen">Imagen:</label>
                    <input
                        type="file"
                        id="imagen"
                        className='module-form__input-file'
                        onChange={(e) => setImagen(e.target.files[0])}
                        accept="image/*"
                    />
                </div>
                <button className='module-form__submit' type="submit">Crear Módulo</button>
            </form>
        </div>
    );
}

export default CrearModulo;
