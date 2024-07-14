document.body.style.cursor = 'url("img/cursor.png"), auto';

document.addEventListener('DOMContentLoaded', function() {
  document.body.addEventListener('click', function() {
    console.log(document.body.style.cursor);
    if(document.body.style.cursor == 'url("img/cursor-dk.png"), auto'){
      document.body.style.cursor = 'url("img/cursor.png"), auto';
    }
    else{
      document.body.style.cursor = 'url("img/cursor-dk.png"), auto';
    }
  });
});


const program = new ogl.Program(gl, {
    vertex,
    fragment,
    uniforms: {
      uTime: { value: 0 },
      tWater: { value: texture },
      res: {
        value: new ogl.Vec4(window.innerWidth, window.innerHeight, a1, a2)
      },
      img: { value: new ogl.Vec2(imgSize[0], imgSize[1]) },
      // Note that the uniform is applied without using an object and value property
      // This is because the class alternates this texture between two render targets
      // and updates the value property after each render.
      tFlow: flowmap.uniform
    }
  });

  const mesh = new ogl.Mesh(gl, { geometry, program });

  window.addEventListener("resize", resize, false);
  resize();

  // Create handlers to get mouse position and velocity
  const isTouchCapable = "ontouchstart" in window;
  if (isTouchCapable) {
    window.addEventListener("touchstart", updateMouse, false);
    window.addEventListener("touchmove", updateMouse, { passive: false });
  } else {
    window.addEventListener("mousemove", updateMouse, false);
  }
  let lastTime;
  const lastMouse = new ogl.Vec2();
  function updateMouse(e) {
    e.preventDefault();
    if (e.changedTouches && e.changedTouches.length) {
      e.x = e.changedTouches[0].pageX;
      e.y = e.changedTouches[0].pageY;
    }
    if (e.x === undefined) {
      e.x = e.pageX;
      e.y = e.pageY;
    }
    // Get mouse value in 0 to 1 range, with y flipped
    mouse.set(e.x / gl.renderer.width, 1.0 - e.y / gl.renderer.height);
    // Calculate velocity
    if (!lastTime) {
      // First frame
      lastTime = performance.now();
      lastMouse.set(e.x, e.y);
    }

    const deltaX = e.x - lastMouse.x;
    const deltaY = e.y - lastMouse.y;

    lastMouse.set(e.x, e.y);

    let time = performance.now();

    // Avoid dividing by 0
    let delta = Math.max(10.4, time - lastTime);
    lastTime = time;
    velocity.x = deltaX / delta;
    velocity.y = deltaY / delta;
    // Flag update to prevent hanging velocity values when not moving
    velocity.needsUpdate = true;
  }
  requestAnimationFrame(update);
  function update(t) {
    requestAnimationFrame(update);
    // Reset velocity when mouse not moving
    if (!velocity.needsUpdate) {
      mouse.set(-1);
      velocity.set(0);
    }
    velocity.needsUpdate = false;
    // Update flowmap inputs
    flowmap.aspect = aspect;
    flowmap.mouse.copy(mouse);
    // Ease velocity input, slower when fading out
    flowmap.velocity.lerp(velocity, velocity.len ? 0.15 : 0.1);
    flowmap.update();
    program.uniforms.uTime.value = t * 0.01;
    renderer.render({ scene: mesh });
  }