import { guyTypes } from './guys.js';
import { mid } from './math.js';
import groundPng from './sprites/ground.png';
import propsPng from './sprites/props.png';
import { fill, pane, gridSheet, img } from 'pxcan';
import { ROOM_SEGMENTS, GROUND_WIDTH, ROOM_WIDTH, ROOM_HEIGHT, MIN_GROUND_HEIGHT, MAX_GROUND_HEIGHT, NUM_PROPS } from './const.js';

const groundImg = img(groundPng);
const propsSheet = gridSheet(propsPng, 32, 32);


const backgroundColor = '#45283c';

function getSprites(ground) {
    const sprites = [fill(backgroundColor)];

    ground.forEach((g, i) => {
        for (let y = g.height; y < ROOM_HEIGHT; y += 8) {
            sprites.push(groundImg.at(i*4, y));
        }
        sprites.push(
            ...g.props.map(p => propsSheet.sprite(p).at((i+0.5)*GROUND_WIDTH - 16, g.height - 24))
        );
    });

    return pane(ROOM_WIDTH, ROOM_HEIGHT, sprites).at(0, 0);
}

export function makeRoom(world, prevRoom) {
    const { rand } = world;
    const startGround = (prevRoom) ?
        { ...prevRoom.ground[prevRoom.ground.length-1], props: [] } :
        { height: (MIN_GROUND_HEIGHT + MAX_GROUND_HEIGHT) / 2, frame: 0, props: [] };
    const roomNum = (prevRoom) ? prevRoom.roomNum + 1 : 0;
    const ground = [startGround];
    const guys = [];
    for (let i = 1; i < ROOM_SEGMENTS; ++i) {
        const h = ground[i-1].height
            + rand(-2, 2)
            + (rand() < 0.05 ? rand(-20, 20) : 0);
        const height = mid(MIN_GROUND_HEIGHT, h, MAX_GROUND_HEIGHT);
        ground[i] = { height, frame: startGround.frame, props: [] };
    }
    for (let i = 1; rand() < i; i = i * 0.94 - 0.001) {
        ground[rand(ROOM_SEGMENTS)].props.push(rand(NUM_PROPS));
    }
    for (let i = 0.8; rand() < i; i = i * 0.8 - 0.001) {
        const guyType = rand(guyTypes);
        const guy = { ...guyType({ roomNum, x: rand(40, 80), rand: rand.create(), world }) };
        guys.push(guy);
    }
    return { ground, guys, roomNum, sprites: getSprites(ground) };
}
