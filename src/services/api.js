import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Ajusta si tu API está en otro puerto

const api = axios.create({
    baseURL: API_URL,
});

// Función para agregar el token JWT a las solicitudes
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Funciones para interactuar con la API
export const login = async (credentials) => {
    try {
        const response = await api.post('/login', credentials);
        return response.data; // Retorna directamente el objeto de datos de la respuesta
    } catch (error) {
        throw error.response?.data || { message: 'Error desconocido en el servidor' }; // Manejo de error más detallado
    }
};

export const createModulo = async (moduloData) => {
    try {
        const response = await api.post('/modulos', moduloData);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const getModulos = async () => {
    try {
        const response = await api.get('/modulos'); // Realiza la solicitud GET a la API
        return response.data; // Retorna los datos de la respuesta (array de módulos)
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener módulos' }; // Maneja errores
    }
};

export const updateModulo = async (id, moduloData) => {
    try {
        const response = await api.put(`/modulos/${id}`, moduloData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al actualizar módulo' };
    }
};

export const getModuloById = async (id) => {
    try {
        const response = await api.get(`/modulos/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener módulo' };
    }
};

export const getPaginasByModuloId = async (moduloId) => {
    try {
        const response = await api.get(`/modulos/${moduloId}/paginas`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener páginas' };
    }
};

export const createPagina = async (paginaData) => {
    try {
        const response = await api.post('/paginas', paginaData);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const getUltimoOrdenPaginaPorModuloId = async (moduloId) => {
    try {
        const response = await api.get(`/modulos/${moduloId}/paginas`);
        const paginas = response.data;

        // Filtra las páginas que pertenecen al módulo especificado
        const paginasDelModulo = paginas.filter(pagina => pagina.modulo_id == moduloId);

        if (paginasDelModulo.length === 0) {
            return 0; // Si no hay páginas para ese módulo, el orden será 0
        } else {
            // Encuentra el orden más alto entre las páginas del módulo
            const ultimoOrden = paginasDelModulo.reduce((max, pagina) => (pagina.orden > max ? pagina.orden : max), 0);
            return ultimoOrden + 1; // Devuelve el siguiente número de orden
        }
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener el último orden de página por módulo' };
    }
};

export const getPaginaById = async (id) => {
    try {
        const response = await api.get(`/paginas/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener módulo' };
    }
};

export const updatePagina = async (id, paginaData) => {
    try {
        const response = await api.put(`/paginas/${id}`, paginaData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al actualizar página' };
    }
};
