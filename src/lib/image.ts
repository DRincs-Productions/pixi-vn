import * as PIXI from 'pixi.js';

export function showImage(imageUrl: string, app: PIXI.Application) {
    PIXI.Assets.load(imageUrl).then((texture) => {
        const plane = new PIXI.SimplePlane(texture, 10, 10);
        plane.x = 0
        plane.y = 0
        // get the size of the image


        // full width and adapt height
        plane.width = app.screen.width
        plane.height = app.screen.height

        app.stage.addChild(plane);
    });
}
