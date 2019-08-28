import { pxcan, pad, pointer } from 'pxcan'
import { binds } from './binds.js';
import { worldview } from './gameloop.js';
import * as gb from 'gameboy-sound';

document.body.addEventListener('keydown', () => gb.resume()); 
document.body.addEventListener('touchstart', () => gb.resume()); 

pxcan({ height: 60, width: 90 }, [pad(binds), pointer()], worldview()).fullscreen();
