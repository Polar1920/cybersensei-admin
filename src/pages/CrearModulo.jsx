import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createModulo } from '../services/api';

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
        <div>
            <h2>Crear Nuevo Módulo</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="nombre">Nombre:</label>
                    <input
                        type="text"
                        id="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="descripcion">Descripción:</label>
                    <textarea
                        id="descripcion"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="imagen">Imagen:</label>
                    <input
                        type="file"
                        id="imagen"
                        onChange={(e) => setImagen(e.target.files[0])}
                        accept="image/*"
                    />
                </div>
                <button type="submit">Crear Módulo</button>
            </form>
        </div>
    );
}

export default CrearModulo;
