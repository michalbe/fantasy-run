const GAME = {
	distance: 0,
	scene: null,
	isUp: 1,
	ticks: 0,
	lights: null,
	camera: null,
	UI: null,
	running: false,
	timeout: 0
};

const CONFIG = {
	speed: 0.9,
	meter_length: 12,
	curbs: 2,
	road_size: 18,
	max_distance: 100,
	rocks: 40,
	grounds: 8,
	change_each: 10,
	step_size: 0.1,
	obstacles: 10,
	obstacle_types: 6,
	immortality_threshold: 2000,
	movable_components: [
		'calculate-distance',
		'move-obstacle',
		'move-rock',
		'move-ground',
		'listener'
	],
	obstacles_with_sound: [
		4, 5, 6
	],
	animated_obstacles: [
		4, 5, 6
	]
};

CONFIG.max_walking_distance = (CONFIG.road_size/2) - 2;


function reset() {
	GAME.distance = 0;
	GAME.scene = null;
	GAME.isUp = 1;
	GAME.ticks = 0;
	GAME.timeout = 0;
	GAME.lights = null;
	GAME.camera = null;
	GAME.UI = null;
	GAME.running = false;
}

function add_obstacle(zPos, element) {
	const el = element || document.createElement('a-entity');
	const obstacle_index = (1 + ~~(Math.random() * CONFIG.obstacle_types));
	const is_animated = CONFIG.animated_obstacles.includes(obstacle_index);
	const has_sound = CONFIG.obstacles_with_sound.includes(obstacle_index);

	let loader;
	el.setAttribute('position', `${CONFIG.road_size/2 - ~~(Math.random() * CONFIG.road_size)} -0.5 ${zPos}`);
	el.setAttribute('animation-mixer', '');

	if (!is_animated) {
		loader = 'collada';
		el.setAttribute('rotation', `0 ${~~(Math.random()*360)} 0`);
	} else {
		loader = 'gltf';
		el.setAttribute('rotation', `0 ${45 - ~~(Math.random()*90)} 0`);
	}

	if (has_sound) {
		el.setAttribute('sound', `src: url(assets/${obstacle_index}.wav); autoplay: true`);
	} else {
		el.removeAttribute('sound');
	}

	el.setAttribute(`${loader}-model`, '#obstacle' + obstacle_index);
	if (!element) {
		el.classList.add('obstacle');
		el.classList.add('gameobj');
		el.setAttribute('move-obstacle', '');
		GAME.scene.appendChild(el);
	}
}

function add_rock(isLeft, zPos, element) {
	const el = element || document.createElement('a-entity');
	const scale = 0.4 + Math.random();
	const position_modifier = 1 - Math.random()*2;
	const multiplier = isLeft ? -1 : 1;

	el.setAttribute('position', `${(CONFIG.road_size/2 + position_modifier) * multiplier} 0 ${zPos}`);
	el.setAttribute('scale', `${scale} ${scale} ${scale}`);
	el.setAttribute('rotation', `0 ${~~(Math.random()*360)} 0`);
	el.setAttribute('collada-model', '#curb' + (1 + ~~(Math.random() * CONFIG.curbs)));

	window.el = el;
	if (!element) {
		el.classList.add('gameobj');
		el.setAttribute('move-rock', '');
		GAME.scene.appendChild(el);
	}
}

function add_ground(zPos) {
	const el = document.createElement('a-entity');

	el.setAttribute('position', `0 -0.5 ${zPos}`);
	el.setAttribute('rotation', `0 90 0`);
	el.setAttribute('collada-model', '#ground');
	el.setAttribute('move-ground', '');
	el.classList.add('gameobj');
	GAME.scene.appendChild(el);
}

AFRAME.registerComponent('calculate-distance', {
	tick() {
		if(!GAME.UI) {
			return;
		}

		GAME.distance += CONFIG.speed
		GAME.UI.children[0].setAttribute('value', Math.round(GAME.distance/CONFIG.meter_length) + 'M');
	}
});

AFRAME.registerComponent('move-rock', {
	tick() {
		const position_modifier = 1 - Math.random()*2;
		if (this.el.object3D.position.z > CONFIG.max_distance) {
			add_rock(Math.random() > 0.5, - CONFIG.max_distance, this.el);
		}
		this.el.object3D.position.z += CONFIG.speed;
	}
});

AFRAME.registerComponent('move-ground', {
	tick() {
		if (this.el.object3D.position.z > CONFIG.max_distance) {
			this.el.object3D.position.z = -CONFIG.max_distance;
			this.el.setAttribute('rotation', `0 ${~~(Math.random()*360)} 0`);
		}
		this.el.object3D.position.z += CONFIG.speed;
	}
});

