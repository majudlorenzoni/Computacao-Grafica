
const canvas = document.querySelector('canvas');        //elemento usado para desenhar os gráficos
const gl = canvas.getContext('webgl');  //obtem o contexto do webgl

if (!gl){
    throw new Error ('WebGL not supported');
}
console.log("funcionando");

const vertexData = [
    0, 1, 0,            //(x, y, z)S
    1, -1, 0,
    -1, -1, 0,
]; //define os vertices do triangulo

const buffer = gl.createBuffer();           //criando um buffer de vértices
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);     //liga o buffer ao array_buffer para armazenar os dados do vertice
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW); //carrega os dados dos vértices no buffer como um array de valores de ponto flutuante.

const vertexShader = gl.createShader(gl.VERTEX_SHADER); // mini programa que roda na gpu, cria o shader de vértice
gl.shaderSource(vertexShader, `
attribute vec3 position;
void main(){
    gl_Position = vec4(position, 1);
}
`); //define o código do shader de vértice que calcula a posição dos vértices
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `
void main(){
    gl_FragColor = vec4(0, 1, 1, 1);
}
`); //define a cor do fragmento
gl.compileShader(fragmentShader);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader); // anexa os vertices e os pixeis ao programa
gl.linkProgram(program); //cria o executavel

const positionLocation = gl.getAttribLocation(program, `position`);
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

gl.useProgram(program); //ativa o programa
gl.drawArrays(gl.TRIANGLES, 0, 3);  //renderiza o triangulo definido pelos vertices
