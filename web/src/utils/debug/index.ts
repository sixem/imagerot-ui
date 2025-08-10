import { debug } from 'debug';

if (import.meta.env.MODE === 'development') {
    debug.enabled('app:*');
}

export { debug };
