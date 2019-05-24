import { ROOM_WIDTH, ROOM_HEIGHT } from './rooms';
import { createPlayer } from './player';
import { rand as rootRand } from './rand';
import {pane} from '../lib/gfx/pane';
import {fill} from '../lib/gfx/fill';
import {letters} from '../lib/gfx/letters';
import px6 from '../lib/fonts/px6';

export function worldview() {
    const seed = 76576;
    const player = createPlayer({ rooms: new Map(), clock: 0, rand: rootRand.create(seed) });

    let helloFrog = null;

    function updateText() {
        helloFrog = pane(90, 6, [
            fill('black'),
            letters(px6, `world ${seed}-${player.roomNum+1}`).single().at(1, 0)
        ]);
    }
    updateText();

    const playback = [];

    function parseBrain({ left, right, up, down }) {
        return [up,down,right,left].map((on,i) => on ? ['↑','↓','→','←'][i] : ' ').join('')
    }

    return function gameloop({ buttons }) {
        // let everything move like itself
        const playerBrain = {
            left: buttons.left.pressed,
            right: buttons.right.pressed,
            up: buttons.up.pressed,
            down: buttons.down.pressed,
        };

        if (playback.length > 0 && parseBrain(playerBrain) === playback[playback.length-1].brain) {
            playback[playback.length-1].time++;
        } else {
            playback.push({ brain: parseBrain(playerBrain), time: 1 })
        }

        player.act(playerBrain);
        player.move();

        player.room().guys.forEach(guy => {
            const brain = guy.brain();
            guy.act(brain);
            guy.move();
        });

        // next room?
        if (player.x === ROOM_WIDTH - 1) {
            ++player.roomNum;
            player.x = 1;
            updateText();
        }
        // previous room??
        else if (player.x === 0) {
            if (player.roomNum !== 0) {
                --player.roomNum;
                player.x = ROOM_WIDTH - 2;
                updateText();
            }
        }

        // player get hurt
        const killer = player.room().guys.find(guy => (
            guy !== player &&
            Math.abs(guy.x - player.x) < (player.w + guy.w) /2 - 2 &&
            Math.abs(guy.y - player.y) < (player.h + guy.h) /2 - 2
        ));

        const roomSprites = killer ?
            [fill('white'), player.sprite(), killer.sprite()] :
            [
                player.room().sprites,
                player.sprite(),
                ...player.room().guys.map(guy => guy.sprite()),
            ];

        // main game panel
        const worldPane = pane(ROOM_WIDTH, ROOM_HEIGHT, roomSprites).at(1, 6);

        // increment clock
        ++player.world.clock;

        // give sprites
        return { sprites: [worldPane, helloFrog], gameloop: killer ? dead(playback) : null };
    };
};

function dead(playback) {
    console.log('bye')
    console.log(playback.map(({brain,time}) => `|${brain}|${('     '+time).substr(-6)}`).join('\n'))

    return function gameloop({ buttons }) {
        if ([buttons.ok, buttons.left, buttons.right, buttons.up, buttons.down].some(b => b.justPressed)) {
            return { gameloop: worldview() };
        } else {
            return {}
        }
    }
}
