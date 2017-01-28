var THREE = require('three'),
    TWEEN = require('tween.js'),
    MeshLine = require('three.meshline'),
    utils = require('./Utils'),
    Defaults = require('./Defaults');

const PI_2 = 2 * Math.PI;

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

var Marker = function(lat, lon, text, altitude, previous, scene, near, far, _opts){

    /* options that can be passed in */
    var opts = {
        lineColor: "#FFCC00",
        lineWidth: 1,
        drawTime: 2000,
        lineSegments: 150
    }

    var point,
        previousPoint,
        labelCanvas,
        labelTexture,
        labelMaterial
        ;


    this.lat = parseFloat(lat);
    this.lon = parseFloat(lon);
    this.text = text;
    this.altitude = parseFloat(altitude);
    this.scene = scene;
    this.previous = previous;
    this.next = [];

    if(this.previous){
        this.previous.next.push(this);
    }

    if(_opts){
        for(var i in opts){
            if(_opts[i] != undefined){
                opts[i] = _opts[i];
            }
        }
    }

    this.opts = opts;

    
    point = utils.mapPoint(lat, lon);

    if(previous){
        previousPoint = utils.mapPoint(previous.lat, previous.lon);
    }

    if (!scene.markerTexture){
        scene.markerTexture = createMarkerTexture({});
    }

    let markerMaterial = new THREE.SpriteMaterial({ map: scene.markerTexture, 
                                                    opacity: Defaults.Markers.Opacity, 
                                                    depthTest: true, 
                                                    fog: true });
    this.marker = new THREE.Sprite(markerMaterial);
    this.marker.scale.set(Defaults.Markers.Canvas / Defaults.Render.PixelRatio, Defaults.Markers.Canvas / Defaults.Render.PixelRatio);
    this.marker.position.set(point.x * altitude, point.y * altitude, point.z * altitude);

    labelCanvas = utils.createLabel(text.toUpperCase(), {}, {});
    labelTexture = new THREE.Texture(labelCanvas);
    labelTexture.name = "marker-label"
    labelTexture.needsUpdate = true;

    labelMaterial = new THREE.SpriteMaterial({
        map : labelTexture,
        opacity: 0,
        depthTest: true,
        fog: true
    });

    this.labelSprite = new THREE.Sprite(labelMaterial);
    this.labelSprite.position.set(point.x * altitude * 1.1, point.y*altitude*1.05 + (point.y < 0 ? -15 : 30), point.z * altitude * 1.1); 
    this.labelSprite.scale.set(labelCanvas.width / Defaults.Render.PixelRatio, labelCanvas.height / Defaults.Render.PixelRatio);

    new TWEEN.Tween( {opacity: 0})
    .to( {opacity: 1}, 500 )
    .onUpdate(function(){
        labelMaterial.opacity = this.opacity
    }).start();


    var _this = this; //arrghghh

    new TWEEN.Tween({x: 0, y: 0})
    .to({x: 50, y: 50}, 2000)
    .easing( TWEEN.Easing.Elastic.Out )
    .onUpdate(function(){
        _this.marker.scale.set(this.x, this.y);
    })
    .delay((this.previous ? _this.opts.drawTime : 0))
    .start();

  if(this.previous){

      var materialSpline,
          materialSplineDotted,
          latdist,
          londist,
          startPoint,
          pointList = [],
          pointList2 = [],
          nextlat,
          nextlon,
          currentLat,
          currentLon,
          currentPoint,
          currentVert,
          update;

        _this.geometrySpline = new THREE.Geometry();
        materialSpline = new THREE.LineBasicMaterial({
            color: this.opts.lineColor,
            transparent: true,
            linewidth: 6,
            opacity: .5
        });

        _this.geometrySplineDotted = new THREE.Geometry();
        materialSplineDotted = new THREE.LineBasicMaterial({
            color: this.opts.lineColor,
            linewidth: 1,
            transparent: true,
            opacity: .5
        });

        latdist = (lat - previous.lat)/_this.opts.lineSegments;
        londist = (lon - previous.lon)/_this.opts.lineSegments;
        startPoint = utils.mapPoint(previous.lat,previous.lon);
        pointList = [];
        pointList2 = [];

        for(var j = 0; j< _this.opts.lineSegments + 1; j++){
            // var nextlat = ((90 + lat1 + j*1)%180)-90;
            // var nextlon = ((180 + lng1 + j*1)%360)-180;


            var nextlat = (((90 + previous.lat + j*latdist)%180)-90) * (.5 + Math.cos(j*(5*Math.PI/2)/_this.opts.lineSegments)/2) + (j*lat/_this.opts.lineSegments/2);
            var nextlon = ((180 + previous.lon + j*londist)%360)-180;
            pointList.push({lat: nextlat, lon: nextlon, index: j});
            if(j == 0 || j == _this.opts.lineSegments){
                pointList2.push({lat: nextlat, lon: nextlon, index: j});
            } else {
                pointList2.push({lat: nextlat+1, lon: nextlon, index: j});
            }
            // var thisPoint = mapPoint(nextlat, nextlon);
            let sPoint = new THREE.Vector3(startPoint.x*1.2, startPoint.y*1.2, startPoint.z*1.2);
            let sPoint2 = new THREE.Vector3(startPoint.x*1.2, startPoint.y*1.2, startPoint.z*1.2);
            // sPoint = new THREE.Vector3(thisPoint.x*1.2, thisPoint.y*1.2, thisPoint.z*1.2);

            sPoint.globe_index = j;
            sPoint2.globe_index = j;

            _this.geometrySpline.vertices.push(sPoint);  
            _this.geometrySplineDotted.vertices.push(sPoint2);  
        }


        currentLat = previous.lat;
        currentLon = previous.lon;

        update = function(){
            var nextSpot = pointList.shift();
            var nextSpot2 = pointList2.shift();

            for(var x = 0; x< _this.geometrySpline.vertices.length; x++){

                let currentVert = _this.geometrySpline.vertices[x];
                let currentPoint = utils.mapPoint(nextSpot.lat, nextSpot.lon);

                let currentVert2 = _this.geometrySplineDotted.vertices[x];
                let currentPoint2 = utils.mapPoint(nextSpot2.lat, nextSpot2.lon);

                if(x >= nextSpot.index){
                    currentVert.set(currentPoint.x*1.2, currentPoint.y*1.2, currentPoint.z*1.2);
                    currentVert2.set(currentPoint2.x*1.19, currentPoint2.y*1.19, currentPoint2.z*1.19);
                }
            }
            
            _this.geometrySpline.verticesNeedUpdate = true;
            _this.geometrySplineDotted.verticesNeedUpdate = true;

            if(pointList.length > 0){
                setTimeout(update,_this.opts.drawTime/_this.opts.lineSegments);
            }

        };

        update();

//        this.scene.add(new THREE.Line(_this.geometrySpline, materialSpline));

// mesh line
/*
        let geometry = new THREE.Geometry();
        for (let j = 0; j < Math.PI; j += 2 * Math.PI / 100) {
            let v = new THREE.Vector3(Math.cos(j), Math.sin(j), 0);
            geometry.vertices.push(v);
        }
        */
        let line = new MeshLine.MeshLine();
        line.setGeometry(_this.geometrySpline);

        let materialMeshSpline = new MeshLine.MeshLineMaterial({
            useMap: false,
            color: new THREE.Color('#fff'),
            opacity: 1,
            resolution: new THREE.Vector2(1024, 1024), // should be window height
            sizeAttenuation: !false,
            lineWidth: .1 ,
            near: near,
            far: far
        });

        /*
        materialMeshSpline.color = new THREE.Color('#000');
        materialMeshSpline.resolution = new THREE.Vector2(1024, 1024);
        materialMeshSpline.lineWidth = 10;
        materialMeshSpline.sizeAttenuation = 0;
        */

        this.scene.add(new THREE.Mesh(line.geometry, materialMeshSpline));
// end mesh line

        this.scene.add(new THREE.LineSegments(_this.geometrySplineDotted, materialSplineDotted));
    }

    this.scene.add(this.marker);
    this.scene.add(this.labelSprite);
};

Marker.prototype.remove = function() {
    let x = 0;
    const _this = this;

    const update = function (ref) {

        for (let i = 0; i < x; i++){
            ref.geometrySpline.vertices[i].set(ref.geometrySpline.vertices[i+1]);
            ref.geometrySplineDotted.vertices[i].set(ref.geometrySplineDotted.vertices[i+1]);
        }
        ref.geometrySpline.verticesNeedUpdate = true;
        ref.geometrySplineDotted.verticesNeedUpdate = true;
        x++;
        if(x < ref.geometrySpline.vertices.length){
            setTimeout(function(){update(ref)}, _this.opts.drawTime / _this.opts.lineSegments)
        } else {
            _this.scene.remove(ref.geometrySpline);
            _this.scene.remove(ref.geometrySplineDotted);
        }
    }

    for (let j = 0; j < _this.next.length; j++){
        (function(k){
            update(_this.next[k]);
        })(j);
    } 

    _this.scene.remove(_this.marker);
    _this.scene.remove(_this.labelSprite);
};

module.exports = Marker;
