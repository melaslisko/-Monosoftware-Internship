var canvas, engine, scene, camera, sumScore = 0;
var DRONE;

// array to store each ending of the lane
var ENDINGS = [];

// array to store the drones
var DRONES = [];

// Load the scene when the canvas is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    if (BABYLON.Engine.isSupported()) {
        initScene();
        initGame();
    }
}, false);


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

    // drones move along lanes
    engine.runRenderLoop(function () {
        scene.render();
        DRONES.forEach(function (machine) {
            if (machine.killed) {
                // nothing to do here
            } else {
                machine.position.z -= 0.5;
            }
        });
        cleanDrones();
    });
}

// Initialize the game
function initGame() {

    var LANE_NUMBER = 3;
    var LANE_INTERVAL = 3;
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
        mat.diffuseColor = new BABYLON.Color3(0.1, 0.5, 0.8);
        ending.material = mat;

        return ending;
    }

    var currentLanePosition = LANE_INTERVAL * -1 * (LANE_NUMBER / 2);

    for (var i = 0; i < LANE_NUMBER; i++) {
        LANES_POSITIONS[i] = currentLanePosition;
        createLane(i, currentLanePosition);
        var e = createEnding(i, currentLanePosition);
        ENDINGS.push(e);
        currentLanePosition += LANE_INTERVAL;
    }

    // import drones into scene
    BABYLON.SceneLoader.ImportMesh('red_toad', 'Assets/', 'toad.babylon', scene, function (meshes) {
        var m = meshes[0];
        m.isVisible = false;
        m.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
        DRONE = m;
    });

    // create a machine model in a random lane
    var createEnemy = function () {
        // starting position of the drones
        var posZ = 100;

        // random lane
        var posX = LANES_POSITIONS[Math.floor(Math.random() * LANE_NUMBER)];

        // create clones
        var machine = DRONE.clone(DRONE.name);
        machine.id = DRONE.name + (DRONES.length + 1);
        machine.killed = false;
        machine.isVisible = true;
        machine.position = new BABYLON.Vector3(posX, machine.position.y / 2, posZ);

        DRONES.push(machine);
    }

    // new machine every 1s
    setInterval(createEnemy, 750);

    camera.position.x = LANES_POSITIONS[Math.floor(LANE_NUMBER / 2)];

};

// delete all the drones behind the camera
function cleanDrones() {
    for (var n = 0; n < DRONES.length; n++) {
        if (DRONES[n].killed) {
            var machine = DRONES[n];
            // destroy the clone
            machine.dispose();
            DRONES.splice(n, 1);
            n--;

            // increase score
            //score += 1;

        } else if (DRONES[n].position.z < -10) {
            var machine = DRONES[n];
            // destroy the clone
            machine.dispose();
            DRONES.splice(n, 1);
            n--;

            // decrease score
            //score -= 1;
        }
    }
};


// animation
function animateEnding(ending) {
    // position of our mesh
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

    // add keys to the animation
    animateEnding.setKeys(keys);

    // link the animation to the Mesh
    ending.animations.push(animateEnding);

    // run the animation
    scene.beginAnimation(ending, 0, 10, false, 1);
};

function onKeyDown(evt) {
    var currentEnding = -1;

    switch (evt.keyCode) {
        case 65: //'A'
            currentEnding = 0;
            break;
        case 83: //'S'
            currentEnding = 1;
            break;
        case 68: //'D'
            currentEnding = 2;
            break;
    }

    if (currentEnding != -1) {
        animateEnding(ENDINGS[currentEnding]);

        var machine = getDrone(ENDINGS[currentEnding]);
        if (machine) {
            machine.killed = true;
            
            document.getElementById('label').innerHTML = machine.label;
            sumScore += machine.score;
            document.getElementById('score').innerHTML = sumScore;
        }
    }
};

// checking if a drone is present on a given ending
function getDrone(ending) {
    for (var i = 0; i < DRONES.length; i++) {
        var machine = DRONES[i];
        var label, score;
        // check if a drone is on the good lane
        if (machine.position.x === ending.position.x) {
            // check if the drone is ON the ending
            var diffSup = ending.position.z + 3;
            var diffInf = ending.position.z - 3;

            if (machine.position.z > diffInf && machine.position.z < diffSup) {
                var t = Math.abs(ending.position.z - machine.position.z);
                if (t <= 1) {
                    label = "SVAKA TI DALA, LEGA !";
                    score = 4;
                } else if (t <= 1.5) {
                    label = "BRAVO";
                    score = 3;
                } else {
                    label = "IT'S OK";
                    score = 1;
                }
            } else {
                label = "FAIL :(";
                score = -5;
            }
            return { machine: machine, label: label, score: score }
        }
    }
};

// keyboard event listener
window.addEventListener('keydown', onKeyDown);