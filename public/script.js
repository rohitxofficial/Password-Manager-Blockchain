document.querySelector(".generate").addEventListener("click", function () {
  var p1 = document.getElementById("p1");
  var p2 = document.getElementById("p2");

  p1.innerHTML = "Master Username: " + makeString(16);
  p2.innerHTML = "Master Key: " + makeString(48);

  p1.classList.remove("invisible");
  p2.classList.remove("invisible");
});

const makeString = (length) => {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
