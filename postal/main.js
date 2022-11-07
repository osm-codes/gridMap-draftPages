
// New adds

  function sel_jurL1(abbrev) {
    if (abbrev>'') {
      let jL2dom = document.getElementById('sel_jurL2');
      let s = '<select name="states" onchange="sel_jurL2(this.value)"><option value="">-- States--</option>'
      for ( var i of Object.keys(jurisdictions[abbrev]) ){
         s = s + '<option>'+i
      }
      jL2dom.innerHTML=s+"</select>"
      let jL3dom = document.getElementById('sel_jurL3');
      jL3dom.innerHTML=""
    }
  }
  function sel_jurL2(abbrev) {
    if (abbrev>'') {
      let country = document.getElementById('sel_jurL1').value;
      let state = document.querySelector('#sel_jurL2 select').value;
      let jL3dom = document.getElementById('sel_jurL3');
      let s = '<select name="cities" onchange="sel_jurL3(this.value)"><option value="">-- Cities --</option>'
      for ( var i of jurisdictions[country][state] ){
         s = s + '<option>'+i
      }
      jL3dom.innerHTML=s+"</select>"
    }
  }
  function sel_jurL3(abbrev) {
      let country = document.getElementById('sel_jurL1').value;
      let state = document.querySelector('#sel_jurL2 select').value;
      window.location.href = 'https://osm.codes/postal/' + country+'-'+state+'-'+abbrev
  }

function latRound(x) {
  return Number.parseFloat(x).toFixed(6);
  // 5 or 6 decimal digits for 1 meter, see https://gis.stackexchange.com/a/208739/7505
}


///////////// Original
var uri_base = "https://osm.codes"

var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib = '&copy; <a href="https://osm.org/copyright">OpenStreetMap contributors</a>';
var mapboxUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
var mapboxAttr = 'Tiles from <a href="https://www.mapbox.com">Mapbox</a>';
var osmAndMapboxAttr = osmAttrib + '. ' + mapboxAttr;

var openstreetmap = L.tileLayer(osmUrl,   {attribution: osmAttrib,detectRetina: true,minZoom: 0,maxNativeZoom: 19,maxZoom: 25 }),
    grayscale = L.tileLayer(mapboxUrl,{id:'mapbox/light-v10',attribution: osmAndMapboxAttr,detectRetina: true,maxNativeZoom: 22,maxZoom: 25 }),
    streets = L.tileLayer(mapboxUrl,{id:'mapbox/streets-v11',attribution: osmAndMapboxAttr,detectRetina: true,maxNativeZoom: 22,maxZoom: 25 }),
    satellite = L.tileLayer(mapboxUrl,{id:'mapbox/satellite-v9',attribution: mapboxAttr,detectRetina: true,maxNativeZoom: 22,maxZoom: 25 }),
    satellitestreet = L.tileLayer(mapboxUrl,{id:'mapbox/satellite-streets-v11',attribution: mapboxAttr,detectRetina: true,maxNativeZoom: 22,maxZoom: 25 });

var baseLayers = {
    'Grayscale': grayscale,
    'OpenStreetMap': openstreetmap,
    'Streets': streets,
    'Satellite': satellite,
    'Satellite and street': satellitestreet };

var layerPolygonCurrent = new L.geoJSON(null, {
            style: style,
            onEachFeature: onEachFeature,
            pointToLayer: pointToLayer,
        });

var layerPolygonAll = new L.geoJSON(null,{
            style: style,
            onEachFeature: onEachFeature,
            pointToLayer: pointToLayer,
        });

var layerJurisdAll = new L.geoJSON(null,{
            style: style,
            onEachFeature: onEachFeatureJurisd,
            pointToLayer: pointToLayer,
        });

var layerCoverAll = new L.geoJSON(null,{
            style: style,
            onEachFeature: onEachFeatureCoverAll,
            pointToLayer: pointToLayer,
        });

var layerMarkerCurrent = new L.featureGroup();
var layerMarkerAll = new L.featureGroup();

var overlays = {
    'Current polygon': layerPolygonCurrent,
    'All polygon': layerPolygonAll,
    'Current marker': layerMarkerCurrent,
    'All markers': layerMarkerAll,
    'Covers': layerCoverAll,
    'Jurisdictions': layerJurisdAll,
};

var levelSize = [1048576,741455.2,524288,370727.6,262144,185363.8,131072,92681.9,65536,46340.95,32768,23170.48,16384,11585.24,8192,5792.62,4096,2896.31,2048,1448.15,1024,724.08,512,362.04,256,181.02,128,90.51,64,45.25,32,22.63,16,11.31,8,5.66,4,2.83,2,1.41,1];

// var levelValues =  [600000,400000,300000,200000,150000,100000,75000,50000,40000,25000,20000,15000,10000,6000,5000,3500,2500,1500,1250,750,600,450,300,225,150,100,75,50,40,25,20,15,8,7,5,3,2,1.4,1,0.7,0];

var levelValues =  [600000,400000,300000,200000,150000,100000,75000,50000,40000,25000,20000,15000,10000,6000,5000,3500,2500,1500,1250,750,600,450,300,225,150,100,75,50,40,25,20,15,8,7,5,3,2,1,1,0,0];

