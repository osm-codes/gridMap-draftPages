
function changeLevel_byDigits(x) {
  const max=8;
  const thisURL = window.location.href.replace(/#.*$/,'');
  const code = document.getElementById('postalCode').textContent.replace('.','');
  let len = (code == null || code == '(click the map)')? 0: code.length;
  if (thisURL.indexOf('~')>0) {
   if (x>0 && len<max) {
      window.location.replace(thisURL+'7');
   } else if (x<0 && len>1) {
      window.location.replace( thisURL.substring(0,thisURL.length-1) );
   } else alert('check code or level limits');
 } else alert('Click a point first');
}

//////////////

function sel_jurL1(abbrev)
{
    if (abbrev>'')
    {
        let jL2dom = document.getElementById('sel_jurL2');
        let s = '<option value="">- opt -</option>'
        for ( var i of Object.keys(approved_jurisdictions[abbrev]) )
            s += '<option value="' + i + '">' + (abbrev != 'CO' ? i : approved_jurisdictions[abbrev][i]['name'])
        jL2dom.innerHTML=s
        let jL3dom = document.getElementById('sel_jurL3');
        jL3dom.innerHTML=""
    }
}

function sel_jurL2(abbrev)
{
    let country = defaultMap.isocode;
    let state = document.getElementById('sel_jurL2').value;
    let jL3dom = document.getElementById('sel_jurL3');
    let s = '<option value="">- City -</option>'
    for ( var i of approved_jurisdictions[country][state]['mun'] )
        s += '<option>'+i
    jL3dom.innerHTML=s
}

function sel_jurL3(abbrev)
{
    // let country = document.getElementById('sel_jurL1').value;
    let country = defaultMap.isocode;
    let state = document.querySelector('#sel_jurL2').value;
    window.location.href = 'https://osm.codes/' + country + '-' + state + '-' + document.getElementById('sel_jurL3').value;
}

function latRound(x,maxDigits=6) {
  return Number.parseFloat(x).toFixed(maxDigits);
  // 5 or 6 decimal digits for 1 meter, see https://gis.stackexchange.com/a/208739/7505
}

function updateJurisd(jurisd)
{
    document.getElementById('sel_jurL1').innerHTML = jurisd.split("-",3)[0];

    let s = '<option value="">- opt -</option>'
    for ( var i of Object.keys(approved_jurisdictions[jurisd.split("-",3)[0]]) )
        // s += '<option' + (jurisd.split("-",3)[1] == i ? ' selected>' : '>') +i

        s += '<option value="' + i + '"' + (jurisd.split("-",3)[1] == i ? ' selected>' : '>') + (jurisd.split("-",3)[0] != 'CO' ? i :   approved_jurisdictions[jurisd.split("-",3)[0]][i]['name'])

    document.getElementById('sel_jurL2').innerHTML=s

    s = '<option value="">- City -</option>'
    for ( var i of approved_jurisdictions[jurisd.split("-",3)[0]][jurisd.split("-",3)[1]]['mun'] )
        s += '<option' + (jurisd.split("-",3)[2] == i ? ' selected>' : '>') +i
    document.getElementById('sel_jurL3').innerHTML=s
}

var uri_base = "https://osm.codes"

var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib = '&copy; <a href="https://osm.org/copyright">OpenStreetMap contributors</a>';
var mapboxUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
var mapboxAttr = 'Tiles from <a href="https://www.mapbox.com">Mapbox</a>';
var osmAndMapboxAttr = osmAttrib + '. ' + mapboxAttr;

var openstreetmap = L.tileLayer(osmUrl,{attribution: osmAttrib,detectRetina: true,minZoom: 0,maxNativeZoom: 19,maxZoom: 25 }),
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

// var layerPolygonCurrentGrid = new L.geoJSON(null, {
//             style: stylePolygonCurrentGrid,
//             onEachFeature: onEachFeaturePolygonCurrentGrid,
//             pointToLayer: pointToLayer,
//             filter: filterLayer,
//         });

var layerPolygonAll = new L.geoJSON(null,{
            style: style,
            onEachFeature: onEachFeaturePolygonAll,
            pointToLayer: pointToLayer,
        });

var layerJurisdAll = new L.geoJSON(null,{
            style: styleJurisdAll,
            onEachFeature: onEachFeatureJurisd,
            pointToLayer: pointToLayer,
        });

var layerCoverAll = new L.geoJSON(null,{
            style: styleCoverAll,
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
    // 'Grid cells': layerPolygonCurrentGrid,
};

var levelSize = [1048576,741455.2,524288,370727.6,262144,185363.8,131072,92681.9,65536,46340.95,32768,23170.48,16384,11585.24,8192,5792.62,4096,2896.31,2048,1448.15,1024,724.08,512,362.04,256,181.02,128,90.51,64,45.25,32,22.63,16,11.31,8,5.66,4,2.83,2,1.41,1];

var levelValues =  [600000,400000,300000,200000,150000,100000,75000,50000,30000,25000,19000,13000,9000,6000,4000,3000,2000,1500,1200,700,600,400,300,200,150,100,70,50,30,20,15,12,8,6,4,3,2,1.5,1,0.7,0.5];

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
        isocoden: 76,
        jurisdictionPlaceholder: 'BR-SP-SaoPaulo',
        selectedBases: ['base32','base16h1c'],
        bases:
        {
            base32:
            {
                iniLevel: 0,
                endLevel: 40,
                modLevel: 5,
                iniDigit: 1,
                levelDefault: 35,
                symbol: '~',
                placeholderDecode: '42',
                placeholderEncode: '-15.7,-47.8;u=10',
                placeholderList: '3,5,7,A',
                selectGrid: [32],
            },
            base16h:
            {
                iniLevel: 0,
                endLevel: 40,
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
                endLevel: 40,
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
        isocoden: 170,
        jurisdictionPlaceholder: 'CO-ANT-Itagui',
        selectedBases: ['base32','base16h'],
        bases:
        {
            base32:
            {
                iniLevel: 4,
                endLevel: 39,
                modLevel: 5,
                iniDigit: 1,
                levelDefault: 39,
                symbol: '~',
                placeholderDecode: '3D5',
                placeholderEncode: '3.5,-72.3;u=10',
                placeholderList: '3D5,3D4,2',
                selectGrid: [32],
            },
            base16h:
            {
                iniLevel: 4,
                endLevel: 40,
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
        isocoden: 218,
        jurisdictionPlaceholder: 'EC-L-Loja',
        selectedBases: ['base32','base16h'],
        bases:
        {
            base32:
            {
                iniLevel: 5,
                endLevel: 40,
                modLevel: 5,
                iniDigit: 1,
                levelDefault: 30,
                symbol: '~',
                placeholderDecode: '5P',
                placeholderEncode: '-1.1,-78.4;u=10',
                placeholderList: '5P,FL,J9',
                selectGrid: [32],
            },
            base16h:
            {
                iniLevel: 5,
                endLevel: 40,
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
        isocoden: 868,
        jurisdictionPlaceholder: 'UY-CA-LasPiedras',
        selectedBases: ['base32','base16h1c'],
        bases:
        {
            base32:
            {
                iniLevel: 6,
                endLevel: 36,
                modLevel: 5,
                iniDigit: 1,
                levelDefault: 36,
                symbol: '~',
                placeholderDecode: '3',
                placeholderEncode: '-32.9,-55.9;u=10',
                placeholderList: '3,2C,4F',
                selectGrid: [32],
            },
            base16h:
            {
                iniLevel: 6,
                endLevel: 40,
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
                endLevel: 38,
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
                endLevel: 38,
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
var arrayOfSideCoverCell = new Array();
var getJurisdAfterLoad = false;

var state = {
    isolabel_ext: ''
};

function checkCountry(string,togglecountry=true)
{
    for(var key in countries)
    {
        let regex = new RegExp("^/?" + key + ".*","i");

        if(regex.test(string))
        {
            defaultMap = countries[key];
            defaultMapBase = defaultMap.postalcodeBase;
            togglecountry ? toggleCountry() : '';
            break;
        }
    }
}

var uri = window.location.href;
let pathname = window.location.pathname;

if (pathname.match(/^\/[A-Z]{2}.+$/i))
{
    checkCountry(pathname,false)
}

function checkCountryn(num,togglecountry=true)
{
    for(var key in countries)
    {
        if(countries[key].isocoden == num)
        {
            defaultMap = countries[key];
            defaultMapBase = defaultMap.postalcodeBase;
            togglecountry ? toggleCountry() : '';
            break;
        }
    }
}

var map = L.map('map',{
    center: defaultMap.center,
    zoom:   defaultMap.zoom,
    maxBoundsViscocity: 1,
    zoomControl: false,
    renderer: L.svg(),
    // layers: [grayscale, layerPolygonCurrent, layerPolygonCurrentGrid, layerPolygonAll, layerCoverAll, layerJurisdAll] });
    layers: [grayscale, layerPolygonCurrent, layerPolygonAll, layerCoverAll, layerJurisdAll] });

var toggleTooltipStatus = false;
var toggleCoverStatus = false;

map.attributionControl.setPrefix(false);
map.addControl(new L.Control.Fullscreen({position:'topleft'})); /* https://github.com/Leaflet/Leaflet.fullscreen */
map.on('zoom', function(e){defaultMap.current_zoom = map.getZoom();});
map.on('click', onMapClick);
// map.on('zoomend', showZoomLevel);
// showZoomLevel();
map.on('baselayerchange', function (e) {
    console.log(e.name);

    // if(e.name == "satellite" || e.name == "satellitestreet")
    // {
    //     layerPolygonCurrent.setStyle({
    //         color: '#F00',
    //         weight:1
    //     });
    // }
    // else
    // {
    //     layerPolygonCurrent.resetStyle(e.target);
    // }
});

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

var jurisdictionGgeohash = L.control({position: 'topleft'});
jurisdictionGgeohash.onAdd = function (map) {
    this.container = L.DomUtil.create('div');
    this.label_country  = L.DomUtil.create('label', '', this.container);
    this.label_state  = L.DomUtil.create('label', '', this.container);
    this.select_state = L.DomUtil.create('select', '', this.container);
    this.label_mun  = L.DomUtil.create('label', '', this.container);
    this.select_mun = L.DomUtil.create('select', '', this.container);

    this.label_country.for = 'country';
    this.label_country.innerHTML = 'Jurisdiction: <span id="sel_jurL1">' + defaultMap.isocode +'</span>';
    this.label_state.for = 'state';
    this.label_state.innerHTML = '-';
    this.label_mun.for = 'mun';
    this.label_mun.innerHTML = '-';

    this.select_state.id = 'sel_jurL2';
    this.select_state.name = 'state';

    this.select_mun.id = 'sel_jurL3';
    this.select_mun.name = 'mun';

    L.DomEvent.disableScrollPropagation(this.container);
    L.DomEvent.disableClickPropagation(this.container);
    L.DomEvent.on(this.select_state, 'change', sel_jurL2, this.container);
    L.DomEvent.on(this.select_mun, 'change', sel_jurL3, this.container);

    return this.container; };

var decodeGgeohash = L.control({position: 'topleft'});
decodeGgeohash.onAdd = function (map) {
    this.container = L.DomUtil.create('div');
    this.label_field  = L.DomUtil.create('label', '', this.container);
    this.field = L.DomUtil.create('input', '', this.container);
    this.button = L.DomUtil.create('button','leaflet-control-button',this.container);

    this.label_field.for = 'fielddecode';
    this.label_field.innerHTML = 'Grid code: ';

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

    // L.DomEvent.disableScrollPropagation(this.button);
    L.DomEvent.disableClickPropagation(this.button);
    L.DomEvent.disableScrollPropagation(this.field);
    L.DomEvent.disableClickPropagation(this.field);
    L.DomEvent.on(this.button, 'click', getDecodeList, this.container);
    //L.DomEvent.on(this.field, 'keyup', function(data){if(data.keyCode === 13){getDecodeList(data);}}, this.container);

    return this.container; };

var encodeGgeohash = L.control({position: 'topleft'});
encodeGgeohash.onAdd = function (map) {
    this.container = L.DomUtil.create('div','leaflet-control-encode');
    this.label_field  = L.DomUtil.create('label', '', this.container);
    this.field = L.DomUtil.create('input', '', this.container);
    this.button = L.DomUtil.create('button','leaflet-control-button',this.container);
    this.button2 = L.DomUtil.create('button','getGeo-button',this.container);

    this.label_field.for = 'fieldencode';
    this.label_field.innerHTML = 'Equivalent Geo URI:<br/>';
    this.field.type = 'text';
    this.field.placeholder = 'e.g.: ' + defaultMap.bases[defaultMapBase].placeholderEncode;
    this.field.id = 'fieldencode';
    this.button.type = 'button';
    this.button.innerHTML= "Encode";

    this.button2.type = 'button';
    this.button2.innerHTML= "My Location";

    L.DomEvent.disableScrollPropagation(this.container);
    L.DomEvent.disableClickPropagation(this.container);
    L.DomEvent.on(this.button, 'click', getEncode, this.container);
    L.DomEvent.on(this.button2, 'click', getMyLocation, this.container);
    L.DomEvent.on(this.field, 'keyup', function(data){if(data.keyCode === 13){getEncode(data);}}, this.container);
    return this.container;
  }; // \onAdd(map)

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
    // this.label_grid    = L.DomUtil.create('label', '', this.container);
    // this.select_grid   = L.DomUtil.create('select', '', this.container);
    //
    // this.label_grid.for = 'grid';
    // this.label_grid.innerHTML = ' ';
    // this.select_grid.id = 'grid';
    // this.select_grid.name = 'grid';
    // this.select_grid.innerHTML = generateSelectGrid(defaultMap.bases[defaultMapBase].selectGrid)

    this.label_level.for = 'level';
    this.label_level.innerHTML = 'Level: '; //no BR
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

var clear = L.control(); // old {position: 'topleft'}
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

var zoomClick = L.control({position: 'topleft'});
zoomClick.onAdd = function (map) {
    this.container = L.DomUtil.create('div');
    this.label     = L.DomUtil.create('label', '', this.container);
    this.checkbox  = L.DomUtil.create('input', '', this.container);

    this.label.for= 'zoomclick';
    this.label.innerHTML= 'Disable zoom-click: ';
    this.checkbox.id = 'zoomclick';
    this.checkbox.type = 'checkbox';
    this.checkbox.checked = false;

    L.DomEvent.disableScrollPropagation(this.container);
    L.DomEvent.disableClickPropagation(this.container);

    return this.container; };

var noTooltip = L.control({position: 'topleft'});
noTooltip.onAdd = function (map) {
    this.container = L.DomUtil.create('div');
    this.label     = L.DomUtil.create('label', '', this.container);
    this.checkbox  = L.DomUtil.create('input', '', this.container);

    this.label.for= 'notooltip';
    this.label.innerHTML= '<br/>No tooltip: ';
    this.checkbox.id = 'notooltip';
    this.checkbox.type = 'checkbox';
    this.checkbox.checked = false;

    L.DomEvent.disableScrollPropagation(this.container);
    L.DomEvent.disableClickPropagation(this.container);

    return this.container; };

var geoUriDiv = L.control({position: 'topright'});
geoUriDiv.onAdd = function (map) {
    this.container = L.DomUtil.create('div');

    this.container.innerHTML= '<a id="hasGeoUri" href="#fieldencode" title="Latitude,Longitude: click here to get it as Geo URI standard"><span id="geoUri" class="font_small"></span></a>';

    L.DomEvent.disableScrollPropagation(this.container);
    L.DomEvent.disableClickPropagation(this.container);

    return this.container; };



zoom.addTo(map);
layers.addTo(map);
geoUriDiv.addTo(map);
escala.addTo(map);
decodeGgeohash.addTo(map);
encodeGgeohash.addTo(map);
level.addTo(map);
clear.addTo(map);
toggleTooltip.addTo(map);
toggleCover.addTo(map);
jurisdictionGgeohash.addTo(map);
noTooltip.addTo(map);
zoomClick.addTo(map);

var a = document.getElementById('custom-map-controlsa');
var b = document.getElementById('custom-map-controlsb');
var c = document.getElementById('custom-map-controlsc');
a.appendChild(jurisdictionGgeohash.getContainer());
a.appendChild(decodeGgeohash.getContainer());
a.appendChild(encodeGgeohash.getContainer());
c.appendChild(level.getContainer());
b.appendChild(clear.getContainer());
b.appendChild(toggleTooltip.getContainer());
b.appendChild(toggleCover.getContainer());
b.appendChild(noTooltip.getContainer());
b.appendChild(zoomClick.getContainer());

function clearAllLayers()
{
    layerPolygonCurrent.clearLayers();
    layerPolygonCurrentGrid.clearLayers();
    layerPolygonAll.clearLayers();
    layerMarkerCurrent.clearLayers();
    layerMarkerAll.clearLayers();
    map.removeLayer(layerCoverAll); toggleCoverStatus = true
    document.getElementById('fielddecode').value = '';
    document.getElementById('fieldencode').value = '';
}

function clearAll()
{
    clearAllLayers();

    toggleCountry()

    map.fitBounds(layerJurisdAll.getBounds());
}

function toggleCountry()
{
    clearAllLayers();
    defaultMapBase = defaultMap.defaultBase;

    toggleLevelBase();
}

function toggleLevelBase()
{
    document.getElementById('level_size').innerHTML = generateSelectLevel(defaultMap.bases[defaultMapBase],defaultMapBase);
    // document.getElementById('grid').innerHTML = generateSelectGrid(defaultMap.bases[defaultMapBase].selectGrid);
    document.getElementById('fielddecode').placeholder = 'e.g.: ' + defaultMap.bases[defaultMapBase].placeholderDecode;
    document.getElementById('fieldencode').placeholder = 'geo:' + defaultMap.bases[defaultMapBase].placeholderEncode;
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

        if (arrayOfSideCoverCell && arrayOfSideCoverCell.length > 0 && levelSize[i] <= Math.ceil(Math.min(...arrayOfSideCoverCell)))
        {
            html += '<option value="' + levelValues[i] + (i == base.levelDefault ? '" selected>' : '">') + 'L' + (0.5*j*base.modLevel).toString() + ' (' + ((levelSize[i]<1000)? Math.round(levelSize[i]) : Math.round(levelSize[i]/1000)) + ((levelSize[i]<1000)? 'm': 'km') + ')</option>'
            //html += '<option value="' + levelValues[i] + (i == base.levelDefault ? '" selected>' : '">') + 'L' + (0.5*j*base.modLevel).toString() + ' (' + ((levelSize[i]<1000)? Math.round(levelSize[i]*100.0)/100 : Math.round(levelSize[i]*100.0/1000)/100) + ((levelSize[i]<1000)? 'm': 'km') + ')</option>'
        }
        else if (arrayOfSideCoverCell && arrayOfSideCoverCell.length == 0)
        {
            html += '<option value="' + levelValues[i] + (i == base.levelDefault ? '" selected>' : '">') + 'L' + (0.5*j*base.modLevel).toString() + ' (' + ((levelSize[i]<1000)? Math.round(levelSize[i]) : Math.round(levelSize[i]/1000)) + ((levelSize[i]<1000)? 'm': 'km') + ')</option>'
            // html += '<option value="' + levelValues[i] + (i == base.levelDefault ? '" selected>' : '">') + 'L' + (0.5*j*base.modLevel).toString() + ' (' + ((levelSize[i]<1000)? Math.round(levelSize[i]*100.0)/100 : Math.round(levelSize[i]*100.0/1000)/100) + ((levelSize[i]<1000)? 'm': 'km') + ')</option>'
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

        if (arrayOfSideCoverCell && arrayOfSideCoverCell.length > 0 && levelSize[i] <= Math.ceil(Math.min(...arrayOfSideCoverCell)))
        {
            html += '<option value="' + levelValues[i] + (Math.floor(size) <= levelSize[i] ? '" selected>' : '">') + 'L' + (0.5*j*base.modLevel).toString() + ' (' + ((levelSize[i]<1000)? Math.round(levelSize[i]) : Math.round(levelSize[i]/1000)) + ((levelSize[i]<1000)? 'm': 'km') + ')</option>'
            // html += '<option value="' + levelValues[i] + (Math.floor(size) <= levelSize[i] ? '" selected>' : '">') + 'L' + (0.5*j*base.modLevel).toString() + ' (' + ((levelSize[i]<1000)? Math.round(levelSize[i]*100.0)/100 : Math.round(levelSize[i]*100.0/1000)/100) + ((levelSize[i]<1000)? 'm': 'km') + ')</option>'
        }
        else if (arrayOfSideCoverCell && arrayOfSideCoverCell.length == 0)
        {
            html += '<option value="' + levelValues[i] + (Math.floor(size) <= levelSize[i] ? '" selected>' : '">') + 'L' + (0.5*j*base.modLevel).toString() + ' (' + ((levelSize[i]<1000)? Math.round(levelSize[i]) : Math.round(levelSize[i]/1000)) + ((levelSize[i]<1000)? 'm': 'km') + ')</option>'
            // html += '<option value="' + levelValues[i] + (Math.floor(size) <= levelSize[i] ? '" selected>' : '">') + 'L' + (0.5*j*base.modLevel).toString() + ' (' + ((levelSize[i]<1000)? Math.round(levelSize[i]*100.0)/100 : Math.round(levelSize[i]*100.0/1000)/100) + ((levelSize[i]<1000)? 'm': 'km') + ')</option>'
        }
    }

    return html
}

function getDecode(data)
{
    let input = defaultMap.isocode + '-' + document.getElementById('sel_jurL2').value + '-' + document.getElementById('sel_jurL3').value + defaultMap.bases[defaultMap.defaultBase].symbol + document.getElementById('fielddecode').value

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

        loadGeojson(uri,[layerPolygonCurrent,layerPolygonAll],afterLoadLayer,afterData,beforeAddDataLayer);
    }
}

function getDecodeList(data)
{
    let input = document.getElementById('fielddecodelist').value;
    let countryValue = document.getElementById('country').value;

    var base = defaultMapBase;

    console.log(input);
    if(input !== null && input !== '')
    {
        var uri = uri_base + "/geo:osmcodes:" + countryValue.toUpperCase() + countries[countryValue].bases[base].symbol + sortAndRemoveDuplicates(input) + ".json"

        loadGeojson(uri,[layerPolygonCurrent,layerPolygonAll],afterLoadLayer,afterData,beforeAddDataLayer);
        document.getElementById('fielddecodelist').value = '';

        checkCountry(input);
    }
}

function getJurisdiction(data)
{
    let input = document.getElementById('fieldjurisdiction').value

    var base = defaultMapBase

    if(input !== null && input !== '')
    {
        let uri = uri_base + "/geo:iso_ext:" + input + '.json/cover' + (base == 'base16h' ? '/base16h' : (base == 'base16h1c' ? '/base16h1c' : ''));

        loadGeojson(uri,[layerCoverAll],afterLoadLayer,afterData);
        document.getElementById('fieldjurisdiction').value = '';

        uri = uri_base + "/geo:iso_ext:" + input + ".json";
        loadGeojson(uri,[layerJurisdAll],afterLoadLayer,afterData);

        checkCountry(input);
    }
}

function getEncode(noData)
{
    let input = document.getElementById('fieldencode').value

    if(input !== null && input !== '')
    {
        let level = document.getElementById('level_size').value
        // let grid = document.getElementById('grid').value
        let grid = ""
        let country = defaultMap.isocode;
        let state = document.getElementById('sel_jurL2').value;
        let jL3dom = document.getElementById('sel_jurL3').value;
        let context = country + '-' + state + '-'+ jL3dom

        var base = defaultMapBase

        var uri = uri_base + (input.match(/^geo:.*/) ? '/' : '/geo:' )

        if(input.match(/.*;u=.*/))
        {
            let u_value = Number(input.split(';u=')[1])

            if(u_value == 0)
            {
                u_value = levelValues[defaultMap.bases[defaultMapBase].endLevel]
            }

            uri += input.replace(/(.*;u=).*/i, "$1" +  (u_value > 9 ? Math.round(u_value) : Math.round(u_value*10)/10 ) )
        }
        else
        {
            uri += input + ";u=" + level
        }

        uri += ".json" + (base != 'base32' ? '/' + base : '')

        var uri_ = uri + '/' + context

        var uriGrid = uri + (grid ? '/' + grid : '') + '/' + context

        document.getElementById('fielddecode').value = '';

        input.match(/^geo:.*/) ? input = input.replace(/^geo:(.*)$/i, "$1") : ''

        var popupContent = "latlng: " + input;
        layerPolygonCurrent.clearLayers();
        layerMarkerCurrent.clearLayers();
        L.marker(input.split(/[;,]/,2)).addTo(layerMarkerCurrent).bindPopup(popupContent);
        L.marker(input.split(/[;,]/,2)).addTo(layerMarkerAll).bindPopup(popupContent);
        loadGeojson(uri_,[layerPolygonCurrent,layerPolygonAll],afterLoadLayer,afterData,beforeAddDataLayer)

        if(grid !== '')
        {
            loadGeojson(uriGrid,[layerPolygonCurrentGrid],afterLoadLayer,afterData)
        }
    }
}

function getEncodeWithoutContext(noData)
{
    let input = document.getElementById('fieldencode').value

    if(input !== null && input !== '')
    {
        let level = document.getElementById('level_size').value
        // let grid = document.getElementById('grid').value
        let grid = ""

        var base = defaultMapBase
        var uri = uri_base + (input.match(/^geo:.*/) ? '/' : '/geo:' ) + (input.match(/.*;u=.*/) ? input : input + ";u=" + level ) + ".json" + (base != 'base32' ? '/' + base : '')
        var uriWithGrid = uri_base + (input.match(/^geo:.*/) ? '/' : '/geo:' ) + (input.match(/.*;u=.*/) ? input : input + ";u=" + level ) + ".json" + (base != 'base32' ? '/' + base : '') + (grid ? '/' + grid : '')

        document.getElementById('fielddecode').value = '';

        input.match(/^geo:.*/) ? input = input.replace(/^geo:(.*)$/i, "$1") : ''

        var popupContent = "latlng: " + input;
        layerPolygonCurrent.clearLayers();
        layerMarkerCurrent.clearLayers();
        L.marker(input.split(/[;,]/,2)).addTo(layerMarkerCurrent).bindPopup(popupContent);
        L.marker(input.split(/[;,]/,2)).addTo(layerMarkerAll).bindPopup(popupContent);
        loadGeojson(uri,[layerPolygonCurrent,layerPolygonAll],afterLoadLayer,afterData,beforeAddDataLayer)

        if(grid !== '')
        {
            loadGeojson(uriWithGrid,[layerPolygonCurrentGrid],afterLoadLayer,afterData)
        }
    }
}

// https://stackoverflow.com/questions/31790344/determine-if-a-point-reside-inside-a-leaflet-polygon
function isMarkerInsidePolygon(latitude, longitude, poly) {
    var inside = false;
    var x = latitude, y = longitude;
    for (var ii=0;ii<poly.getLatLngs().length;ii++){
        var polyPoints = poly.getLatLngs()[ii];
        for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
            var xi = polyPoints[i].lat, yi = polyPoints[i].lng;
            var xj = polyPoints[j].lat, yj = polyPoints[j].lng;

            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
    }

    return inside;
};

function getMyLocation(noData)
{
    if (navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(getMyLocation_write)
    }
    else
    {
        alert( "Geolocation is not supported by this browser." )
    }
}

function getMyLocation_write(position)
{
    let context = defaultMap.isocode + '-' + document.getElementById('sel_jurL2').value + '-'+ document.getElementById('sel_jurL3').value

    layerJurisdAll.eachLayer(
        function(memberLayer)
        {
            if (isMarkerInsidePolygon(position.coords.latitude, position.coords.longitude, memberLayer))
            {
                // console.log(memberLayer.feature.properties);
                // console.log("DENTRO");
                // if (confirm("My location in " + context + ". Go to location?"))
                // {
                    document.getElementById('fieldencode').value = 'geo:'+ position.coords.latitude +','+ position.coords.longitude
                    getEncode();
                // }
            }
            else
            {
                alert("Error: location out of " + context + ".");
                // console.log("FORA");
                // if (confirm("Error: my location out of " + context + ". Go to location? It may take a few seconds."))
                // {
                //     document.getElementById('fieldencode').value = 'geo:'+ position.coords.latitude +','+ position.coords.longitude
                //     getEncodeWithoutContext();
                // }
            }
        }
    );
}

function getMyLocationJurisd(noData)
{
    if (navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(getMyLocationJurisdTest)
    }
}

function getMyLocationJurisdTest(position)
{
    let context = defaultMap.isocode + '-' + document.getElementById('sel_jurL2').value + '-'+ document.getElementById('sel_jurL3').value

    layerJurisdAll.eachLayer(
        function(memberLayer)
        {
            if (isMarkerInsidePolygon(position.coords.latitude, position.coords.longitude, memberLayer))
            {
                if (confirm("Go to my location in " + context + "?"))
                {
                    document.getElementById('fieldencode').value = 'geo:'+ position.coords.latitude +','+ position.coords.longitude
                    getEncode();
                }
            }
        }
    );
}

function sortAndRemoveDuplicates(value) {

    let listValues = [...new Set(value.trim().split(/[\n,]+/).map(i => i.trim().substring(0,11)))];

    return listValues.sort().join(",");
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
                defaultMapBase = countries[key].scientificBase;
            }
            else
            {
                defaultMapBase = countries[key].postalcodeBase;
            }
            toggleLevelBase();
            break;
        }
    }
}

function showZoomLevel()
{
    document.getElementById('zoom').innerHTML = map.getZoom();
}

function onMapClick(e)
{
    let level = document.getElementById('level_size').value
    // let grid = document.getElementById('grid').value
    let grid = ""

    let country = defaultMap.isocode;
    let state = document.getElementById('sel_jurL2').value;
    let jL3dom = document.getElementById('sel_jurL3').value;
    let context = country + '-' + state + '-'+ jL3dom

    var base = defaultMapBase
    var uri = uri_base + "/geo:" + e.latlng['lat'] + "," + e.latlng['lng'] + ";u=" + level + ".json" + (base != 'base32' ? '/' + base : '') + '/' + context
    var uriWithGrid = uri_base + "/geo:" + e.latlng['lat'] + "," + e.latlng['lng'] + ";u=" + level + ".json" + (base != 'base32' ? '/' + base : '') + (grid ? '/' + grid : '') + '/' + context
    var popupContent = "latlng: " + e.latlng['lat'] + "," + e.latlng['lng'];

    let decimals = (level <= 64 ? 5 : 4)

    layerJurisdAll.eachLayer(
        function(memberLayer)
        {
            if (isMarkerInsidePolygon(e.latlng['lat'], e.latlng['lng'], memberLayer))
            {
                document.getElementById('fieldencode').value = 'geo:' + latRound(e.latlng['lat']) + "," + latRound(e.latlng['lng']) + ";u=" + level;
                // or e.latlng['lat'].toPrecision(8)

                document.getElementById('geoUri').innerHTML = 'geo:' + latRound(e.latlng['lat'],decimals) + "," + latRound(e.latlng['lng'],decimals) //+ ";u=" + level;

                layerMarkerCurrent.clearLayers();

                L.marker(e.latlng).addTo(layerMarkerCurrent).bindPopup(popupContent);
                L.marker(e.latlng).addTo(layerMarkerAll).bindPopup(popupContent);

                loadGeojson(uri,[layerPolygonCurrent,layerPolygonAll],afterLoadLayer,afterData,beforeAddDataLayer)

                if(grid !== '')
                {
                    loadGeojson(uriWithGrid,[layerPolygonCurrentGrid],afterLoadLayer,afterData)
                }
            }
            else
            {
                alert("Error: click out of " + context + ".");
            }
        }
    );
}

// Layer layerPolygonCurrent
function style(feature)
{
    return {color: 'black', fillColor: 'deeppink', fillOpacity: 0.1, weight:0};
}

function popUpFeature(feature,layer)
{
    sufix_area =(feature.properties.area<1000000)? 'm2': 'km2';
    value_area =(feature.properties.area<1000000)? feature.properties.area: Math.round((feature.properties.area*100/1000000))/100;
    sufix_side =(feature.properties.side<1000)? 'm': 'km';
    value_side =(feature.properties.side<1000)? Math.round(feature.properties.side*100.0)/100 : Math.round(feature.properties.side*100.0/1000)/100;

    var popupContent = "";

    if(feature.properties.short_code )
    {
        popupContent += "Postal code: <big><code>" + (feature.properties.short_code.split(/[~]/)[1]) + "</code></big><br>";
        popupContent += "Area: " + value_area + " " + sufix_area + "<br>";
        popupContent += "Side: " + value_side + " " + sufix_side + "<br>";

        if(defaultMap.isocode != 'CO')
        {
            popupContent += "Jurisdiction: <code>" + feature.properties.short_code.split(/[~]/)[0] + "</code><br>";
        }

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
}

function layerTooltipFeature(feature,layer)
{
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

    layer.bindTooltip(layerTooltip,{ permanent:toggleTooltipStatus,direction:'auto',className:'tooltip' + feature.properties.base});
}

function highlightFeature(e)
{
    const layer = e.target;

    let noTooltip = document.getElementById('notooltip')

    if(noTooltip.checked)
    {
        this.closeTooltip();
        layer.setStyle({
            color: 'deeppink',
            weight:1
        });

        layer.bringToFront();
    }
    else
    {
        this.openTooltip();
    }
}

function resetHighlight(e,layer)
{
    layerPolygonCurrent.resetStyle(e.target);
    layerPolygonAll.resetStyle(e.target);
}

function onFeatureClick(feature)
{
    let zoomclick = document.getElementById('zoomclick')
    zoomclick.checked ? '' : map.fitBounds(feature.target.getBounds())
}

function onEachFeature(feature,layer)
{
    const reg = /(...)(?!$)/g
    popUpFeature(feature,layer);
    layerTooltipFeature(feature,layer);

    const center = layer.getBounds().getCenter();

    L.circleMarker(center,{color: 'black', radius: 3, weight: 1, opacity: 0.8, fillOpacity: 0.6 }).addTo(layerPolygonCurrent);

    if(feature.properties.scientic_code)
    {
        document.getElementById('sciCode').innerHTML = '<a href="https://osm.codes/' + defaultMap.isocode + defaultMap.bases[defaultMap.scientificBase].symbol + feature.properties.scientic_code + '">' + feature.properties.scientic_code +'</a>';
    }

    if(feature.properties.short_code)
    {
        document.getElementById('sel_jurL3').innerHTML == feature.properties.short_code.split(/[-~]/)[2] ? '' : updateJurisd(feature.properties.short_code.split(/[~]/)[0])
        document.getElementById('postalCode').innerHTML = (feature.properties.short_code.split(/[~]/)[1]).replace(reg, '$1.');
    }

    layer.on({
        click: onFeatureClick,
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
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

// Layer layerPolygonAll
function onEachFeaturePolygonAll(feature,layer)
{
    popUpFeature(feature,layer);
    layerTooltipFeature(feature,layer);

    L.circleMarker(layer.getBounds().getCenter(),{color: 'black', radius: 3, weight: 1, opacity: 0.8, fillOpacity: 0.6 }).addTo(layerPolygonAll);

    layer.on({
        click: onFeatureClick,
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
}

// Layer layerJurisdAll
function styleJurisdAll(feature)
{
    return {color: 'red', fillColor: 'none', fillOpacity: 0.1};
}

function onEachFeatureJurisd(feature,layer)
{
    updateJurisd(feature.properties.isolabel_ext);

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

// Layer layerCoverAll
function resetHighlightCoverAll(e,layer)
{
    layerCoverAll.resetStyle(e.target);
}

function onEachFeatureCoverAll(feature,layer)
{
    popUpFeature(feature,layer);
    layerTooltipFeature(feature,layer);

    layer.on({
        click: onFeatureClick,
        mouseover: highlightFeature,
        mouseout: resetHighlightCoverAll
    });

    arrayOfSideCoverCell.push(feature.properties.side);
}

function styleCoverAll(feature)
{
    return {color: 'black', fillColor: 'deeppink', fillOpacity: 0.1, weight:1};
}

//


// Layer layerPolygonCurrentGrid
function highlightFeaturePolygonCurrentGrid(e)
{
    const layer = e.target;

    let noTooltip = document.getElementById('notooltip')

    if(noTooltip.checked)
    {
        this.closeTooltip();
        layer.setStyle({
            color: 'deeppink',
            weight:2
        });

        layer.bringToFront();
    }
    else
    {
        this.openTooltip();
    }
}

function filterLayer(feature, layer) {
        return feature.properties.code_subcell;
    }
    
function resetHighlightPolygonCurrentGrid(e,layer)
{
    layerPolygonCurrentGrid.resetStyle(e.target);
}

function stylePolygonCurrentGrid(feature)
{
    let grid = document.getElementById('grid').value

    if(grid.match(/^grid(3|5|9|17|33)$/))
    {
        return {color: 'deeppink', weight:1};
    }
    else
    {
        return {color: 'deeppink', fillColor: 'deeppink', fillOpacity: 0.1, weight:1};
    }
}

function onEachFeaturePolygonCurrentGrid(feature,layer)
{
    const reg = /(...)(?!$)/g
    popUpFeature(feature,layer);
    layerTooltipFeature(feature,layer);

    layer.on({
        click: onFeatureClick,
        mouseover: highlightFeaturePolygonCurrentGrid,
        mouseout: resetHighlightPolygonCurrentGrid
    });
}

//

function afterLoadLayer(featureGroup)
{
    let zoomclick = document.getElementById('zoomclick')
    let zoom = map.getBoundsZoom(featureGroup.getBounds());
    zoomclick.checked ? map.setView(featureGroup.getBounds().getCenter(),map.getZoom()) : map.setView(featureGroup.getBounds().getCenter(),zoom-(zoom < 10 ? 1: (zoom < 20 ? 2: (zoom < 24 ? 3: 4))))
}

function afterLoadCurrent(featureGroup)
{
    // map.fitBounds(featureGroup.getBounds());
    let zoom = map.getBoundsZoom(featureGroup.getBounds());
    map.setView(featureGroup.getBounds().getCenter(),zoom-(zoom < 10 ? 1: (zoom < 20 ? 2: (zoom < 24 ? 3: 4))));
}

function afterLoadJurisdAll(featureGroup,fittobounds=true)
{
    if(fittobounds)
    {
        map.fitBounds(featureGroup.getBounds(),{reset: true});
        map.options.minZoom = map.getZoom();
    }
    else
    {
        map.options.minZoom = map.getBoundsZoom(featureGroup.getBounds());
    }

    map.setMaxBounds(featureGroup.getBounds())
}

function afterLoadJurisdAllCheckLocation(featureGroup,fittobounds=true)
{
    afterLoadJurisdAll(featureGroup,fittobounds)

    getMyLocationJurisd()
}

function afterLoadLayerCoverAll(featureGroup,fittobounds=true)
{
    if(!toggleCoverStatus)
    {
        map.removeLayer(featureGroup);
        toggleCoverStatus = true
    }
    if(fittobounds)
    {
        document.getElementById('level_size').innerHTML = generateSelectLevel(defaultMap.bases[defaultMapBase],defaultMapBase)
    }
}

function afterData(data,layer)
{
    if(data.features.length = 1)
    {
        if(data.features[0].properties.jurisd_base_id)
        {
            checkCountryn(data.features[0].properties.jurisd_base_id,false)
        }

        if(data.features[0].properties.isolabel_ext)
        {
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
                if(getJurisdAfterLoad)
                {
                    getJurisdAfterLoad = false;

                    var uri = uri_base + "/geo:iso_ext:" + data.features[0].properties.short_code.split(/[~]/)[0] + ".json";

                    loadGeojson(uri,[layerJurisdAll],function(e){afterLoadJurisdAll(e,false)},function(e){afterDataGeo(e,data.features[0].properties.scientic_code); });
                    loadGeojson(uri + '/cover',[layerCoverAll], function(e){map.removeLayer(e);},function(e){});
                }

                //var nextURL = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname + window.location.search
                var nextURL = window.location.protocol + "//" + window.location.host + "/" + data.features[0].properties.short_code + window.location.search
                const nextTitle = 'OSM.codes: ' + data.features[0].properties.short_code;
                const nextState = { additionalInformation: 'to canonical.' };

                window.history.pushState(nextState, nextTitle, nextURL);

                document.getElementById('fielddecode').value = data.features[0].properties.short_code.split(/[~]/)[1];

                if(data.features[0].properties.truncated_code)
                {
                    alert("Geocódigo truncado. Número de dígitos excedeu o limite de níveis da grade.");
                }
            }
            else if(data.features[0].properties.code)
            {
                document.getElementById('fielddecode').value = data.features[0].properties.code;
            }
            if(data.features[0].properties.side)
            {
                document.getElementById('level_size').innerHTML = generateSelectLevel2(defaultMap.bases[defaultMapBase],defaultMapBase,data.features[0].properties.side);

                let level = document.getElementById('level_size').value
                let decimals = (level <= 64 ? 5 : 4)

                const center = layer.getBounds().getCenter();
                const { lat, lng } = center;

                document.getElementById('geoUri').innerHTML  = 'geo:' + latRound(lat,decimals) + "," + latRound(lng,decimals) //+ ";u=" + level;
                document.getElementById('fieldencode').value = 'geo:' + latRound(lat)          + "," + latRound(lng)          + ";u=" + document.getElementById('level_size').value;
            }
        }
    }
}

function beforeAddDataLayer(data)
{
//     if(data.features.length = 1)
//         if(!data.features[0].properties.isolabel_ext)
//             if(!data.features[0].properties.index)
//             {
//                 if(data.features[0].properties.short_code)
//                 {
//                     console.log (state.isolabel_ext)
//
//                     if(/*state.isolabel_ext !== '' && */state.isolabel_ext !== data.features[0].properties.short_code.split(/[~]/)[0])
//                     {
//                         console.log("mudar cidade");
//
//                         // var nextURL = window.location.protocol + "//" + window.location.host + "/" + data.features[0].properties.short_code + window.location.search
//                         // const nextTitle = 'OSM.codes: ' + data.features[0].properties.short_code;
//                         // const nextState = { additionalInformation: 'to canonical.' };
//
//                         // window.history.pushState(nextState, nextTitle, nextURL);
//                     }
//                     else
//                     {
//                         state.isolabel_ext = data.features[0].properties.short_code.split(/[~]/)[0];
//                         console.log("mesma cidade")
//                     }
//                 }
//                 else
//                 {
//                     console.log("ERROR. Sem cobertura.");
//                     // alert("ERROR. Sem cobertura.");
//                 }
//             }
}

function afterDataGeo(data,scicode)
{
    if(data.features.length = 1)
    {
        if(data.features[0].properties.side)
        {
            document.getElementById('level_size').innerHTML = generateSelectLevel2(defaultMap.bases[defaultMapBase],defaultMapBase,data.features[0].properties.side);
        }

        document.getElementById('sciCode').innerHTML = '<a href="https://osm.codes/' + defaultMap.isocode + defaultMap.bases[defaultMap.scientificBase].symbol + scicode + '">' + scicode +'</a>';
    }
}

function loadGeojson(uri,arrayLayer,afterLoad,afterData,before=function(e){})
{
    fetch(uri)
    .then(response => {return response.json()})
    .then((data) =>
    {
        before(data);

        arrayLayer[0].clearLayers();

        for (i=0; i < arrayLayer.length; i++)
        {
            arrayLayer[i].addData(data.features);
        }

        afterLoad(arrayLayer[0]);

        afterData(data,arrayLayer[0]);

        fixZOrder(overlays);
    })
    .catch(err => {})
}

var uriApi = ''
var uriApiJurisd = ''
const reg_esp_caracter = /\./

if (pathname.match(/^\/[A-Z]{2}-[A-Z]{1,3}-[A-Z]+$/i))
{
    uriApi = uri.replace(/\/([A-Z]{2}-[A-Z]{1,3}-[A-Z]+)$/i, "/geo:iso_ext:$1.json");

    loadGeojson(uriApi + '/cover',[layerCoverAll], afterLoadLayerCoverAll,afterData);
    loadGeojson(uriApi,[layerJurisdAll],afterLoadJurisdAllCheckLocation,afterData);
}
else if (pathname.match(/\/CO-\d+$/i))
{
    uriApi = uri.replace(/\/CO-(\d+)$/i, "/geo:co-divipola:$1.json");

    loadGeojson(uriApi + '/cover',[layerCoverAll], afterLoadLayerCoverAll,afterData);
    loadGeojson(uriApi,[layerJurisdAll],afterLoadJurisdAllCheckLocation,afterData);
}
else if (pathname.match(/\/BR-\d+$/i))
{
    uriApi = uri.replace(/\/BR-(\d+)$/i, "/geo:br-geocodigo:$1.json");

    loadGeojson(uriApi + '/cover',[layerCoverAll], afterLoadLayerCoverAll,afterData);
    loadGeojson(uriApi,[layerJurisdAll],afterLoadJurisdAllCheckLocation,afterData);
}

else if (pathname.match(/\/(BR-[A-Z]+)$/i))
{
    uriApi = uri.replace(/\/(BR-[A-Z]+)$/i, "/geo:iso_ext:$1.json");

    loadGeojson(uriApi + '/cover',[layerCoverAll], afterLoadLayerCoverAll,afterData);
    loadGeojson(uriApi,[layerJurisdAll],afterLoadJurisdAllCheckLocation,afterData);
}
else
{
    pathname = pathname.replace(reg_esp_caracter,"");

    if (pathname.match(/\/[A-Z]{2}~[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+(,[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+)*$/i))
    {
        uriApi = pathname.replace(/\/([A-Z]{2}~[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+(,[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+)*)$/i, "/geo:osmcodes:$1.json");
        uriApiJurisd = pathname.replace(/\/(([A-Z]{2})~[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+(,[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+)*)$/i, "/geo:iso_ext:$2.json");
    }
    else if (pathname.match(/^\/([A-Z]{2})-\d+(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+$/i))
    {
        uriApi = pathname.replace(/\/(([A-Z]{2})-\d+(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+)$/i, "/geo:osmcodes:$1.json");

        if (pathname.match(/^\/BR-\d+(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+$/i))
        {
            uriApiJurisd = pathname.replace(/\/BR-(\d+)(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+$/i, "/geo:co-divipola:$1.json");
        }
        else if (pathname.match(/^\/CO-\d+(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+$/i))
        {
            uriApiJurisd = pathname.replace(/\/CO-(\d+)(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+$/i, "/geo:co-divipola:$1.json");
        }
    }
    else if (pathname.match(/^\/[A-Z]{2}(-[A-Z]{1,3}-[A-Z]+)(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+$/i))
    {
        uriApi = pathname.replace(/\/([A-Z]{2}(-[A-Z]{1,3}-[A-Z]+)(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+)$/i, "/geo:osmcodes:$1.json");
        uriApiJurisd = pathname.replace(/\/(([A-Z]{2}(-[A-Z]{1,3}-[A-Z]+))(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+)$/i, "/geo:iso_ext:$2.json");
    }
    else if (pathname.match(/^\/geo:.+$/i))
    {
        uriApi = pathname + '.json';
        getJurisdAfterLoad = true;
    }
    else
    {
        uriApi = pathname + '.json';
    }

    uriApi = uri_base + uriApi;
    uriApiJurisd = uri_base + uriApiJurisd;

    if(uriApi !== null && uriApi !== '')
    {
        loadGeojson(uriApi,[layerPolygonCurrent,layerPolygonAll],afterLoadCurrent,afterData,beforeAddDataLayer);
    }

    if(uriApiJurisd !== null && uriApiJurisd !== '')
    {
        loadGeojson(uriApiJurisd,[layerJurisdAll],function(e){afterLoadJurisdAll(e,false)},function(e){});
        loadGeojson(uriApiJurisd + '/cover',[layerCoverAll],function(e){afterLoadLayerCoverAll(e,false)},function(e){});
    }
}

