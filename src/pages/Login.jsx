import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import './pages.css'

function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await login({ correo, password });
      console.log('Respuesta de la API:', response); // Agrega esta línea para depurar
      localStorage.setItem('token', response.token); // Almacena el token en localStorage
      navigate('/modulos'); // Redirige a la página de módulos después de iniciar sesión
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      // Manejo de errores (mostrar mensaje al usuario)
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-form-header">
          <h1 className="login-form-title">Iniciar Sesión</h1>
          <p className="login-form-subtitle">Ingrese sus datos</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form-form">
          <div className="login-form-group">
            <div className="login-form-field">
              <label htmlFor="correo" className="login-form-label">Correo</label>
              <input
                type="email"
                id="correo"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                placeholder="ejemplo@gmail.com"
                className="login-form-input"
              />
            </div>
            <div className="login-form-field">
              <div className="login-form-password">
                <label htmlFor="password" className="login-form-label">Contraseña</label>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-form-input"
              />
            </div>
          </div>
          <div className="login-form-actions">
            <div>
              <button type="submit" className="login-form-button">Iniciar Sesión</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