var countries = {
    BR:
    {
        name: 'Brasil',
        center: [-15.796,-47.880],
        zoom: 4,
        current_zoom: 4,
        defaultBase: 'base32',
        scientificBase: 'base16h1c',
        postalcodeBase: 'base32',
        isocode: 'BR',
        jurisdictionPlaceholder: 'BR-SP-SaoPaulo',
        selectedBases: ['base32','base16h1c'],
        bases:
        {
            base32:
            {
                iniLevel: 0,
                modLevel: 5,
                iniDigit: 1,
                levelDefault: 35,
                symbol: '~',
                placeholderDecode: 'BR~42',
                placeholderEncode: '-15.7,-47.8;u=10',
                placeholderList: '3,5,7,A',
                selectGrid: [32],
            },
            base16h:
            {
                iniLevel: 0,
                modLevel: 1,
                iniDigit: 2,
                symbol: '+',
                placeholderDecode: 'BR+3F',
                placeholderEncode: '-15.7,-47.8;u=10',
                placeholderList: '3,5,7,B',
                selectGrid: [2,4,8,16],
            },
            base16h1c:
            {
                iniLevel: 0,
                modLevel: 1,
                iniDigit: 1,
                symbol: '+',
                placeholderDecode: 'BR+hF',
                placeholderEncode: '-15.7,-47.8;u=10',
                placeholderList: 'h,7,B',
                selectGrid: [2,4,8,16],
            }
        }
    },
    CO:
    {
        name: 'Colombia',
        center: [3.5,-72.3],
        zoom: 6,
        current_zoom: 6,
        defaultBase: 'base32',
        scientificBase: 'base16h',
        postalcodeBase: 'base32',
        isocode: 'CO',
        jurisdictionPlaceholder: 'CO-ANT-Itagui',
        selectedBases: ['base32','base16h'],
        bases:
        {
            base32:
            {
                iniLevel: 4,
                modLevel: 5,
                iniDigit: 1,
                levelDefault: 39,
                symbol: '~',
                placeholderDecode: 'CO~3D5',
                placeholderEncode: '3.5,-72.3;u=10',
                placeholderList: '3D5,3D4,2',
                selectGrid: [32],
            },
            base16h:
            {
                iniLevel: 4,
                modLevel: 1,
                iniDigit: 2,
                symbol: '+',
                placeholderDecode: 'CO+0A2',
                placeholderEncode: '3.5,-72.3;u=10',
                placeholderList: '0A,0B,0C',
                selectGrid: [2,4,8,16],
            }
        }
    },
    EC:
    {
        name: 'Equador',
        center: [-0.944,-83.895],
        zoom: 6,
        current_zoom: 6,
        defaultBase: 'base32',
        scientificBase: 'base16h',
        postalcodeBase: 'base32',
        isocode: 'EC',
        jurisdictionPlaceholder: 'EC-L-Loja',
        selectedBases: ['base32','base16h'],
        bases:
        {
            base32:
            {
                iniLevel: 5,
                modLevel: 5,
                iniDigit: 1,
                levelDefault: 30,
                symbol: '~',
                placeholderDecode: 'EC~5P',
                placeholderEncode: '-1.1,-78.4;u=10',
                placeholderList: '5P,FL,J9',
                selectGrid: [32],
            },
            base16h:
            {
                iniLevel: 5,
                modLevel: 1,
                iniDigit: 2,
                symbol: '+',
                placeholderDecode: 'EC+0E',
                placeholderEncode: '-1.1,-78.4;u=10',
                placeholderList: '0E,0A,05',
                selectGrid: [2,4,8,16],
            }
        }
    },
    UY:
    {
        name: 'Uruguai',
        center: [-32.981,-55.921],
        zoom: 7,
        current_zoom: 7,
        defaultBase: 'base32',
        scientificBase: 'base16h1c',
        postalcodeBase: 'base32',
        isocode: 'UY',
        jurisdictionPlaceholder: 'UY-CA-LasPiedras',
        selectedBases: ['base32','base16h1c'],
        bases:
        {
            base32:
            {
                iniLevel: 6,
                modLevel: 5,
                iniDigit: 1,
                levelDefault: 36,
                symbol: '~',
                placeholderDecode: 'UY~3',
                placeholderEncode: '-32.9,-55.9;u=10',
                placeholderList: '3,2C,4F',
                selectGrid: [32],
            },
            base16h:
            {
                iniLevel: 6,
                modLevel: 1,
                iniDigit: 2,
                symbol: '+',
                placeholderDecode: 'UY+2',
                placeholderEncode: '-32.9,-55.9;u=10',
                placeholderList: '2G,3A,01',
                selectGrid: [2,4,8,16],
            },
            base16:
            {
                iniLevel: 6,
                modLevel: 4,
                iniDigit: 2,
                symbol: '+',
                placeholderDecode: 'UY~2',
                placeholderEncode: '-32.9,-55.9;u=10',
                placeholderList: '3B,3A,01',
                selectGrid: [16],
            },
            base16h1c:
            {
                iniLevel: 6,
                modLevel: 1,
                iniDigit: 1,
                symbol: '+',
                placeholderDecode: 'UY+gB',
                placeholderEncode: '-32.9,-55.9;u=10',
                placeholderList: '3B,g,hB',
                selectGrid: [2,4,8,16],
            }
        }
    }
};

var defaultMap = countries['CO'];
var defaultMapBase = defaultMap.postalcodeBase;
let ptname = window.location.pathname;

var arrayOfSideCoverCell = new Array();

for(var key in countries)
{
    let regex = new RegExp("^/?" + key + ".*","i");

    if(regex.test(ptname))
    {
        // document.getElementById('country').value = key;
        defaultMap = countries[key];
        defaultMapBase = defaultMap.postalcodeBase;
        // console.log(defaultMap)
        break;
    }
}

var map = L.map('map',{
    center: defaultMap.center,
    zoom:   defaultMap.zoom,
    zoomControl: false,
    renderer: L.svg(),
    layers: [grayscale, layerPolygonCurrent, layerPolygonAll, layerCoverAll, layerJurisdAll] });

var toggleTooltipStatus = false;
var toggleCoverStatus = false;

map.attributionControl.setPrefix(false);
map.addControl(new L.Control.Fullscreen({position:'topleft'})); /* https://github.com/Leaflet/Leaflet.fullscreen */
map.on('zoom', function(e){defaultMap.current_zoom = map.getZoom();});
map.on('click', onMapClick);
// map.on('zoomend', showZoomLevel);
// showZoomLevel();

var zoom   = L.control.zoom({position:'topleft'});
var layers = L.control.layers(baseLayers, overlays,{position:'topleft'});
var escala = L.control.scale({position:'bottomright',imperial: false});

var decodeJurisdiction = L.control({position: 'topleft'});
decodeJurisdiction.onAdd = function (map) {
    this.container = L.DomUtil.create('div');
    this.label     = L.DomUtil.create('label', '', this.container);
    this.field     = L.DomUtil.create('input', '', this.container);
    this.button    = L.DomUtil.create('button','leaflet-control-button',this.container);

    this.label     = L.DomUtil.create('label', '', this.container);
    this.checkbox  = L.DomUtil.create('input', '', this.container);

    this.label.for = 'jcover';
    this.label.innerHTML = 'Cover: ';
    this.checkbox.id = 'jcover';
    this.checkbox.type = 'checkbox';
    this.checkbox.checked = false;

    this.field.type = 'text';
    this.field.placeholder = 'e.g.: ' + defaultMap.jurisdictionPlaceholder;
    this.field.id = 'fieldjurisdiction';
    this.button.type = 'button';
    this.button.innerHTML= "Jurisdiction";

    L.DomEvent.disableScrollPropagation(this.button);
    L.DomEvent.disableClickPropagation(this.button);
    L.DomEvent.disableScrollPropagation(this.field);
    L.DomEvent.disableClickPropagation(this.field);
    L.DomEvent.disableScrollPropagation(this.checkbox);
    L.DomEvent.disableClickPropagation(this.checkbox);
    L.DomEvent.on(this.button, 'click', getJurisdiction, this.container);
    L.DomEvent.on(this.field, 'keyup', function(data){if(data.keyCode === 13){getJurisdiction(data);}}, this.container);

    return this.container; };

