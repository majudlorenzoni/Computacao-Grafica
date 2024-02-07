import { parseOBJ, parseMTL, vs, fs } from "./read.js";
import { degToRad, getExtents, getGeometriesExtents } from "./read.js";

let idCanvas = [
  "canvas1",
  "canvas2",
  "canvas3", 
  "canvas4",
  "canvas5",
  "canvas6",
  "canvas7",
];

let objAddresses = [
  { path: "/obj/bottle_A_brown/bottle_A_brown.obj"},
  { path: "/obj/banner_blue/banner_blue.obj" },
  { path: "/obj/banner_green/banner_green.obj" },
  { path: "/obj/barrier/barrier.obj" },
  { path: "/obj/table_long_decorated_A/table_long_decorated_A.obj"},
  { path: "/obj/floor_foundation_corner/floor_foundation_corner.obj"},
  { path: "/obj/key/key.obj"},
];

async function loadObj(gl, objAddress) {
  const meshProgramInfo = twgl.createProgramInfo(gl, [vs, fs]);
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
    const vao = twgl.createVAOFromBufferInfo(
      gl,
      meshProgramInfo,
      bufferInfo
    );

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
  // figure out how far away to move the camera so we can likely
  // see the object.
  const radius = m4.length(range) * 1.2;
  const cameraPosition = m4.addVectors(cameraTarget, [0, 0, radius]);
  // Set zNear and zFar to something hopefully appropriate
  // for the size of this object.
  const zNear = radius / 100;
  const zFar = radius * 3;

  return { parts, meshProgramInfo, objOffset, cameraPosition, cameraTarget, zNear, zFar };
}

function drawObj(gl, { parts, meshProgramInfo, objOffset, cameraPosition, cameraTarget, zNear, zFar }) {
  function render(time) {
    time *= 0.001; 

    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);

    const fieldOfViewRadians = degToRad(60);
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projection = m4.perspective(
      fieldOfViewRadians,
      aspect,
      zNear,
      zFar
    );

    const up = [0, 1, 0];
    const camera = m4.lookAt(cameraPosition, cameraTarget, up);
    const view = m4.inverse(camera);

    const sharedUniforms = {
      u_lightDirection: m4.normalize([-1, 3, 5]),
      u_view: view,
      u_projection: projection,
      u_viewWorldPosition: cameraPosition,
    };

    gl.useProgram(meshProgramInfo.program);
    twgl.setUniforms(meshProgramInfo, sharedUniforms);
    
    let u_world = m4.yRotation(time);
    u_world = m4.translate(u_world, ...objOffset);

    for (const { bufferInfo, vao, material, scale } of parts) {
   
      // set the attributes for this part.
      gl.bindVertexArray(vao);
      // calls gl.uniform
      twgl.setUniforms(
        meshProgramInfo,
        {
          u_world,
        },
        material
      );
      // calls gl.drawArrays or gl.drawElements
      twgl.drawBufferInfo(gl, bufferInfo);
    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

export async function renderMenu() {
  for(let i = 0; i < Math.min(idCanvas.length, objAddresses.length); i++) {
    let canvas = document.getElementById(idCanvas[i]);
    let gl = canvas.getContext("webgl2");
    if (!gl) {
      alert("No se pudo inicializar WebGL 2.0. Tu navegador o máquina puede no soportarlo.");
      return;
    }
    let objAddress = objAddresses[i];
    const objData = await loadObj(gl, objAddress);
    drawObj(gl, objData);
  }
}

renderMenu();
