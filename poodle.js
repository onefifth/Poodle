/* global THREE */
/* global material */
/* global requestAnimationFrame */
/* global MouseEvent */

function Poodle () {
  this.renderer = new THREE.WebGLRenderer({ antialias: false })
  this.scale = 50
  this.target = new THREE.Mesh(new THREE.BoxBufferGeometry(this.scale, this.scale, this.scale), new THREE.LineBasicMaterial({ color: 0xff0000 }))
  this.el = this.renderer.domElement

  var scene
  var plane
  var mouse; var raycaster; var isShiftDown = false
  var rollOverMesh, rollOverMaterial
  var cubeGeo
  var objects = []

  this.install = (host = document.body) => {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
    this.camera.position.set(500, 800, 1300)
    this.camera.lookAt(0, 0, 0)

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xffffff)

    scene.add(this.target)

    var rollOverGeo = new THREE.BoxBufferGeometry(this.scale, this.scale, this.scale)
    rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.25, transparent: true, wireframe: true })
    rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial)
    scene.add(rollOverMesh)

    // cubes
    cubeGeo = new THREE.BoxBufferGeometry(this.scale, this.scale, this.scale)

    // grid
    var gridHelper = new THREE.GridHelper(this.scale * 50, this.scale/2)
    scene.add(gridHelper)

    //
    raycaster = new THREE.Raycaster()
    mouse = new THREE.Vector2()

    var geometry = new THREE.PlaneBufferGeometry(1000, 1000)
    geometry.rotateX(-Math.PI / 2)
    plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }))
    scene.add(plane)
    objects.push(plane)

    document.addEventListener('mousemove', this.onMouseMove, false)
    document.addEventListener('mousedown', this.onMouseDown, false)
    document.addEventListener('keydown', this.onKeyDown, false)
    document.addEventListener('keyup', this.onKeyUp, false)

    host.appendChild(poodle.renderer.domElement)
  }

  this.start = (w, h) => {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    // this.resize(w, h)
    this.render()
  }

  this.cube = (pos, size, scale = this.scale) => {
    var geometry = new THREE.Geometry()

    const vertices = this._cube(size)

    for (const vertex of vertices) {
      geometry.vertices.push(vertex)
    }

    const line = new THREE.Line(geometry, this.material())
    const mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(size.x * scale * 0.99, size.y * scale * 0.99, size.z * scale * 0.99), this.defMat())

    line.position.x = pos.x * scale
    line.position.y = pos.y * scale
    line.position.z = pos.z * scale

    // line.add(mesh)

    return line
  }

  this.create = (name, pos = { x: 0, y: 0, z: 0 }, size = { x: 1, y: 1, z: 1 }) => {
    return this[name](pos, size)
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

  this.material = () => {
    return new THREE.LineBasicMaterial({ color: 0x000000 })
  }

  this.onMouseMove = (event) => {
    event.preventDefault()
    mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1)
    raycaster.setFromCamera(mouse, this.camera)
    var intersects = raycaster.intersectObjects(objects)
    if (intersects.length > 0) {
      var intersect = intersects[0]
      rollOverMesh.position.copy(intersect.point).add(intersect.face.normal)
      rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25)
    }
    this.render()
  }

  this.onMouseDown = (event) => {
    event.preventDefault()
    mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1)
    raycaster.setFromCamera(mouse, this.camera)
    var intersects = raycaster.intersectObjects(objects)
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
        var voxel = new THREE.Mesh(cubeGeo, this.material())
        voxel.position.copy(intersect.point).add(intersect.face.normal)
        voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25)
        scene.add(voxel)
        objects.push(voxel)
      }
      this.render()
    }
  }

  this.focus = () => {
    var position = new THREE.Vector3().copy(this.target.position)
    this.target.localToWorld(position)
    this.camera.lookAt(position)
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
      this.camera.position.y += this.scale
    }
    if (e.key === 'z') {
      this.camera.position.y -= this.scale
    }
    if (e.key === 'q') {
      this.target.position.set(0, 0, 0)
    }
    this.focus()
  }

  this.onKeyUp = (e) => {
    if (e.key === 'e') {
      grab(this.renderer.domElement.toDataURL('image/png'))
    }
    this.focus()
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

  function grab (base64, name = 'export.png') {
    const link = document.createElement('a')
    link.setAttribute('href', base64)
    link.setAttribute('download', name)
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
  }
}
