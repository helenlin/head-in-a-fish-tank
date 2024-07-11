
window.onload=init;

function init()
{

    console.log("window has loaded");
    
}


let cursorState = 1;
document.body.addEventListener('click', function() {
  if (cursorState === 1) {
    document.body.classList.remove('custom-cursor-2');
    document.body.classList.add('custom-cursor-1');
    cursorState = 2;
  } else {
    document.body.classList.add('custom-cursor-2');
    cursorState = 1;
  }
  });

