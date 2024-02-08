import { parseOBJ, parseMTL, vs, fs } from "./read.js";
import { degToRad, getGeometriesExtents } from "./read.js";

let canvas = document.getElementById("canvasScene");
let gl = canvas.getContext("webgl2");
const meshProgramInfo = twgl.createProgramInfo(gl, [vs, fs]);
let objDataScene = [];
let objectsOnScene = [];
let objAddresses = [
  { path: "/obj/bottle_A_brown/bottle_A_brown.obj",
    textures: [
      { path: "textura1.png" },
      { path: "textura2.png" },
      { path: "textura3.png" },
    ],
  },
  { path: "/obj/banner_blue/banner_blue.obj",
    textures: [
      { path: "textura1.png" },
      { path: "textura2.png" },
      { path: "textura3.png" },
    ],
  },
  {
    path: "/obj/banner_green/banner_green.obj",
    textures: [
      { path: "textura1.png" },
      { path: "textura2.png" },
      { path: "textura3.png" },
    ],
  },

  { path: "/obj/barrier/barrier.obj",
  textures: [
    { path: "textura1.png" },
    { path: "textura2.png" },
    { path: "textura3.png" },
  ],
 },
  { path: "/obj/table_long_decorated_A/table_long_decorated_A.obj",  textures: [
    { path: "textura1.png" },
    { path: "textura2.png" },
    { path: "textura3.png" },
  ],
 },
  { path: "/obj/floor_foundation_corner/floor_foundation_corner.obj", textures: [
    { path: "textura1.png" },
    { path: "textura2.png" },
    { path: "textura3.png" },
  ],
},
  { path: "/obj/key/key.obj", 
  textures: [
    { path: "textura1.png" },
    { path: "textura2.png" },
    { path: "textura3.png" },
  ], },
];


