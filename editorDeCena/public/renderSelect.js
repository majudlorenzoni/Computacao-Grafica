import { parseOBJ, parseMTL, vs, fs } from "./read.js";
import { degToRad, getExtents, getGeometriesExtents } from "./read.js";

let canvas = document.getElementById("canvasScene");
let gl = canvas.getContext("webgl2");
const meshProgramInfo = twgl.createProgramInfo(gl, [vs, fs]);
let objDataScene = [];
let objectsOnScene = [];
let novaTexturaP = "/images/textura1.png";
let objAddresses = [
  { path: "/obj/bottle_A_brown/bottle_A_brown.obj" },
  { path: "/obj/banner_blue/banner_blue.obj" },
  { path: "/obj/banner_green/banner_green.obj" },
  { path: "/obj/barrier/barrier.obj" },
  { path: "/obj/table_long_decorated_A/table_long_decorated_A.obj" },
  { path: "/obj/floor_foundation_corner/floor_foundation_corner.obj" },
  { path: "/obj/key/key.obj" },
];

const sceneData = {
  objects: objDataScene.map(objectOnScene => ({
    position: objectOnScene.position,
    orientation: objectOnScene.orientation,
    scale: objectOnScene.scale,
    texture: objectOnScene.texture,
    geometry: objectOnScene.geometry,
    cameraSettings: {
      position: objectOnScene.cameraPosition,
      target: objectOnScene.cameraTarget,
      fieldOfView: objectOnScene.fieldOfView,
      aspectRatio: objectOnScene.aspectRatio,
      nearPlane: objectOnScene.nearPlane,
      farPlane: objectOnScene.farPlane
    }
  }))
};
 export { sceneData };

export function saveSceneToJson(filename) {
  const jsonData = JSON.stringify(sceneData);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "scene.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

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

export async function renderSelect(title, index) {
  objectsOnScene.push({ objAddress: objAddresses[index] });

  const objData = await loadObj(
    gl,
    objectsOnScene[objectsOnScene.length - 1].objAddress,
    novaTexturaP
  );
  objectsOnScene[objectsOnScene.length - 1].objData = objData;
  callObjData();
}

async function loadObj(gl, objAddress, novaTexturaP) {
  twgl.setAttributePrefix("a_");

  const objHref = objAddress.path;
  const response = await fetch(objHref);
  const text = await response.text();
  const obj = parseOBJ(text);

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
  const novaTextura = twgl.createTexture(gl, {
    src: novaTexturaP,
    flipY: true,
  });
  textures["texture1.png"] = novaTextura; //textura 1 está em

  console.log(" TEXTURES EM LOAD: ", textures);
  // load texture for materials
  for (const material of Object.values(materials)) {
    Object.entries(material)
      .filter(([key]) => key.endsWith("Map"))
      .forEach(([key, filename]) => {
        let texture = textures[filename];
        if (!texture) {
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
    diffuseMap: novaTextura,
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
    textures,
    novaTextura,
  };
}

function drawObj(gl) {
  function render(time) {
    if (objDataScene.length != 0) {
      time *= 0.0001;
      twgl.resizeCanvasToDisplaySize(gl.canvas);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.enable(gl.DEPTH_TEST);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.clearColor(0, 0, 0, 0);

      const fieldOfViewRadians = degToRad(60);
      const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

      for (const objectOnScene of objDataScene) {
        objectOnScene.textures = {
          defaultWhite: twgl.createTexture(gl, { src: [255, 255, 255, 255] }),
        };
        objectOnScene.novaTextura = twgl.createTexture(gl, {
          src: novaTexturaP,
          flipY: true,
        });
        objectOnScene.textures["texture1.png"] = objectOnScene.novaTextura; //textura 1 está em
        // console.log(" TEXTURES NO DRAW: ", objectOnScene.textures);

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
  let alterTexture = document.getElementById("alterTexture");

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

  alterTexture.onclick = function () {
    objDataScene[buttonIndex].textures;
    console.log(" TEXTURES NO ALTER: ", objDataScene[buttonIndex].textures);
  };
}

export async function saveCanvas(canvas, data, filename) {
  const canvasData = canvas.toDataURL();
  const jsonData = JSON.stringify(data);
  const combinetData = { canvasData, jsonData };
  console.log("save canvas");

  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log("dowload canvas");
}

await drawObj(gl);
