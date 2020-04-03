// 定义全局变量
let container, scene, camera, renderer, controls;
let keyboard = new THREEx.KeyboardState();
let clock = new THREE.Clock;
let stats;
let movingCar;
let collisionList = [];
let obstacles = [];
let crash = false;
let id = 0;
let score = 0;
let crashId = " ";
let lastCrashId = " ";
let randomRate = 0.04;
let randomCar = 30;
let speed = 25;
let randomColor = [
  '#0091ea',
  '#ffd600',
  '#f8bbd0',
  '#ffab00',
  '#546e7a',
  '#b388ff',
  '#4db6ac',
  '#c5cae9',
  '#a1887f'
]

let state = {
  left: false,
  right: false,
  top: false,
  bottom: false
}

let leftBtn = document.querySelector('#left');
let rightBtn = document.querySelector('#right');
let topBtn = document.querySelector('#top');
let bottomBtn = document.querySelector('#bottom');
let scoreDiv = document.querySelector('#score');
//
// var peer = new Peer('zhangyuwei', {
//   host: '127.0.0.1',
//   port: 9000,
//   path: '/'
// });
// // on open will be launch when you successfully connect to PeerServer
// peer.on('open', function(id) {
//   console.log('My peer ID is: ' + id);
// });
//
// peer.on('connection', function(conn) {
//   console.log('coon', conn)
// });
//
// var conn = peer.connect('zhangyuwei2');
// conn.on('open', function() {
//   // Receive messages
//   conn.on('data', function(data) {
//     console.log('Received', data);
//   });
//
//   // Send messages
//   conn.send('Hello!zhangyuwei2');
// });


init();
animate();

