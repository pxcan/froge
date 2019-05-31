import { pxcan, pad } from 'pxcan'
import { binds } from './binds.js';
import { worldview } from './gameloop.js';

pxcan({ height: 60, width: 90 }, [pad(binds)], worldview()).fullscreen();
