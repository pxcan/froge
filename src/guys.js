import { guy } from './guy.js';
import { ROOM_WIDTH } from './const.js';
import { mid } from './math.js';
// import * as gb from 'gameboy-sound';

export const froge = guy((base) => ({
    ...base,
    w: 12,
    h: 12,
    y: 20,
    xv: 1,
    yv: -0.5,
    state: 'standing',
    brain: (() => {
        let dir = 0;
        return function() {
            if (this.rand()<0.05) dir = this.rand(-1,1);
            return {
                left: (dir === -1),
                right: (dir === 1),
                up: (this.rand()<0.005),
            };
        };
    })(),
    act(brain) {
        if (brain.left) { this.xa = -1; this.flip = 'h'; }
        else if (brain.right) { this.xa = 1; this.flip = ''; }
        else this.xa = 0;
        if (brain.up && this.isGrounded() && this.state === 'standing') {
            this.yv = -2.5;
            // gb.pulse1({ freq:gb.C5, volume:6, fade:1, duty:1, sweepFactor:3, sweepPeriod:3 })
        }
    },
    frame() {
        if (!this.isGrounded()) return 3;
        else if (this.xa === 0) return this.rand() < .1? 1: 0;
        return this.clock()%10>=5 ? 2: 0;
    },
}));

export const bird = guy((base) => ({
    ...base,
    w: 8,
    h: 8,
    ya: 0.02,
    yv: -0.4,
    yvmax: 1,
    xvmax: 1,
    brain() {
        return {
            left: (this.world.player.x < this.x - 20),
            right: (this.world.player.x > this.x + 20),
            up: (!this.world.player.isGrounded()),
        };
    },
    act(brain) {
        if (brain.right) {
            this.xa = 0.8;
            this.flip = '';
        }
        else if (brain.left) {
            this.xa = -0.8;
            this.flip = 'h';
        }
        else this.xa = 0;
        if (this.isGrounded() && brain.up) {
            this.yv = -1;
        }
    },
    frame() { return this.clock()%10>=5 ? 11: 10; },
}));

export const [bigfish, fish, squid] = [
    {
        w: 9,
        h: 5,
        xdrag: 0.01,
        ya: 0,
        firstFrame: 15,
    },
    {
        w: 6,
        h: 3,
        xdrag: 0.025,
        ya: 0,
        firstFrame: 17,
    },
    {
        w: 12,
        h: 12,
        xdrag: 0.01,
        ya: -0.01,
        firstFrame: 19,
    },
].map(aq => guy((base) => ({
    ...base,
    y: 15 + base.rand(2,10) * (base.rand() < .5 ? -1 : 1),
    xvmax: 0.5,
    ...aq,
    brain() {
        if (Math.abs(this.xv) <= this.xdrag) {
            if (this.x > ROOM_WIDTH - 10) return { left: true };
            if (this.x < 10) return { right: true };
            if (this.flip === 'h') return { left: true };
            return { right: true };
        }
        return {};
    },
    act(brain) {
        if (Math.abs(this.xv) <= this.xdrag) {
            if (brain.left) {
                this.flip = 'h';
                this.xv = -this.xvmax;
            }
            else if (brain.right) {
                this.flip = '';
                this.xv = this.xvmax;
            }
        }
        if (this.ya) {
            if (this.y < 15) this.ya = Math.abs(this.ya);
            else this.ya = -Math.abs(this.ya);
        }
    },
    frame() {
        return this.firstFrame + (Math.abs(this.xv) < 0.15? 1: 0);
    },
})));

export const rock = guy((base) => ({
    ...base,
    w: 12,
    h: 6,
    y: base.ground().height - 30,
    xfric: 0,
    brain() {
        if (this.isGrounded() && this.rand()<.01) {
            if (this.x > this.world.player.x) return { left: true };
            return { right: true };
        }
        return {};
    },
    act(brain) {
        if (this.isGrounded()) {
            if (brain.left) { this.flip = 'h'; this.xv = -0.1; }
            if (brain.right) { this.flip = ''; this.xv = 0.1; }
        }
    },
    frame() {
        if (!this.isGrounded()) return 13;
        return this.clock()%80>=60 && this.xv ? 12: 13;
    },
}));

export const spinner = guy((base) => ({
    ...base,
    w: 9,
    h: 9,
    xdrag: 0,
    xfric: 0,
    ya: 0,
    y: base.ground().height - 15,
    mode: 0,
    waitCounter: 10,
    brain: (() => {
        let dir = null;
        return function() {
            if (this.rand()<0.03) {
                dir = this.rand(['up','down','left','right']);
            }
            return { [dir]: true };
        };
    })(),
    act(brain) {
        if (this.waitCounter > 0) {
            --this.waitCounter;
            return;
        }
        if (this.mode === 0 && brain.up) this.yv = -1;
        else if (this.mode === 4 && brain.down) this.yv = 1;
        else if (this.mode === 2 && brain.right) this.xv = 1;
        else if (this.mode === 6 && brain.left) this.xv = -1;
        else {
            this.xv = 0;
            this.yv = 0;
            ++this.mode;
            if (this.mode >= 8) this.mode = 0;
            this.flip = (this.mode%4 === 3)? 'h': '';
            this.waitCounter = 10;
        }
    },
    frame() {
        if (this.mode === 0 || this.mode === 4) return 21;
        if (this.mode === 2 || this.mode === 6) return 23;
        return 22;
    },
}));

export const blink = guy((base) => ({
    ...base,
    w: 9,
    h: 9,
    xdrag: 0,
    xfric: 0,
    ya: 0,
    y: base.ground().height - 10,
    mode: 0,
    waitCounter: 0,
    brain() {
        if (this.rand()<0.01) {
            const dir1 = this.rand(['up','down']);
            const dir2 = this.rand(['left','right']);
            return { [dir1]: true, [dir2]: true };
        }
        return {};
    },
    act({ up=false, down=false, left=false, right=false }) {
        if (this.waitCounter === 34) {
            if (this.teleportX != null) this.x = this.teleportX;
            if (this.teleportY != null) this.y = this.teleportY;
            this.x = mid(this.x, 0, ROOM_WIDTH - 1);
            this.y = mid(this.y, 0, this.ground().height - this.h/2);
            this.teleportX = null;
            this.teleportY = null;
        }
        if (this.waitCounter > 0) {
            --this.waitCounter;
            return;
        }
        if (up || down || left || right) {
            this.waitCounter = 50;
            if (up) this.teleportY = this.y - 10;
            if (down) this.teleportY = this.y + 10;
            if (left) this.teleportX = this.x - 20;
            if (right) this.teleportX = this.x + 20;
        }
    },
    frame() {
        if (this.waitCounter > 46) return 25;
        if (this.waitCounter > 42) return 26;
        if (this.waitCounter > 38) return 27;
        if (this.waitCounter > 36) return 28;
        if (this.waitCounter > 32) return 29;
        if (this.waitCounter > 28) return 28;
        if (this.waitCounter > 26) return 27;
        if (this.waitCounter > 22) return 26;
        if (this.waitCounter > 18) return 25;
        return 24;
    },
}));

export const guyTypes = [
    bird,
    fish,
    bigfish,
    squid,
    rock,
    spinner,
    // blink,
];
