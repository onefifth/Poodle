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

    //
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xffffff)

    scene.add(this.create('rect', { x: 0, y: 0, z: 0 }, { x: 50, y: 100, z: 100 }))
    scene.add(this.create('rect', { x: 0, y: 0, z: 0 }, { x: 75, y: 125, z: 125 }))

    //

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

  this.create = (name, pos = { x: 0, y: 0, z: 0 }, size = { x: 100, y: 100, z: 100 }) => {
    return this[name](pos, size)
  }

  this.rect = (pos, size) => {
    var geometry = new THREE.Geometry()

    const vertices = [
      new THREE.Vector3(-size.x / 2, size.y / 2, 0),
      new THREE.Vector3(size.x / 2, size.y / 2, 0),
      new THREE.Vector3(size.x / 2, -size.y / 2, 0),
      new THREE.Vector3(-size.x / 2, -size.y / 2, 0),
      new THREE.Vector3(-size.x / 2, size.y / 2, 0)
    ]

    for (const vertex of vertices) {
      geometry.vertices.push(vertex)
    }

    return new THREE.Line(geometry, this.material())
  }

  this.cube = (pos, size) => {
    var geometry = new THREE.Geometry()

    const vertices = [
      new THREE.Vector3(-100, 0, 0),
      new THREE.Vector3(100, 0, 0),
      new THREE.Vector3(0, 100, 0)
    ]

    for (const vertex of vertices) {
      geometry.vertices.push(vertex)
    }

    return new THREE.Line(geometry, this.material())
  }

  this.material = () => {
    return new THREE.LineBasicMaterial({ color: 0x00000 })
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
