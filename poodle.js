/* global THREE */
/* global MouseEvent */

function Poodle () {
  this.scale = 50

  this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
  this.renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, logarithmicDepthBuffer: true })
  this.target = new THREE.Mesh(new THREE.BoxBufferGeometry(this.scale, this.scale, this.scale), new THREE.MeshBasicMaterial({ visible: false }))
  this.grid = new THREE.GridHelper(this.scale * 50, this.scale / 2)
  this.pointer = new THREE.Mesh(new THREE.BoxBufferGeometry(this.scale, this.scale, this.scale), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }))
  this.raycaster = new THREE.Raycaster()
  this.mouse = new THREE.Vector2()

  this.el = this.renderer.domElement

  // Controls
  this.showGuide = true
  this.mode = 'floor'

  var scene
  var plane
  var objects = []

  this.install = (host = document.body) => {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xffffff)

    scene.add(this.target)
    scene.add(this.pointer)

    var geometry = new THREE.PlaneBufferGeometry(1000, 1000)
    geometry.rotateX(-Math.PI / 2)
    plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }))
    plane.add(this.grid)

    objects.push(plane)

    scene.add(plane)

    document.addEventListener('mousemove', this.onMouseMove, false)
    document.addEventListener('mousedown', this.onMouseDown, false)
    document.addEventListener('keydown', this.onKeyDown, false)
    document.addEventListener('keyup', this.onKeyUp, false)

    host.appendChild(this.renderer.domElement)
  }

  this.start = (w, h) => {
    this.camera.position.set(500, 800, 1300)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    // this.resize(w, h)
    this.focus()
    this.render()
  }

  this.floor = (size, scale = this.scale) => {
    var geometry = new THREE.Geometry()

    const vertices = this._cube(size)

    for (const vertex of vertices) {
      geometry.vertices.push(vertex)
    }

    return new THREE.Line(geometry, this.material())
  }

  this.ramp = (size, scale = this.scale) => {
    var geometry = new THREE.Geometry()

    const vertices = this._ramp(size)

    for (const vertex of vertices) {
      geometry.vertices.push(vertex)
    }

    return new THREE.Line(geometry, this.material())
  }

  this.wall = (size, scale = this.scale) => {
    var geometry = new THREE.Geometry()

    const vertices = this._wall(size)

    for (const vertex of vertices) {
      geometry.vertices.push(vertex)
    }

    return new THREE.Line(geometry, this.material())
  }

  this.create = (name, pos = { x: 0, y: 0, z: 0 }, size = { x: 1, y: 1, z: 1 }) => {
    return this[name](pos, size)
  }

  this._cube = (size = { x: 1, y: 1, z: 1 }, scale = this.scale) => {
    const g = this.guides(size, scale)
    return [
      g.RBF, g.RBB, g.LBB, g.LBF, g.RBF
    ]
  }

  this._ramp = (size = { x: 1, y: 1, z: 1 }, scale = this.scale) => {
    const g = this.guides(size, scale)
    return [
      g.RTF, g.RTB, g.LBB, g.LBF, g.RTF
    ]
  }

  this._wall = (size = { x: 1, y: 1, z: 1 }, scale = this.scale) => {
    const g = this.guides(size, scale)
    return [
      g.RTF, g.RTB, g.RBB, g.RBF, g.RTF
    ]
  }

  this.guides = (size, scale) => {
    return {
      RTF: new THREE.Vector3(scale * (size.x / 2), scale * (size.y / 2), scale * (size.z / 2)),
      RTB: new THREE.Vector3(scale * (size.x / 2), scale * (size.y / 2), scale * (-size.z / 2)),
      LTF: new THREE.Vector3(scale * (-size.x / 2), scale * (size.y / 2), scale * (size.z / 2)),
      LTB: new THREE.Vector3(scale * (-size.x / 2), scale * (size.y / 2), scale * (-size.z / 2)),
      RBF: new THREE.Vector3(scale * (size.x / 2), -scale * (size.y / 2), scale * (size.z / 2)),
      RBB: new THREE.Vector3(scale * (size.x / 2), -scale * (size.y / 2), scale * (-size.z / 2)),
      LBF: new THREE.Vector3(scale * (-size.x / 2), -scale * (size.y / 2), scale * (size.z / 2)),
      LBB: new THREE.Vector3(scale * (-size.x / 2), -scale * (size.y / 2), scale * (-size.z / 2))
    }
  }

  this.material = () => {
    return new THREE.LineBasicMaterial({ color: 0x000000 })
  }

  this.add = (pos) => {
    const stepped = new THREE.Vector3().copy(pos).divideScalar(this.scale).floor().multiplyScalar(this.scale).addScalar(this.scale / 2)
    var voxel = this[this.mode]()
    voxel.position.set(stepped.x, stepped.y, stepped.z)
    scene.add(voxel)
    objects.push(voxel)
  }

  this.focus = () => {
    var position = new THREE.Vector3().copy(this.target.position)
    this.target.localToWorld(position)
    this.camera.lookAt(position)
  }

  this.render = () => {
    this.renderer.render(scene, this.camera)
  }

  this.resize = (w, h) => {
    document.location.hash = `#${w}x${h}`
    this.el.width = w
    this.el.height = h
    this.el.style.width = w + 'px'
    this.el.style.height = h + 'px'
    this.center()
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
  }

  this.center = () => {
    this.offset.x = (window.innerWidth - this.el.width) / 2
    this.offset.y = -(window.innerHeight - this.el.height) / 2
    this.el.setAttribute('style', `left:${parseInt(this.offset.x)}px;top:${-parseInt(this.offset.y)}px`)
  }

  this.toggleGuide = () => {
    this.showGuide = !this.showGuide
    this.grid.material.visible = this.showGuide
    this.render()
  }

  this.setMode = (mode) => {
    console.log('mode', mode)
    this.mode = mode
  }

  // Events

  this.onMouseMove = (event) => {
    event.preventDefault()
    this.mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1)
    this.raycaster.setFromCamera(this.mouse, this.camera)
    var intersects = this.raycaster.intersectObjects(objects)
    if (intersects.length > 0) {
      var intersect = intersects[0]
      this.pointer.position.copy(intersect.point).add(intersect.face.normal)
      this.pointer.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25)
    }
    this.render()
  }

  this.onMouseDown = (event) => {
    event.preventDefault()
    this.mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1)
    this.raycaster.setFromCamera(this.mouse, this.camera)
    var intersects = this.raycaster.intersectObjects(objects)
    if (intersects.length > 0) {
      var intersect = intersects[0]
      // delete cube
      if (event.shiftKey) {
        if (intersect.object !== plane) {
          scene.remove(intersect.object)
          objects.splice(objects.indexOf(intersect.object), 1)
        }
        // create cube
      } else {
        const pos = new THREE.Vector3().copy(intersect.point).add(intersect.face.normal)
        this.add(pos)
      }
      this.render()
    }
  }

  this.onKeyDown = (e) => {
    if (e.key === 'A') {
      this.target.position.x += this.scale
    }
    if (e.key === 'D') {
      this.target.position.x -= this.scale
    }
    if (e.key === 'W') {
      this.target.position.z += this.scale
    }
    if (e.key === 'S') {
      this.target.position.z -= this.scale
    }
    if (e.key === 'X') {
      this.target.position.y += this.scale
    }
    if (e.key === 'Z') {
      this.target.position.y -= this.scale
    }
    if (e.key === 'w') {
      this.camera.translateZ(-this.scale)
    }
    if (e.key === 's') {
      this.camera.translateZ(this.scale)
    }
    if (e.key === 'a') {
      this.camera.translateX(-this.scale)
    }
    if (e.key === 'd') {
      this.camera.translateX(this.scale)
    }
    if (e.key === 'x') {
      plane.position.y += this.scale
    }
    if (e.key === 'z') {
      plane.position.y -= this.scale
    }
    // Options
    if (e.key === 'q') {
      this.target.position.set(0, 0, 0)
    }
    if (e.key === 'h') {
      this.toggleGuide()
    }

    if (e.key === '1') {
      this.setMode('floor')
    }
    if (e.key === '2') {
      this.setMode('ramp')
    }
    if (e.key === '3') {
      this.setMode('wall')
    }
    this.focus()
  }

  this.onKeyUp = (e) => {
    if (e.key === 'e') {
      grab(this.renderer.domElement.toDataURL('image/png'))
    }
    this.focus()
  }

  // Functions

  function grab (base64, name = 'export.png') {
    const link = document.createElement('a')
    link.setAttribute('href', base64)
    link.setAttribute('download', name)
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
  }
}
