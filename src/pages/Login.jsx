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
    <div class="login-container">
      <div class="login-form">
        <div class="login-form-header">
          <h1 class="login-form-title">Iniciar Sesión</h1>
          <p class="login-form-subtitle">Ingrese sus datos</p>
        </div>
        <form onSubmit={handleSubmit} class="login-form-form">
          <div class="login-form-group">
            <div class="login-form-field">
              <label htmlFor="correo" class="login-form-label">Correo</label>
              <input
                type="email"
                id="correo"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                placeholder="ejemplo@gmail.com"
                class="login-form-input"
              />
            </div>
            <div class="login-form-field">
              <div class="login-form-password">
                <label htmlFor="password" class="login-form-label">Contraseña</label>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                class="login-form-input"
              />
            </div>
          </div>
          <div class="login-form-actions">
            <div>
              <button type="submit" class="login-form-button">Iniciar Sesión</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