function init() {
  // Scene
  scene = new THREE.Scene();
  // Camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 5000);
  camera.position.set(0, 100, 300);
  
  // renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    logarithmicDepthBuffer: true,
    canvas: document.getElementById("three")
  });
  
  // 天的颜色
  renderer.setClearColor(new THREE.Color(0x69c6d0));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  
  // 加入地面
  let floorMaterial = new THREE.MeshBasicMaterial({
    color: 0x222222,
    side: THREE.DoubleSide,
  });
  let floorGeometry = new THREE.PlaneGeometry(500, 11000, 10, 10);
  let floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = Math.PI / 2;
  floor.position.z = 2000;
  scene.add(floor);
  
  // 加入分割线
  let whiteMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide
  });

  let whiteGeometry = new THREE.PlaneGeometry(8, 7000, 1, 1);

  let leftOne = new THREE.Mesh(whiteGeometry, whiteMaterial);
  let rightOne = leftOne.clone();

  leftOne.rotation.x = Math.PI / 2;
  rightOne.rotation.x = Math.PI / 2;

  leftOne.position.x -= 250;
  rightOne.position.x += 250;

  scene.add(leftOne);
  scene.add(rightOne);
  
  // 草地
  let grassGeomery = new THREE.PlaneBufferGeometry(6000, 7000);
  let grassMaterial = new THREE.MeshLambertMaterial({
    color: 0x689f38
  });
  let grass = new THREE.Mesh(grassGeomery,grassMaterial);
  
  grass.name = "Grass";
  grass.rotation.x = -Math.PI/2;
  grass.position.set(0, -0.05, -1);
  scene.add(grass);
  
  // 雾
  scene.fog = new THREE.Fog(0x69c6d0, 1000, 3000);
  
  // 光线
  let ambientLight = new THREE.AmbientLight(0xffffff);
  ambientLight.name = "Ambient Light";
  scene.add(ambientLight);
  
  // 环境光
  let hemiLight = new THREE.HemisphereLight(0x0044ff, 0xffffff, 0.5);
  hemiLight.name = "Hemisphere Light";
  hemiLight.position.set(0, 5, 200);
  scene.add(hemiLight);

  let cubeGeometry = new THREE.DodecahedronGeometry(20, 1);
  let wireMaterial = new THREE.MeshStandardMaterial({
    color: 0xe5f2f2,
    flatShading: true
  });
  movingCar = new THREE.Mesh(cubeGeometry, wireMaterial);
  movingCar.position.set(0, 25, 0);
  movingCar.receiveShadow = true;
  movingCar.castShadow = true;
  scene.add(movingCar);
  
  // 云
  let Cloud = function () {
    // Create an empty container for the cloud
    this.mesh = new THREE.Object3D();
    // Cube geometry and material
    var geom = new THREE.DodecahedronGeometry(20,0);
    let mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      flatShading: true
    });
    let nBlocs = 3+Math.floor(Math.random()*3);
    
    for (var i=0; i<nBlocs; i++ ){
      //Clone mesh geometry
      var m = new THREE.Mesh(geom, mat);
      //Randomly position each cube
      m.position.x = i*15;
      m.position.y = Math.random()*10;
      m.position.z = Math.random()*10;
      m.rotation.z = Math.random()*Math.PI*2;
      m.rotation.y = Math.random()*Math.PI*2;
      
      //Randomly scale the cubes
      var s = .1 + Math.random()*.9;
      m.scale.set(s,s,s);
      this.mesh.add(m);
    }
  }
  
  for (let i = 0; i < 8; i++) {
    let c = new Cloud();
    // this is the distance between the center of the axis and the cloud itself
    let po = getRandomInt(5, 7);
    let hi = getRandomInt(-6, -4);
    let xi = getRandomInt(-4, 4);
    c.mesh.position.y = po * 20;
    c.mesh.position.x = xi * 250;
    c.mesh.position.z = hi * 200;
    // random scale
    let s = 1 + Math.random() * 2;
    c.mesh.scale.set(s,s,s);
    scene.add(c.mesh);
  }
  
  // stats
  stats = initStats();
  
  // window resize
  window.addEventListener('resize', onWindowResize);
  
  leftBtn.addEventListener('touchstart', handleLeftStart);
  leftBtn.addEventListener('touchend', handleLeftEnd);
  rightBtn.addEventListener('touchstart', handleRightStart);
  rightBtn.addEventListener('touchend', handleRightEnd);
  topBtn.addEventListener('touchstart', handleTopStart);
  topBtn.addEventListener('touchend', handleTopEnd);
  bottomBtn.addEventListener('touchstart', handleBottomStart);
  bottomBtn.addEventListener('touchend', handleBottomEnd);
  
  scoreDiv.innerHTML = score;
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  update();
}

