import { useEffect, useState } from 'react';
import { storage } from '@/utils/storage';

export function useStoredState<T>(key: string, initial: T) {
    const [value, setValue] = useState<T>(initial);

    useEffect(() => {
        let alive = true;
        
        (async () => {
            const saved = await storage.get<T>(key);
            
            if (alive && saved !== undefined) {
                setValue(saved);
            }
        })();

        return () => { alive = false; };
    }, [key]);

    useEffect(() => { storage.set(key, value) }, [key, value]);

    return [value, setValue] as const;
}