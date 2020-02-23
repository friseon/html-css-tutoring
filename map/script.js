const state = {
    scale: 1,
    position: {
        x: 0,
        y: 0
    }
}
const map = document.querySelector('.map');
let mapParams = map.getBoundingClientRect();
const container = document.querySelector('.container');
const containerParams = container.getBoundingClientRect();

const zoom = document.querySelector('button');

const updatePosition = (diffScale) => {
    // TODO: зум должен быть к центру карты
    // TODO: смещение не ограничено краями и карта может выпасть, не сможем еще перемещать
    state.position.x = state.position.x * diffScale;
    state.position.y = state.position.y * diffScale;
};
const updateMapTransfrom = () => {
    map.style.transform = `translate(${state.position.x}px, ${state.position.y}px) scale(${state.scale})`;
}

zoom.addEventListener('click', () => {
    state.scale = state.scale === 1 ? 2 : 1;
    updatePosition(state.scale === 2 ? 2 : .5);
    updateMapTransfrom();
    mapParams = map.getBoundingClientRect();
});

interact('.draggable').draggable({
    listeners: {
        start(event) {
            //   console.log(event.type, event.target)
        },
        move(event) {
            if (state.position.x + mapParams.width + event.dx <= containerParams.width
                || state.position.x + event.dx >= 0
                || state.position.y + mapParams.height + event.dy <= containerParams.height
                || state.position.y + event.dy >= 0) {
                return;
            }

            state.position.x += event.dx;
            state.position.y += event.dy;

            updateMapTransfrom();
        },
    }
})