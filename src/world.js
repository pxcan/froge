import { froge } from './guys.js';
import { rand } from './rand.js';
import { makeRoom } from './rooms.js'

function createPlayer(world) {
    const color = '#' + (Math.random() * (2**24) | 0).toString(16);
    return froge({
        roomNum: 0,
        x: 20,
        rand: rand.create(505),
        world,
        colors: [color] 
    });
}

export function world(seed) {
    const world = {
        rooms: new Map(),
        clock: 0,
        rand: rand.create(seed),
        getRoom(roomNum) {
            if (roomNum < 0) return null;

            if (!this.rooms.has(roomNum)) {
                const prevRoom = roomNum === 0 ? null : this.getRoom(roomNum - 1)
                this.rooms.set(roomNum, makeRoom(this, prevRoom));
            }

            return world.rooms.get(roomNum);
        }
    };
    world.player = createPlayer(world);
    return world;
}