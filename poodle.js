/* global THREE */
/* global material */
/* global requestAnimationFrame */
/* global MouseEvent */

function Poodle () {
  let scene

  this.renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true })
  this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000)
  this.target = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false }))
  this.el = this.renderer.domElement
  this.offset = { x: 0, y: 0 }
  this.scale = 50

  this.install = (host = document.body) => {
    this.camera.position.z = 250

    // controls

    // controls = new THREE.OrbitControls(camera, this.renderer.domElement)
    // controls.screenSpacePanning = false
    // controls.minDistance = 100
    // controls.maxDistance = 500
    // controls.maxPolarAngle = Math.PI / 2

    //
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xffffff)

    scene.add(this.create('cube', { x: 0, y: 0, z: 0 }))
    scene.add(this.create('cube', { x: 1, y: 0, z: 0 }))
    scene.add(this.create('cube', { x: 2, y: 0, z: 0 }))
    scene.add(this.create('cube', { x: -1, y: 1, z: 0 }))

    scene.add(this.target)

    //

    host.appendChild(this.renderer.domElement)

    window.addEventListener('keydown', this.onKeyDown, false)
    window.addEventListener('keyup', this.onKeyUp, false)
  }

  this.start = (w, h) => {
    this.resize(w, h)
    requestAnimationFrame(this.animate)
    // controls.update()
    this.render()
  }

  this.create = (name, pos = { x: 0, y: 0, z: 0 }, size = { x: 1, y: 1, z: 1 }) => {
    return this[name](pos, size)
  }

  this.cube = (pos, size, scale = this.scale) => {
    var geometry = new THREE.Geometry()

    const vertices = this._cube(size)

    for (const vertex of vertices) {
      geometry.vertices.push(vertex)
    }

    const line = new THREE.Line(geometry, this.lineMat())
    const mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(size.x * scale * 0.99, size.y * scale * 0.99, size.z * scale * 0.99), this.defMat())

    line.position.x = pos.x * scale
    line.position.y = pos.y * scale
    line.position.z = pos.z * scale

    // line.add(mesh)

    return line
  }

  this._cube = (size, scale = this.scale) => {
    const g = this.guides(size, scale)
    return [
      g.RTF, g.RTB, g.LTB, g.LTF, g.RTF
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

  this.focus = () => {
    var position = new THREE.Vector3().copy(this.target.position)
    this.target.localToWorld(position)
    this.camera.lookAt(position)
  }

  this.lineMat = () => {
    return new THREE.LineBasicMaterial({ color: 0x000000 })
  }

  this.defMat = () => {
    return new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false })
  }

  this.animate = () => {
    requestAnimationFrame(this.animate)
    this.render()
  }

  this.render = () => {
    this.renderer.render(scene, this.camera)
  }

  this.onKeyDown = (e) => {
    const speed = 10

    if (e.key === 'A') {
      this.camera.rotation.y += speed / 50
    }
    if (e.key === 'D') {
      this.camera.rotation.y -= speed / 50
    }
    if (e.key === 'W') {
      this.camera.rotation.x += speed / 50
    }
    if (e.key === 'S') {
      this.camera.rotation.x -= speed / 50
    }
    if (e.key === 'w') {
      this.camera.translateZ(-speed)
    }
    if (e.key === 's') {
      this.camera.translateZ(speed)
    }
    if (e.key === 'a') {
      this.camera.translateX(-speed)
    }
    if (e.key === 'd') {
      this.camera.translateX(speed)
    }
    if (e.key === 'x') {
      this.camera.position.y += speed
    }
    if (e.key === 'z') {
      this.camera.position.y += speed
    }
    this.focus()
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
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
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
