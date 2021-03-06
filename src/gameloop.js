import { ROOM_WIDTH, ROOM_HEIGHT } from './const.js';
import { world } from './world.js';
import { pane, fill, letters } from 'pxcan';
import px6 from 'pxcan/fonts/px6.js';
import * as gb from 'gameboy-sound';

export function worldview() {
    const seed = 76576;
    const { player } = world(seed);

    let helloFrog = null;

    function updateText(str=`world ${seed}-${player.roomNum+1}`) {
        helloFrog = pane(90, 6, [
            fill('black'),
            letters(px6, str).single().at(1, 0)
        ]);
    }
    updateText();

    const playback = [];

    function parseBrain({ left, right, up, down }) {
        return [up,down,right,left].map((on,i) => on ? ['↑','↓','→','←'][i] : ' ').join('')
    }

    const leanThreshold = 3;
    let lean = 0;
    return function gameloop({ buttons, touches }) {
        // let everything move like itself
        touches = touches.filter(t => !t.isMouse);
        if (touches.length === 0) {
            lean = 0;
        } else if (touches.length === 2) {
            lean = Math.abs(lean) >= leanThreshold ? Math.sign(lean)*leanThreshold : 0;
        } else if (touches.length === 1) {
            if (touches[0].x < 35) lean--;
            else if (touches[0].x > 90-35) lean++;
        }
        // updateText(JSON.stringify({t:touches.length,l:lean}))
        const playerBrain = {
            left: buttons.left.pressed || lean <= -leanThreshold,
            right: buttons.right.pressed || lean >= leanThreshold,
            up: buttons.up.pressed || (touches[0] && touches[0].x >= 35 && touches[0].x <= 90-35 && touches[0].justPressed) || (touches[1] && touches[1].justPressed),
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
}

function dead(playback) {
    gb.play(3, [{ freq:6<<7, buzzy:true, volume:7, fade:3 }, 1])
    gb.play(0, [{ freq:gb.A5, duty:0, volume:6, fade:8, sweepFactor: -4, sweepPeriod: 9 }, 1])
    console.log('bye')
    console.log(playback.map(({brain,time}) => `|${brain}|${('     '+time).substr(-6)}`).join('\n'))

    return function gameloop({ buttons, touches }) {
        if ([buttons.ok, buttons.left, buttons.right, buttons.up, buttons.down, touches[0]||{}].some(b => b.justPressed)) {
            return { gameloop: worldview() };
        } else {
            return {}
        }
    }
}
