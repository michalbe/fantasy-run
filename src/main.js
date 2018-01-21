const speed = 0.2;
let scene;
const road_size = 12;
const max_distance = 50;
const rocks = 20;

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
		el.setAttribute('move', '');
		scene.appendChild(el);
	}
}

AFRAME.registerComponent('move', {
	tick() {
		const position_modifier = 1 - Math.random()*2;
		if (this.el.object3D.position.z > max_distance) {
			add_rock(Math.random() > 0.5, - max_distance, this.el);
			// this.el.object3D.position.z = -max_distance + position_modifier;

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
}
