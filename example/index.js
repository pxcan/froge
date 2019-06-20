import { pxcan, pad } from 'pxcan'
import { binds } from './binds.js';
import { worldview } from './gameloop.js';
import * as gb from 'gameboy-sound';

document.body.addEventListener('keydown', () => gb.resume()); 

pxcan({ height: 60, width: 90 }, [pad(binds)], worldview()).fullscreen();
