import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ImageRot from './ImageRot.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ImageRot />
    </StrictMode>
);
