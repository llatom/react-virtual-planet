import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'

let container, stats, mixer, camera, scene, pointLight, Flamingo, boomBox, facecap

// Canvas
const canvas = document.querySelector('canvas.webgl')
//renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})

init()
animate()

function init() {
  container = document.createElement('div')
  document.body.appendChild(container)

  camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(3, 3, 12)

  //cubemap
  const path = '/textures/SwedishRoyalCastle/'
  const format = '.jpg'
  const urls = [
    path + 'px' + format,
    path + 'nx' + format,
    path + 'py' + format,
    path + 'ny' + format,
    path + 'pz' + format,
    path + 'nz' + format
  ]

  const reflectionCube = new THREE.CubeTextureLoader().load(urls)
  const refractionCube = new THREE.CubeTextureLoader().load(urls)
  refractionCube.mapping = THREE.CubeRefractionMapping

  scene = new THREE.Scene()
  scene.background = reflectionCube

  //lights
  // const ambient = new THREE.AmbientLight(0xffffff, 1)
  // scene.add(ambient)

  // pointLight = new THREE.PointLight(0xff0000, 1, 100)
  // pointLight.position.set(50, 50, 50)
  // scene.add(pointLight)

  // lights
  const mainLight = new THREE.PointLight(0xcccccc, 1.5, 250)
  mainLight.position.y = 60
  scene.add(mainLight)

  const greenLight = new THREE.PointLight(0x00ff00, 1.5, 1000)
  greenLight.position.set(300, 50, 0)
  scene.add(greenLight)

  const redLight = new THREE.PointLight(0xff0000, 1.5, 1000)
  redLight.position.set(-300, 50, 0)
  scene.add(redLight)

  const blueLight = new THREE.PointLight(0x7f7fff, 1.5, 1000)
  blueLight.position.set(0, 50, 300)
  scene.add(blueLight)

  //模型
  const gltfLoader = new GLTFLoader()
  gltfLoader.load('/models/Flamingo.glb', function (gltf) {
    Flamingo = gltf.scene
    Flamingo.scale.set(0.05, 0.05, 0.05)
    Flamingo.position.set(-5, 3, -7)
    scene.add(Flamingo)
  })

  gltfLoader.load('/models/BoomBox.glb', function (gltf) {
    boomBox = gltf.scene
    boomBox.scale.set(200, 200, 200)
    boomBox.position.set(1, -10, -10)
    scene.add(boomBox)
  })

  const ktx2Loader = new KTX2Loader().setTranscoderPath('/basis/').detectSupport(renderer)

  new GLTFLoader()
    .setKTX2Loader(ktx2Loader)
    .setMeshoptDecoder(MeshoptDecoder)
    .load('/models/facecap.glb', gltf => {
      facecap = gltf.scene.children[0]
      facecap.scale.set(20, 20, 20)
      facecap.position.set(6, 1, -7)

      scene.add(facecap)

      mixer = new THREE.AnimationMixer(facecap)

      mixer.clipAction(gltf.animations[0]).play()

      const head = facecap.getObjectByName('mesh_2')
      const influences = head.morphTargetInfluences

      const gui = new GUI()
      gui.close()

      for (const [key, value] of Object.entries(head.morphTargetDictionary)) {
        gui.add(influences, value, 0, 1, 0.01).name(key.replace('blendShape1.', '')).listen(influences)
      }
    })

  // Animation loop.
  const tick = () => {
    if (Flamingo) {
      Flamingo.rotation.y += 0.2
    }
    if (boomBox) {
      boomBox.rotation.y += 0.02
    }
    if (facecap) {
      facecap.rotation.y += 0.02
    }

    renderer.render(scene, camera)
    requestAnimationFrame(tick)
  }
  tick()

  // 场景渲染
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor('#262837')
  renderer.shadowMap.enabled = true

  container.appendChild(canvas)

  //controls
  const controls = new OrbitControls(camera, canvas)
  controls.enableZoom = false
  controls.enablePan = false
  controls.minPolarAngle = Math.PI / 4
  controls.maxPolarAngle = Math.PI / 1.5

  //stats
  stats = new Stats()
  container.appendChild(stats.dom)

  window.addEventListener('resize', onWindowResize)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
  requestAnimationFrame(animate)
  render()
}

function render() {
  renderer.render(scene, camera)
  stats.update()
}
