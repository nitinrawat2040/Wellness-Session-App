import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SimpleTest from './pages/SimpleTest';
import TestRoute from './pages/TestRoute';

const AppMinimal = () => {
    return (
        <div className="App">
            <h1 style={{ textAlign: 'center', padding: '20px' }}>Minimal App Test</h1>
            <Routes>
                <Route path="/simple" element={<SimpleTest />} />
                <Route path="/test" element={<TestRoute />} />
                <Route path="/" element={<Navigate to="/simple" replace />} />
                <Route path="*" element={<Navigate to="/simple" replace />} />
            </Routes>
        </div>
    );
};

export default AppMinimal; 