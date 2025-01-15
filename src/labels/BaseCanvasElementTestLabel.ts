import { Container, ImageSprite, RotateTicker, canvas, clearAllGameDatas, narration } from '@drincs/pixi-vn';

const body = document.body
if (!body) {
    throw new Error('body element not found')
}

canvas.initialize(body, 1920, 1080, {
    backgroundColor: "#303030"
}).then(() => {
    let number = 25

    // Create and add a container to the stage
    const container = new Container();

    canvas.add("container", container);

    // Create a 5x5 grid of bunnies in the container
    for (let i = 0; i < number; i++) {
        const bunny = new ImageSprite({
            x: (i % 5) * 40,
            y: Math.floor(i / 5) * 40,
        }, "https://pixijs.com/assets/bunny.png");
        bunny.load()
        container.addChild(bunny);
    }

    // Move the container to the center
    container.x = canvas.screen.width / 2;
    container.y = canvas.screen.height / 2;

    // Center the bunny sprites in local container coordinates
    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;

    canvas.addTicker("container", new RotateTicker({ speed: 1 }));

})

// read more here: https://pixi-vn.web.app/start/other-narrative-features.html#how-manage-the-end-of-the-game
narration.onGameEnd = async (props) => {
    clearAllGameDatas()
    props.navigate("/")
}

