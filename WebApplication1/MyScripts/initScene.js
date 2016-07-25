var canvas, engine, scene, camera, score = 0;

// array to store the drones
var DRONES = [];

// Load the scene when the canvas is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    if (BABYLON.Engine.isSupported()) {
        initScene();
        initGame();
    }
}, false);


// keyboard listener
window.addEventListener('keydown', onKeyDown);

/**
 * Creates a new BABYLON Engine and initialize the scene
 */
function initScene() {
    // Get canvas
    canvas = document.getElementById('canvas');

    // Create Babylon engine
    engine = new BABYLON.Engine(canvas, true);

    // Create a scene
    scene = new BABYLON.Scene(engine);

    // Create the camera
    camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 4, -10), scene);
    camera.setTarget(new BABYLON.Vector3(0, 0, 10));
    camera.attachControl(canvas);

    // Create light
    var light = new BABYLON.PointLight('light', new BABYLON.Vector3(0, 5, -5), scene);

    // create box
    var skybox = BABYLON.Mesh.CreateBox('skyBox', 1000.0, scene);

    // create environment (space)
    var skyBoxMaterial = new BABYLON.StandardMaterial('skyBox', scene);
    skyBoxMaterial.backFaceCulling = false;
    skyBoxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyBoxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyBoxMaterial.reflectionTexture = new BABYLON.CubeTexture('Assets/cubemap/starfiel', scene);
    skyBoxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

    // Box + Sky
    skybox.material = skyBoxMaterial;
}


// initialize the game
function initGame() {
    
    var LANE_NUMBER = 3;
    var LANE_INTERVAL = 5;
    var LANES_POSITIONS = [];

    // create lanes
    var createLane = function (id, position) {
        var lane = BABYLON.Mesh.CreateBox('lane' + id, 1, scene);
        lane.scaling.y = 0.1;
        lane.scaling.x = 3;
        lane.scaling.z = 800;
        lane.position.x = position;
        lane.position.z = lane.scaling.z / 2 - 200;
        lane.material = ground;
    }

    // texture
    var ground = new BABYLON.StandardMaterial('ground', scene);
    var texture = new BABYLON.Texture('Assets/neon.jpg', scene);
    texture.uScale = 100;
    texture.vScale = 1;
    ground.diffuseTexture = texture;

    var createEnding = function (id, position) {
        var ending = BABYLON.Mesh.CreateGround(id, 3, 4, 1, scene);
        ending.position.x = position;
        ending.position.y = 0.1;
        ending.position.z = 1;

        var mat = new BABYLON.StandardMaterial('endingMat', scene);
        mat.diffuseColor = new BABYLON.Color3(0.8, 0.2, 0.2);
        ending.material = mat;

        return ending;
    }

}

// animation
function animateEnding(ending) {
    var posY = ending.position.y;
    var animateEnding = new BABYLON.Animation(
        'animateEnding',
        'position.y',
        60,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE
    );

    // animation keys
    var keys = [];
    keys.push(
        { frame: 0, value: posY },
        { frame: 5, value: posY + 0.5 },
        { frame: 10, value: posY }
    );

    animateEnding.setKeys(keys);
    ending.animations.push(animateEnding);

    // run animation
    scene.beginAnimation(ending, 0, 10, false, 1);
}

function onKeyDown(evt) {
    var currentEnding = -1;

    switch (evt.keyCode) {
        case 65: // A
            currentEnding = 0;
            break;
        case 83: // S
            currentEnding = 1;
            break;
        case 68: // D
            currentEnding = 2;
            break;
    }

}