const saveButton = document.getElementById("btnSalvar");
saveButton.addEventListener("click", function () {
let copyObjs = objectsOnScene.map((obj) => {
  return {
    objData: obj.objData,
    objAddress: obj.objAddress,
  };
});
console.log("COPIANDO OS OBJETOS: ", copyObjs);
const data = JSON.stringify(copyObjs);
const blob = new Blob([data], { type: "application/json" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "scene.json";
document.body.appendChild(a);
a.click();

});

//CARREGAR CENA - TODO O NECESSÁRIO PARA CHAMAR RENDERSELECT NOVAMENTE

async function loadSceneFromJSON(jsonData) {
  const sceneData = JSON.parse(jsonData);
  objectsOnScene = [];

  for (const obj of sceneData) {
      const objData = await loadObj(gl, obj.objAddress);
      objectsOnScene.push({
          canvas: obj.canvas,
          objData: objData,
          objAddress: obj.objAddress,
      });
  }
}


// LIMPAR CENA
export async function clearCanvas(gl) {
  gl.clear(gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clearColor(0, 0, 0, 0);
  objDataScene = [];
  objectsOnScene = [];
  console.log("LIMPOU O CANVAS");
}

async function callObjData() {
  objDataScene = objectsOnScene.map((obj) => {
    return obj.objData;
  });
}

export async function renderSelect(index) {
  objectsOnScene.push({ objAddress: objAddresses[index] });
  console.log(objectsOnScene);

  const objData = await loadObj(
    gl,
    objectsOnScene[objectsOnScene.length - 1].objAddress
  );

  objectsOnScene[objectsOnScene.length - 1].objData = objData;
  callObjData();
}

async function loadTexture(gl, objAddress, urlTexture) {
  const objHref = objAddress.path;
  const response = await fetch(objHref);
  const text = await response.text();
  const obj = parseOBJ(text);

  // COMEÇA AQUI A FUNÇÃO
  const baseHref = new URL(objHref, window.location.href);
  const matTexts = await Promise.all(
    obj.materialLibs.map(async (filename) => {
      const matHref = new URL(filename, baseHref).href;
      const response = await fetch(matHref);
      return await response.text();
    })
  );

  const materials = parseMTL(matTexts.join("\n"));

  const textures = {
    defaultWhite: twgl.createTexture(gl, { src: [255, 255, 255, 255] }),
  };

  // load texture for materials
  for (const material of Object.values(materials)) {
    Object.entries(material)
      .filter(([key]) => key.endsWith("Map")) //textura
      .forEach(([key, filename]) => {
        //carrega a textura e atribui ao material
        filename = urlTexture ? urlTexture : filename;
        let texture = textures[filename];
        if (!texture) {
          // const textureHref = new URL(filename, baseHref).href;
          const textureHref = new URL(filename, baseHref).href;
          texture = twgl.createTexture(gl, {
            src: textureHref,
            flipY: true,
          });
          textures[filename] = texture;
        }
        material[key] = texture;
      });
  }

  const defaultMaterial = {
    diffuse: [1, 1, 1],
    diffuseMap: textures.defaultWhite,
    ambient: [0, 0, 0],
    specular: [1, 1, 1],
    shininess: 400,
    opacity: 1,
  };

  const parts = obj.geometries.map(({ material, data }) => {
    if (data.color) {
      if (data.position.length === data.color.length) {
        data.color = { numComponents: 3, data: data.color };
      }
    } else {
      data.color = { value: [1, 1, 1, 1] };
    }

    const bufferInfo = twgl.createBufferInfoFromArrays(gl, data);
    const vao = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, bufferInfo);
    return {
      material: {
        ...defaultMaterial,
        ...materials[material],
      },
      bufferInfo,
      vao,
      obj,
    };
  });

  return parts;
}

async function loadObj(gl, objAddress) {
  twgl.setAttributePrefix("a_");
  // const { parts, textures } = await loadTexture(gl, objAddress, "textura2.png");
  const parts = await loadTexture(gl, objAddress, "dungeon_texture.png");

  const extents = getGeometriesExtents(parts[0].obj.geometries);
  const range = m4.subtractVectors(extents.max, extents.min);

  const objOffset = m4.scaleVector(
    m4.addVectors(extents.min, m4.scaleVector(range, 0.5)),
    -1
  );

  const cameraTarget = [0, 0, 0];

  let escala = 1.2;
  const radius = m4.length(range) * escala;

  const cameraPosition = m4.addVectors(cameraTarget, [0, 0, radius]);
  const zNear = radius / 100;
  const zFar = radius * 3;
  
  console.log("OBJ ADDRESS: ", objAddress);
  return {
    parts,
    meshProgramInfo,
    objOffset,
    cameraPosition,
    cameraTarget,
    zNear,
    zFar,
    range,
    radius,
    escala,
    extents,
    texturesAddresses: objAddress.textures,
    indexAdress: objAddress,
  };
}

async function drawObj(gl) {
  async function render(time) {
    if (objDataScene.length != 0) {
      // loadTexture(gl, objDataScene[0], "textura2.png");
      // objectsOnScene[0] = loadObj(gl, objAddresses[0], );
      time *= 0;
      twgl.resizeCanvasToDisplaySize(gl.canvas);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.enable(gl.DEPTH_TEST);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.clearColor(0, 0, 0, 0);

      const fieldOfViewRadians = degToRad(60);
      const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

      for (const objectOnScene of objDataScene) {
        const cameraTarget = [0, 0, 0];
        const radius = m4.length(objectOnScene.range) * objectOnScene.escala;
        objectOnScene.cameraPosition = m4.addVectors(cameraTarget, [
          0,
          0,
          radius,
        ]);
        objectOnScene.zNear = radius / 100;
        objectOnScene.zFar = radius * 3;

        const projection = m4.perspective(
          fieldOfViewRadians,
          aspect,
          objectOnScene.zNear,
          objectOnScene.zFar
        );

        const up = [0, 1, 0];
        const camera = m4.lookAt(
          objectOnScene.cameraPosition,
          objectOnScene.cameraTarget,
          up
        );
        const view = m4.inverse(camera);

        const sharedUniforms = {
          u_lightDirection: m4.normalize([-1, 3, 5]),
          u_view: view,
          u_projection: projection,
          u_viewWorldPosition: objectOnScene.cameraPosition,
        };

        gl.useProgram(meshProgramInfo.program);
        twgl.setUniforms(meshProgramInfo, sharedUniforms);

        let u_world = m4.yRotation(
          objectOnScene.yrotation ? objectOnScene.yrotation : time
        );

        u_world = m4.translate(u_world, ...objectOnScene.objOffset);

        for (const { bufferInfo, vao, material } of objectOnScene.parts) {
          gl.bindVertexArray(vao);
          twgl.setUniforms(
            meshProgramInfo,
            {
              u_world,
            },
            material
          );
          twgl.drawBufferInfo(gl, bufferInfo);
        }
      }

      requestAnimationFrame(render);
    } else {
      requestAnimationFrame(render);
    }
  }
  requestAnimationFrame(render);
}

export async function transformationEditing(buttonIndex) {
  let inputRotation = document.getElementById("rotation");
  let inputScale = document.getElementById("scale");
  let inputTranslationX = document.getElementById("translateXButton");
  let inputTranslationY = document.getElementById("translateYButton");
  let inputTranslationZ = document.getElementById("translateZButton");
  let defaultTextura1Btn = document.getElementById("defaultTextura1Btn");
  let defaultTextura2Btn = document.getElementById("defaultTextura2Btn");
  let defaultTextura3Btn = document.getElementById("defaultTextura3Btn");

  inputRotation.onchange = function () {
    objDataScene[buttonIndex].yrotation = inputRotation.value;
  };

  inputScale.onchange = function () {
    objDataScene[buttonIndex].escala = parseFloat(inputScale.value);
    console.log(" A NOVA ESCALA É: ", parseFloat(inputScale.value));
  };

  inputTranslationX.onchange = function () {
    objDataScene[buttonIndex].objOffset[0] = parseFloat(
      inputTranslationX.value
    );
  };

  inputTranslationY.onchange = function () {
    objDataScene[buttonIndex].objOffset[1] = parseFloat(
      inputTranslationY.value
    );
  };

  inputTranslationZ.onchange = function () {
    objDataScene[buttonIndex].objOffset[2] = parseFloat(
      inputTranslationZ.value
    );
  };

  defaultTextura1Btn.onclick = async function () {
    objDataScene[buttonIndex].parts = await loadTexture(
      gl,
      objDataScene[buttonIndex].indexAdress,
      objDataScene[buttonIndex].texturesAddresses[0].path
    );
    console.log("obj data scene: ", objDataScene);
  };

  defaultTextura2Btn.onclick = async function () {
    console.log("objDataScene: ", objDataScene[buttonIndex]);

    objDataScene[buttonIndex].parts = await loadTexture(
      gl,
      objDataScene[buttonIndex].indexAdress,
      objDataScene[buttonIndex].texturesAddresses[1].path
    );
  };

  defaultTextura3Btn.onclick = async function () {
    objDataScene[buttonIndex].parts = await loadTexture(
      gl,
      objDataScene[buttonIndex].indexAdress,
      objDataScene[buttonIndex].texturesAddresses[2].path
    );
  };
}

await drawObj(gl);
