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
  "/obj/bottle_A_brown/bottle_A_brown.obj",
  "/obj/banner_blue/banner_blue.obj",
  "/obj/banner_green/banner_green.obj",
  "/obj/barrier/barrier.obj",
  "/obj/table_long_decorated_A/table_long_decorated_A.obj",
  "/obj/floor_foundation_corner/floor_foundation_corner.obj",
  "/obj/key/key.obj",
];

document.addEventListener("DOMContentLoaded", async function () {
  for (let i = 0; i < Math.min(idCanvas.length, objAddresses.length); i++) {
    main(idCanvas[i], objAddresses[i]);
  }

  const boxes = document.querySelectorAll(".box-models li");
  const buttonContainer = document.querySelector(".buttonContainer");

  boxes.forEach(function (box, index) {
    box.onclick = function () {
      idCanvas = "canvasScene";
      main(idCanvas, objAddresses[index]);
      
      const titles = ["Garrafa", "Banner Azul", "Banner Verde", "Barreira", "Mesa", "Chão", "Chave"];
      const title = titles[index] || "Título Padrão";
     
      console.log("Clicou na caixa " + index);
      const newButton = document.createElement("button");
      newButton.textContent = title;
      
      newButton.addEventListener("click", function () {
        newButton.classList.add("buttonContainer");
        newButton.style.display = "block";
      });

      buttonContainer.appendChild(newButton);
    };
  });
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
