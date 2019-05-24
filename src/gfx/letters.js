import {pane} from './pane';

// word wrap function by james padolsey
// modified from original
// http://james.padolsey.com/javascript/wordwrap-for-javascript/
function wordwrap(str, width = 80, maxLines = Infinity) {
    const regex = RegExp('.{0,' +width+ '}(\\s|$)|.{' +width+ '}|.+$', 'g');
    let lines = str.match(regex).slice(0, maxLines);
    if (lines[lines.length-1] === '') lines = lines.slice(0, lines.length-1);
    return lines.map(line => line.trim()).join('\n').split('\n');
}

export function letters(font, str, maxCols=Infinity, maxRows=Infinity) {
    const lines = wordwrap(str, maxCols, maxRows);

    const w = font.width;
    const h = font.height;

    const cols = Math.max(...lines.map(line => line.length));
    const rows = lines.length;

    const letters = lines.map(
        (line, row) => line
            .split('')
            .map(letter => letter.charCodeAt(0) - 32)
            .map((s, col) => font.sprite(s).at(col*w, row*h))
    ).reduce((arr, x) => arr.concat(x));

    const asMulti = pane(w*cols, h*rows, letters);

    return {
        separately() {
            return { cols, rows, letters };
        },
        single() {
            return asMulti;
        }
    }
}