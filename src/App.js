import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Modulos from './pages/Modulos';
import CrearModulo from './pages/CrearModulo';
import EditarModulo from './pages/EditarModulo';
import Paginas from './pages/Paginas';
import CrearPagina from './pages/CrearPagina';
import EditarPagina from './pages/EditarPagina';
import Login from './pages/Login';
import Verify from './pages/Verify';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    // Verifica el token al cargar la aplicación (opcional)
  }, []); // Corrección en useEffect: se agrega un array vacío como segundo argumento

  return (
    <div>
      <nav>
        <ul>
          {isLoggedIn ? (
            <>
              {/*<li><Link to="/modulos">Módulos</Link></li>*/}
              {/* ... otros enlaces para usuarios autenticados */}
            </>
          ) : (
            <li><Link to="/login">Iniciar Sesión</Link></li>
          )}
        </ul>
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/modulos" element={isLoggedIn ? <Modulos /> : <Navigate to="/login" replace />} />
        <Route path="/modulos/crear" element={isLoggedIn ? <CrearModulo /> : <Navigate to="/login" replace />} />
        <Route path="/modulos/:moduloId/editar" element={isLoggedIn ? <EditarModulo /> : <Navigate to="/login" replace />} />
        <Route path="/modulos/:moduloId/paginas" element={isLoggedIn ? <Paginas /> : <Navigate to="/login" replace />} />
        <Route path="/modulos/:moduloId/paginas/crear" element={isLoggedIn ? <CrearPagina /> : <Navigate to="/login" replace />} />
        <Route path="/modulos/:moduloId/paginas/:paginaId/editar" element={isLoggedIn ? <EditarPagina /> : <Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;