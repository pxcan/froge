import { pxcan, pad, pointer } from 'pxcan'
import { binds } from './binds.js';
import { worldview } from './gameloop.js';
import * as gb from 'gameboy-sound';

document.body.addEventListener('keydown', () => gb.allow()); 
document.body.addEventListener('touchstart', () => gb.allow()); 

const { canvas } = pxcan({ height: 60, width: 90 }, [pad(binds), pointer()], worldview());
document.body.appendChild(canvas);

document.querySelector('html').style.height = '100%'
document.body.style.cssText = `
margin:0;
height:100%;
background-color:black;
overflow:hidden
`;

if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
    // due to a firefox bug that causes the canvas "edges" to flicker,
    // we do fullscreen differently
    canvas.style.width = '100vmin';
    canvas.style.height = '100vmin';
    canvas.style.margin = 'auto';
} else {
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.objectFit = 'contain';
    canvas.style.objectPosition = 'center top';
}
canvas.style.display = 'block';
canvas.style.touchAction = 'none';
canvas.focus();

