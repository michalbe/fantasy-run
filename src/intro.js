function go_to_github() {
	window.open('http://github.com/michalbe');
}


function init() {
	const points_element = document.querySelector('#points');
	const points = window.localStorage.getItem('points') || 0;
	points_element.setAttribute('value', `Best: ${points}m`);
}
