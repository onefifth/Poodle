/* global THREE */
/* global material */
/* global requestAnimationFrame */
/* global MouseEvent */

function Poodle () {
  let camera, controls, scene

  this.renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true })
  this.el = this.renderer.domElement
  this.ratio = window.devicePixelRatio
  this.offset = { x: 0, y: 0 }

  this.install = (host = document.body) => {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(400, 200, 0)

    // controls

    controls = new THREE.OrbitControls(camera, this.renderer.domElement)
    controls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05
    controls.screenSpacePanning = false
    controls.minDistance = 100
    controls.maxDistance = 500
    controls.maxPolarAngle = Math.PI / 2

    this.create()

    host.appendChild(this.renderer.domElement)

    window.addEventListener('keydown', this.onKeyDown, false)
    window.addEventListener('keyup', this.onKeyUp, false)
  }

  this.start = (w, h) => {
    this.resize(w, h)
    requestAnimationFrame(this.animate)
    controls.update()
    this.render()
  }

  this.create = () => {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xffffff)

    var material = new THREE.LineBasicMaterial({ color: 0x00000 })
    var line1 = new THREE.Line(new THREE.BoxGeometry(100, 200, 30), material)

    scene.add(line1)
  }

  this.animate = () => {
    requestAnimationFrame(this.animate)
    controls.update() // only required if controls.enableDamping = true, or if controls.autoRotate = true
    this.render()
  }

  this.render = () => {
    this.renderer.render(scene, camera)
  }

  this.onKeyDown = (e) => {

  }

  this.onKeyUp = (e) => {
    if (e.key === 'e') {
      grab(this.renderer.domElement.toDataURL('image/png'))
    }
  }

  this.resize = (w, h) => {
    document.location.hash = `#${w}x${h}`
    this.el.width = w
    this.el.height = h
    this.el.style.width = w + 'px'
    this.el.style.height = h + 'px'
    this.center()
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(w, h)
  }

  this.center = () => {
    this.offset.x = (window.innerWidth - this.el.width) / 2
    this.offset.y = -(window.innerHeight - this.el.height) / 2
    this.el.setAttribute('style', `left:${parseInt(this.offset.x)}px;top:${-parseInt(this.offset.y)}px`)
  }

  function grab (base64, name = 'export.png') {
    const link = document.createElement('a')
    link.setAttribute('href', base64)
    link.setAttribute('download', name)
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
  }
}
