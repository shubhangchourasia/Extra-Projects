let scene,
  camera,
  renderer,
  shape,
  geometry,
  canvas,
  width,
  height,
  positions,
  dots;

function init() {
  //Initialize canvas
  canvas = document.querySelector("#canvas");
  (width = canvas.offsetWidth), (height = canvas.offsetHeight);
  //Create a scene
  scene = new THREE.Scene();

  //Adding renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas, //The canvas in which everything will be displayed.
    antialias: true, //Used to smooth edges.
  });
  renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1); //Sets device pixel ratio.
  renderer.setSize(width, height); //Set width and height of renderer.
  renderer.setClearColor(0x58c285); //Background color.

  //Add camera to scene.
  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
  camera.position.z = 70;

  //Create a new geometry. On this shape all the dots will be displayed.
  // geometry = new THREE.SphereGeometry(50, 60, 60);
  geometry = new THREE.IcosahedronGeometry(50, 5);

  //Using bufferGeometry to represent dots.
  var bufferGeometry = new THREE.BufferGeometry();

  //Positions represents array with x,y,z coordinates for all the vertices in the geometry.
  //Initially all x,y,z are assigned 0.
  positions = new Float32Array(geometry.vertices.length * 3);

  //Looping through each vertex if geometry.
  for (var i = 0; i < geometry.vertices.length; i++) {
    var point = geometry.vertices[i]; //ith Vertex of geometry with x,y,z.
    animatePoints(i, point); //Passing index and vertex to animate it.

    point.toArray(positions, i * 3); //Passing x,y,z values stored in point to positions array.
  }

  //BufferAttribute store information of bufferGeometry.
  //Values passed are array: positions and itemSize: 3
  var attributePositions = new THREE.BufferAttribute(positions, 3);

  //Adding attribute to bufferGeometry.
  bufferGeometry.addAttribute("position", attributePositions);

  var shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: document.getElementById("vertexShader").textContent, //Vertex position after render.
    fragmentShader: document.getElementById("fragmentShader").textContent, //Vertex color after render.
    transparent: true,
  });
  dots = new THREE.Points(bufferGeometry, shaderMaterial); //Finally adding geometry and material to create a model.

  scene.add(dots);
}

function animatePoints(index, point) {
  //TweenMax.to syntax (Target object (Current vertex), Delay in seconds, Object containing values to be changed after animation.)
  TweenMax.to(point, 4, {
    x: 0, //Bring back x to 0.
    z: 0, //Bring back y to 0.
    ease: Back.easeOut,
    delay: Math.abs(point.y / 50) * 2, //Delay in points to reach specified position.
    repeat: -1, //Repeat is -1 to repeat infinetely.
    yoyo: true, //Yoyo is GSAP animation for back and forth animation.
    yoyoEase: Back.easeOut,
    onUpdate: function () {
      updatePoints(index, point); //Passed to function to update positions.
    },
  });
}
function updatePoints(index, point) {
  positions[index * 3] = point.x; //Update x of current vertex in loop.
  positions[index * 3 + 2] = point.z; //Update z of current vertex in loop.
}

init();

function animate() {
  dots.geometry.attributes.position.needsUpdate = true; // Required after the first render to repeat animation.
  renderer.render(scene, camera);
}
TweenMax.ticker.addEventListener("tick", animate); //Execute animate() after each render.

//Create 2D Vector and store value of x and y.
var mouse = new THREE.Vector2(0, 0);
function onMouseMove(e) {
  mouse.x = e.clientX / window.innerWidth - 0.75;
  mouse.y = e.clientY / window.innerHeight - 0.75;
  //Rotation of shape on mouse move event.
  TweenMax.to(dots.rotation, 4, {
    x: mouse.y,
    z: mouse.x,
    ease: Back.easeOut,
  });
}
window.addEventListener("mousemove", onMouseMove);

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
