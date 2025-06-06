<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const container = ref(null);
const loading = ref(true);
const error = ref(null);
let scene, camera, renderer, controls, carModel;

// 初始化场景
function initScene() {
  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);
  
  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
  
  // 添加定向光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);
  
  // 创建相机
  camera = new THREE.PerspectiveCamera(
    45,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1, 3);
  
  // 初始化渲染器
  renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.value.appendChild(renderer.domElement);
  
  // 添加轨道控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 1;
  controls.maxDistance = 10;
  
  // 添加坐标轴辅助
  const axesHelper = new THREE.AxesHelper(1);
  scene.add(axesHelper);
  
  // 添加网格地面
  const gridHelper = new THREE.GridHelper(10, 10);
  scene.add(gridHelper);
  
  // 加载模型
  loadModel();
}

// 加载glTF模型 - 修正路径问题
function loadModel() {
  const loader = new GLTFLoader();
  
  // 重要：确保路径正确
  // 将模型文件放在public/models/car目录下
  // 或者根据你的实际项目结构调整路径
  const modelPath = '/models/scene.gltf';
  
  loader.load(
    modelPath,
    (gltf) => {
      carModel = gltf.scene;
      loading.value = false;
      
      // 调整模型位置和缩放
      carModel.position.set(0, 0, 0);
      carModel.scale.set(0.5, 0.5, 0.5);
      
      // 添加到场景
      scene.add(carModel);
      
      // 计算包围盒居中模型
      centerModel();
    },
    (xhr) => {
      // 加载进度
      const percent = Math.round((xhr.loaded / xhr.total) * 100);
      console.log(`模型加载进度: ${percent}%`);
    },
    (err) => {
      console.error('模型加载失败:', err);
      loading.value = false;
      error.value = `模型加载失败: ${err.message}`;
    }
  );
}

// 居中模型
function centerModel() {
  if (!carModel) return;
  
  const box = new THREE.Box3().setFromObject(carModel);
  const size = box.getSize(new THREE.Vector3()).length();
  const center = box.getCenter(new THREE.Vector3());
  
  // 调整相机位置
  camera.position.x = center.x;
  camera.position.y = center.y;
  camera.position.z = center.z + size * 1.5;
  
  // 设置控制器目标
  controls.target.copy(center);
  controls.update();
}

// 动画循环
function animate() {
  requestAnimationFrame(animate);
  
  // 如果有模型，可以添加旋转效果
  if (carModel) {
    carModel.rotation.y += 0.005;
  }
  
  controls.update();
  renderer.render(scene, camera);
}

// 响应窗口大小变化
function onWindowResize() {
  if (!container.value || !camera || !renderer) return;
  
  camera.aspect = container.value.clientWidth / container.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
}

onMounted(() => {
  if (container.value) {
    initScene();
    animate();
    window.addEventListener('resize', onWindowResize);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize);
  if (renderer) {
    renderer.dispose();
  }
});
</script>

<template>
  <div class="model-container">
    <div ref="container" class="three-container"></div>
    
    <!-- 加载状态提示 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>加载模型中...</p>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="error" class="error-overlay">
      <div class="error-message">
        <h3>⚠️ 模型加载失败</h3>
        <p>{{ error }}</p>
        <p>请检查：</p>
        <ul>
          <li>模型文件是否位于 <code>/public/models/car/</code> 目录</li>
          <li>文件是否完整 (scene.gltf 和 scene.bin)</li>
          <li>文件命名是否正确</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.model-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #1a2a6c, #b21f1f, #1a2a6c);
}

.three-container {
  width: 100%;
  height: 100%;
}

/* 加载状态样式 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1.2rem;
  z-index: 10;
}

.loading-spinner {
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 5px solid #42b983;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误提示样式 */
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.error-message {
  background: #2c3e50;
  padding: 2rem;
  border-radius: 10px;
  max-width: 600px;
  color: #ecf0f1;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.error-message h3 {
  color: #e74c3c;
  margin-top: 0;
}

.error-message ul {
  text-align: left;
  padding-left: 20px;
}

.error-message code {
  background: #34495e;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>