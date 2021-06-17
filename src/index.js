window.onload = () => {
    initButton("button","comment","led");
    window.api.getEndpoint();
}
  
window.api.setSticker((label) => {
  switch(label){
    case "white":
      document.getElementById("sticker").style.visibility = "hidden";
      break;
    case "soracomug":
      document.getElementById("sticker").style.visibility = "visible";
      break;
  }
});