AFRAME.registerComponent('move-obstacle', {
	tick() {
		if (this.el.object3D.position.z > CONFIG.max_distance) {
			this.el.object3D.position.z = -CONFIG.max_distance;
			add_obstacle(-CONFIG.max_distance, this.el);
		}
		this.el.object3D.position.z += CONFIG.speed;
	}
});

AFRAME.registerComponent("listener", {
	schema :
	{
		stepFactor : {
			type : "number",
			default : 0.05
		}
	},
	tick : function() {
		if (!GAME.UI || !GAME.camera) {
			return;
		}
		const dead_point = Math.PI/24;
		const camera = this.el.children[0].object3D;
		const modifier = camera.rotation.y > 0 ? -1 : 1;
		if (
			Math.abs(camera.rotation.y) > dead_point
			&&
			(
				(modifier > 0 && this.el.object3D.position.x < CONFIG.max_walking_distance) ||
				(modifier < 0 && this.el.object3D.position.x > -CONFIG.max_walking_distance)
			)
		) {
			this.el.object3D.position.x += 0.2 * modifier;
			GAME.UI.object3D.position.x += 0.2 * modifier;
		}
	}
});

function stop_game() {
	Array.from(
		document.querySelectorAll(CONFIG.movable_components.map((component) => {
			return `[${component}]`
		}).join(', '))
	).forEach((element) => {
		CONFIG.movable_components.forEach((component) => {
			element.removeAttribute(component);
		});
	});

	window.localStorage.setItem('points', Math.max(
		Math.round(GAME.distance / CONFIG.meter_length),
		parseInt(window.localStorage.getItem('points'), 10)
	));
	document.querySelector('#scene-renderer').style.opacity = 0;
	setTimeout(intro_init, 2000);
	setTimeout(() => {
		document.querySelector('#scene-renderer').style.opacity = 1;
	}, 3000);
	GAME.camera.removeEventListener('hit', stop_game);
}

function init_main() {
	console.log('MAIN');
	
	reset();
	GAME.scene = document.querySelector('#game_scene');
	GAME.UI = document.querySelector('#UI');
	GAME.camera = document.querySelector('#camera_entity');
	const step = (CONFIG.max_distance * 2) / CONFIG.rocks;
	for (let i = 0; i < CONFIG.rocks; i++) {
		add_rock(Math.random() > 0.5, i * step - CONFIG.max_distance);
	}

	const ground_step = (CONFIG.max_distance * 2) / CONFIG.grounds;
	for (let i = 0; i < CONFIG.grounds; i++) {
		add_ground(i * ground_step - CONFIG.max_distance);
	}

	const obstacle_step = (CONFIG.max_distance * 2) / CONFIG.obstacles;
	for (let i = 0; i < CONFIG.obstacles; i++) {
		add_obstacle(i * obstacle_step - CONFIG.max_distance);
	}

	// Force call `update` on `aabb` component on each game start
	GAME.camera.setAttribute('aabb-collider', 'objects: .dummy-class');
	GAME.camera.setAttribute('aabb-collider', 'objects: .obstacle');

	document.querySelector('#camera_wrapper_game').object3D.position.x = 0;
	document.querySelector('#camera_wrapper_game').setAttribute('listener', 'stepFactor:1');
	document.querySelector('#points-label').setAttribute('calculate-distance', '');
	GAME.UI.object3D.position.x = -3;

	setTimeout(() => {
		GAME.camera.addEventListener('hit', stop_game);
	}, CONFIG.immortality_threshold);

}

function go_to_github() {
	window.open('http://github.com/michalbe');
}

function intro_init() {
	Array.from(
		document.querySelectorAll('.gameobj')
	).forEach((game_object) => {
		game_object.parentNode.removeChild(game_object);
	});

	document.querySelector('#intro-camera').setAttribute('camera', 'active: true');
	document.querySelector('#game-camera').setAttribute('camera', 'active: false');
	document.querySelector('#intro').setAttribute('visible', 'true');
	document.querySelector('#game_scene').setAttribute('visible', 'false');

	const points_element = document.querySelector('#points');
	const points = window.localStorage.getItem('points') || 0;
	points_element.setAttribute('value', `Best: ${points}m`);
}

function start_game() {
	if (document.querySelector('#game_scene').setAttribute('visible') === 'true') {
		return;
	}

	document.querySelector('#intro-camera').setAttribute('camera', 'active: false');
	document.querySelector('#game-camera').setAttribute('camera', 'active: true');
	document.querySelector('#intro').setAttribute('visible', 'false');
	document.querySelector('#game_scene').setAttribute('visible', 'true');
	init_main();
}
