const speed = 0.9;
const obstacles = 2;
let scene;
const road_size = 18;
const max_distance = 100;
const rocks = 40;
const grounds = 7;
let isUp = 1;
const change_each = 10;
let ticks = 0;
const step_size = 0.1;
let lights;
function add_rock(isLeft, zPos, element) {
	const el = element || document.createElement('a-entity');
	const scale = 0.4 + Math.random();
	const position_modifier = 1 - Math.random()*2;
	const multiplier = isLeft ? -1 : 1;

	el.setAttribute('position', `${(road_size/2 + position_modifier) * multiplier} 0 ${zPos}`);
	el.setAttribute('scale', `${scale} ${scale} ${scale}`);
	el.setAttribute('rotation', `0 ${~~(Math.random()*360)} 0`);
	el.setAttribute('collada-model', '#obstacle' + (1 + ~~(Math.random() * obstacles)));

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

AFRAME.registerComponent("listener", {
	schema :
	{
		stepFactor : {
			type : "number",
			default : 0.05
		}
	},
	tick : function() {
		const modifier = this.el.components.camera.camera.getWorldDirection().x > 0 ? 1 : -1;
		if (
			Math.abs(this.el.components.camera.camera.getWorldDirection().x) > 0.1 &&
			(
				(modifier > 0 && this.el.components.camera.camera.parent.position.x < road_size/2) ||
				(modifier < 0 && this.el.components.camera.camera.parent.position.x > -road_size/2)
			)
		) {
			this.el.components.camera.camera.parent.position.x += this.data.stepFactor * modifier;
		}
		// this.el.components.camera.camera.parent.position.add(
		// 	this.el.components.camera.camera.getWorldDirection().multiplyScalar(this.data.stepFactor)
		// );
	}
});

function init() {
	scene = document.querySelector('#scene1');
	light = document.querySelector('#light');
	const step = (max_distance * 2) / rocks;
	for (let i = 0; i < rocks; i++) {
		add_rock(Math.random() > 0.5, i * step - max_distance);
	}

	const ground_step = (max_distance * 2) / grounds;
	for (let i = 0; i < grounds; i++) {
		add_ground(i * ground_step - max_distance);
	}

}
