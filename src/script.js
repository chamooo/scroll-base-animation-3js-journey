import * as THREE from 'three'
import GUI from 'lil-gui'



/**
 * Debug
 */
const gui = new GUI()

const parameters = {
    materialColor: '#ffeded'
}

gui
    .addColor(parameters, 'materialColor')
    .onChange(() => {
        material.color.set(parameters.materialColor)
    })

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */

const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load('./textures/gradients/3.jpg')
gradientTexture.minFilter = THREE.NearestFilter;
gradientTexture.magFilter = THREE.NearestFilter;
gradientTexture.generateMipmaps = false;

/**
 * Objects
 */

const material = new THREE.MeshToonMaterial({ 
    color: parameters.materialColor,
    gradientMap: gradientTexture
})

const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, .4, 14, 40,),
    material
);

const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material
);

const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(.8, .32, 100, 60),
    material
);

const objectsDistance = 4;

mesh1.position.y = 0
mesh2.position.y = - objectsDistance * 1
mesh3.position.y = - objectsDistance * 2

mesh1.position.x = 2
mesh2.position.x = - 2
mesh3.position.x = 2


scene.add(mesh1, mesh2, mesh3)

/**
 * Lights
 */

const directionalLight = new THREE.DirectionalLight('#ffffff', 3);

directionalLight.position.set(1, 1, 0)

scene.add(directionalLight)

const sectionMeshes = [mesh1, mesh2, mesh3]

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */

const cameraGroup = new THREE.Group();
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Scroll
 */

let scrollY = window.scrollY;

window.addEventListener('scroll', () => {
    scrollY = window.scrollY
})


/**
 * Cursor
 */

const cursor = {
    x: 0,
    y: 0
}

window.addEventListener('mousemove', (e) => {
    cursor.x = e.clientX / sizes.width - .5;
    cursor.y = e.clientY / sizes.height - .5;
    console.log(cursor);
    

})


/**
 * Animate
 */
const clock = new THREE.Clock()

let previousTime = 0;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    
    // Animate camera
    camera.position.y = - scrollY / sizes.height * objectsDistance * 1.1

    const parallaxX = cursor.x;
    const parallaxY = -cursor.y;

    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 3 * deltaTime // (distance from current pos to the destination) * speed
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 3 * deltaTime

    // Animate meshes
    for(const mesh of sectionMeshes) {
        mesh.rotation.x = elapsedTime * .2
        mesh.rotation.y = elapsedTime * .22
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()