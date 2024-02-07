import { parseOBJ, parseMTL, vs, fs } from "./read.js";
import { degToRad, getExtents, getGeometriesExtents } from "./read.js";

let canvas = document.getElementById("canvasScene");
let gl = canvas.getContext("webgl2");
const meshProgramInfo = twgl.createProgramInfo(gl, [vs, fs]);
let objDataScene = [];
let objectsOnScene = [];
let countObj = [];

let objAddresses = [
  { path: "/obj/bottle_A_brown/bottle_A_brown.obj" },
  { path: "/obj/banner_blue/banner_blue.obj" },
  { path: "/obj/banner_green/banner_green.obj" },
  { path: "/obj/barrier/barrier.obj" },
  { path: "/obj/table_long_decorated_A/table_long_decorated_A.obj" },
  { path: "/obj/floor_foundation_corner/floor_foundation_corner.obj" },
  { path: "/obj/key/key.obj" },
];

console.log("OBJETCS ON SCENE: ", objectsOnScene);

async function loadObj(gl, objAddress) {
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

  const extents = getGeometriesExtents(parts[0].obj.geometries);
  const range = m4.subtractVectors(extents.max, extents.min);
  // deslocamento do objeto para o centro
  const objOffset = m4.scaleVector(
    m4.addVectors(extents.min, m4.scaleVector(range, 0.5)),
    -1
  );
  const cameraTarget = [0, 0, 0];

  const radius = m4.length(range) * 1.2; //escala
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
  };
}

function drawObj(gl) {
  function render(time) {
    if (objDataScene.length != 0) {
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

        let u_world = m4.yRotation(objectOnScene.yrotation ? objectOnScene.yrotation : time);
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

export async function renderSelect(title, index) {
  objectsOnScene.push({ objAddress: objAddresses[index] });
  
  for (let i = 0; i < objectsOnScene.length; i++) {
    const objData = await loadObj(gl, objectsOnScene[i].objAddress);
    objectsOnScene[i].objData = objData;
    console.log("OBJ DATA>>>>>>>>>>> ", objData);
    countObj = i + 1;
  }
  callObjData();
}

async function callObjData() {
  objDataScene = objectsOnScene.map((obj) => {
    return obj.objData;
  });
  console.log("VAPO VAPO", objDataScene);
}

export async function clearCanvas(gl) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  console.log("LIMPOU O CANVAS");
}

await drawObj(gl);

export async function transformationEditing(buttonIndex) {
  let input = document.getElementById("rotation");
  console.log("ObjDataScene: ", objDataScene, "Index: ", buttonIndex);
  input.onchange = function () {
    console.log(input.value);
    objDataScene[buttonIndex].yrotation = input.value;
  }
}
