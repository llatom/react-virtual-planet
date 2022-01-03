import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import * as dat from 'dat.gui'
import ky from 'kyouka'

let container, stats

let camera, scene

let pointLight

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

  camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 0.1, 100 );
  camera.position.set( 3, 3, 12 );


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
  const ambient = new THREE.AmbientLight(0xffffff,  1)
  scene.add(ambient)

  pointLight = new THREE.PointLight(0xff0000, 1, 100)
  pointLight.position.set( 50, 50, 50 );
  scene.add(pointLight)

  //模型
  const gltfLoader = new GLTFLoader()
  gltfLoader.load('/models/Flamingo.glb', function (gltf) {
    const Flamingo = gltf.scene
    Flamingo.scale.set(0.01, 0.01, 0.01)
    Flamingo.position.set(1, 3, 1)
    scene.add(Flamingo)
  })

  gltfLoader.load('/models/BoomBox.glb', function (gltf) {
    const boomBox = gltf.scene
    boomBox.scale.set(200, 200, 200)
    boomBox.position.set(3, -10, -10)
    console.log(boomBox)

    scene.add(boomBox)
  })

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
