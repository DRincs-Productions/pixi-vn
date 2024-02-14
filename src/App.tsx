import { Container, Sprite, Stage, useTick } from '@pixi/react';
import { useReducer, useRef } from 'react';

type reducertype = {
    type: string,
    data: any
}

const Bunny = () => {
    const reducer = (a: any, data: reducertype) => data.data;
    const [motion, update] = useReducer(reducer, undefined);
    const iter = useRef(0);

    useTick((delta) => {
        const i = (iter.current += 0.05 * delta);

        update({
            type: 'update',
            data: {
                x: Math.sin(i) * 100,
                y: Math.sin(i / 1.5) * 100,
                rotation: Math.sin(i) * Math.PI,
                anchor: Math.sin(i / 2),
            },
        });
    });
    try {
        return <Sprite image="https://pixijs.io/pixi-react/img/bunny.png" {...motion} />;
    }
    catch (e) {
        console.log(e);
    }
    return <></>;
};

function App() {
    return (
        <Stage width={300} height={300} options={{ backgroundAlpha: 0 }}>
            <Container x={150} y={150}>
                <Bunny />
            </Container>
        </Stage>
    );
}

export default App;
