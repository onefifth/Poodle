/* global THREE */
/* global MouseEvent */

function Poodle () {
  this.scale = 50
  this.offset = { x: 0, y: 0 }
  this.bounds = { x: 1000, z: 1000 }
  this.showGrid = true
  this.mode = 'floor'
  this.orientation = 0
  this.objects = []

  this.scene = new THREE.Scene()
  this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
  this.renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, logarithmicDepthBuffer: true })
  this.target = new THREE.Line(new THREE.Geometry(), new THREE.MeshBasicMaterial({ color: 0x72dec2 }))
  this.pointer = new THREE.Line(new THREE.Geometry(), new THREE.MeshBasicMaterial({ color: 0xff0000 }))
  this.contact = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({ visible: false }))
  this.grid = new THREE.GridHelper(20 * this.scale, 20)
  this.raycaster = new THREE.Raycaster()
  this.mouse = new THREE.Vector2()

  this.el = this.renderer.domElement

  this.install = (host = document.body) => {
    this.scene.background = new THREE.Color(0xffffff)
    this.target.geometry = this._target()
    this.contact.geometry = this._contact()
    this.contact.add(this.grid)
    this.contact.add(this.target)
    this.objects.push(this.contact)
    this.scene.add(this.pointer)
    this.scene.add(this.contact)

    document.addEventListener('mousemove', this.onMouseMove, false)
    document.addEventListener('mousedown', this.onMouseDown, false)
    document.addEventListener('keydown', this.onKeyDown, false)
    document.addEventListener('keyup', this.onKeyUp, false)

    host.appendChild(this.renderer.domElement)
  }

  this.start = (w, h) => {
    this.camera.position.set(500, 800, 1300)
    this.resize(w, h)
    this.setMode('floor')
    this.focus()
  }

  this._floor = () => {
    const geo = new THREE.Geometry()
    const g = this.guides()
    for (const vertex of [g.RBF, g.RBB, g.LBB, g.LBF, g.RBF]) {
      geo.vertices.push(vertex)
    }
    return geo
  }

  this._ramp = () => {
    const geo = new THREE.Geometry()
    const g = this.guides()
    for (const vertex of [g.RTF, g.RTB, g.LBB, g.LBF, g.RTF]) {
      geo.vertices.push(vertex)
    }
    return geo
  }

  this._wall = () => {
    const geo = new THREE.Geometry()
    const g = this.guides()
    for (const vertex of [g.RTF, g.RTB, g.RBB, g.RBF, g.RTF]) {
      geo.vertices.push(vertex)
    }
    return geo
  }

  this._target = () => {
    const geo = new THREE.Geometry()
    geo.vertices.push(new THREE.Vector3(this.scale / 2, 0, this.scale / 2))
    geo.vertices.push(new THREE.Vector3(this.scale / 2, 0, -this.scale / 2))
    geo.vertices.push(new THREE.Vector3(-this.scale / 2, 0, -this.scale / 2))
    geo.vertices.push(new THREE.Vector3(-this.scale / 2, 0, this.scale / 2))
    geo.vertices.push(new THREE.Vector3(this.scale / 2, 0, this.scale / 2))
    return geo
  }

  this._contact = () => {
    const geo = new THREE.PlaneBufferGeometry(this.bounds.x, this.bounds.z)
    geo.rotateX(-Math.PI / 2)
    return geo
  }

  this.guides = (size = { x: 1, y: 1, z: 1 }, scale = this.scale) => {
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

  this.add = (pos, geo) => {
    const stepped = new THREE.Vector3().copy(pos).divideScalar(this.scale).floor().multiplyScalar(this.scale).addScalar(this.scale / 2)
    const voxel = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x000000 }))
    voxel.position.set(stepped.x, stepped.y, stepped.z)
    voxel.rotation.y = this.orientation
    this.scene.add(voxel)
    this.objects.push(voxel)
  }

  this.remove = (pos) => {
    for (const obj of this.objects) {
      if (posEqual(pos, obj.position)) {
        console.log('erase', pos)
        this.scene.remove(obj)
        this.objects.splice(this.objects.indexOf(obj), 1)
        return
      } else {
        console.log(obj.position, pos)
      }
    }
  }

  this.delete = () => {
    if (this.objects.length < 2) { return }
    const obj = this.objects[this.objects.length - 1]
    this.scene.remove(obj)
    this.objects.splice(this.objects.length - 1, 1)
  }

  this.focus = () => {
    const pos = new THREE.Vector3().copy(this.target.position)
    this.target.localToWorld(pos)
    this.camera.lookAt(pos)
    this.render()
  }

  this.render = () => {
    this.renderer.render(this.scene, this.camera)
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
    this.showGrid = !this.showGrid
    this.grid.material.visible = this.showGrid
    this.render()
  }

  this.setMode = (mode) => {
    console.log('mode', mode)
    this.mode = mode
    this.pointer.geometry = this[`_${mode}`]()
  }

  this.setOrientation = () => {
    this.orientation += degToRad(90)
    this.pointer.rotation.y = this.orientation
  }

  this.cast = (x, y) => {
    this.mouse.set((x / this.el.width) * 2 - 1, -(y / this.el.height) * 2 + 1)
    this.raycaster.setFromCamera(this.mouse, this.camera)
    return this.raycaster.intersectObjects(this.objects)
  }

  // Events

  this.onMouseMove = (event) => {
    event.preventDefault()
    const intersects = this.cast(event.layerX, event.layerY)
    if (intersects.length > 0 && intersects[0].face) {
      const intersect = intersects[0]
      this.pointer.position.copy(intersect.point).add(intersect.face.normal)
      this.pointer.position.divideScalar(this.scale).floor().multiplyScalar(this.scale).addScalar(this.scale / 2)
    }
    this.render()
  }

  this.onMouseDown = (event) => {
    event.preventDefault()
    const intersects = this.cast(event.layerX, event.layerY)
    if (intersects.length > 0) {
      const intersect = intersects[0]
      if (event.shiftKey && intersect.object === this.contact) {
        const pos = new THREE.Vector3().copy(intersect.point).divideScalar(this.scale).floor().multiplyScalar(this.scale).addScalar(this.scale / 2)
        this.remove(pos)
      } else if (intersect.face) {
        const pos = new THREE.Vector3().copy(intersect.point).add(intersect.face.normal)
        const geo = this[`_${this.mode}`]()
        this.add(pos, geo)
      }
    }
    this.render()
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
      this.contact.position.y += this.scale
    }
    if (e.key === 'Z') {
      this.contact.position.y -= this.scale
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
      this.camera.position.y += this.scale
    }
    if (e.key === 'z') {
      this.camera.position.y -= this.scale
    }
    if (e.key === 'r') {
      this.setOrientation()
    }
    // Options
    if (e.key === 'q') {
      this.target.position.set(0, 0, 0)
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      this.toggleGuide()
    }
    if (e.key === 'Backspace') {
      e.preventDefault()
      this.delete()
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
      this.pointer.material.visible = false
      this.target.material.visible = false
      this.grid.material.visible = false
      this.render()
      grab(this.renderer.domElement.toDataURL('image/png'))
      this.pointer.material.visible = true
      this.target.material.visible = true
      this.grid.material.visible = this.showGrid
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

  function posEqual (a, b) {
    return a.x === b.x && a.y === b.y && a.z === b.z
  }

  function degToRad (deg) {
    return deg * (Math.PI / 180)
  }
}
