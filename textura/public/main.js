const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    throw new Error('WebGL not supported');
}

const vertexData = [
    // Front
    0.5, 0.5, 0.5, // top right 
    0.5, -.5, 0.5, // bottom right
    -.5, 0.5, 0.5, // top left
    -.5, 0.5, 0.5, // top left
    0.5, -.5, 0.5, // bottom right
    -.5, -.5, 0.5, // bottom left

    // Left
    -.5, 0.5, 0.5,
    -.5, -.5, 0.5,
    -.5, 0.5, -.5,
    -.5, 0.5, -.5,
    -.5, -.5, 0.5,
    -.5, -.5, -.5,

    // Back
    -.5, 0.5, -.5,
    -.5, -.5, -.5,
    0.5, 0.5, -.5,
    0.5, 0.5, -.5,
    -.5, -.5, -.5,
    0.5, -.5, -.5,

    // Right
    0.5, 0.5, -.5,
    0.5, -.5, -.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    0.5, -.5, -.5,

    // Top
    0.5, 0.5, 0.5,
    0.5, 0.5, -.5,
    -.5, 0.5, 0.5,
    -.5, 0.5, 0.5,
    0.5, 0.5, -.5,
    -.5, 0.5, -.5,

    // Underside
    0.5, -.5, 0.5,
    0.5, -.5, -.5,
    -.5, -.5, 0.5,
    -.5, -.5, 0.5,
    0.5, -.5, -.5,
    -.5, -.5, -.5,
];

function repeat(n, pattern){
    return [...Array(n)].map(pattern).reduce(sum => sum.concat(pattern), []);
}

const uvData = repeat(6, [
    0, 0,
    0, 1,
    1, 0,

    1, 0,
    0, 1,
    1, 1,
]);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

function loadTexture(url) {
    const texture = gl.createTexture();
    const image = new Image();
    image.onload = e => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    };
    image.src = url;
    return texture;
}
// Shader program
let uniformLocations;
(function shaderProgram() {})();

//Matrizes
const modelMatrix = mat4.create();
const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix,
    75 * Math.PI / 180,
    canvas.width / canvas.height,)
mat4.perspective(projectionMatrix,
    75 * Math.PI / 180,
    canvas.width / canvas.height,
    1e-4,
    1e4
);

const mvMatrix = mat4.create();
const mvpMatrix = mat4.create();
mat4.translate(mvMatrix, mvMatrix, [0, 0.1, 2]);
mat4.invert[viewMatrix, viewMatrix];

//loop animado
function animate(){
    requestAnimationFrame(animate);
   
}

animate();