var decodeGgeohash = L.control({position: 'topleft'});
decodeGgeohash.onAdd = function (map) {
    this.container = L.DomUtil.create('div');
    this.field = L.DomUtil.create('input', '', this.container);
    this.button = L.DomUtil.create('button','leaflet-control-button',this.container);

    this.field.type = 'text';
    this.field.placeholder = 'e.g.: ' + defaultMap.bases[defaultMapBase].placeholderDecode;
    this.field.id = 'fielddecode';
    this.button.type = 'button';
    this.button.innerHTML= "Decode";

    L.DomEvent.disableScrollPropagation(this.button);
    L.DomEvent.disableClickPropagation(this.button);
    L.DomEvent.disableScrollPropagation(this.field);
    L.DomEvent.disableClickPropagation(this.field);
    L.DomEvent.on(this.button, 'click', getDecode, this.container);
    L.DomEvent.on(this.field, 'keyup', function(data){if(data.keyCode === 13){getDecode(data);}}, this.container);

    return this.container; };

var decodeGgeohashList = L.control({position: 'topleft'});
decodeGgeohashList.onAdd = function (map) {
    this.container = L.DomUtil.create('div');
    this.field = L.DomUtil.create('textarea', '', this.container);
    this.button = L.DomUtil.create('button','leaflet-control-button',this.container);

    this.field.placeholder = 'list geocodes, e.g.: ' + defaultMap.bases[defaultMapBase].placeholderList;
    this.field.id = 'fielddecodelist';
    this.button.type = 'button';
    this.button.innerHTML= "Decode";

    L.DomEvent.disableScrollPropagation(this.button);
    L.DomEvent.disableClickPropagation(this.button);
    L.DomEvent.disableScrollPropagation(this.field);
    L.DomEvent.disableClickPropagation(this.field);
    L.DomEvent.on(this.button, 'click', getDecodeList, this.container);
    //L.DomEvent.on(this.field, 'keyup', function(data){if(data.keyCode === 13){getDecodeList(data);}}, this.container);

    return this.container; };

var encodeGgeohash = L.control({position: 'topleft'});
encodeGgeohash.onAdd = function (map) {
    this.container = L.DomUtil.create('div','leaflet-control-encode');
    this.field = L.DomUtil.create('input', '', this.container);
    this.button = L.DomUtil.create('button','leaflet-control-button',this.container);

    this.field.type = 'text';
    this.field.placeholder = 'e.g.: ' + defaultMap.bases[defaultMapBase].placeholderEncode;
    this.field.id = 'fieldencode';
    this.button.type = 'button';
    this.button.innerHTML= "Encode";

    L.DomEvent.disableScrollPropagation(this.container);
    L.DomEvent.disableClickPropagation(this.container);
    L.DomEvent.on(this.button, 'click', getEncode, this.container);
    L.DomEvent.on(this.field, 'keyup', function(data){if(data.keyCode === 13){getEncode(data);}}, this.container);

    return this.container; };

var country = L.control({position: 'topleft'});
country.onAdd = function (map) {
    this.container      = L.DomUtil.create('div');
    this.label_country  = L.DomUtil.create('label', '', this.container);
    this.select_country = L.DomUtil.create('select', '', this.container);

    this.label_country.for = 'country';
    this.label_country.innerHTML = 'Country: ';
    this.select_country.id = 'country';
    this.select_country.name = 'country';
    this.select_country.innerHTML = generateSelectCountries(countries);

    L.DomEvent.disableScrollPropagation(this.container);
    L.DomEvent.disableClickPropagation(this.container);
    L.DomEvent.on(this.select_country, 'change', toggleCountry, this.container);

    return this.container; };

var level = L.control({position: 'topleft'});
level.onAdd = function (map) {
    this.container     = L.DomUtil.create('div');
    this.label_level   = L.DomUtil.create('label', '', this.container);
    this.select_level  = L.DomUtil.create('select', '', this.container);
    this.label_grid    = L.DomUtil.create('label', '', this.container);
    this.select_grid   = L.DomUtil.create('select', '', this.container);

    this.label_grid.for = 'grid';
    this.label_grid.innerHTML = ' ';
    this.select_grid.id = 'grid';
    this.select_grid.name = 'grid';
    this.select_grid.innerHTML = generateSelectGrid(defaultMap.bases[defaultMapBase].selectGrid)

    this.label_level.for = 'level';
    this.label_level.innerHTML = 'Level: ';
    this.select_level.id = 'level_size';
    this.select_level.name = 'level';
    this.select_level.innerHTML = generateSelectLevel(defaultMap.bases[defaultMapBase],defaultMapBase);

    L.DomEvent.disableScrollPropagation(this.container);
    L.DomEvent.disableClickPropagation(this.container);

    return this.container; };

var baseLevel = L.control({position: 'topleft'});
baseLevel.onAdd = function (map) {
    this.container     = L.DomUtil.create('div');
    this.select_base   = L.DomUtil.create('select', '', this.container);

    this.select_base.id = 'base';
    this.select_base.name = 'base';
    this.select_base.innerHTML = generateSelectBase(defaultMap.selectedBases);

    L.DomEvent.disableScrollPropagation(this.container);
    L.DomEvent.disableClickPropagation(this.container);
    L.DomEvent.on(this.select_base, 'change', toggleLevelBase, this.container);

    return this.container; };

var clear = L.control({position: 'topleft'});
clear.onAdd = function (map) {
    this.container = L.DomUtil.create('div');
    this.button    = L.DomUtil.create('button','leaflet-control-button',this.container);

    this.button.type = 'button';
    this.button.innerHTML= "Clear all";

    L.DomEvent.disableScrollPropagation(this.button);
    L.DomEvent.disableClickPropagation(this.button);
    L.DomEvent.on(this.button, 'click', clearAll, this.container);

    return this.container; };

var fitBounds = L.control({position: 'topleft'});
fitBounds.onAdd = function (map) {
    this.container = L.DomUtil.create('div');
    this.label     = L.DomUtil.create('label', '', this.container);
    this.checkbox  = L.DomUtil.create('input', '', this.container);

    this.label.for= 'fitbounds';
    this.label.innerHTML= 'Fit bounds: ';
    this.checkbox.id = 'fitbounds';
    this.checkbox.type = 'checkbox';
    this.checkbox.checked = false;

    L.DomEvent.disableScrollPropagation(this.container);
    L.DomEvent.disableClickPropagation(this.container);

    return this.container; };

