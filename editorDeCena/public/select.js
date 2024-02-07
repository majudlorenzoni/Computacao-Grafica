import {
  renderSelect,
  clearCanvas,
  transformationEditing,
} from "./renderSelect.js";
import { renderMenu } from "./renderMenu.js";

document.addEventListener("DOMContentLoaded", async function () {
  const boxes = document.querySelectorAll(".box-models li");
  const buttonContainer = document.querySelector(".buttonContainer");

  //SALVAR
  //LIMPAR
  const clearButton = document.getElementById("btnLimpar");
  clearButton.addEventListener("click", function () {
    const gl = document.getElementById("canvasScene").getContext("webgl2");
    clearCanvas(gl);
  });
  //CARREGAR

  let buttonCount = 0;

  boxes.forEach(function (box, index) {
    box.onclick = function () {
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
      renderSelect(title, index); // Chama renderSelect com o índice do modelo selecionado

      const newButton = document.createElement("button");
      newButton.textContent = title;
      const buttonIndex = buttonCount;
      buttonCount++;

      newButton.addEventListener("click", function () {
        transformationEditing(buttonIndex); // Chama a função
        newButton.classList.add("buttonContainer");
        newButton.style.display = "block";
      });
      // Adiciona o botão no container
      buttonContainer.appendChild(newButton);
    };
  });
});
