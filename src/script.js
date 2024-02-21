document.addEventListener('DOMContentLoaded', function () {
    var shift = { x: 0, y: 0.3, z: 0 };
    var scene = document.querySelector('a-scene');
    plotAxes(shift);
    screenSurf(shift);

    var websocket = new WebSocket("ws://185.180.230.108:8001");

    websocket.onmessage = function(event) {
        redata(JSON.parse(event.data));
    };

    var box_id = 0;
    var boxes = [];
    var flag = false;
    var index = -1;

    var selectedShape = 'box';
    var initialPositionSet = false;

    var cameraIsSet = false;
    var accuracy = 0;
    camPos = {x: 0, y: 0, z: 0};

    var position = {x: 0, y: 0, z: 0};

    function redata(data) {
        if (data !== null) {
            for (var i = 1; i < 50; i++) {
                if (data['x' + i] !== undefined && data['y' + i] !== undefined && data['z' + i] !== undefined) {
                    let x = parseInt(data['x' + i], 10) / 10 + shift.x;
                    let y = parseInt(data['y' + i], 10) / 10 + shift.y;
                    let z = parseInt(data['z' + i], 10) / 10 + shift.z;

                    position.x = x;
                    position.y = y;
                    position.z = z;

                    if (!cameraIsSet){
                        if (accuracy < 10) {
                            camPos.x += position.x;
                            camPos.y += position.y;
                            camPos.z += position.z;
                            accuracy += 1;
                            continue;
                        } else {
                            camPos.x = camPos.x / accuracy + 2;
                            camPos.y = camPos.y / accuracy - 2;
                            camPos.z = camPos.z / accuracy + 3;

                            cameraIsSet = true;
                            var cam = document.getElementById("cam");
                            cam.setAttribute('position', camPos);

                            var plane = document.getElementById('screen');
                            var textS = document.getElementById('textScreen');

                            plane.setAttribute('position', {
                                x: camPos.x,
                                y: 5 + shift.y,
                                z: shift.z
                            });
                            textS.setAttribute('position', {
                                x: camPos.x,
                                y: 5 + shift.y,
                                z: shift.z + 0.1
                            });

                        }
                    }

                    if (!initialPositionSet) {
                        x = camPos.x;
                        y += camPos.y;
                        initialPositionSet = true;
                    }

                    var newPos = `${x} ${y} ${z}`;

                    if (document.getElementById('parent_id' + i)) {
                        document.getElementById('parent_id' + i).setAttribute('animation', `property: position; to: ${newPos}`);
                        document.getElementById('text_id' + i).setAttribute('value', 'id=' + i + ' (' + parseInt(data['x' + i], 10) + ',' + parseInt(data['y' + i], 10) + ',' + parseInt(data['z' + i], 10) + ')');
                    } else {
                        var entity = document.createElement('a-entity');
                        entity.setAttribute('id', 'parent_id' + i);
                        entity.setAttribute('position', newPos);

                        var object = document.createElement('a-box');
                        object.setAttribute('color', '#483D8B');
                        object.setAttribute('position', '0 0 0');

                        var text = document.createElement('a-text');
                        text.setAttribute('id', 'text_id' + i);
                        text.setAttribute('value', 'id=' + i + ' (' + parseInt(data['x' + i], 10) + ',' + parseInt(data['y' + i], 10) + ',' + parseInt(data['z' + i], 10) + ')');
                        text.setAttribute('position', '0.125 0 0');

                        entity.appendChild(object);
                        entity.appendChild(text);

                        scene.appendChild(entity);
                    }

                    if (flag) {
                        document.getElementById('box_' + index).setAttribute('animation', 'property: position; to: ' + position.x + ' ' + position.y + ' ' + position.z + '')
                    }

                }
            }
        }
    }

    function screenSurf(shift) {
        var plane = document.getElementById('screen');
        plane.setAttribute('height', 10);
        plane.setAttribute('width', 10);
        plane.setAttribute('position', {
            x: 5 + shift.x,
            y: 5 + shift.y,
            z: shift.z
        });
        var textS = document.getElementById('textScreen');
        textS.setAttribute('position', {
            x: 5 + shift.x,
            y: 5 + shift.y,
            z: shift.z + 0.1
        });
        textS.setAttribute('text', {
            value: 'screen',
            color: 'black',
            align: 'center',
            width: 20,
            opacity: 0.4
        });
    }

    function plotAxes(shift) {
        for (var i = 0; i < 100; i++) {
            if (i == 0) {
                var boxEl = document.createElement('a-sphere');
                boxEl.setAttribute('material', { color: '#ae63e4' });
                boxEl.setAttribute('position', { x: shift.x, y: shift.y, z: i + shift.z });
                boxEl.setAttribute('scale', { x: 0.03, y: 0.03, z: 0.03 });
                scene.appendChild(boxEl);
                var textA = document.createElement('a-text');
                textA.setAttribute('text', { value: '' + i, color: '#969696' });
                textA.setAttribute('position', { x: shift.x + 0.1, y: shift.y + 0.2, z: i + shift.z });
                scene.appendChild(textA);
                continue;
            }
            boxEl = document.createElement('a-sphere');
            boxEl.setAttribute('material', { color: '#ae63e4' });
            boxEl.setAttribute('position', { x: shift.x, y: shift.y, z: i + shift.z });
            boxEl.setAttribute('scale', { x: 0.05, y: 0.05, z: 0.05 });
            scene.appendChild(boxEl);
            textA = document.createElement('a-text');
            textA.setAttribute('text', { value: 'z=' + i, color: '#969696' });
            textA.setAttribute('position', { x: shift.x + 0.1, y: shift.y, z: i + shift.z });
            scene.appendChild(textA);
            boxEl = document.createElement('a-sphere');
            boxEl.setAttribute('material', { color: '#ae63e4' });
            boxEl.setAttribute('position', { x: i + shift.x, y: shift.y, z: shift.z });
            boxEl.setAttribute('scale', { x: 0.05, y: 0.05, z: 0.05 });
            scene.appendChild(boxEl);
            textA = document.createElement('a-text');
            textA.setAttribute('text', { value: 'x=' + i, color: '#969696' });
            textA.setAttribute('position', { x: i + shift.x + 0.1, y: shift.y + 0.2, z: shift.z });
            scene.appendChild(textA);
            boxEl = document.createElement('a-sphere');
            boxEl.setAttribute('material', { color: '#ae63e4' });
            boxEl.setAttribute('position', { x: shift.x, y: i + shift.y, z: shift.z });
            boxEl.setAttribute('scale', { x: 0.05, y: 0.05, z: 0.05 });
            scene.appendChild(boxEl);
            textA = document.createElement('a-text');
            textA.setAttribute('text', { value: 'y=' + i, color: '#969696' });
            textA.setAttribute('position', { x: shift.x + 0.1, y: i + shift.y, z: shift.z });
            scene.appendChild(textA);
        }
        var lineX = document.createElement('a-entity');
        lineX.setAttribute('line', {
            start: shift.x + ' ' + shift.y + ' ' + shift.z,
            end: shift.x + ' ' + shift.y + ' ' + (i + shift.z),
            color: '#ae63e4'
        });
        scene.appendChild(lineX);
        var lineY = document.createElement('a-entity');
        lineY.setAttribute('line', {
            start: shift.x + ' ' + shift.y + ' ' + shift.z,
            end: (i + shift.x) + ' ' + shift.y + ' ' + shift.z,
            color: '#ae63e4'
        });
        scene.appendChild(lineY);
        var lineZ = document.createElement('a-entity');
        lineZ.setAttribute('line', {
            start: shift.x + ' ' + shift.y + ' ' + shift.z,
            end: shift.x + ' ' + (i + shift.y) + ' ' + shift.z,
            color: '#ae63e4'
        });
        scene.appendChild(lineZ);
    }
});