var fitCenter = L.control({position: 'topleft'});
fitCenter.onAdd = function (map) {
    this.container = L.DomUtil.create('div');
    this.label     = L.DomUtil.create('label', '', this.container);
    this.checkbox  = L.DomUtil.create('input', '', this.container);

    this.label.for= 'fitcenter';
    this.label.innerHTML= 'Fit center: ';
    this.checkbox.id = 'fitcenter';
    this.checkbox.type = 'checkbox';
    this.checkbox.checked = true;

    L.DomEvent.disableScrollPropagation(this.container);
    L.DomEvent.disableClickPropagation(this.container);

    return this.container; };

var toggleTooltip = L.control({position: 'topleft'});
toggleTooltip.onAdd = function (map) {
    this.container = L.DomUtil.create('div');
    this.button    = L.DomUtil.create('button','leaflet-control-button',this.container);

    this.button.type = 'button';
    this.button.innerHTML= "Tooltip";

    L.DomEvent.disableScrollPropagation(this.button);
    L.DomEvent.disableClickPropagation(this.button);
    L.DomEvent.on(this.button, 'click', toggleTooltipLayers, this.container);

    return this.container; };

var toggleCover = L.control({position: 'topleft'});toggleCoverLayers
toggleCover.onAdd = function (map) {
    this.container = L.DomUtil.create('div');
    this.button    = L.DomUtil.create('button','leaflet-control-button',this.container);

    this.button.type = 'button';
    this.button.innerHTML= "Cover";

    L.DomEvent.disableScrollPropagation(this.button);
    L.DomEvent.disableClickPropagation(this.button);
    L.DomEvent.on(this.button, 'click', toggleCoverLayers, this.container);

    return this.container; };

var zoomAll = L.control({position: 'topleft'});
zoomAll.onAdd = function (map) {
    this.container = L.DomUtil.create('div');
    this.button    = L.DomUtil.create('button','leaflet-control-button',this.container);

    this.button.type = 'button';
    this.button.innerHTML= "Zoom all";

    L.DomEvent.disableScrollPropagation(this.button);
    L.DomEvent.disableClickPropagation(this.button);
    L.DomEvent.on(this.button, 'click', function(e){map.fitBounds(layerPolygonAll.getBounds())}, this.container);

    return this.container; };

zoom.addTo(map);
layers.addTo(map);
escala.addTo(map);
// country.addTo(map);
// decodeJurisdiction.addTo(map);
decodeGgeohash.addTo(map);
encodeGgeohash.addTo(map);
// baseLevel.addTo(map);
level.addTo(map);
clear.addTo(map);
// fitBounds.addTo(map);
// fitCenter.addTo(map);
toggleTooltip.addTo(map);
toggleCover.addTo(map);
// decodeGgeohashList.addTo(map);
// zoomAll.addTo(map);

var a = document.getElementById('custom-map-controlsa');
var b = document.getElementById('custom-map-controlsb');
// a.appendChild(country.getContainer());
a.appendChild(decodeGgeohash.getContainer());
a.appendChild(level.getContainer());
a.appendChild(encodeGgeohash.getContainer());
// a.appendChild(baseLevel.getContainer());
b.appendChild(clear.getContainer());
// a.appendChild(fitBounds.getContainer());
// a.appendChild(fitCenter.getContainer());
b.appendChild(toggleTooltip.getContainer());
b.appendChild(toggleCover.getContainer());
// a.appendChild(decodeJurisdiction.getContainer());
// a.appendChild(decodeGgeohashList.getContainer());
// a.appendChild(zoomAll.getContainer());

function clearAllLayers()
{
    layerPolygonCurrent.clearLayers();
    layerPolygonAll.clearLayers();
    layerMarkerCurrent.clearLayers();
    layerMarkerAll.clearLayers();
    map.removeLayer(layerCoverAll); toggleCoverStatus = true
    document.getElementById('fielddecode').value = '';
    document.getElementById('fieldencode').value = '';
    // layerCoverAll.clearLayers();
    // layerJurisdAll.clearLayers();
}

function clearAll()
{
    clearAllLayers();

    toggleCountry()

    map.fitBounds(layerJurisdAll.getBounds());
//     map.setView(defaultMap.center, defaultMap.zoom);
//     document.getElementById('fielddecodelist').value = '';
//     document.querySelector('#base').value = defaultMapBase;
//     document.querySelector('#country').value = defaultMap.isocode;
//     document.querySelector('#grid').value = '';
//     document.getElementById('fieldencode').value = '';
//     document.getElementById('fielddecode').value = '';
//     document.getElementById('base').innerHTML = generateSelectBase(defaultMap.selectedBases);
//     toggleLevelBase()
}

function toggleCountry()
{
    // document.getElementById('fielddecodelist').value = '';

    clearAllLayers();

    // let countryValue = document.getElementById('country').value;
    // defaultMap = countries[countryValue];
    // map.setView(defaultMap.center, defaultMap.zoom);
    // document.getElementById('base').innerHTML = generateSelectBase(countries[countryValue].selectedBases);
    // document.getElementById('base').value = countries[countryValue].defaultBase;

    defaultMapBase = defaultMap.defaultBase;

    // document.getElementById('fieldjurisdiction').placeholder = 'e.g.: ' + defaultMap.jurisdictionPlaceholder;

    toggleLevelBase();
}

function toggleLevelBase()
{
    // let countryValue = document.getElementById('country').value;
    // let base = document.getElementById('base').value;
    var base = defaultMapBase;

    document.getElementById('level_size').innerHTML = generateSelectLevel(defaultMap.bases[base],base);
    document.getElementById('grid').innerHTML = generateSelectGrid(defaultMap.bases[base].selectGrid);

    document.getElementById('fielddecode').placeholder = 'geocode, e.g.: ' + defaultMap.bases[base].placeholderDecode;
    // document.getElementById('fielddecodelist').placeholder = 'list geocodes, e.g.: ' + defaultMap.bases[base].placeholderList;
    document.getElementById('fieldencode').placeholder = 'geo: ' + defaultMap.bases[base].placeholderEncode;
}

function toggleTooltipLayers()
{
    map.eachLayer(function(l)
    {
        if (l.getTooltip())
        {
            var tooltip = l.getTooltip();
            l.unbindTooltip();
            toggleTooltipStatus ? tooltip.options.permanent = false : tooltip.options.permanent = true
            l.bindTooltip(tooltip)
        }
    })

    toggleTooltipStatus ? toggleTooltipStatus = false : toggleTooltipStatus = true;
}

