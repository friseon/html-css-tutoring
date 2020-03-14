// описываем все элементы на странице
const map = document.querySelector('.map');
const container = document.querySelector('.container');
const containerParams = container.getBoundingClientRect();
const zoomButton = document.querySelector('.zoom');

// состояние карты
const mapState = {
    // увеличение
    scale: 1,
    // смещение
    offset: {
        x: 0,
        y: 0
    }
}

// обновление смещения в состоянии карты
const updateStateOffset = () => {
    // получение геометрических данных по карте (размеры, координаты)
    const mapParams = map.getBoundingClientRect();
    // во сколько меняется увелечиние на карта
    // в 2 раза увеличиваем или в 2 раза уменьшаем
    const zoomDiff = (mapState.scale === 2 ? 2 : .5);
    // TODO: зум должен быть к центру карты
    mapState.offset.x = Math.max(containerParams.width - mapParams.width * zoomDiff, mapState.offset.x * zoomDiff);
    mapState.offset.y = Math.max(containerParams.height - mapParams.height * zoomDiff, mapState.offset.y * zoomDiff);
};

// обновление трансформации элемента
const updateMapTransfrom = () => {
    map.style.transform = `translate(${mapState.offset.x}px, ${mapState.offset.y}px) scale(${mapState.scale})`;
}

// переключение зума карты
const toggleScale = () => {
    if (mapState.scale === 1) {
        // если текущий scale обычный, то делаем увеличение x2
        mapState.scale = 2;
    } else {
        // если текущий scale отличен от обычного, то возвращаем обычный
        mapState.scale =  1
    }
}

// зумируем карту
const zoomMap = async () => {
    toggleScale();
    updateStateOffset();
    updateMapTransfrom();
}

zoomButton.addEventListener('click', zoomMap);

interact('.draggable')
    // двойной тап на карте зумирует её
    .on('doubletap', zoomMap)
    .draggable({
        modifiers: [
            // настройка границ, в которых мы можем двигать нашу карту
            interact.modifiers.restrictEdges({
                // насколько можем сдвинуть левый и верхний края в положительную сторону
                inner: {
                  left: 0,
                  top: 0,
                },
                // насколько можем сдвинуть левый и верхний края в отрицательную сторону
                outer: (x, y, mapElem) => {
                    return {
                        top: containerParams.height - mapElem.rect.height,
                        left: containerParams.width - mapElem.rect.width
                    };
                },
            })
        ],
        // включяем инерцию при передвижении по карте (плавность сдвига)
        inertia: true,
        // обработчики событий на карте при сдвиге
        listeners: {
            // процесс движения
            move(event) {
                mapState.offset.x += event.dx;
                mapState.offset.y += event.dy;

                updateMapTransfrom();
            },
        }
    });