function update() {
  stats.update();
  controls.update();
  let delta = clock.getDelta();
  movingCar.rotation.x -= 3 * Math.PI / 180;
  let moveDistance = 200 * delta;
  if (keyboard.pressed("left") || keyboard.pressed("A") || state.left) {
    if (movingCar.position.x > -270)
      movingCar.position.x -= moveDistance;
    // if (camera.position.x > -150) {
      // camera.position.x -= moveDistance * 0.6;
      // if (camera.rotation.z > -5 * Math.PI / 180) {
      //   camera.rotation.z -= 0.2 * Math.PI / 180;
      // }
    // }
  }
  if (keyboard.pressed("right") || keyboard.pressed("D") || state.right) {
    if (movingCar.position.x < 270)
      movingCar.position.x += moveDistance;
    // if (camera.position.x < 150) {
      // camera.position.x += moveDistance * 0.6;
      // if (camera.rotation.z < 5 * Math.PI / 180) {
      //   camera.rotation.z += 0.2 * Math.PI / 180;
      // }
    // }
  }
  if (keyboard.pressed("up") || keyboard.pressed("W") || state.top) {
    movingCar.position.z -= moveDistance;
  }
  if (keyboard.pressed("down") || keyboard.pressed("S") || state.bottom) {
    movingCar.position.z += moveDistance;
  }
  // threejs的几何体默认情况下几何中心在场景中坐标是坐标原点。
  // 可以通过position属性或.getWorldPosition()方法获得模型几何中心的世界坐标
  let originPoint = movingCar.position.clone();
  //球体网格模型几何体的所有顶点数据
  let vertices = movingCar.geometry.vertices
  for (let vertexIndex = 0; vertexIndex < movingCar.geometry.vertices.length; vertexIndex++) {
    // 顶点原始坐标
    let localVertex = vertices[vertexIndex].clone();
    // 顶点经过变换后的坐标
    // vertices[i]获得几何体索引是i的顶点坐标，
    // 注意执行.clone()返回一个新的向量，以免改变几何体顶点坐标值
    // 几何体的顶点坐标要执行该几何体绑定模型对象经过的旋转平移缩放变换
    // 几何体顶点经过的变换可以通过模型的本地矩阵属性.matrix或世界矩阵属性.matrixWorld获得
    let globalVertex = localVertex.applyMatrix4(movingCar.matrix);
    // 获得由中心指向顶点的向量
    let directionVector = globalVertex.sub(movingCar.position);
    // 将方向向量初始化,并发射光线
    // Ray caster构造函数创建一个射线投射器对象，参数1、参数2改变的是该对象的射线属性.ray
    // 参数1：射线的起点
    // 参数2：射线的方向，注意归一化的时候，需要先克隆,否则后面会执行dir.length()计算向量长度结果是1
    let ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
    // 检测射线与多个物体的相交情况
    // 如果为true，它还检查所有后代。否则只检查该对象本身。缺省值为false
    let collisionResults = ray.intersectObjects(collisionList, true);
    // 如果返回结果不为空，且交点与射线起点的距离小于物体中心至顶点的距离，则发生了碰撞
    // intersects[0].distance：射线起点与交叉点之间的距离(交叉点：射线和模型表面交叉点坐标)
    // dir.length()：球体顶点和球体几何中心构成向量的长度
    // 通过距离大小比较判断是否碰撞
    // intersects[0].distance小于dir.length()，说明交叉点的位置在射线起点和球体几何体顶点之间，
    // 而交叉点又在立方体表面上,也就是说立方体部分表面插入到了球体里面
    if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
      crash = true;
      crashId = collisionResults[0].object.name;
      break;
    }
    crash = false;
  }
  // 计算量
  // 通过上面的代码你可以看到
  // 如果要判断一个网格模型和另一个网格模型是否碰撞
  // 需要循环遍历该模型绑定几何体Geometry的所有顶点位置坐标
  // 然后分别创建一个射线
  // 然后把创建的射线与其它网格模型进行射线拾取交叉计算
  // 这也就是说该模型几何体的顶点数量阅读
  // 计算量越大。
  if (crash) {
    movingCar.material.color.setHex(0xe91e63);
    console.log("Crash");
    if (crashId !== lastCrashId) {
      if (score > 100) {
        score -= 100;
      } else {
        score = 0;
      }
      lastCrashId = crashId;
    }
  } else {
    movingCar.material.color.setHex(0xe5f2f2);
  }
  if (Math.random() < randomRate && obstacles.length < randomCar) {
    makeRandomCar();
  }
  for (i = 0; i < obstacles.length; i++) {
    if (obstacles[i].position.z > camera.position.z) {
      scene.remove(obstacles[i]);
      obstacles.splice(i, 1);
      collisionList.splice(i, 1);
      score += 10;
    } else {
      obstacles[i].position.z += speed;
    }
  }
  scoreDiv.innerHTML = score;
}