function toggleCoverLayers()
{
    toggleCoverStatus ? map.addLayer(layerCoverAll) : map.removeLayer(layerCoverAll);
    fixZOrder(overlays);
    toggleCoverStatus ? toggleCoverStatus = false : toggleCoverStatus = true;
}

// function toggleCoverLayer() {
//     !this.checked ? map.removeLayer(layerCoverAll) : map.addLayer(layerCoverAll) ;
//     fixZOrder(overlays);
// }
// 
// document.getElementById ("jcover").addEventListener ("click", toggleCoverLayer, false);

function generateSelectGrid(grids)
{
    let htmlA = '';
    let htmlB = '';

    for (let i = 0; i < grids.length; i++)
    {
        htmlA += '<option value="grid' +  grids[i]    + '">Grid</option>'
        htmlB += '<option value="grid' + (grids[i]+1) + '">Points</option>'
    }

    return '<option value="">Cell</option>' + htmlB + htmlA
}

function generateSelectBase(bases)
{
    let html = '';

    for (let i = 0; i < bases.length; i++)
    {
        html += '<option value="' + bases[i] + '">' + bases[i] + '</option>'
    }

    return html
}

function generateSelectCountries(dict)
{
    let html = '';

    for(var key in dict)
    {
        html += '<option value="' + key + (defaultMap.isocode == key ? '" selected>' : '">') + countries[key].name + '</option>'
    }

    defaultMap.isocode

    return html
}

function generateSelectLevel(base,baseValue)
{
    let html = '';

    let m=0;

    for (let i = base.iniLevel, j=0; i < levelValues.length; i+=base.modLevel, j++)
    {
        m = (j == 0 ? base.iniDigit : ((j%4)-1 == 0 ? m+1 : m) )

        // html += '<option value="' + levelValues[i] + (i == base.levelDefault ? '" selected>' : '">') + 'L' + (0.5*j*base.modLevel).toString() + (baseValue == 'base32' ? ' (' + (base.iniDigit+j) + 'd) (' : ( (baseValue == 'base16h' || baseValue == 'base16h1c') ? ' (' + m + 'd) (' : ' (') ) + ((levelSize[i]<1000)? Math.round(levelSize[i]*100.0)/100 : Math.round(levelSize[i]*100.0/1000)/100) + ((levelSize[i]<1000)? 'm': 'km') + ')</option>'

        if (arrayOfSideCoverCell && arrayOfSideCoverCell.length > 0 && levelSize[i] <= Math.ceil(Math.min(...arrayOfSideCoverCell)))
        {
            html += '<option value="' + levelValues[i] + (i == base.levelDefault ? '" selected>' : '">') + 'L' + (0.5*j*base.modLevel).toString() + ' (' + ((levelSize[i]<1000)? Math.round(levelSize[i]*100.0)/100 : Math.round(levelSize[i]*100.0/1000)/100) + ((levelSize[i]<1000)? 'm': 'km') + ')</option>'
        }
        else if (arrayOfSideCoverCell && arrayOfSideCoverCell.length == 0)
        {
            html += '<option value="' + levelValues[i] + (i == base.levelDefault ? '" selected>' : '">') + 'L' + (0.5*j*base.modLevel).toString() + ' (' + ((levelSize[i]<1000)? Math.round(levelSize[i]*100.0)/100 : Math.round(levelSize[i]*100.0/1000)/100) + ((levelSize[i]<1000)? 'm': 'km') + ')</option>'
        }
    }

    return html
}

function generateSelectLevel2(base,baseValue,size)
{
    let html = '';

    let m=0;

    for (let i = base.iniLevel, j=0; i < levelValues.length; i+=base.modLevel, j++)
    {
        m = (j == 0 ? base.iniDigit : ((j%4)-1 == 0 ? m+1 : m) )

        // html += '<option value="' + levelValues[i] + (Math.floor(size) <= levelSize[i] ? '" selected>' : '">') + 'L' + (0.5*j*base.modLevel).toString() + (baseValue == 'base32' ? ' (' + (base.iniDigit+j) + 'd) (' : ( (baseValue == 'base16h' || baseValue == 'base16h1c') ? ' (' + m + 'd) (' : ' (') ) + ((levelSize[i]<1000)? Math.round(levelSize[i]*100.0)/100 : Math.round(levelSize[i]*100.0/1000)/100) + ((levelSize[i]<1000)? 'm': 'km') + ')</option>'


        if (arrayOfSideCoverCell && arrayOfSideCoverCell.length > 0 && levelSize[i] <= Math.ceil(Math.min(...arrayOfSideCoverCell)))
        {
            html += '<option value="' + levelValues[i] + (Math.floor(size) <= levelSize[i] ? '" selected>' : '">') + 'L' + (0.5*j*base.modLevel).toString() + ' (' + ((levelSize[i]<1000)? Math.round(levelSize[i]*100.0)/100 : Math.round(levelSize[i]*100.0/1000)/100) + ((levelSize[i]<1000)? 'm': 'km') + ')</option>'
        }
        else if (arrayOfSideCoverCell && arrayOfSideCoverCell.length == 0)
        {
            html += '<option value="' + levelValues[i] + (Math.floor(size) <= levelSize[i] ? '" selected>' : '">') + 'L' + (0.5*j*base.modLevel).toString() + ' (' + ((levelSize[i]<1000)? Math.round(levelSize[i]*100.0)/100 : Math.round(levelSize[i]*100.0/1000)/100) + ((levelSize[i]<1000)? 'm': 'km') + ')</option>'
        }
    }

    return html
}

function getDecode(data)
{
    let input = document.getElementById('fielddecode').value

    if(input !== null && input !== '')
    {
        var uri = uri_base + "/geo:osmcodes:"

        let regex = new RegExp("^" + defaultMap.isocode + "[+-~].*","i");

        if(!regex.test(input))
        {
            uri += defaultMap.isocode + defaultMap.bases[defaultMap.defaultBase].symbol 
        }

        uri += input + ".json"
        document.getElementById('fieldencode').value = '';

        loadGeojson(uri,[layerPolygonCurrent,layerPolygonAll],loadGeojsonFitCenter);
    }
}

function getDecodeList(data)
{
    let input = document.getElementById('fielddecodelist').value;
    let countryValue = document.getElementById('country').value;
    // let base = document.getElementById('base').value;

    var base = defaultMapBase;

    console.log(input);
    if(input !== null && input !== '')
    {
        var uri = uri_base + "/geo:osmcodes:" + countryValue.toUpperCase() + countries[countryValue].bases[base].symbol + sortAndRemoveDuplicates(input) + ".json"

        loadGeojson(uri,[layerPolygonCurrent,layerPolygonAll],loadGeojsonFitCenter);
        document.getElementById('fielddecodelist').value = '';

        checkCountry(input);
    }
}

