import { sheets } from './sheets';
import { getRoom, GROUND_WIDTH, ROOM_WIDTH } from './rooms';
import { mid, clamp } from './math';
const guysSheet = sheets.find(s => s.name === 'guys');

const nextId = (function() {
    let i = 0;
    return () => `guy${i++}`;
}());

const base = {
    world: null,
    roomNum: null,
    w: 12,
    h: 12,
    x: null,
    y: 20,
    xv: 0,
    yv: 0,
    xa: 0,
    ya: 0.15,
    xfric: 0.5,
    xdrag: 0.1,
    xvmax: 2,
    yvmax: 4,
    flip: '',
    // behavior
    brain: () => ({}),
    act: () => undefined,
    frame: () => 0,
    // methods
    left() { return this.x - this.w/2; },
    right() { return this.x + this.w/2; },
    top() { return this.y - this.h/2; },
    bottom() { return this.y + this.h/2; },
    room() { return getRoom(this.world, this.roomNum); },
    groundIndex() { return Math.floor(this.x / GROUND_WIDTH); },
    ground() { return this.room().ground[this.groundIndex()]; },
    isGrounded() { return this.ground().height === this.bottom(); },
    clock() { return this.world.clock; },
    move() {
        // velocity
        this.xv += this.xa;
        const xslow = this.isGrounded()? this.xfric: this.xdrag;
        this.xv = mid(0, this.xv, this.xv-(xslow*Math.sign(this.xv)));
        this.xv = clamp(this.xv, this.xvmax);
        this.yv = Math.max(this.yv + this.ya, -this.yvmax);
        // move x
        const oldx = this.x;
        const wasg = this.isGrounded();
        this.x = mid(this.x + this.xv, 0, ROOM_WIDTH - 1);
        const newg = this.ground();
        if (newg.height < this.bottom() - 3) { this.x = oldx; this.xv = 0; }
        // move y
        this.y = Math.max(this.y + this.yv, 0);
        if (wasg && this.yv > 0 && this.bottom() > this.ground().height - 3) {
            this.y = this.ground().height - this.h/2;
            this.yv = 0;
        }
        else if (this.yv > 0 && this.bottom() > this.ground().height) {
            this.y = this.ground().height - this.h/2;
            this.yv = 0;
        }
    },
    sprite() {
        return {
            key: this.id,
            sheet: guysSheet,
            sprite: this.frame(this.clock()),
            x: this.x,
            y: this.y,
            flip: this.flip,
        };
    },
};

export function guy(froge) {
    return (overrides) => {
        if (overrides.x == null) throw new Error('Missing guy param: x');
        if (overrides.roomNum == null) throw new Error('Missing guy param: roomNum');
        if (overrides.rand == null) throw new Error('Missing guy param: rand');
        if (overrides.world == null) throw new Error('Missing guy param: world');

        const skeleton = {
            ...base,
            id: nextId(),
            ...overrides,
        };
        return {
            ...skeleton,
            ...froge(skeleton),
            ...overrides,
        };
    };
}