function makeRandomCar() {
  let index = getRandomInt(0, 8);
  let color = randomColor[index];
  let name = "car_" + id;
  id++;
  // mess 初始化
  let mess = new THREE.Object3D();
  mess.name = name;
  // trunk 初始化 position
  let a = getRandomInt(-2, 2) * 80;
  let b = 30;
  let c = getRandomArbitrary(-15, -20) * 100;
  mess.position.set(a, b, c);
  scene.add(mess);
  obstacles.push(mess);
  collisionList.push(mess);
  // Body
  let truckBodyBase = new THREE.Mesh(new THREE.BoxGeometry(50,40,100));
  let truckFront = new THREE.Mesh(new THREE.BoxGeometry(50,15,25));
  let truckBack = new THREE.Mesh(new THREE.BoxGeometry(50,15,45));
  // 上底半径 下底半径 高度 圆柱周围的分段面数 沿着圆柱高度的面的行数
  let frontTireHoles = new THREE.Mesh(new THREE.CylinderGeometry(12,12,50,16,16,false));
  let backTireHoles = frontTireHoles.clone();
  let trunk = new THREE.Mesh(new THREE.BoxGeometry(44,15,40));

  truckFront.position.set(0,12.5,-37.5);
  truckBack.position.set(0,12.5,30);

  frontTireHoles.position.set(0, -20, -30);
  frontTireHoles.rotation.z = 90 * Math.PI/180;

  backTireHoles.position.set(0, -20, 30);
  backTireHoles.rotation.z = frontTireHoles.rotation.z;

  trunk.position.set(0, 1, 27.5);

  truckBodyBase.updateMatrix();
  truckFront.updateMatrix();
  truckBack.updateMatrix();
  frontTireHoles.updateMatrix();
  backTireHoles.updateMatrix();
  trunk.updateMatrix();

  let truckBodyBase_CSG = CSG.fromMesh(truckBodyBase);
  let truckFront_CSG = CSG.fromMesh(truckFront);
  let truckBack_CSG = CSG.fromMesh(truckBack);
  let frontTireHoles_CSG = CSG.fromMesh(frontTireHoles);
  let backTireHoles_CSG = CSG.fromMesh(backTireHoles);
  let trunk_CSG = CSG.fromMesh(trunk);
  let truckBody_CSG = truckBodyBase_CSG
      .subtract(truckFront_CSG)
      .subtract(truckBack_CSG)
      .subtract(frontTireHoles_CSG)
      .subtract(backTireHoles_CSG)
      .subtract(trunk_CSG);
  let truckBody = CSG.toMesh(truckBody_CSG, truckBodyBase.matrix);

  truckBody.material = new THREE.MeshLambertMaterial({
    color: color
  });
  truckBody.position.set(0,0.5,0);
  truckBody.castShadow = true;
  mess.add(truckBody);

  // Wheels
  let wheelGeo = new THREE.CylinderGeometry(10, 10, 5, 24, 24, false);
  let wheelMat = new THREE.MeshLambertMaterial({
    color: 0x171717
  });
  let wheel = new THREE.Mesh(wheelGeo,wheelMat);
  wheel.castShadow = true;
  wheel.rotation.z = -0.5 * Math.PI;

  let wheelPos = [
    {x: -22.5, y: -15, z: 30, name: "BL"},
    {x: 22.5, y: -15, z: 30, name: "BR"},
    {x: -22.5, y: -15, z: -30, name: "FL"},
    {x: 22.5, y: -15, z: -30, name: "FR"}
  ];
  for (let p of wheelPos) {
    var w = wheel.clone();
    w.name = p.name;
    w.position.set(p.x,p.y,p.z);
    mess.add(w);
  }
  // IV. Windows
  let windowMat = new THREE.MeshLambertMaterial({
    color: 0x171717
  });

  let	horzWindowGeo = new THREE.PlaneBufferGeometry(44, 12);
  let	horzWindowMat = windowMat;
  let	horzWindow = new THREE.Mesh(horzWindowGeo,horzWindowMat);

  let	midFrontWindowGeo = new THREE.PlaneBufferGeometry(14, 12);
  let	midFrontWindowMat = windowMat;
  let	midFrontWindow = new THREE.Mesh(midFrontWindowGeo,midFrontWindowMat);

  let	midBackWindowGeo = new THREE.PlaneBufferGeometry(10, 12);
  let	midBackWindowMat = windowMat;
  let	midBackWindow = new THREE.Mesh(midBackWindowGeo,midBackWindowMat);

  horzWindow.receiveShadow = true;
  midFrontWindow.receiveShadow = true;
  midBackWindow.receiveShadow = true;

  let leftMFWindow = midFrontWindow.clone();
  leftMFWindow.position.set(-25.1, 15.5, -15.5);
  leftMFWindow.rotation.y = -0.5 * Math.PI;
  mess.add(leftMFWindow);

  let rightMFWindow = midFrontWindow.clone();
  rightMFWindow.position.set(25.1, 15.5,-15.5);
  rightMFWindow.rotation.y = 0.5 * Math.PI;
  mess.add(rightMFWindow);

  let leftMBWindow = midBackWindow.clone();
  leftMBWindow.position.set(-25.1, 15.5, -0.5);
  leftMBWindow.rotation.y = -0.5 * Math.PI;
  mess.add(leftMBWindow);

  let rightMBWindow = midBackWindow.clone();
  rightMBWindow.position.set(25.1, 15.5,-0.5);
  rightMBWindow.rotation.y = 0.5 * Math.PI;
  mess.add(rightMBWindow);

  let frontWindow = horzWindow.clone();
  frontWindow.position.set(0, 15.5, -25.1);
  frontWindow.rotation.y = Math.PI;
  mess.add(frontWindow);

  let backWindow = horzWindow.clone();
  backWindow.position.set(0, 15.5, 7.6);
  mess.add(backWindow);

  /// V. Lights
  let lightGeo = new THREE.PlaneBufferGeometry(7.5, 10);
  let frontLightMat = new THREE.MeshLambertMaterial({
    color: 0xf1f1f1
  });
  let frontLight = new THREE.Mesh(lightGeo,frontLightMat);
  let backLightMat = new THREE.MeshLambertMaterial({
    color: 0xf65555
  });
  let backLight = new THREE.Mesh(lightGeo,backLightMat);

  frontLight.rotation.y = Math.PI;

  let frontLeftLight = frontLight.clone();
  frontLeftLight.position.set(-21.25, 2.5, -50.1);
  mess.add(frontLeftLight);

  let frontRightLight = frontLight.clone();
  frontRightLight.position.set(21.25, 2.5, -50.1);
  mess.add(frontRightLight);

  let backLeftLight = backLight.clone();
  backLeftLight.position.set(-21.25, 2.5, 50.1);
  mess.add(backLeftLight);

  let backRightLight = backLight.clone();
  backRightLight.position.set(21.25, 2.5, 50.1);
  mess.add(backRightLight);
}

function initStats() {
  var stats = new Stats();
  //设置统计模式
  stats.setMode(0); // 0: fps, 1: ms
  //将统计对象添加到对应的<div>元素中
  stats.domElement.style.position = 'fixed';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.getElementById("stats").appendChild(stats.domElement);
  return stats;
}

// 返回一个介于min和max之间的随机数
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

// 返回一个介于min和max之间的整型随机数
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// 浏览器窗口变动触发的方法
function onWindowResize() {
  // 重新设置相机宽高比例
  camera.aspect = window.innerWidth / window.innerHeight;
  // 更新相机投影矩阵
  camera.updateProjectionMatrix();
  // 重新设置渲染器渲染范围
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function handleLeftStart() { state.left = true; }
function handleLeftEnd() { state.left = false; }
function handleRightStart() { state.right = true; }
function handleRightEnd() { state.right = false; }
function handleTopStart() { state.top = true; }
function handleTopEnd() { state.top = false; }
function handleBottomStart() { state.bottom = true; }
function handleBottomEnd() { state.bottom = false; }
