const speed = 0.5;
let scene;
const road_size = 12;
const max_distance = 50;
const rocks = 20;
const grounds = 5;
let isUp = 1;
const change_each = 10;
let ticks = 0;
const step_size = 0.1;

function add_rock(isLeft, zPos, element) {
	const el = element || document.createElement('a-entity');
	const scale = 0.4 + Math.random();
	const position_modifier = 1 - Math.random()*2;
	const multiplier = isLeft ? -1 : 1;

	el.setAttribute('position', `${(road_size/2 + position_modifier) * multiplier} 0 ${zPos}`);
	el.setAttribute('scale', `${scale} ${scale} ${scale}`);
	el.setAttribute('rotation', `0 ${~~(Math.random()*360)} 0`);

	window.el = el;
	if (!element) {
		el.setAttribute('collada-model', '#rock1');
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

function init() {
	scene = document.querySelector('#scene1');
	const step = (max_distance * 2) / rocks;
	for (let i = 0; i < rocks; i++) {
		add_rock(Math.random() > 0.5, i * step - max_distance);
	}

	const ground_step = (max_distance * 2) / grounds;
	for (let i = 0; i < grounds; i++) {
		add_ground(i * ground_step - max_distance);
	}

}
