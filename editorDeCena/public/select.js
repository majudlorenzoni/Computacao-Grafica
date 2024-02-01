import {main} from './main.js';
console.log("importação funcionando");

document.addEventListener("DOMContentLoaded", async function () {


  const { idCanvas, objAddresses } = await main()
  function selectModel(idCanvas, objAddresses) {
    let canvas = document.getElementById(idCanvas);
    const selectCanva = idCanvas;
    const selectObj = objAddresses;
    main(selectCanva, selectObj);
    console.log("select canva ok");
  }

  const boxes = document.querySelectorAll(".box-models li");
  boxes.forEach(function (box, index) {
    box.onclick = function () {
      selectModel(idCanvas[index], objAddresses[index]);

    };
  });
});
