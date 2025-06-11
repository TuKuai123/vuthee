<script setup>
import { createApp, ref, onMounted, onUnmounted } from 'vue'
import * as THREE from "three"
const sceneContainer = ref(null)
const cloudCount = ref(0)

// Three.js变量
let scene, camera, renderer
let clouds = []
let mouseX = 0, mouseY = 0
let targetX = 0, targetY = 0
let animationFrameId = null
const windowHalfX = window.innerWidth / 2
const windowHalfY = window.innerHeight / 2

// 创建云朵
const createCloud = (x, y, z) => {
  const cloudGroup = new THREE.Group()
  
  // 创建云朵的多个球体
  const cloudGeo = new THREE.SphereGeometry(1, 8, 8)
  const cloudMat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    flatShading: true
  })
  
  // 创建多个球体组合成云朵
  for (let i = 0 ;i < 5 ;i++) {
    const sphere = new THREE.Mesh(cloudGeo, cloudMat)
    
    // 随机位置和大小
    const offsetX = Math.random() * 3 - 1.5
    const offsetY = Math.random() * 1.5 - 0.75
    const offsetZ = Math.random() * 1.5 - 0.75
    const scale = 0.5 + Math.random() * 0.7
    
    sphere.position.set(offsetX, offsetY, offsetZ)
    sphere.scale.set(scale, scale, scale)
    
    cloudGroup.add(sphere)
  }
  
  cloudGroup.position.set(x, y, z)
  scene.add(cloudGroup)
  
  // 添加一些随机属性用于动画
  cloudGroup.userData = {
    speed: 0.01 + Math.random() * 0.02,
    rotationSpeed: 0.001 + Math.random() * 0.002,
    scale: 0.8 + Math.random() * 0.4
  }
  
  cloudGroup.scale.multiplyScalar(cloudGroup.userData.scale)
  
  return cloudGroup
}

// 初始化场景
const initScene = () => {
  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87CEEB)
  scene.fog = new THREE.Fog(0x87CEEB, 10, 100)
  
  // 创建相机
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 20
  
  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  sceneContainer.value.appendChild(renderer.domElement)
  
  // 添加光源
  const ambientLight = new THREE.AmbientLight(0x555555)
  scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(1, 1, 1)
  scene.add(directionalLight)
  
  // 创建云朵
  const cloudSpacing = 15
  const gridSize = 5
  
  for (let i = 0 ;i < gridSize * gridSize * gridSize ;i++) {
    const x = (i % gridSize) * cloudSpacing - (gridSize * cloudSpacing) / 2
    const y = Math.floor(i / gridSize) % gridSize * cloudSpacing - (gridSize * cloudSpacing) / 2
    const z = Math.floor(i / (gridSize * gridSize)) * cloudSpacing - (gridSize * cloudSpacing) / 2
    
    const cloud = createCloud(x, y, z)
    clouds.push(cloud)
  }
  
  cloudCount.value = clouds.length
}

// 处理窗口大小变化
const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// 处理鼠标移动
const onDocumentMouseMove = (event) => {
  mouseX = (event.clientX - windowHalfX) / 100
  mouseY = (event.clientY - windowHalfY) / 100
}

// 动画循环
const animate = () => {
  animationFrameId = requestAnimationFrame(animate)
  
  // 平滑跟随鼠标
  targetX = mouseX * 0.05
  targetY = mouseY * 0.05
  
  // 更新相机旋转
  camera.rotation.y += 0.05 * (targetX - camera.rotation.y)
  camera.rotation.x += 0.05 * (targetY - camera.rotation.x)
  
  // 更新云朵位置和旋转
  const time = Date.now() * 0.001
  
  clouds.forEach(cloud => {
    cloud.rotation.y += cloud.userData.rotationSpeed
    cloud.rotation.z += cloud.userData.rotationSpeed * 0.5
    cloud.position.x += Math.sin(time * cloud.userData.speed) * 0.01
    cloud.position.y += Math.cos(time * cloud.userData.speed * 1.2) * 0.01
  })
  
  renderer.render(scene, camera)
}

onMounted(() => {
  initScene()
  animate()
  
  window.addEventListener('resize', onWindowResize)
  document.addEventListener('mousemove', onDocumentMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  document.removeEventListener('mousemove', onDocumentMouseMove)
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  
  if (renderer) {
    renderer.dispose()
  }
})
</script>

<template>
  <div class="cloud-scene">         
    <div ref="sceneContainer" class="scene-container"></div>
  </div>
</template>

<style scoped>
* {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      overflow: hidden;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #1a2a6c, #2a4365, #4a7b9d);
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
    }
    
    .app-container {
      width: 100%;
      height: 100%;
      position: relative;
    }
    
    .cloud-scene {
      width: 100%;
      height: 100%;
      position: relative;
    }
    
    .scene-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    }
    
    .scene-header {
      position: absolute;
      top: 30px;
      left: 0;
      width: 100%;
      text-align: center;
      z-index: 10;
      padding: 0 20px;
      animation: fadeInDown 1s ease-out;
    }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      text-shadow: 0 0 10px rgba(0, 0, 0, 0.7);
      background: linear-gradient(90deg, #4facfe, #00f2fe);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .subtitle {
      font-size: 1.2rem;
      max-width: 600px;
      margin: 0 auto;
      opacity: 0.9;
      color: #c0e0ff;
    }
    
    .instructions {
      position: absolute;
      bottom: 40px;
      left: 0;
      width: 100%;
      text-align: center;
      z-index: 10;
      font-size: 1.1rem;
      background: rgba(0, 0, 0, 0.3);
      padding: 15px 20px;
      border-radius: 12px;
      max-width: 500px;
      margin: 0 auto;
      backdrop-filter: blur(5px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      animation: fadeInUp 1s ease-out;
      color: #e0f0ff;
    }
    
    .scene-info {
      position: absolute;
      top: 30px;
      right: 30px;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 15px;
      animation: fadeInRight 1s ease-out;
    }
    
    .info-card {
      background: rgba(0, 0, 0, 0.3);
      padding: 15px 20px;
      border-radius: 12px;
      min-width: 150px;
      text-align: center;
      backdrop-filter: blur(5px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      transition: transform 0.3s ease;
    }
    
    .info-card:hover {
      transform: translateY(-5px);
    }
    
    .info-title {
      font-size: 1rem;
      opacity: 0.8;
      margin-bottom: 5px;
      color: #a0d0ff;
    }
    
    .info-value {
      font-size: 1.4rem;
      font-weight: bold;
      color: #23629a;
    }
    
    /* 动画效果 */
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    /* 响应式调整 */
    @media (max-width: 768px) {
      h1 {
        font-size: 2rem;
      }
      
      .subtitle {
        font-size: 1rem;
      }
      
      .scene-info {
        top: 20px;
        right: 20px;
      }
      
      .info-card {
        padding: 10px 15px;
        min-width: 130px;
      }
      
      .instructions {
        font-size: 1rem;
        bottom: 20px;
        max-width: 90%;
      }
    }
    
    @media (max-width: 480px) {
      h1 {
        font-size: 1.6rem;
      }
      
      .scene-header {
        top: 15px;
      }
      
      .scene-info {
        position: static;
        margin: 20px auto;
        flex-direction: row;
        justify-content: center;
        width: 100%;
        padding: 0 20px;
        top: 120px;
      }
      
      .info-card {
        padding: 10px;
        min-width: 110px;
      }
      
      .info-value {
        font-size: 1.2rem;
      }
    }
</style>