function getJurisdiction(data)
{
    let input = document.getElementById('fieldjurisdiction').value
    // let jcover = document.getElementById('jcover')
    // let base = document.getElementById('base').value

    var base = defaultMapBase

    if(input !== null && input !== '')
    {
        let uri = uri_base + "/geo:iso_ext:" + input + ".json" + /*(jcover.checked ?*/ '/cover' /*: '')*/ + (base == 'base16h' ? '/base16h' : (base == 'base16h1c' ? '/base16h1c' : ''));

        // if(jcover.checked)
        // {
            loadGeojson(uri,[layerCoverAll],loadGeojsonFitCenter);
            document.getElementById('fieldjurisdiction').value = '';
        // }

        uri = uri_base + "/geo:iso_ext:" + input + ".json";
        loadGeojson(uri,[layerJurisdAll],loadGeojsonFitCenter);

        checkCountry(input);
    }
}

function getEncode(data)
{
    let input = document.getElementById('fieldencode').value

    if(input !== null && input !== '')
    {
        let level = document.getElementById('level_size').value
        let grid = document.getElementById('grid').value
        // let base = document.getElementById('base').value

        var base = defaultMapBase
        var uri = uri_base + "/geo:" + (input.match(/.*;u=.*/) ? input : input + ";u=" + level ) + ".json" + (base != 'base32' ? '/' + base : '') + (grid ? '/' + grid : '')

        document.getElementById('fielddecode').value = '';

        var popupContent = "latlng: " + input;
        layerPolygonCurrent.clearLayers();
        layerMarkerCurrent.clearLayers();
        L.marker(input.split(/[;,]/,2)).addTo(layerMarkerCurrent).bindPopup(popupContent);
        L.marker(input.split(/[;,]/,2)).addTo(layerMarkerAll).bindPopup(popupContent);
        loadGeojson(uri,[layerPolygonCurrent,layerPolygonAll],loadGeojsonFitCenter)
//         document.getElementById('fieldencode').value = '';
    }
}

function sortAndRemoveDuplicates(value) {

    let listValues = [...new Set(value.trim().split(/[\n,]+/).map(i => i.trim().substring(0,11)))];

    return listValues.sort().join(",");
}

function onEachFeatureJurisd(feature,layer)
{
    var popupContent = "";
    popupContent += "osm_id: " + feature.properties.osm_id + "<br>";
    popupContent += "jurisd_base_id: " + feature.properties.jurisd_base_id + "<br>";
    popupContent += "jurisd_local_id: " + feature.properties.jurisd_local_id + "<br>";
    popupContent += "parent_id: " + feature.properties.parent_id + "<br>";
    popupContent += "admin_level: " + feature.properties.admin_level + "<br>";
    popupContent += "name: " + feature.properties.name + "<br>";
    popupContent += "parent_abbrev: " + feature.properties.parent_abbrev + "<br>";
    popupContent += "abbrev: " + feature.properties.abbrev + "<br>";
    popupContent += "wikidata_id: " + feature.properties.wikidata_id + "<br>";
    popupContent += "lexlabel: " + feature.properties.lexlabel + "<br>";
    popupContent += "isolabel_ext: " + feature.properties.isolabel_ext + "<br>";
    popupContent += "lex_urn: " + feature.properties.lex_urn + "<br>";
    popupContent += "name_en: " + feature.properties.name_en + "<br>";
    popupContent += "isolevel: " + feature.properties.isolevel + "<br>";
    popupContent += "area: " + feature.properties.area + "<br>";
    popupContent += "jurisd_base_id: " + feature.properties.jurisd_base_id + "<br>";

    document.getElementById('nameJurisd').innerHTML = ' of ' + feature.properties.name;

    layer.bindPopup(popupContent);
}

function onEachFeatureCoverAll(feature,layer)
{
    onEachFeature(feature,layer)

    arrayOfSideCoverCell.push(feature.properties.side);
}

function onEachFeature(feature,layer)
{
    const reg = /(...)(?!$)/g
    // console.log( "AB233CC".replace(reg, '$1.') )
    sufix_area =(feature.properties.area<1000000)? 'm2': 'km2';
    value_area =(feature.properties.area<1000000)? feature.properties.area: Math.round((feature.properties.area*100/1000000))/100;
    sufix_side =(feature.properties.side<1000)? 'm': 'km';
    value_side =(feature.properties.side<1000)? Math.round(feature.properties.side*100.0)/100 : Math.round(feature.properties.side*100.0/1000)/100;

    var popupContent = "";

    if(feature.properties.scientic_code )
    {
        document.getElementById('sciCode').innerHTML = '<a href="https://osm.codes/' + defaultMap.isocode + defaultMap.bases[defaultMap.scientificBase].symbol + feature.properties.scientic_code + '">' + feature.properties.scientic_code +'</a>';
    }

    if(feature.properties.short_code )
    {
        document.getElementById('postalCode').innerHTML = (feature.properties.short_code.split(/[~]/)[1]).replace(reg, '$1.');

        popupContent += "Postal code: <big><code>" + (feature.properties.short_code.split(/[~]/)[1]) + "</code></big><br>";
        popupContent += "Area: " + value_area + " " + sufix_area + "<br>";
        popupContent += "Side: " + value_side + " " + sufix_side + "<br>";
        popupContent += "Jurisdiction: <code>" + feature.properties.short_code.split(/[~]/)[0] + "</code><br>";
        if(feature.properties.jurisd_local_id )
        {
            popupContent += "Jurisdiction code: " + feature.properties.jurisd_local_id + "<br>";
        }
    }
    else
    {
        popupContent += "Code: <big><code>" + (feature.properties.code) + "</code></big><br>";
        popupContent += "Area: " + value_area + " " + sufix_area + "<br>";
        popupContent += "Side: " + value_side + " " + sufix_side + "<br>";

        if(feature.properties.prefix )
        {
            popupContent += "Prefix: " + feature.properties.prefix + "<br>";
        }

        if(feature.properties.code_subcell )
        {
            popupContent += "Code_subcell: " + feature.properties.code_subcell + "<br>";
        }
    }

    layer.bindPopup(popupContent);

    if(feature.properties.code_subcell)
    {
        var layerTooltip = feature.properties.code_subcell;
    }
    else if(feature.properties.short_code)
    {
        var layerTooltip = '.' + (feature.properties.short_code.split(/[~]/)[1]);
    }
    else if(feature.properties.index)
    {
        var layerTooltip = '.' + feature.properties.index
    }
    else
    {
        var layerTooltip = (feature.properties.code);
    }

    layer.bindTooltip(layerTooltip,{ permanent:toggleTooltipStatus,direction:'center',className:'tooltip' + feature.properties.base});

    // if(!feature.properties.code_subcell && !feature.properties.osm_id)
    // {
    //     let listBar = document.getElementById('fielddecodelist');
    // 
    //     listBar.value = sortAndRemoveDuplicates((listBar.value ? listBar.value + ',': '') + feature.properties.code)
    // }

    layer.on({click: onFeatureClick});
}

