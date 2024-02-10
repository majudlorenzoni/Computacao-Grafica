import {
  renderSelect,
  clearCanvas,
  transformationEditing,
} from "./renderSelect.js";


document.addEventListener("DOMContentLoaded", async function () {
  const boxes = document.querySelectorAll(".box-models li");
  const buttonContainer = document.querySelector(".buttonContainer");

  const clearButton = document.getElementById("btnLimpar");
  clearButton.addEventListener("click", function () {
    const gl = document.getElementById("canvasScene").getContext("webgl2");
    clearCanvas(gl);
    document.getElementById("buttonContainer").innerHTML = "";
  });

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
        "Vela",
        "Chão Madeira",
        "Escada",
      ];
      const title = titles[index];
      renderSelect(index); // Chama renderSelect com o índice do modelo selecionado

      const newButton = document.createElement("button");
      newButton.textContent = title;
      
      const buttonIndex = buttonCount;
      buttonCount++;

      newButton.addEventListener("click", function () {
        console.log("Button index: ", buttonIndex);
        transformationEditing(buttonIndex); // Chama a função
        newButton.classList.add("buttonContainer");
        newButton.style.display = "block";
      });
      // Adiciona o botão no container
      buttonContainer.appendChild(newButton);
    };
  });
});

