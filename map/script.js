// описываем все элементы на странице
const map = document.querySelector('.map');
const container = document.querySelector('.container');
const zoomButton = document.querySelector('.zoom');
const test = document.querySelector('.test');

// Высота панели управления. Нужно здесь задавать для расчета границ передвижения по карте
const CONTROL_PANEL_HEIGHT = 78;

let containerParams = container.getBoundingClientRect();

window.addEventListener('resize', () => {
    const vh = window.innerHeight * 0.01;

    document.documentElement.style.setProperty('--vh', `${vh}px`);
    containerParams = container.getBoundingClientRect();
});

document.addEventListener("DOMContentLoaded", () => {
    // хак для лечение проблемы в сафари с высотой контейнера
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    containerParams = container.getBoundingClientRect();

    zoomButton.addEventListener('click', zoomMap);

    interact('.draggable')
        // двойной тап на карте зумирует её
        .on('doubletap', zoomMap)
        .draggable({
            modifiers: [
                // настройка границ, в которых мы можем двигать нашу карту
                interact.modifiers.restrictEdges({
                    // насколько можем сдвинуть левый и верхний края в положительную сторону
                    // какая-то фигня, если делать на весь экран, то требуется учитывать разницу
                    inner: {
                        left: 0,
                        top: CONTROL_PANEL_HEIGHT,
                    },
                    // насколько можем сдвинуть левый и верхний края в отрицательную сторону
                    outer: (x, y, mapElem) => {
                        return {
                            top: containerParams.height - mapElem.rect.height + CONTROL_PANEL_HEIGHT,
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
});

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

// формула получения смещения
const getOffset = (coord, zoomDiff, zommDiffCoef) => {
    // получение геометрических данных по карте (размеры, координаты)
    const mapParams = map.getBoundingClientRect();
    const measurement = coord === 'x' ? 'width' : 'height';
    // максимальное смещение, чтобы карта при сдвиге влево не уходила в пустоту
    const maxOffset = containerParams[measurement] - mapParams[measurement] * zoomDiff;
    // считаем смещение
    const offset = mapState.offset[coord] * zoomDiff + zommDiffCoef * containerParams[measurement] / 2;

    // mapParams[measurement] - в квадратных скобках указана ссылка на название поля в объекте mapParams. Поле в данном случее это либо width, либо height
    // Находим максимум между максимальным смещением, что позволяет сделать контейнер, и тем сколько у нас получилось по формуле
    // Используем Math.max, потому что смещение влево - это отрицательное значение в translate. Поэтому берем верхнюю границу из диапазона
    return Math.max(maxOffset, offset);
}

// обновление смещения в состоянии карты
const updateStateOffset = () => {
    // во сколько меняется увелечиние на карта
    // в 2 раза увеличиваем или в 2 раза уменьшаем
    const zoomDiff = (mapState.scale === 2 ? 2 : .5);
    // коэфициент смещения при увеличении или уменьшении
    const zommDiffCoef = (mapState.scale === 2 ? -1 : .5);
    const diffX = getOffset('x', zoomDiff, zommDiffCoef);
    const diffY = getOffset('y', zoomDiff, zommDiffCoef)

    // Здесь уже считаем максимальное смещение впарво, чтобы там не создавать пустоту.
    // Используем Math.min, потому что смещение вправо - это положительное значение в translate. Поэтому берем нижнюю границу из диапазона
    mapState.offset.x = Math.min(0, diffX);
    mapState.offset.y = Math.min(0, diffY);
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
        mapState.scale = 1
    }
}

// зумируем карту
const zoomMap = async () => {
    toggleScale();
    updateStateOffset();
    updateMapTransfrom();
}