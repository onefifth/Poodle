function Poodle () {
  let camera, controls, scene

  this.renderer = new THREE.WebGLRenderer({ antialias: false })
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
  }

  this.start = (w,h) => {
    this.resize(w,h)
    requestAnimationFrame(this.animate)
    controls.update() // only required if controls.enableDamping = true, or if controls.autoRotate = true
    this.render()
  }

  this.create = () => {

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xffffff)

    var geometry = new THREE.CylinderBufferGeometry(0, 10, 30, 4, 1)
    var material = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true })
    for (var i = 0; i < 500; i++) {
      var mesh = new THREE.Mesh(geometry, material)
      mesh.position.x = Math.random() * 1600 - 800
      mesh.position.y = 0
      mesh.position.z = Math.random() * 1600 - 800
      mesh.updateMatrix()
      mesh.matrixAutoUpdate = false
      scene.add(mesh)
    }
    // lights
    var light = new THREE.DirectionalLight(0xffffff)
    light.position.set(1, 1, 1)
    scene.add(light)
    var light = new THREE.DirectionalLight(0x002288)
    light.position.set(-1, -1, -1)
    scene.add(light)
    var light = new THREE.AmbientLight(0x222222)
    scene.add(light)

    // create a blue LineBasicMaterial
    var material = new THREE.LineBasicMaterial({ color: 0xffffff })

    var line1 = new THREE.Line(new THREE.BoxGeometry(30, 30, 30), material)
    var line2 = new THREE.Line(new THREE.BoxGeometry(20, 20, 20), material)

    scene.add(line1)
    scene.add(line2)
  }

  this.animate = () => {
    requestAnimationFrame(this.animate)
    controls.update() // only required if controls.enableDamping = true, or if controls.autoRotate = true
    this.render()
  }

  this.render = () => {
    this.renderer.render(scene, camera)
  }

  this.resize = (w,h) => {

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
    this.renderer.setSize(w, h)
  }

  this.center = () => {
    this.offset.x = (window.innerWidth - this.el.width) / 2
    this.offset.y = -(window.innerHeight - this.el.height) / 2
    this.el.setAttribute('style', `left:${parseInt(this.offset.x)}px;top:${-parseInt(this.offset.y)}px`)
  }
}
