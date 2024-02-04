import { main } from "./main.js";

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
  { path: "/obj/bottle_A_brown/bottle_A_brown.obj", scale: [1, 1, 1.0],},
  { path: "/obj/banner_blue/banner_blue.obj", scale: [1.0, 1.0, 1.0],},
  { path: "/obj/banner_green/banner_green.obj", scale: [1, 1, 1.0],},
  { path: "/obj/barrier/barrier.obj", scale:[1.0, 1.0, 1.0],},
  { path: "/obj/table_long_decorated_A/table_long_decorated_A.obj", scale:[1.0, 1.0, 1.0],},
  { path: "/obj/floor_foundation_corner/floor_foundation_corner.obj", scale: [1.0, 1.0, 1.0],},
  { path: "/obj/key/key.obj", scale: [1.0, 1.0, 1.0],},
];

document.addEventListener("DOMContentLoaded", async function () {
  // renderiza os objetos no modelo
  for (let i = 0; i < Math.min(idCanvas.length, objAddresses.length); i++) {
    main(idCanvas[i], objAddresses[i]);
  }

  const boxes = document.querySelectorAll(".box-models li");
  const buttonContainer = document.querySelector(".buttonContainer");

  boxes.forEach(function (box, index) {
    box.onclick = function () {
      idCanvas = "canvasScene";
      // adiciona o modelo selecionado no canvas
      main(idCanvas, objAddresses[index]);

      const titles = [
        "Garrafa",
        "Banner Azul",
        "Banner Verde",
        "Barreira",
        "Mesa",
        "Chão",
        "Chave",
      ];
      const title = titles[index];

      const newButton = document.createElement("button");
      newButton.textContent = title;

      newButton.addEventListener("click", function () {
        // transformationEditing(objAddresses[index]);
        newButton.classList.add("buttonContainer");
        newButton.style.display = "block";
      });
      // adiciona o botão no container
      buttonContainer.appendChild(newButton);
    };
  });

  // // adiciona os botões de transformação
  // function transformationEditing(objAddress) {
  //   clearTransformationOptions();
  
  //   const transformationOptionsDiv = document.createElement("div");
  //   transformationOptionsDiv.className = "transformation-options";
  
  //   const scaleLabel = document.createElement("label");
  //   scaleLabel.textContent = "Escala: ";
  
  //   const scaleInputX = createRangeInput("scaleX", 0, 100, 50);
  //   const scaleInputY = createRangeInput("scaleY", 0, 100, 50);
  //   const scaleInputZ = createRangeInput("scaleZ", 0, 100, 50);
  
  //   transformationOptionsDiv.appendChild(scaleLabel);
  //   transformationOptionsDiv.appendChild(scaleInputX);
  //   transformationOptionsDiv.appendChild(scaleInputY);
  //   transformationOptionsDiv.appendChild(scaleInputZ);
  
  //   const transformationEditingDiv = document.querySelector(
  //     ".transformation_editing"
  //   );
  //   transformationEditingDiv.appendChild(transformationOptionsDiv);
  
  //   const applyButton = document.createElement("button");
  //   applyButton.addEventListener("click", function () {
  //     const scale = [
  //       scaleInputX.value / 100,
  //       scaleInputY.value / 100,
  //       scaleInputZ.value / 100,
  //     ];
  //     applyTransformation(objAddress, scale);
  //     clearTransformationOptions();
  //   });
  
  //   transformationOptionsDiv.appendChild(applyButton);
  // }
  
  // function createRangeInput(id, min, max, defaultValue) {
  //   const input = document.createElement("input");
  //   input.type = "range";
  //   input.id = id;
  //   input.min = min;
  //   input.max = max;
  //   input.value = defaultValue;
  //   return input;
  // }
  
  // function clearTransformationOptions() {
  //   const existingOptions = document.querySelector(".transformation-options");
  //   if (existingOptions) {
  //     existingOptions.remove();
  //   }
  // }
  
  // function applyTransformation(objAddress, scale) {
  //   console.log("Aplicando transformação para " + objAddress);
  //   console.log("Escala: ", scale);
  // }
});

// async function clearScene(){
//   const canvas = document.getElementById(idCanvas);
//   console.log(canvas);
//   if (!canvas) {
//     console.error(`Canvas with ID "${idCanvas}" not found.`);
//     return;
//   }

//   const gl = canvas.getContext("webgl2");
//   if (!gl) {
//     console.error("WebGL2 not supported in this browser.");
//     return;
//   } else {

//     gl.clearColor(0.0, 0.5, 0.0, 1.0);
//     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT ) ; // Limpa o buffer de cor e o buffer de profundidade
//     console.log("limpando cena...");
//   }
// const btnClearScene = document.getElementById("btnClearScene");
// if (btnClearScene) {
//     btnClearScene.addEventListener("click", clearScene);
//   }
// }
