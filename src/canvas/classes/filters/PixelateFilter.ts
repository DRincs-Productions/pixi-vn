import {
    Filter,
    GlProgram,
    GpuProgram,
    UniformGroup,
    type FilterOptions,
} from "@drincs/pixi-vn/pixi.js";

/**
 * The standard PixiJS filter vertex shader (GLSL). Every core `pixi.js` filter ships its own copy of
 * this same boilerplate (see `NoiseFilter`/`AlphaFilter`/`DisplacementFilter`) since it isn't part of
 * the package's public API surface.
 */
const defaultVertex = `in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition( void )
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;

    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}
`;

const fragment = `in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform highp vec4 uInputSize;
uniform float uPixelSize;

void main()
{
    vec2 size = uInputSize.xy;
    float pixelSize = max(uPixelSize, 1.0);
    vec2 coord = vTextureCoord * size;
    coord = (floor(coord / pixelSize) + 0.5) * pixelSize;
    finalColor = texture(uTexture, coord / size);
}
`;

const source = `
struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

struct PixelateUniforms {
  uPixelSize:f32,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler : sampler;

@group(1) @binding(0) var<uniform> pixelateUniforms : PixelateUniforms;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>
};

fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>,
) -> VSOutput {
  return VSOutput(
   filterVertexPosition(aPosition),
   filterTextureCoord(aPosition)
  );
}

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
  @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {
    let pixelSize = max(pixelateUniforms.uPixelSize, 1.0);
    let size = gfu.uInputSize.xy;
    var coord = uv * size;
    coord = (floor(coord / pixelSize) + vec2<f32>(0.5)) * pixelSize;
    return textureSample(uTexture, uSampler, coord / size);
}
`;

export interface PixelateFilterOptions extends FilterOptions {
    /**
     * The size (in pixels) of each pixelated block.
     * @default 1
     */
    pixelSize?: number;
}

/**
 * A filter that pixelates the content it is applied to, snapping the sampled texture coordinates to a
 * grid sized by {@link pixelSize}. `pixi.js` core doesn't ship a pixelate filter (it only exists in the
 * separate `pixi-filters` package), so this is a small, self-contained one to avoid adding a new peer
 * dependency just for the {@link transitions.pixelateIn}/{@link transitions.pixelateOut} transitions.
 * @example
 * ```ts
 * const filter = new PixelateFilter({ pixelSize: 8 });
 * sprite.filters = [filter];
 * ```
 */
export default class PixelateFilter extends Filter {
    constructor(options?: PixelateFilterOptions) {
        const { pixelSize = 1, ...rest } = options ?? {};
        const gpuProgram = GpuProgram.from({
            vertex: { source, entryPoint: "mainVertex" },
            fragment: { source, entryPoint: "mainFragment" },
        });
        const glProgram = GlProgram.from({
            vertex: defaultVertex,
            fragment,
            name: "pixivn-pixelate-filter",
        });
        super({
            ...rest,
            gpuProgram,
            glProgram,
            resources: {
                pixelateUniforms: new UniformGroup({
                    uPixelSize: { value: pixelSize, type: "f32" },
                }),
            },
        });
    }
    /**
     * The size (in pixels) of each pixelated block. `1` (or less) means no visible pixelation.
     */
    get pixelSize(): number {
        return this.resources.pixelateUniforms.uniforms.uPixelSize;
    }
    set pixelSize(value: number) {
        this.resources.pixelateUniforms.uniforms.uPixelSize = value;
    }
}
