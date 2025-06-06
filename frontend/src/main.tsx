import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import MainPage from '@/pages/main-page.tsx';
import {BrowserRouter, Route, Routes} from 'react-router';
import PatientPage from '@/pages/patient/patient-page.tsx';
import {Toaster} from '@/components/ui/sonner.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route index element={<MainPage/>}/>
                <Route path="patient/:id" element={<PatientPage/>}/>
            </Routes>
        </BrowserRouter>
        <Toaster/>
    </StrictMode>,
);
