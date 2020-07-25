import template from './template.js'

const getLaidPointsElement = document.getElementById('getLaidPoints');
const uploadPointsElement = document.getElementById('uploadPoints');
const clearPointsElement = document.getElementById('clearPoints');
const getCanvasLine = document.getElementById('getCanvasLine');
const pointJSONElement = document.getElementById('pointJSON');
const pointsListElement = document.getElementById('points');
const lines = [{
    x: null,
    y: null
}];
const line = {
    w: 5,
    c: '#fff',
    group: lines
};
const getReferenceDot = pos => ({
    r: 5,
    c: '#44f',
    ...mouse(),
    ...pos
});
const getPositionText = pos => ({
    c: '#ffe',
    font: '12px monospace',
    txt: JSON.stringify(pos || mouse()),
    ...mouse(),
    ...pos
});
const getXSymmetricalPoint = () => ({
    x: c.width / 2 - (mouse().x - c.width / 2),
    y: mouse().y
});
const canDrawFollowUp = () => mouse() && mouse().x < c.width;
const canUseXSymmetry = () => document.getElementById('XSymmetry').checked && canDrawFollowUp();
size(window.innerWidth - 300);
onMouseMove();
draw(() => {
    clear('#001');
    if (lines[0].x !== null) {
        if (canUseXSymmetry()) lines.unshift(getXSymmetricalPoint());
        if (canDrawFollowUp()) lines.push(mouse());
        render(line).lines();
        if (canDrawFollowUp()) lines.pop();
        if (canUseXSymmetry()) lines.shift();
        ctx.fillStyle = "#44f";
        ctx.fill();
    }
    if (canUseXSymmetry()) {
        render(getReferenceDot(getXSymmetricalPoint())).arc();
        render(getPositionText(getXSymmetricalPoint())).txt();
    }
    render(getReferenceDot()).arc();
    render(getPositionText()).txt();
});

// add point when click canvas
c.addEventListener('click', () => {
    if (lines[0].x === null) lines.pop();
    appendPointToPointsListElement(mouse());
    lines.push({
        ...mouse()
    });
    if (canUseXSymmetry()) {
        lines.unshift(getXSymmetricalPoint());
        appendPointToPointsListElement(getXSymmetricalPoint());
    }
    pointJSONElement.value = JSON.stringify(lines, null, 2);
});

getLaidPointsElement.addEventListener('click', () => {
    downloadJSText(JSON.stringify(getLaidPoints(lines), null, 2), 'laidPoints');
});

getCanvasLine.addEventListener('click', () => {
    downloadJSText(pointsListElement.innerText, 'canvasLine');
});

// erase a point
pointsListElement.addEventListener('click', e => {
    const isEraseButton = e.target.getAttribute('data-type') === 'erase';
    if (isEraseButton) {
        const targetIndex = [
            ...e.target.parentElement.parentElement.children
        ].indexOf(e.target.parentElement);
        lines.splice(targetIndex, 1);
        pointJSONElement.value = JSON.stringify(lines, null, 2);
        e.target.parentElement.remove();
        if (!lines.length) lines.push({x: null, y: null});
    }
});

// resize canvas
window.addEventListener('resize', () => {
    c.width = window.innerWidth - 300;
});

uploadPointsElement.addEventListener('click', () => {
    const parsedPoints = JSON.parse(pointJSONElement.value);
    lines.pop();
    parsedPoints.forEach(vector => {
        appendPointToPointsListElement(vector);
        lines.push(vector);
    });
});

clearPointsElement.addEventListener('click', () => {
    pointsListElement.innerHTML = '';
    lines.splice(0);
    lines.push({x: null, y: null})
});

function appendPointToPointsListElement({x, y}, index) {
    const pointListItemElement = template(`
        <li>
            ${
                lines.length ?
                `
                canvas.lineTo(<b>${x}</b>, <b>${y}</b>);
                `
                :
                `
                canvas.moveTo(<b>${x}</b>, <b>${y}</b>);
                `
            }
            <button data-type="erase"></button>
        </li>
    `);
    if (index !== undefined) {
        pointsListElement.insertBefore(
            pointsListElement.childNodes[index],
            pointListItemElement
        );
        return;
    }
    pointsListElement.appendChild(pointListItemElement);
}

function downloadJSText(text, name) {
    const a = document.createElement('a');
    a.download = `${name}.js`;
    a.href = "data:text/plain;charset=UTF-8,"  + encodeURIComponent(text);
    a.click();
}

function getLaidPoints(points) {
    const pointsToLaid = JSON.parse(JSON.stringify(points));
    const least = {
        x: Infinity,
        y: Infinity
    };

    pointsToLaid.forEach(({x, y}) => {
        if (x < least.x) least.x = x;
        if (y < least.y) least.y = y;
    });

    pointsToLaid.forEach(vector => {
        vector.x -= least.x;
        vector.y -= least.y;
    });

    return pointsToLaid;
}