var square = document.querySelector(".square");
var square2 = document.querySelector(".square2");
var input = document.querySelector(".animVal");
var button = document.querySelector(".button");
var text = document.querySelector(".text");
var canvas = document.querySelector(".canvas");

var context = canvas.getContext("2d");
context.fillStyle = "#fff";
context.strokeStyle = "#fff";
var lastLinePos = [0, 500];

function fadeOut(element, val) {
  element.style.opacity = 1.0 - val;
}

function fadeBothOut(val) {
  fadeOut(square, Animator.partitionAnimation(val, 0, 0.7));
  fadeOut(square2, Animator.partitionAnimation(val, 0.4, 1));
}

function drawCanvas(val) {
  var currentPos = [val*500, (1-easeInOutQuad(val))*500];
  context.beginPath();
  context.moveTo(lastLinePos[0], lastLinePos[1]);
  context.lineTo(currentPos[0], currentPos[1]);
  context.stroke();
  lastLinePos = currentPos
}

//function easeIn(val) {
  //return val*val;
//}

function easeInOutQuad(val) {
  val /= 1/2;
  if (val < 1) return 1/2*val*val;
  val--;
  return -1/2 * (val*(val-2) - 1);
};

input.addEventListener("input", function() {
  var val = input.value;
  //val = easeIn(val);
  //fadeOut(val);
  anim.setVal(parseFloat(val));
});

var anim = new Animator(fadeBothOut);
//anim.setEasing(easeInOutQuad);
var dir = 1;

button.addEventListener("click", function() {
  context.clearRect(0, 0, 500, 500);
  if (dir == 1) {
    anim.playForward().then(function() {
      text.value += "\nresolved";
    }, function() {
      text.value += "\nrejected";
    });
  } else {
    anim.playBackwards().then(function() {
      text.value += "\nresolved";
    }, function() {
      text.value += "\nrejected";
    });
  }
  dir *= -1;
});
