import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './pages.css';

function Verify() {
    const [digit1, setDigit1] = useState('');
    const [digit2, setDigit2] = useState('');
    const [digit3, setDigit3] = useState('');
    const [digit4, setDigit4] = useState('');
    const navigate = useNavigate();

    const handlePaste = (event) => {
        const paste = event.clipboardData.getData('text');
        if (paste.length === 4) {
            setDigit1(paste[0]);
            setDigit2(paste[1]);
            setDigit3(paste[2]);
            setDigit4(paste[3]);
        }
        event.preventDefault();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const token_2FA = String(digit1) + String(digit2) + String(digit3) + String(digit4);
            console.log(token_2FA);
            const correo = localStorage.getItem('correo');
            console.log(correo);
            const response = await axios.post('http://23.27.177.187:3000/verify-2fa', { correo, token_2FA });
            console.log('Response:', response); // Log response after sending
            if (response.status === 200) {
                const { token } = response.data;
                localStorage.setItem('token', token);
                navigate('/modulos');
            }
        } catch (error) {
            console.error('Error en la verificación en dos pasos:', error);
            // Manejar errores, mostrar mensajes al usuario, etc.
        }
    };

    return (
        <div className="verify-container">
            <div className="verify-form">
                <h3 className="verify-form-title">Verificación en dos pasos</h3>
                <p className="verify-form-subtitle">Introduce el código de verificación que has recibido.</p>
                <form onSubmit={handleSubmit} className="verify-form-form">
                    <div className="verify-form-group">
                        <div className="verify-form-field">
                            <input
                                type="text"
                                value={digit1}
                                onChange={(e) => setDigit1(e.target.value)}
                                onPaste={handlePaste}
                                maxLength={1}
                                required
                                className="verify-form-input"
                                placeholder="0"
                            />
                            <input
                                type="text"
                                value={digit2}
                                onChange={(e) => setDigit2(e.target.value)}
                                maxLength={1}
                                required
                                className="verify-form-input"
                                placeholder="0"
                            />
                            <input
                                type="text"
                                value={digit3}
                                onChange={(e) => setDigit3(e.target.value)}
                                maxLength={1}
                                required
                                className="verify-form-input"
                                placeholder="0"
                            />
                            <input
                                type="text"
                                value={digit4}
                                onChange={(e) => setDigit4(e.target.value)}
                                maxLength={1}
                                required
                                className="verify-form-input"
                                placeholder="0"
                            />
                        </div>
                    </div>
                    <div className="verify-form-actions">
                        <button type="submit" className="verify-form-button">Verificar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Verify;
