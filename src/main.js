const speed = 0.9;
const meter_length = 8;
const curbs = 2;
const road_size = 18;
const max_walking_distance = (road_size/2) - 2;
const max_distance = 100;
const rocks = 40;
const grounds = 8;
const change_each = 10;
const step_size = 0.1;
const obstacles = 10;
const obstacle_types = 6;

let distance = 0;
let scene;
let isUp = 1;
let ticks = 0;
let lights;
let UI;
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

function init() {
	scene = document.querySelector('#scene1');
	UI = document.querySelector('#UI');
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
}
