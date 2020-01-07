
import * as PIXI from 'pixi.js'
import { bezier } from "chroma-js"
import { numberWithCommas } from "shared/js/util"
import * as d3Geo from "d3-geo"
import * as d3Fetch from "d3-fetch"

const d3 = Object.assign({}, d3Geo, d3Fetch)

const ratio = 783/748;

var width = document.querySelector(".interactive-wrapper").clientWidth,
    height = width*ratio,
    extent = [[0, 0],[width, height]]

const app = new PIXI.Application({
    width: width, height: height, transparent: true, resolution: window.devicePixelRatio || 1, antialias: true
}); 

window.requestAnimationFrame(() => {
    if(window.resize) {
        window.resize();
    }
});

const colour = bezier(['#c70000','#f5be2c','#6c514a'])

document.querySelector(".interactive-wrapper").appendChild(app.view);

var graphics_map = new PIXI.Graphics();
var graphics_dots = new PIXI.Container();
var textContainer = new PIXI.Container();
var labelContainer = new PIXI.Container();

var textStyle = new PIXI.TextStyle({
    fontFamily: 'Guardian Text Egyptian Web',
    fontSize: 16,
    fontWeight: "bold",
    fill: '#000',
    stroke: "#ffffff",
    strokeThickness: 3
});

var cityLabelStyle = new PIXI.TextStyle({
    fontFamily: 'Guardian Text Sans Web',
    fontSize: 13,
    fill: '#000',
    stroke: "#ffffff",
    strokeThickness: 3
});

var stateLabelStyle = new PIXI.TextStyle({
    fontFamily: 'Guardian Text Egyptian Web',
    fontSize: 15,
    fill: '#000',
    stroke: "#ffffff",
    strokeThickness: 3
});


var countLabelStyle = new PIXI.TextStyle({
    fontFamily: 'Guardian Text Egyptian Web',
    fontSize: 16,
    fill: '#000',
    stroke: "#ffffff",
    strokeThickness: 3
});

var projection = d3.geoMercator();

var path = d3.geoPath()
    .projection(projection)
    .context(graphics_map);

    var dot = d3.geoPath()
    .projection(projection)
    .context(graphics_dots);

var svgPath = d3.geoPath()
.projection(projection)

