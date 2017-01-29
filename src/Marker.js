var THREE = require('three'),
    TWEEN = require('tween.js'),
    MeshLine = require('three.meshline'),
    utils = require('./Utils'),
    Defaults = require('./Defaults');

const PI_2 = 2 * Math.PI;
const SPOT_NEXT = 1.2;

function createMarkerTexture(marker) {
    marker = marker || {};
    marker.size = marker.size || Defaults.Markers.Canvas;
    marker.color = marker.color || Defaults.Markers.Color;
    marker.outer = marker.outer || Defaults.Markers.RadiusOuter;
    marker.inner = marker.inner || Defaults.Markers.RadiusInner;
    marker.stroke = marker.stroke || Defaults.Markers.StrokeOuter;

    const canvas = utils.renderToCanvas(marker.size, marker.size, function(ctx) {
        const arcW = marker.size / 2;
        const arcH = marker.size / 2;

        ctx.fillStyle = marker.color;
        ctx.strokeStyle = marker.color;
        ctx.lineWidth = marker.stroke;
        ctx.beginPath();
        ctx.arc(arcW, arcH, marker.outer, 0, PI_2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(arcW, arcH, marker.inner, 0, PI_2);
        ctx.fill();
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.name = "marker";
    return texture;
}

function createLineTexture(line) {
    line = line || {};
    line.size = line.size || Defaults.Lines.Canvas;

    const canvas = utils.renderToCanvas(line.size, line.size, function (context) {
        // creates a alpha modulation texture
        // that looks like Contrails

        const RGB_ON = 'rgba(255, 255, 255, 1.0)';
        const RGB_OFF = 'rgba(255, 255, 255, 0.0)';
        const RGB_MID = 'rgba(255, 255, 255, 0.33)';

        const gradient = context.createLinearGradient(0, 0, 0, line.size);
        gradient.addColorStop(0.00, RGB_OFF);
        gradient.addColorStop(0.10, RGB_OFF);
        gradient.addColorStop(0.25, RGB_ON);
        gradient.addColorStop(0.50, RGB_MID);  
        gradient.addColorStop(0.75, RGB_ON);
        gradient.addColorStop(0.90, RGB_OFF);
        gradient.addColorStop(1.00, RGB_OFF);
        context.fillStyle = gradient;
        context.fillRect(0, 0, line.size, line.size);

    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.name = "line";

    return texture;
}

function Marker(lat, lon, text, altitude, previous, scene, near, far, opts) {

    this.lat = parseFloat(lat);
    this.lon = parseFloat(lon);
    this.altitude = parseFloat(altitude);

    this.text = text;
    this.scene = scene;
    this.previous = previous;
    this.next = [];

    if (this.previous){
        this.previous.next.push(this);
    }

    opts = opts || {};
    this.opts = opts;
    this.opts.lines = this.opts.lines || {};
    this.opts.lines.color = this.opts.lines.color || Defaults.Lines.Color;
    this.opts.lines.segments = this.opts.lines.segments || Defaults.Lines.Segments;
    this.opts.lines.opacity = this.opts.lines.opacity || Defaults.Lines.Opacity;
    this.opts.lines.width = this.opts.lines.width || Defaults.Lines.Width;
    this.opts.lines.dotwiggle = this.opts.lines.dotwiggle || Defaults.Lines.DotWiggle;

    this.opts.drawTime = this.opts.drawTime || Defaults.Markers.Delay_MS;

    this.opts.marker = this.opts.marker || {};
    this.opts.marker.size = this.opts.marker.size || Defaults.Markers.Canvas;
    this.opts.marker.opacity = this.opts.marker.opacity || Defaults.Markers.Opacity;
    this.opts.marker.scale = this.opts.marker.scale || Defaults.Markers.Scale_MS;

    this.opts.label = this.opts.label || {};
    this.opts.label.font = this.opts.label.font || {};
    this.opts.label.underline = this.opts.label.underline || {};
    this.opts.label.fade = this.opts.label.fade || Defaults.Labels.Fade_MS;

    let point = utils.mapPoint(lat, lon);

    // -- marker the ()
    if (!scene.markerTexture) {
        scene.markerTexture = createMarkerTexture(this.opts.marker);
    }

    let markerMaterial = new THREE.SpriteMaterial({ map: scene.markerTexture, 
                                                    opacity: this.opts.marker.opacity, 
                                                    depthTest: true, 
                                                    fog: true });

    const marker = new THREE.Sprite(markerMaterial);
    this.marker = marker;
    this.marker.scale.set(0, 0);
    this.marker.position.set(point.x * altitude, point.y * altitude, point.z * altitude);

    new TWEEN.Tween({x: 0, y: 0})
                .to({x: this.opts.marker.size, y: this.opts.marker.size}, this.opts.marker.scale)
                .easing(TWEEN.Easing.Elastic.Out)
                .onUpdate(function() {
                    marker.scale.set(this.x, this.y);
                })
                .delay((this.previous ? this.opts.drawTime : 0))
                .start();
    // -- end marker

    // -- text label
    let labelCanvas = utils.createLabel(text.toUpperCase(), this.opts.label.font, this.opts.label.underline, this.opts.label.background);
    let labelTexture = new THREE.Texture(labelCanvas);
    labelTexture.name = "marker-label"
    labelTexture.needsUpdate = true;

    let labelMaterial = new THREE.SpriteMaterial({
        map : labelTexture,
        opacity: 0,
        transparent: (this.opts.label.fade > 0),
        depthTest: true,
        fog: true
    });

    this.labelSprite = new THREE.Sprite(labelMaterial);
    this.labelSprite.position.set(point.x * altitude * 1.1, point.y * altitude * 1.05 + (point.y < 0 ? -15 : 30), point.z * altitude * 1.1); 
    this.labelSprite.scale.set(labelCanvas.width / Defaults.Render.PixelRatio, labelCanvas.height / Defaults.Render.PixelRatio);

    new TWEEN.Tween({opacity: 0})
                .to({opacity: 1}, this.opts.label.fade)
                .onUpdate(function() {
                    labelMaterial.opacity = this.opacity
                })
                .start();
    // -- end text label

  if (this.previous) {
        this.geometrySpline = new THREE.Geometry();
        this.geometrySplineDotted = new THREE.Geometry();

        let latdist = (lat - previous.lat) / this.opts.lines.segments;
        let londist = (lon - previous.lon) / this.opts.lines.segments;
        let startPoint = utils.mapPoint(previous.lat,previous.lon);
        let pointList = [];
        let pointList2 = [];

        for (let j = 0; j< this.opts.lines.segments + 1; j++){
            let nextlat = (((90 + previous.lat + j*latdist)%180)-90) * (.5 + Math.cos(j*(5*Math.PI/2)/this.opts.lines.segments)/2) + (j*lat/this.opts.lines.segments/2);
            let nextlon = ((180 + previous.lon + j*londist)%360)-180;
            pointList.push({lat: nextlat, lon: nextlon, index: j});
            if (j == 0 || j == this.opts.lines.segments){
                pointList2.push({lat: nextlat, lon: nextlon, index: j});
            } else {
                pointList2.push({lat: nextlat+1, lon: nextlon, index: j});
            }

            let sPoint = new THREE.Vector3(startPoint.x * SPOT_NEXT, startPoint.y * SPOT_NEXT, startPoint.z * SPOT_NEXT);
            let sPoint2 = new THREE.Vector3(startPoint.x * SPOT_NEXT, startPoint.y * SPOT_NEXT, startPoint.z * SPOT_NEXT);

            sPoint.globe_index = j;
            sPoint2.globe_index = j;

            this.geometrySpline.vertices.push(sPoint);  
            this.geometrySplineDotted.vertices.push(sPoint2);  
        }

        // -- mesh line
        if (!scene.lineTexture) {
            scene.lineTexture = createLineTexture(this.opts.lines);
        }

        if (!this.meshLine) {
            this.meshLine = new MeshLine.MeshLine();
        }

        const sizeFunction = (p) => 0.5 + 3 * Math.sin(p * Math.PI);
        this.meshLine.setGeometry(this.geometrySpline, sizeFunction);

        const materialMeshSpline = new MeshLine.MeshLineMaterial({ 
            useMap: true,
            map: scene.lineTexture,
            color: new THREE.Color(this.opts.lines.color),
            opacity: this.opts.lines.opacity,
            lineWidth: this.opts.lines.width, 
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthTest: false,
            resolution: new THREE.Vector2(1024, 1024), // should be window height
            sizeAttenuation: true,
            near: near,
            far: far,
            fog: true
        });
        // -- end mesh line
        
        const materialSplineDotted = new THREE.LineBasicMaterial({
            color: this.opts.lines.color,
            linewidth: 1,
            transparent: true,
            opacity: this.opts.lines.opacity
        });

        const update = () => {
            let nextSpot = pointList.shift();
            let nextSpot2 = pointList2.shift();
            const SPOT_NEXT_O = SPOT_NEXT - this.opts.lines.dotwiggle;

            for (let x = 0; x < this.geometrySpline.vertices.length; x++){

                let currentVert = this.geometrySpline.vertices[x];
                let currentPoint = utils.mapPoint(nextSpot.lat, nextSpot.lon);

                let currentVert2 = this.geometrySplineDotted.vertices[x];
                let currentPoint2 = utils.mapPoint(nextSpot2.lat, nextSpot2.lon);

                if (x >= nextSpot.index) {
                    currentVert.set(currentPoint.x * SPOT_NEXT, currentPoint.y * SPOT_NEXT, currentPoint.z * SPOT_NEXT);
                    currentVert2.set(currentPoint2.x * SPOT_NEXT_O, currentPoint2.y * SPOT_NEXT_O, currentPoint2.z * SPOT_NEXT_O);
                }
            }
            
            this.geometrySpline.verticesNeedUpdate = true;
            this.meshLine.setGeometry(this.geometrySpline, sizeFunction); // ned to reset it

            this.geometrySplineDotted.verticesNeedUpdate = true;

            if (pointList.length > 0){
                setTimeout(update, this.opts.drawTime / this.opts.lines.segments);
            }
        };

        update();

        const trailMesh = new THREE.Mesh(this.meshLine.geometry, materialMeshSpline);
        trailMesh.frustumCulled = false;

        this.scene.add(trailMesh);

        if (this.opts.lines.dotwiggle !== 0) {
            this.scene.add(new THREE.LineSegments(this.geometrySplineDotted, materialSplineDotted));
        }
    }

    this.scene.add(this.marker);
    this.scene.add(this.labelSprite);
}

Marker.prototype.remove = function() {
    let x = 0;

    const update = (ref) => {

        for (let i = 0; i < x; i++){
            ref.geometrySpline.vertices[i].set(ref.geometrySpline.vertices[i+1]);
            ref.geometrySplineDotted.vertices[i].set(ref.geometrySplineDotted.vertices[i+1]);
        }
        ref.geometrySpline.verticesNeedUpdate = true;
        ref.geometrySplineDotted.verticesNeedUpdate = true;
        x++;
        if(x < ref.geometrySpline.vertices.length) {
            setTimeout(() => update(ref), this.opts.drawTime / this.opts.lines.segments);
        } else {
            this.scene.remove(ref.geometrySpline);
            this.scene.remove(ref.geometrySplineDotted);
        }
    }

    for (let j = 0; j < this.next.length; j++){
        (function(k){
            update(this.next[k]);
        })(j);
    } 

    this.scene.remove(this.marker);
    this.scene.remove(this.labelSprite);
};

module.exports = Marker;
