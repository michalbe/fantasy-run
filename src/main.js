const speed = 0.9;
const meter_length = 12;
const curbs = 2;
const road_size = 18;
const max_walking_distance = (road_size/2) - 2;
const max_distance = 100;
const rocks = 40;
const grounds = 8;
const change_each = 10;
const step_size = 0.1;
const obstacles = 1;
const obstacle_types = 6;
const immortality_threshold = 4000;

let distance = 0;
let scene;
let isUp = 1;
let ticks = 0;
let lights;
let camera;
let UI;

function reset() {
	distance = 0;
	scene = null;
	isUp = 1;
	ticks = 0;
	lights = null;
	camera = null;
	UI = null;
}

const movable_components = [
	'calculate-distance',
	'move-obstacle',
	'move-rock',
	'move-ground',
	'listener'
];

const animated_obstacles = [
	4, 5, 6
];

function add_obstacle(zPos, element) {
	const el = element || document.createElement('a-entity');
	const obstacle_index = (1 + ~~(Math.random() * obstacle_types));
	const is_animated = animated_obstacles.includes(obstacle_index);
	let loader;
	el.setAttribute('position', `${road_size/2 - ~~(Math.random() * road_size)} -0.5 ${zPos}`);
	el.setAttribute('animation-mixer', '');

	if (!is_animated) {
		loader = 'collada';
		el.setAttribute('rotation', `0 ${~~(Math.random()*360)} 0`);
	} else {
		loader = 'gltf';
		el.setAttribute('rotation', `0 ${45 - ~~(Math.random()*90)} 0`);
	}

	el.setAttribute(`${loader}-model`, '#obstacle' + obstacle_index);
	if (!element) {
		el.classList.add('obstacle');
		el.setAttribute('move-obstacle', '');
		scene.appendChild(el);
	}
}

function add_rock(isLeft, zPos, element) {
	const el = element || document.createElement('a-entity');
	const scale = 0.4 + Math.random();
	const position_modifier = 1 - Math.random()*2;
	const multiplier = isLeft ? -1 : 1;

	el.setAttribute('position', `${(road_size/2 + position_modifier) * multiplier} 0 ${zPos}`);
	el.setAttribute('scale', `${scale} ${scale} ${scale}`);
	el.setAttribute('rotation', `0 ${~~(Math.random()*360)} 0`);
	el.setAttribute('collada-model', '#curb' + (1 + ~~(Math.random() * curbs)));

	window.el = el;
	if (!element) {
		el.setAttribute('move-rock', '');
		scene.appendChild(el);
	}
}

function add_ground(zPos) {
	const el = document.createElement('a-entity');

	el.setAttribute('position', `0 -0.5 ${zPos}`);
	el.setAttribute('rotation', `0 90 0`);
	el.setAttribute('collada-model', '#ground');
	el.setAttribute('move-ground', '');
	scene.appendChild(el);
}

AFRAME.registerComponent('step-shake', {
	tick() {
		ticks++;
		if (ticks%change_each === 0) {
			this.el.object3D.position.y += step_size * isUp;
			isUp *= -1;
		}
	}
});

AFRAME.registerComponent('calculate-distance', {
	tick() {
		if(!UI) {
			return;
		}
		
		distance += speed
		UI.children[0].setAttribute('value', Math.round(distance/meter_length) + 'M');
	}
});

AFRAME.registerComponent('move-rock', {
	tick() {
		const position_modifier = 1 - Math.random()*2;
		if (this.el.object3D.position.z > max_distance) {
			add_rock(Math.random() > 0.5, - max_distance, this.el);
		}
		this.el.object3D.position.z += speed;
	}
});

AFRAME.registerComponent('move-ground', {
	tick() {
		if (this.el.object3D.position.z > max_distance) {
			this.el.object3D.position.z = -max_distance;
			this.el.setAttribute('rotation', `0 ${~~(Math.random()*360)} 0`);
		}
		this.el.object3D.position.z += speed;
	}
});

AFRAME.registerComponent('move-obstacle', {
	tick() {
		if (this.el.object3D.position.z > max_distance) {
			this.el.object3D.position.z = -max_distance;
			add_obstacle(-max_distance, this.el);
		}
		this.el.object3D.position.z += speed;
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
		if (!UI) {
			return;
		}
		const dead_point = Math.PI/24;
		const camera = this.el.children[0].object3D;
		const modifier = camera.rotation.y > 0 ? -1 : 1;
		if (
			Math.abs(camera.rotation.y) > dead_point
			&&
			(
				(modifier > 0 && this.el.object3D.position.x < max_walking_distance) ||
				(modifier < 0 && this.el.object3D.position.x > -max_walking_distance)
			)
		) {
			this.el.object3D.position.x += 0.2 * modifier;
			UI.object3D.position.x += 0.2 * modifier;
		}
	}
});

function stop_game() {
	Array.from(
		document.querySelectorAll(movable_components.map((component) => {
			return `[${component}]`
		}).join(', '))
	).forEach((element) => {
		movable_components.forEach((component) => {
			element.removeAttribute(component);
		});
	});
}

function init_main() {
	reset();
	scene = document.querySelector('#game_scene');
	UI = document.querySelector('#UI');
	camera = document.querySelector('#camera_entity');
	const step = (max_distance * 2) / rocks;
	for (let i = 0; i < rocks; i++) {
		add_rock(Math.random() > 0.5, i * step - max_distance);
	}

	const ground_step = (max_distance * 2) / grounds;
	for (let i = 0; i < grounds; i++) {
		add_ground(i * ground_step - max_distance);
	}

	const obstacle_step = (max_distance * 2) / obstacles;
	for (let i = 0; i < obstacles; i++) {
		add_obstacle(i * obstacle_step - max_distance);
	}

	document.querySelector('#camera_entity').setAttribute('aabb-collider', 'objects: .obstacle');
	setTimeout(() => {
		camera.addEventListener('hit', (e) => {
			stop_game();
		});
	}, immortality_threshold);

}

function go_to_github() {
	window.open('http://github.com/michalbe');
}

function intro_init() {
	// const scene_renderer = document.querySelector('#scene-renderer');
	// scene_renderer.innerHTML = document.querySelector('#game-shared').innerHTML + document.querySelector('#intro-scene').innerHTML;
	// AFRAME.scenes[0].init();
	document.querySelector('#intro-camera').setAttribute('camera', 'active: true');
	document.querySelector('#game-camera').setAttribute('camera', 'active: false');

	const points_element = document.querySelector('#points');
	const points = window.localStorage.getItem('points') || 0;
	points_element.setAttribute('value', `Best: ${points}m`);
}

function start_game() {
	if (document.querySelector('#game_scene').setAttribute('visible') === 'true') {
		return;
	}
	// AFRAME.scenes[0].removeChild(AFRAME.scenes[0].querySelector('#camera_wrapper'));
  //
	// const scene_renderer = document.querySelector('#scene-renderer');
	// scene_renderer.innerHTML = document.querySelector('#game-shared').innerHTML + document.querySelector('#game-scene').innerHTML;
	// AFRAME.scenes[0].init();
	document.querySelector('#intro-camera').setAttribute('camera', 'active: false');
	document.querySelector('#game-camera').setAttribute('camera', 'active: true');
	document.querySelector('#intro').setAttribute('visible', 'false');
	document.querySelector('#game_scene').setAttribute('visible', 'true');
	init_main();
}