d3.csv('<%= path %>/output.csv').then((geo) => {


    projection.fitExtent(extent, {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {},
            "geometry": {
              "type": "Polygon",
              "coordinates": [
                [
                  [
                    153.623153687,
                    -28.158622742
                  ],
                  [
                    153.623153687,
                    -39.134536743
                  ],
                  [
                   140.960037231,
                    -39.134536743
                  ],
                  [
                   140.960037231,
                    -28.158622742
                  ],
                  [
                   153.623153687,
                    -28.158622742
                  ]
                ]
              ]
            }
          }
        ]
      });

      var data_2019 = geo.filter(c => Math.random() > 0.5).map(d => {
        const dot = new PIXI.Sprite.from(PIXI.Texture.WHITE)
        dot.x = projection([d.LONGITUDE,d.LATITUDE])[0]
        dot.y = projection([d.LONGITUDE,d.LATITUDE])[1]
        dot.width = 1.5
        dot.height = 1.5
        dot.tint = colour(0).num()
        dot.alpha = 0;
        d.dot = dot;
        graphics_dots.addChild(d.dot)
        return d;
    })

    let i = 0;

    document.querySelector(".restart").addEventListener("click", () => {
        counter = 0;
        i = 0;
        k = 0;
        graphics_dots.removeChildren(0, 999999999)
        data_2019 = geo.map(d => {
            const dot = new PIXI.Sprite.from(PIXI.Texture.WHITE)
            dot.x = projection([d.LONGITUDE,d.LATITUDE])[0]
            dot.y = projection([d.LONGITUDE,d.LATITUDE])[1]
            dot.width = 1.5
            dot.height = 1.5
            dot.tint = colour(0).num()
            dot.alpha = 0;
            d.dot = dot;
            graphics_dots.addChild(d.dot)
            return d;
        })
        prevDrawn = [];
        document.body.classList.remove("ended");
    })
 
    const text = new PIXI.Text("1 December", textStyle);
    text.x = 0;
    text.y = 0;
    textContainer.addChild(text);

    const count = new PIXI.Text("", countLabelStyle);
    count.x = 0;
    count.y = 20;
    textContainer.addChild(count);

    // const baseMap = new PIXI.Sprite(base);
    // baseMap.width = width;
    // baseMap.height = height;
    // baseMap.x = 0
    // baseMap.y = 0 

    // aus.features.forEach(p => {
    //     graphics_map.beginFill(0xeaeaea, 1);
    //     graphics_map.lineStyle(1, 0xbdbdbd, 1); 
    //     path(p);
    //     graphics_map.endFill();
    // })

    // graphics_map.addChild(baseMap);

    const toLabel = [
        {"name": "Sydney", "lat": -33.9, "lng": 151.2},
        {"name": "Melbourne", "lat": -37.814, "lng": 144.96332},
        {"name":"Canberra", "lat": -35.28346, "lng": 149.12807}
    ]

    const states = [
        {"name": "New South Wales", "lat": -32.7162685, "lng": 146.2116744},
        {"name": "Victoria", "lat": -37.0241817, "lng": 144.109221}
        // {"name":"Canberra", "lat": -35.28346, "lng": 149.12807}
    ]

    toLabel.forEach(d => {
        const t = new PIXI.Text(d.name, cityLabelStyle);
        const coord = projection([d.lng, d.lat]);
        t.x = Math.floor(coord[0]) + 7;
        t.y = Math.floor(coord[1]) - 8;
        labelContainer.addChild(t);

        const p = new PIXI.Graphics();
        p.beginFill(0x000000);
        p.lineStyle(0);
        p.drawCircle(0, 0, 3);
        p.endFill();   
        p.position.x = coord[0]
        p.position.y = coord[1]
        labelContainer.addChild(p);
    });

    const stateLabels = states.map(d => {
        const t = new PIXI.Text(d.name, stateLabelStyle);
        const coord = projection([d.lng, d.lat]);
        t.x = Math.floor(coord[0]) + 7 - 55;
        t.y = Math.floor(coord[1]) - 8;
        // t.anchor.set(0.5);
        labelContainer.addChild(t);
        return t;
    });

    app.stage.addChild(graphics_map);
    app.stage.addChild(graphics_dots);
    app.stage.addChild(textContainer); 
    app.stage.addChild(labelContainer);

    let prevDrawn = [];

    let k = 0;

    const pad = (a) => a.toString().padStart(2, "0")

    const colours = {};

    let counter = 0;
    let started = false;
    const timer = window.setInterval(() => {
        if(!started && (!window.frameElement || window.frameElement.getBoundingClientRect().top <= 300)) {
            start()
            clearInterval(timer)
        }
    }, 300);

    const start = () => {
        const started = true;
        app.ticker.add((delta) => {
            // console.log(delta);
            const newI = i + (0.04*delta);

            const hours = `${24*(newI % 1)}`
            const minutes = (hours % 1)*60

            stateLabels.forEach(sl => {
                sl.y = sl.y + 0.0000001
            })
            
            prevDrawn.forEach(d => {
                d.prev = d.prev || 0
                d.prev = d.prev + (0.01*delta)
                if(!colours[d.prev]) {
                    colours[d.prev] = colour(d.prev).num()
                }
                d.tint = colours[d.prev]
            });

            prevDrawn = prevDrawn.filter(d => d.prev < 1);

            if(newI < 30.99999) {
                text.text = `${Math.floor(newI)+1} December`
                if(width > 600) {
                    count.text = `${numberWithCommas(counter)} total fire detections`
                }
            } else {
                document.body.classList.add("ended");
                text.text = `31 December`
                if(width > 600) {
                    count.text = `${numberWithCommas(geo.length)} total fire detections`
                }
                return;
            }

            data_2019 = data_2019.filter((d, j) => {
                // if(j < k) {
                //     return; 
                // }
                const time = Number(d.ACQ_DATE) + (Number(d.ACQ_TIME)/2400)

                if(time <= newI) {
                    d.dot.alpha = 1

                    prevDrawn.push(d.dot)

                    k = j; 
                    counter++;
                    return false
                } else {
                    return true
                }
            });

            i = newI
        });
    }
    
});
