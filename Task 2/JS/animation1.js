let scene, camera, renderer, shape, geometry, canvas, width, height;

function init() {
  //Initialize canvas
  canvas = document.querySelector("#canvas");
  width = canvas.offsetWidth;
  height = canvas.offsetHeight;

  //Create a scene
  scene = new THREE.Scene();

  //Adding renderer
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(width, height);
  renderer.setClearColor(0xa7e7d8);
  renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);

  //Add camera to scene.
  camera = new THREE.PerspectiveCamera(80, width / height, 0.1, 1000);
  scene.add(camera);
  camera.position.z = 350;

  //Create new sphere geometry.
  geometry = new THREE.SphereGeometry(100, 50, 50);

  //Loop through each vertex.
  for (var i = 0; i < geometry.vertices.length; i++) {
    var vector = geometry.vertices[i];
    vector.org = vector.clone(); //vector.org stores original x,y,z of ith vertex.
  }

  // Light 1 comming from top and bottom.
  var light1 = new THREE.HemisphereLight(0xffffff, 0x140d70, 0.6);
  scene.add(light1);

  //Light2 and Light3 comming from specified directions.
  var light2 = new THREE.DirectionalLight(0x590d82, 0.5);
  light2.position.set(-100, 200, 350);
  scene.add(light2);
  var light3 = new THREE.DirectionalLight(0xbed0ff, 0.2);
  light3.position.set(100, 200, 300);
  scene.add(light3);

  // Adding material, here color.
  var material = new THREE.MeshLambertMaterial({
    emissive: 0x0b4a1d,
  });

  //Create new mesh (shape.)
  shape = new THREE.Mesh(geometry, material);
  shape.position.set(-100, 0, 0);

  scene.add(shape);
}

function updateVertices(time) {
  for (var i = 0; i < geometry.vertices.length; i++) {
    var vector = geometry.vertices[i];
    vector.copy(vector.org); //Coping back original ith vertex of shape.
    //Noise is generated using below method. This noise is used to distort sphere (shape).
    var perlin = noise.simplex3(
      vector.x * 0.007 + time * 0.0002,
      vector.y * 0.007 + time * 0.0003,
      vector.z * 0.007
    );
    var ratio = perlin * 0.6 * (mouse.y + 0.1) + 0.8;
    vector.multiplyScalar(ratio);
  }
  geometry.verticesNeedUpdate = true;
}

var mouse = new THREE.Vector2(0, 0); //Create 2D Vector and store value of x and y.

//TweenMax.to syntax (Target object, Delay in seconds, Object containing values to be changed.)

function onMouseMove(e) {
  TweenMax.to(mouse, 0.5, {
    y: e.clientY / width,
    x: e.clientX / height,
    ease: Power1.easeIn,
  });
}

window.addEventListener("mousemove", onMouseMove);
// Render
function animate(time) {
  requestAnimationFrame(animate); //Request for animation.
  updateVertices(time);
  renderer.render(scene, camera);
}
//Function for resize window.
function onWindowResize() {
  canvas.style.width = "";
  canvas.style.height = "";
  width = canvas.offsetWidth;
  height = canvas.offsetHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}
window.addEventListener("resize", onWindowResize, false);
init();
animate();