function style(feature)
{
    let grid = document.getElementById('grid')

    if(grid.value.match(/^grid(3|5|9|17|33)$/))
    {
        if (feature.properties.code_subcell)
        {
            return {color: 'deeppink'};
        }
        else
        {
            return {color: 'deeppink', fillColor: 'none'};
        }
    }
    else
    {
        if (feature.properties.osm_id)
        {
            return {color: 'red', fillColor: 'none', fillOpacity: 0.1};
        }
        else
        {
            return {color: 'black', fillColor: 'deeppink', fillOpacity: 0.1};
        }
    }
}

function pointToLayer(feature,latlng)
{
    return L.circleMarker(latlng,{
        radius: 3,
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.6,
    });
}

function onFeatureClick(feature)
{
    //console.log(feature);
    //var label = feature.sourceTarget.feature.properties.label;
}

function loadGeojsonFitCenterlayerCurrent(featureGroup)
{
    map.fitBounds(featureGroup.getBounds());
    let zoom = map.getZoom();
    map.setView(featureGroup.getBounds().getCenter(),zoom-(zoom < 10 ? 1: (zoom < 20 ? 2: (zoom < 24 ? 3: 4))));
    console.log(map.getZoom())
}

function loadGeojsonFitCenterlayerCurrentJurisd(featureGroup)
{
    map.fitBounds(featureGroup.getBounds(),{reset: true});
    let zoom = map.getZoom();
    map.options.minZoom = map.getZoom();
    // map.setView(featureGroup.getBounds().getCenter(),zoom-(zoom < 10 ? 1: (zoom < 20 ? 2: (zoom < 24 ? 3: 4))));
    // console.log(map.getZoom())
}

function loadGeojsonFitCenterlayerCoverAll(featureGroup)
{
    if(toggleCoverStatus)
    {
        loadGeojsonFitCenterlayerCurrentJurisd(featureGroup)
    }
    else
    {
        map.removeLayer(e);
        toggleCoverStatus = true
    }

    // console.log(Math.ceil(Math.min(...arrayOfSideCoverCell)))

    document.getElementById('level_size').innerHTML = generateSelectLevel(defaultMap.bases[defaultMapBase],defaultMapBase)
}

function loadGeojsonFitCenter(featureGroup)
{
//     let fitbd = document.getElementById('fitbounds') || true
//     let fitce = document.getElementById('fitcenter') || true
//     
//     fitbd.checked ? map.fitBounds(featureGroup.getBounds()) : (fitce.checked ? map.setView(featureGroup.getBounds().getCenter()) : '')
    // fitbd.checked ? map.setView(featureGroup.getBounds().getCenter(),zoom-(zoom < 10 ? 1: (zoom < 20 ? 2: (zoom < 24 ? 3: 4)))) : '';
    // map.fitBounds(featureGroup.getBounds())
    map.setView(featureGroup.getBounds().getCenter(),map.getZoom())
}

// https://gis.stackexchange.com/questions/137061/changing-layer-order-in-leaflet
function fixZOrder(dataLayers) {

    // only similar approach is to remove and re-add back to the map
    // use the order in the dataLayers object to define the z-order
    Object.keys(dataLayers).forEach(function (key) {

        // check if the layer has been added to the map, if it hasn't then do nothing
        // we only need to sort the layers that have visible data
        // Note: this is similar but faster than trying to use map.hasLayer()
        var layerGroup = dataLayers[key];
        if (layerGroup._layers
            && Object.keys(layerGroup._layers).length > 0
            && layerGroup._layers[Object.keys(layerGroup._layers)[0]]._path
            && layerGroup._layers[Object.keys(layerGroup._layers)[0]]._path.parentNode)
            layerGroup.bringToFront();
    });
}

function loadGeojson(uri,arrayLayer,afterLoad)
{
    fetch(uri)
    .then(response => {return response.json()})
    .then(data =>
    {
        arrayLayer[0].clearLayers();

        for (i=0; i < arrayLayer.length; i++)
        {
            arrayLayer[i].addData(data.features);
        }

        afterLoad(arrayLayer[0]);
        
        if(data.features.length = 1)
        {
            // console.log(data.features[0])
            // console.log(data.features)

            if(data.features[0].properties.isolabel_ext)
            {
                // console.log(data.features[0].properties.isolabel_ext)

                //var nextURL = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname + window.location.search
                var nextURL = window.location.protocol + "//" + window.location.host + "/" + data.features[0].properties.isolabel_ext + window.location.search
                const nextTitle = 'OSM.codes: ' + data.features[0].properties.isolabel_ext;
                const nextState = { additionalInformation: 'to canonical.' };

                window.history.pushState(nextState, nextTitle, nextURL);
            }
            else if (!data.features[0].properties.index)
            {
                if(data.features[0].properties.short_code)
                {
                    // console.log(data.features[0].properties.short_code)

                    //var nextURL = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname + window.location.search
                    var nextURL = window.location.protocol + "//" + window.location.host + "/" + data.features[0].properties.short_code + window.location.search
                    const nextTitle = 'OSM.codes: ' + data.features[0].properties.short_code;
                    const nextState = { additionalInformation: 'to canonical.' };

                    window.history.pushState(nextState, nextTitle, nextURL);
                    
                    document.getElementById('fielddecode').value = data.features[0].properties.short_code;
                }
                else if(data.features[0].properties.code)
                {
                    document.getElementById('fielddecode').value = data.features[0].properties.code;
                }
                if(data.features[0].properties.side)
                {
                    document.getElementById('level_size').innerHTML = generateSelectLevel2(defaultMap.bases[defaultMapBase],defaultMapBase,data.features[0].properties.side);
                }
            }
        }

        fixZOrder(overlays);
    })
    .catch(err => {})
}

