<template>
  <div class="scene-container">
    <div ref="sceneContainer" class="three-scene">
      <LoginUI></LoginUI>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import LoginUI from './LoginUI.vue';

const sceneContainer = ref(null);

// Three.js变量
let scene, camera, renderer;
let clouds = [];
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
let animationFrameId = null;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

// 创建云朵
const createCloud = (x, y, z) => {
  const cloudGroup = new THREE.Group();
  
  // 创建云朵的多个球体
  const cloudGeo = new THREE.SphereGeometry(1, 8, 8);
  const cloudMat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    flatShading: true
  });
  
  // 创建多个球体组合成云朵
  for (let i = 0; i < 5; i++) {
    const sphere = new THREE.Mesh(cloudGeo, cloudMat);
    
    // 随机位置和大小
    const offsetX = Math.random() * 3 - 1.5;
    const offsetY = Math.random() * 1.5 - 0.75;
    const offsetZ = Math.random() * 1.5 - 0.75;
    const scale = 0.5 + Math.random() * 0.7;
    
    sphere.position.set(offsetX, offsetY, offsetZ);
    sphere.scale.set(scale, scale, scale);
    
    cloudGroup.add(sphere);
  }
  
  cloudGroup.position.set(x, y, z);
  scene.add(cloudGroup);
  
  // 添加一些随机属性用于动画
  cloudGroup.userData = {
    speed: 0.01 + Math.random() * 0.02,
    rotationSpeed: 0.001 + Math.random() * 0.002,
    scale: 0.8 + Math.random() * 0.4
  };
  
  cloudGroup.scale.multiplyScalar(cloudGroup.userData.scale);
  
  return cloudGroup;
};

// 初始化场景
const initScene = () => {
  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);
  scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
  
  // 创建相机
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;
  
  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  sceneContainer.value.appendChild(renderer.domElement);
  
  // 添加光源
  const ambientLight = new THREE.AmbientLight(0x777777); // 增加环境光亮度
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // 增加主光源强度
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);
  
  const backLight = new THREE.DirectionalLight(0xffffff, 0.8); // 增加背光强度
  backLight.position.set(-1, -1, -1);
  scene.add(backLight);
  
  // 创建云朵
  const cloudSpacing = 20;
  const gridSize = 5;
  
  for (let i = 0; i < gridSize * gridSize * gridSize; i++) {
    const x = (i % gridSize) * cloudSpacing - (gridSize * cloudSpacing) / 2;
    const y = Math.floor(i / gridSize) % gridSize * cloudSpacing - (gridSize * cloudSpacing) / 2;
    const z = Math.floor(i / (gridSize * gridSize)) * cloudSpacing - (gridSize * cloudSpacing) / 2;
    
    const cloud = createCloud(x, y, z);
    clouds.push(cloud);
  }
};

// 处理窗口大小变化
const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

// 处理鼠标移动
const onDocumentMouseMove = (event) => {
  mouseX = (event.clientX - windowHalfX) / 100;
  mouseY = (event.clientY - windowHalfY) / 100;
};

// 动画循环
const animate = () => {
  animationFrameId = requestAnimationFrame(animate);
  
  // 平滑跟随鼠标
  targetX = mouseX * 0.05;
  targetY = mouseY * 0.05;
  
  // 更新相机旋转
  camera.rotation.y += 0.05 * (targetX - camera.rotation.y);
  camera.rotation.x += 0.05 * (targetY - camera.rotation.x);
  
  // 更新云朵位置和旋转
  const time = Date.now() * 0.001;
  
  clouds.forEach(cloud => {
    cloud.rotation.y += cloud.userData.rotationSpeed;
    cloud.rotation.z += cloud.userData.rotationSpeed * 0.5;
    cloud.position.x += Math.sin(time * cloud.userData.speed) * 0.015;
    cloud.position.y += Math.cos(time * cloud.userData.speed * 1.2) * 0.01;
    cloud.position.z += Math.sin(time * cloud.userData.speed * 0.8) * 0.005;
  });
  
  renderer.render(scene, camera);
};

onMounted(() => {
  initScene();
  animate();
  
  window.addEventListener('resize', onWindowResize);
  document.addEventListener('mousemove', onDocumentMouseMove);
});

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize);
  document.removeEventListener('mousemove', onDocumentMouseMove);
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  // 清理Three.js资源
  if (renderer) {
    renderer.dispose();
  }
});
</script>

<style scoped>
.scene-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.three-scene {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>