<script setup>
import { userRegisterService, userLoginService } from '@/api/user.js'
import { User, Lock } from '@element-plus/icons-vue'
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/use'
import { useRouter } from 'vue-router'
const isRegister = ref(false)
const form = ref()

const formModel = ref({
  username: '',
  password: '',
  repassword: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 5, max: 10, message: '用户名必须是 5-10位 的字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      pattern: /^\S{6,15}$/,
      message: '密码必须是 6-15位 的非空字符',
      trigger: 'blur'
    }
  ],
  repassword: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      pattern: /^\S{6,15}$/,
      message: '密码必须是 6-15位 的非空字符',
      trigger: 'blur'
    },
    {
      validator: (rule, value, callback) => {
        // 判断 value 和 当前 form 中收集的 password 是否一致
        if (value !== formModel.value.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback() // 就算校验成功，也需要callback
        }
      },
      trigger: 'blur'
    }
  ]
}

const register = async () => {
  // 注册成功之前，先进行校验，校验成功 → 请求，校验失败 → 自动提示
  await form.value.validate()
  await userRegisterService(formModel.value)
  ElMessage.success('注册成功')
  isRegister.value = false
}

const userStore = useUserStore()
const router = useRouter()
const login = async () => {
  await form.value.validate()
  const res = await userLoginService(formModel.value)
  userStore.setToken(res.data.data.token)
  ElMessage.success('登录成功')
  router.push('/')
}

// 切换的时候，重置表单内容
watch(isRegister, () => {
  formModel.value = {
    username: '',
    password: '',
    repassword: ''
  }
})
</script>

<template>
<div class="login-overlay">
    <el-row class="login-page">
        <el-col :span="24" class="form-container">
          <!-- 注册相关表单 -->
          <el-form
            v-if="isRegister"
            class="login-card"
            :model="formModel"
            :rules="rules"
            ref="form"
            size="large"
            autocomplete="off"
          >
            <el-form-item>
              <h1>注册</h1>
            </el-form-item>
            <el-form-item prop="username">
              <el-input
                v-model="formModel.username"
                :prefix-icon="User"
                placeholder="请输入用户名"
              ></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="formModel.password"
                :prefix-icon="Lock"
                type="password"
                placeholder="请输入密码"
              ></el-input>
            </el-form-item>
            <el-form-item prop="repassword">
              <el-input
                v-model="formModel.repassword"
                :prefix-icon="Lock"
                type="password"
                placeholder="请输入再次密码"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button
                @click="register"
                class="button"
                type="primary"
                auto-insert-space
              >
                注册
              </el-button>
            </el-form-item>
            <el-form-item class="flex">
              <el-link type="info" :underline="false" @click="isRegister = false">
                ← 返回
              </el-link>
            </el-form-item>
          </el-form>

          <!-- 登录相关表单 -->
          <el-form
            v-else
            class="login-card"
            :model="formModel"
            :rules="rules"
            ref="form"
            size="large"
            autocomplete="off"
          >
            <el-form-item>
              <h1>登录</h1>
            </el-form-item>
            <el-form-item prop="username">
              <el-input
                v-model="formModel.username"
                :prefix-icon="User"
                placeholder="请输入用户名"
              ></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="formModel.password"
                name="password"
                :prefix-icon="Lock"
                type="password"
                placeholder="请输入密码"
              ></el-input>
            </el-form-item>
            <el-form-item class="flex">
              <div class="flex">
                <el-checkbox>记住我</el-checkbox>
                <el-link type="primary" :underline="false">忘记密码？</el-link>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button
                @click="login"
                class="button"
                type="primary"
                auto-insert-space
                >登录</el-button
              >
            </el-form-item>
            <el-form-item class="flex">
              <el-link type="info" :underline="false" @click="isRegister = true">
                注册 →
              </el-link>
            </el-form-item>
          </el-form>
        </el-col>
    </el-row>
</div>
</template>

<style lang="scss" scoped>
.login-overlay {
  position: absolute;
  top: 50vh;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10; /* 确保在3D背景之上 */
}

.login-page {
  width: 420px;
  padding: 0 20px;
  
  .form-container {
    display: flex;
    justify-content: center;
  }
}

.login-card {
  width: 100%;
  padding: 30px;
  border-radius: 15px;
  background: rgba(255, 255, 255,0.1); /* 半透明白色背景 */
  backdrop-filter: blur(10px); /* 背景模糊效果 */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  h1 {
    text-align: center;
    margin-bottom: 25px;
    color: #2c3e50;
    font-weight: 600;
  }
  
  .el-form-item {
    margin-bottom: 22px;
  }
  
  .button {
    width: 100%;
    height: 45px;
    font-size: 1.1rem;
    margin-top: 10px;
  }
  
  .flex {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .el-link {
    font-size: 0.95rem;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .login-card {
    padding: 25px 20px;
    
    h1 {
      font-size: 1.8rem;
      margin-bottom: 20px;
    }
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 20px 15px;
    
    h1 {
      font-size: 1.6rem;
    }
    
    .el-form-item {
      margin-bottom: 18px;
    }
  }
}
</style>
