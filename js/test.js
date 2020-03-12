// 加入控制的cube
// movingCube = new THREE.Object3D();
// movingCube.name = 'movingCube';

// // moving car body
// let truckBodyBase = new THREE.Mesh(new THREE.BoxGeometry(50,40,100));
// // 上底半径 下底半径 高度 圆柱周围的分段面数 沿着圆柱高度的面的行数
// let frontTireHoles = new THREE.Mesh(new THREE.CylinderGeometry(12,12,50,16,16,false));
// let backTireHoles = frontTireHoles.clone();
// let trunk = new THREE.Mesh(new THREE.BoxGeometry(44,15,40));

// frontTireHoles.position.set(0, -20, -30);
// frontTireHoles.rotation.z = 90 * Math.PI/180;

// backTireHoles.position.set(0, -20, 30);
// backTireHoles.rotation.z = frontTireHoles.rotation.z;

// trunk.position.set(0, 1, 27.5);

// truckBodyBase.updateMatrix();
// frontTireHoles.updateMatrix();
// backTireHoles.updateMatrix();
// trunk.updateMatrix();

// let truckBodyBase_BSP = CSG.fromMesh(truckBodyBase);
// let frontTireHoles_BSP = CSG.fromMesh(frontTireHoles);
// let backTireHoles_BSP = CSG.fromMesh(backTireHoles);
// let trunk_BSP = CSG.fromMesh(trunk);
// let truckBody_BSP = truckBodyBase_BSP
//     .subtract(frontTireHoles_BSP)
//     .subtract(backTireHoles_BSP)
//     .subtract(trunk_BSP);

// let truckBody = CSG.toMesh(truckBody_BSP, truckBodyBase.matrix);
// truckBody.material = new THREE.MeshLambertMaterial({
//   color: 0x171717
// });
// truckBody.castShadow = true;
// movingCube.add(truckBody);
// movingCube.position.set(0, 30, 0);