function onMapClick(e)
{
    let level = document.getElementById('level_size').value
    let grid = document.getElementById('grid').value
    // let base = document.getElementById('base').value

    var base = defaultMapBase
    var uri = uri_base + "/geo:" + e.latlng['lat'] + "," + e.latlng['lng'] + ";u=" + level + ".json" + (base != 'base32' ? '/' + base : '') + (grid ? '/' + grid : '')
    var popupContent = "latlng: " + e.latlng['lat'] + "," + e.latlng['lng'];

    document.getElementById('fieldencode').value = latRound(e.latlng['lat']) + "," + latRound(e.latlng['lng']) + ";u=" + level;
    // or e.latlng['lat'].toPrecision(8)

    layerMarkerCurrent.clearLayers();

    L.marker(e.latlng).addTo(layerMarkerCurrent).bindPopup(popupContent);
    L.marker(e.latlng).addTo(layerMarkerAll).bindPopup(popupContent);

    loadGeojson(uri,[layerPolygonCurrent,layerPolygonAll],loadGeojsonFitCenter)
    // loadGeojson(uri,[layerPolygonCurrent,layerPolygonAll],loadGeojsonFitCenterlayerCurrent)
}

function showZoomLevel()
{
    document.getElementById('zoom').innerHTML = map.getZoom();
}

function checkCountry(string)
{
    for(var key in countries)
    {
        let regex = new RegExp("^/?" + key + ".*","i");

        if(regex.test(string))
        {
            // document.getElementById('country').value = key;
            defaultMap = countries[key];
            // console.log(defaultMap)
            toggleCountry();
            break;
        }
    }
}

function checkBase(string)
{
    for(var key in countries)
    {
        let regex = new RegExp("^/?" + key + ".*","i");

        if(regex.test(string))
        {
            let regex2 = /\+/;

            if(regex2.test(string))
            {
                // document.getElementById('base').value = countries[key].scientificBase;
                defaultMapBase = countries[key].scientificBase;
            }
            else
            {
                // document.getElementById('base').value = countries[key].postalcodeBase;
                defaultMapBase = countries[key].postalcodeBase;
            }
            // console.log(defaultMapBase)
            toggleLevelBase();
            break;
        }
    }
}

var uri = window.location.href;
let pathname = window.location.pathname;

if(pathname !== "/view/")
{
    checkCountry(pathname);
    checkBase(pathname);
    
    if (pathname.match(/^\/[A-Z]{2}-[A-Z]{1,3}-[A-Z]+$/i))
    {
        var uriApi = uri.replace(/\/([A-Z]{2}-[A-Z]{1,3}-[A-Z]+)$/i, "/geo:iso_ext:$1.json");
        
        // document.getElementById('jcover').checked=true

        // loadGeojson(uriApi + '/cover',[layerCoverAll],loadGeojsonFitCenter);
        // loadGeojson(uriApi,[layerJurisdAll],loadGeojsonFitCenter);
        loadGeojson(uriApi + '/cover',[layerCoverAll], loadGeojsonFitCenterlayerCoverAll);
        loadGeojson(uriApi,[layerJurisdAll],loadGeojsonFitCenterlayerCurrentJurisd);
    }
    else
    {
        var uriApiJurisd = ''
        if (pathname.match(/\/base16\/grid/))
        {
            var uriApi = uri.replace(/(\/base16\/grid)/, ".json$1");
        }
        else if (pathname.match(/(\/base16h)?\/grid/))
        {
            var uriApi = uri.replace(/((\/base16h)?\/grid)/, ".json$1");
        }
        else if (pathname.match(/\/[A-Z]{2}~[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+(,[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+)*$/i))
        {
            var uriApi = uri.replace(/\/([A-Z]{2}~[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+(,[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+)*)$/i, "/geo:osmcodes:$1.json");
            uriApiJurisd = uri.replace(/\/(([A-Z]{2})~[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+(,[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+)*)$/i, "/geo:iso_ext:$2.json");
        }
        else if (pathname.match(/\/[A-Z]{2}\+[0123456789ABCDEFGHJKLMNPQRSTVZ]([0123456789ABCDEF]*([GHJKLMNPQRSTVZ])?)?(,[0123456789ABCDEFGHJKLMNPQRSTVZ]([0123456789ABCDEF]*([GHJKLMNPQRSTVZ])?)?)*$/i))
        {
            var uriApi = uri.replace(/\/([A-Z]{2}\+[0123456789ABCDEFGHJKLMNPQRSTVZ]([0123456789ABCDEF]*([GHJKLMNPQRSTVZ])?)?(,[0123456789ABCDEFGHJKLMNPQRSTVZ]([0123456789ABCDEF]*([GHJKLMNPQRSTVZ])?)?)*)$/i, "/geo:osmcodes:$1.json");
            uriApiJurisd = uri.replace(/\/(([A-Z]{2})\+[0123456789ABCDEFGHJKLMNPQRSTVZ]([0123456789ABCDEF]*([GHJKLMNPQRSTVZ])?)?(,[0123456789ABCDEFGHJKLMNPQRSTVZ]([0123456789ABCDEF]*([GHJKLMNPQRSTVZ])?)?)*)$/i, "/geo:iso_ext:$2.json");
        }
        else if (pathname.match(/\/CO-\d+$/i))
        {
            var uriApi = uri.replace(/\/CO-(\d+)$/i, "/geo:co-divipola:$1.json");
        }
        else if (pathname.match(/^\/([A-Z]{2})-\d+(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+$/i))
        {
            var uriApi = uri.replace(/\/(([A-Z]{2})-\d+(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+)$/i, "/geo:osmcodes:$1.json");
            uriApiJurisd = uri.replace(/\/((([A-Z]{2})-\d+)(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+)$/i, "/geo:iso_ext:$2.json");
        }
        else if (pathname.match(/\/BR-\d+$/i))
        {
            var uriApi = uri.replace(/\/BR-(\d+)$/i, "/geo:br-geocodigo:$1.json");
        }
        else if (pathname.match(/^\/[A-Z]{2}(-[A-Z]{1,3}-[A-Z]+)(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+$/i))
        {
            var uriApi = uri.replace(/\/([A-Z]{2}(-[A-Z]{1,3}-[A-Z]+)(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+)$/i, "/geo:osmcodes:$1.json");
            uriApiJurisd = uri.replace(/\/(([A-Z]{2}(-[A-Z]{1,3}-[A-Z]+))(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+)$/i, "/geo:iso_ext:$2.json");
        }
        else
        {
            var uriApi = uri + '.json';
        }
        if(uriApiJurisd !== null && uriApiJurisd !== '')
        {
            loadGeojson(uriApiJurisd,[layerJurisdAll],loadGeojsonFitCenterlayerCurrentJurisd);
            loadGeojson(uriApiJurisd + '/cover',[layerCoverAll],function(e){});
        }
        
        loadGeojson(uriApi,[layerPolygonCurrent,layerPolygonAll],loadGeojsonFitCenterlayerCurrent);
    }
}
