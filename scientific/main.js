//var uri_base = "https://osm.codes"
var uri_base = "."

var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib = '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>';
var mapboxUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
var mapboxAttr = '<a href="https://www.mapbox.com">Mapbox</a>';
var cartoUrl = 'https://{s}.basemaps.cartocdn.com/{id}/{z}/{x}/{y}{r}.png';
var cartoAttr = '<a href="https://carto.com/attributions">CARTO</a>';
var osmAndMapboxAttr = osmAttrib + '. ' + mapboxAttr;
var osmAndCartoAttr = osmAttrib + '. ' + cartoAttr;

var openstreetmap = L.tileLayer(osmUrl,{attribution: osmAttrib,detectRetina: true,minZoom: 0,maxNativeZoom: 19,maxZoom: 25 }),
    grayscale = L.tileLayer(cartoUrl, {id:'light_all', attribution: osmAndCartoAttr,detectRetina: true,maxNativeZoom: 22,maxZoom: 25 }),
    // grayscale = L.tileLayer(mapboxUrl,{id:'mapbox/light-v10',attribution: osmAndMapboxAttr,detectRetina: true,maxNativeZoom: 22,maxZoom: 25 }),
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

var layerPolygonCurrentGrid = new L.geoJSON(null, {
            style: stylePolygonCurrentGrid,
            onEachFeature: onEachFeaturePolygonCurrentGrid,
            pointToLayer: pointToLayer,
            filter: filterLayer,
        });

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
    'Grid cells': layerPolygonCurrentGrid,
};

var levelSize = [1048576,741455.2,524288,370727.6,262144,185363.8,131072,92681.9,65536,46340.95,32768,23170.48,16384,11585.24,8192,5792.62,4096,2896.31,2048,1448.15,1024,724.08,512,362.04,256,181.02,128,90.51,64,45.25,32,22.63,16,11.31,8,5.66,4,2.83,2,1.41,1];

var levelValues =  [600000,400000,300000,200000,150000,100000,75000,50000,30000,25000,19000,13000,9000,6000,4000,3000,2000,1500,1200,700,600,400,300,200,150,100,70,50,30,20,15,12,8,6,4,3,2,1.5,1,0.7,0.5];

var countries_common = {
    softwareVersions: ['gridMap-draftPages/v0.1.0'],
}

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
        softwareVersions: ['BR_new/v0.1.0'],
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
        softwareVersions: ['CO_new/v0.1.0'],
        bases:
        {
            base32:
            {
                iniLevel: 2,
                endLevel: 37,
                modLevel: 5,
                iniDigit: 1,
                levelDefault: 37,
                symbol: '~',
                placeholderDecode: '3D5',
                placeholderEncode: '3.5,-72.3;u=10',
                placeholderList: '3D5,3D4,2',
                selectGrid: [32],
            },
            base16h:
            {
                iniLevel: 2,
                endLevel: 40,
                modLevel: 1,
                iniDigit: 1,
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
        softwareVersions: ['EC_new/v0.1.0'],
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
        softwareVersions: ['UY_new/v0.1.0'],
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
var defaultMapBase = defaultMap.scientificBase;

function generateSoftwareVersions()
{
    let html = '';

    for (let i = 0; i < (countries_common['softwareVersions']).length; i++)
    {
        html += '<a href="https://git.osm.codes/' + ((countries_common['softwareVersions'])[i]).replace(/(\/)/i, "/releases/tag/" ) +'">' + (countries_common['softwareVersions'])[i] + '</a> '
    }

    for (let i = 0; i < defaultMap.softwareVersions.length; i++)
    {
        html += '<a href="https://git.osm.codes/' + (defaultMap.softwareVersions[i]).replace(/(\/)/i, "/releases/tag/" ) +'">' + defaultMap.softwareVersions[i] + '</a> '
    }

    if (document.getElementById('swVersions'))
    {
        document.getElementById('swVersions').innerHTML = html
    }
}

function checkCountry(string,togglecountry=true)
{
    for(var key in countries)
    {
        let regex = new RegExp("^/?" + key + ".*","i");

        if(regex.test(string))
        {
            defaultMap = countries[key];
            defaultMapBase = defaultMap.scientificBase;
            togglecountry ? toggleCountry() : '';
            generateSoftwareVersions();
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
            defaultMapBase = defaultMap.scientificBase;
            togglecountry ? toggleCountry() : '';
            generateSoftwareVersions();
            break;
        }
    }
}

var map = L.map('map',{
    center: defaultMap.center,
    zoom:   defaultMap.zoom,
    zoomControl: false,
    renderer: L.svg(),
    layers: [grayscale, layerPolygonCurrent, layerPolygonCurrentGrid, layerPolygonAll, layerCoverAll, layerJurisdAll] });

var toggleTooltipStatus = false;
var toggleCoverStatus = false;

map.attributionControl.setPrefix(false);
map.addControl(new L.Control.Fullscreen({position:'topleft'})); /* https://github.com/Leaflet/Leaflet.fullscreen */
map.on('zoom', function(e){defaultMap.current_zoom = map.getZoom();});
map.on('click', onMapClick);
map.on('zoomend', showZoomLevel);
showZoomLevel();

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
    // this.checkbox  = L.DomUtil.create('input', '', this.container);

    // this.label.for = 'jcover';
    // this.label.innerHTML = 'Cover: ';
    // this.checkbox.id = 'jcover';
    // this.checkbox.type = 'checkbox';
    // this.checkbox.checked = false;

    this.field.type = 'text';
    this.field.placeholder = 'e.g.: ' + defaultMap.jurisdictionPlaceholder;
    this.field.id = 'fieldjurisdiction';
    this.button.type = 'button';
    this.button.innerHTML= "Jurisdiction";

    L.DomEvent.disableScrollPropagation(this.button);
    L.DomEvent.disableClickPropagation(this.button);
    L.DomEvent.disableScrollPropagation(this.field);
    L.DomEvent.disableClickPropagation(this.field);
    // L.DomEvent.disableScrollPropagation(this.checkbox);
    // L.DomEvent.disableClickPropagation(this.checkbox);
    L.DomEvent.on(this.button, 'click', getJurisdiction, this.container);
    L.DomEvent.on(this.field, 'keyup', function(data){if(data.keyCode === 13){getJurisdiction(data);}}, this.container);

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

var searchDecodeList = L.control({position: 'topleft'});
searchDecodeList.onAdd = function (map) {
    this.container = L.DomUtil.create('div');
    this.search    = L.DomUtil.create('textarea', '', this.container);
    this.button    = L.DomUtil.create('button','leaflet-control-button',this.container);

    this.search.placeholder = 'list geocodes, e.g.: ' + defaultMap.bases[defaultMapBase].placeholderList;
    this.search.id = 'fielddecodelist';
    this.button.type = 'button';
    this.button.innerHTML= "Decode";

    L.DomEvent.disableScrollPropagation(this.button);
    L.DomEvent.disableClickPropagation(this.button);
    L.DomEvent.disableScrollPropagation(this.search);
    L.DomEvent.disableClickPropagation(this.search);
    L.DomEvent.on(this.button, 'click', getDecodeList, this.container);
    //L.DomEvent.on(this.search, 'keyup', function(data){if(data.keyCode === 13){getDecodeList(data);}}, this.container);

    return this.container; };

var encodeGgeohash = L.control({position: 'topleft'});
encodeGgeohash.onAdd = function (map) {
    this.container = L.DomUtil.create('div','leaflet-control-encode');
    this.label_field  = L.DomUtil.create('label', '', this.container);
    this.field = L.DomUtil.create('input', '', this.container);
    this.button = L.DomUtil.create('button','leaflet-control-button',this.container);

    this.label_field.for = 'fieldencode';
    this.label_field.innerHTML = 'Equivalent Geo URI:<br/>';
    this.field.type = 'text';
    this.field.placeholder = 'e.g.: ' + defaultMap.bases[defaultMapBase].placeholderEncode;
    this.field.id = 'fieldencode';
    this.button.type = 'button';
    this.button.innerHTML= "Encode";

    L.DomEvent.disableScrollPropagation(this.container);
    L.DomEvent.disableClickPropagation(this.container);
    L.DomEvent.on(this.button, 'click', getEncode, this.container);
    L.DomEvent.on(this.field, 'keyup', function(data){if(data.keyCode === 13){getEncode(data);}}, this.container);
    return this.container;
  }; // \onAdd(map)

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

var toggleCover = L.control({position: 'topleft'});
toggleCover.onAdd = function (map) {
    this.container = L.DomUtil.create('div');
    this.button    = L.DomUtil.create('button','leaflet-control-button',this.container);

    this.button.type = 'button';
    this.button.innerHTML= "Cover";

    L.DomEvent.disableScrollPropagation(this.button);
    L.DomEvent.disableClickPropagation(this.button);
    L.DomEvent.on(this.button, 'click', toggleCoverLayers, this.container);

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

zoom.addTo(map);
layers.addTo(map);
escala.addTo(map);
// decodeJurisdiction.addTo(map);
decodeGgeohash.addTo(map);
encodeGgeohash.addTo(map);
level.addTo(map);
clear.addTo(map);
toggleTooltip.addTo(map);
toggleCover.addTo(map);
searchDecodeList.addTo(map);
noTooltip.addTo(map);
zoomClick.addTo(map);

var a = document.getElementById('custom-map-controlsa');
var b = document.getElementById('custom-map-controlsb');
// a.appendChild(decodeJurisdiction.getContainer());
a.appendChild(decodeGgeohash.getContainer());
a.appendChild(encodeGgeohash.getContainer());
a.appendChild(level.getContainer());
a.appendChild(searchDecodeList.getContainer());
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
    document.getElementById('fielddecodelist').value= '';
}

function clearAll()
{
    clearAllLayers();

    toggleCountry()
    map.setView(defaultMap.center, defaultMap.zoom);
}

function toggleCountry()
{
    clearAllLayers();

    defaultMapBase = defaultMap.defaultBase;

    document.getElementById('level_size').innerHTML = generateSelectLevel(defaultMap.bases[defaultMapBase],defaultMapBase);
    document.getElementById('grid').innerHTML = generateSelectGrid(defaultMap.bases[defaultMapBase].selectGrid);

    document.getElementById('fielddecode').placeholder = 'geocode, e.g.: ' + defaultMap.bases[defaultMapBase].placeholderDecode;
    document.getElementById('fieldencode').placeholder = 'geo: ' + defaultMap.bases[defaultMapBase].placeholderEncode;
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

function generateSelectGrid(grids)
{
    let htmlA = '';
    let htmlB = '';

    for (let i = 0; i < grids.length; i++)
    {
        htmlA += '<option value="grid' +  grids[i]    + '">' + grids[i] + ' grid</option>'
        htmlB += '<option value="grid' + (grids[i]+1) + '">' + grids[i] + ' points</option>'
    }

    return '<option value="">Cell</option>' + htmlA + htmlB
}

function generateSelectLevel(base,baseValue)
{
    let html = '';

    let m=0;

    for (let i = base.iniLevel, j=0; i < levelValues.length; i+=base.modLevel, j++)
    {
        m = (j == 0 ? base.iniDigit : ((j%4)-1 == 0 ? m+1 : m) )

        html += '<option value="' + levelValues[i] + '">L' + (0.5*j*base.modLevel).toString() + (baseValue == 'base32' ? ' (' + (base.iniDigit+j) + 'd) (' : ( (baseValue == 'base16h' || baseValue == 'base16h1c') ? ' (' + m + 'd) (' : ' (') ) + ((levelSize[i]<1000)? Math.round(levelSize[i]*100.0)/100 : Math.round(levelSize[i]*100.0/1000)/100) + ((levelSize[i]<1000)? 'm': 'km') + ')</option>'
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

        html += '<option value="' + levelValues[i] + (Math.floor(size) <= levelSize[i] ? '" selected>' : '">') + 'L' + (0.5*j*base.modLevel).toString() + (baseValue == 'base32' ? ' (' + (base.iniDigit+j) + 'd) (' : ( (baseValue == 'base16h' || baseValue == 'base16h1c') ? ' (' + m + 'd) (' : ' (') ) + ((levelSize[i]<1000)? Math.round(levelSize[i]*100.0)/100 : Math.round(levelSize[i]*100.0/1000)/100) + ((levelSize[i]<1000)? 'm': 'km') + ')</option>'
    }

    return html
}

function getDecode(data)
{
    let input = document.getElementById('fielddecode').value

    if(input !== null && input !== '')
    {
        var uri = uri_base + "/geo:osmcodes:"

        let regex = new RegExp("^" + defaultMap.isocode + "[+].*","i");

        if(!regex.test(input))
        {
            uri += defaultMap.isocode + defaultMap.bases[defaultMapBase].symbol
        }

        uri += input + ".json"
        document.getElementById('fieldencode').value = '';

        loadGeojson(uri,[layerPolygonCurrent,layerPolygonAll],afterLoadLayer,afterData);
    }
}

function getDecodeList(data)
{
    let input = document.getElementById('fielddecodelist').value;

    if(input !== null && input !== '')
    {
        var uri = uri_base + "/geo:osmcodes:" + defaultMap.isocode + defaultMap.bases[defaultMapBase].symbol + sortAndRemoveDuplicates(input) + ".json"

        loadGeojson(uri,[layerPolygonCurrent,layerPolygonAll],afterLoadLayer,afterData);
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
        // let uri = uri_base + "/geo:iso_ext:" + input + '.json/cover' + (base == 'base16h' ? '/base16h' : (base == 'base16h1c' ? '/base16h1c' : ''));

        // loadGeojson(uri,[layerCoverAll],afterLoadLayer,afterData);
        document.getElementById('fieldjurisdiction').value = '';

        uri = uri_base + "/geo:iso_ext:" + input + ".json";
        // loadGeojson(uri,[layerJurisdAll],afterLoadLayer,afterData);

    loadGeojson(uri,[layerJurisdAll],function(e){afterLoadJurisdAll(e,false)},afterData);
    loadGeojson(uri + '/cover/' + defaultMap.scientificBase,[layerCoverAll],function(e){afterLoadLayerCoverAll(e,false)},function(e){});

        // checkCountry(input);
    }
}

function getEncode(noData)
{
    let input = document.getElementById('fieldencode').value

    if(input !== null && input !== '')
    {
        let level = document.getElementById('level_size').value
        let grid = document.getElementById('grid').value
        let context = defaultMap.isocode;

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
        loadGeojson(uri_,[layerPolygonCurrent,layerPolygonAll],afterLoadLayer,afterData)

        if(grid !== '')
        {
            loadGeojson(uriGrid,[layerPolygonCurrentGrid],afterLoadLayer,afterData)
        }
    }
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

function latRound(x)
{
    return Number.parseFloat(x).toFixed(6);
    // 5 or 6 decimal digits for 1 meter, see https://gis.stackexchange.com/a/208739/7505
}

function showZoomLevel()
{
    document.getElementById('zoom').innerHTML = map.getZoom();
}

function onMapClick(e)
{
    let level = document.getElementById('level_size').value
    let grid = document.getElementById('grid').value
    let context = defaultMap.isocode;

    var base = defaultMapBase
    var uri = uri_base + "/geo:" + e.latlng['lat'] + "," + e.latlng['lng'] + ";u=" + level + ".json" + (base != 'base32' ? '/' + base : '') + '/' + context
    var uriWithGrid = uri_base + "/geo:" + e.latlng['lat'] + "," + e.latlng['lng'] + ";u=" + level + ".json" + (base != 'base32' ? '/' + base : '') + (grid ? '/' + grid : '') + '/' + context
    var popupContent = "latlng: " + e.latlng['lat'] + "," + e.latlng['lng'];

    document.getElementById('fieldencode').value = 'geo:' + latRound(e.latlng['lat']) + "," + latRound(e.latlng['lng']) + ";u=" + level;
    // or e.latlng['lat'].toPrecision(8)

    document.getElementById('geoUri').innerHTML = 'geo:' + latRound(e.latlng['lat']) + "," + latRound(e.latlng['lng']) + ";u=" + level;

    layerMarkerCurrent.clearLayers();

    L.marker(e.latlng).addTo(layerMarkerCurrent).bindPopup(popupContent);
    L.marker(e.latlng).addTo(layerMarkerAll).bindPopup(popupContent);

    loadGeojson(uri,[layerPolygonCurrent,layerPolygonAll],afterLoadLayer,afterData)

    if(grid !== '')
    {
        loadGeojson(uriWithGrid,[layerPolygonCurrentGrid],afterLoadLayer,afterData)
    }
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

    console.log(feature.properties.code)
    var popupContent = "";

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

    layer.bindPopup(popupContent);
}

function layerTooltipFeature(feature,layer)
{
    if(feature.properties.code_subcell)
    {
        var layerTooltip = feature.properties.code_subcell;
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
    popUpFeature(feature,layer);
    layerTooltipFeature(feature,layer);

    L.circleMarker(layer.getBounds().getCenter(),{color: 'black', radius: 3, weight: 1, opacity: 0.8, fillOpacity: 0.6 }).addTo(layerPolygonCurrent);

    if(feature.properties.code)
    {
        document.getElementById('sciCode').innerHTML = (feature.properties.code).replace(/(...)(?!$)/g,'$1.');

        let listBar = document.getElementById('fielddecodelist');

        listBar.value = sortAndRemoveDuplicates((listBar.value ? listBar.value + ',': '') + feature.properties.code)
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

function afterLoadLayerCoverAll(featureGroup,fittobounds=true)
{
    if(toggleCoverStatus)
    {
        afterLoadJurisdAll(featureGroup,fittobounds)
    }
    else
    {
        map.removeLayer(featureGroup);
        toggleCoverStatus = true
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

        if (!data.features[0].properties.index)
        {
            if(data.features[0].properties.code)
            {
                var nextURL = window.location.protocol + "//" + window.location.host + "/" + defaultMap.isocode + defaultMap.bases[defaultMapBase].symbol + data.features[0].properties.code + window.location.search
                const nextTitle = 'OSM.codes: ' + data.features[0].properties.code;
                const nextState = { additionalInformation: 'to canonical.' };

                window.history.pushState(nextState, nextTitle, nextURL);

                document.getElementById('fielddecode').value = data.features[0].properties.code;

                if(data.features[0].properties.truncated_code)
                {
                    alert("Geocódigo truncado. Número de dígitos excedeu o limite de níveis da grade.");
                }
            }

            if(data.features[0].properties.side)
            {
                document.getElementById('level_size').innerHTML = generateSelectLevel2(defaultMap.bases[defaultMapBase],defaultMapBase,data.features[0].properties.side);

                const center = layer.getBounds().getCenter();
                const { lat, lng } = center;
                const stringgeo = 'geo:' + latRound(lat) + "," + latRound(lng) + ";u=" + document.getElementById('level_size').value;

                document.getElementById('geoUri').innerHTML = stringgeo;
                document.getElementById('fieldencode').value = stringgeo;
            }
        }
    }
}

function loadGeojson(uri,arrayLayer,afterLoad,afterData)
{
    fetch(uri)
    .then(response => {return response.json()})
    .then((data) =>
    {
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

function toggleCoverLayers()
{
//     !this.checked ? map.removeLayer(layerCoverAll) : map.addLayer(layerCoverAll) ;
    toggleCoverStatus ? map.addLayer(layerCoverAll) : map.removeLayer(layerCoverAll);
    fixZOrder(overlays);
    toggleCoverStatus ? toggleCoverStatus = false : toggleCoverStatus = true;
}


var uriApi = ''
var uriApiJurisd = ''

if (pathname.match(/\/base16\/grid/))
{
    uriApi = uri.replace(/(\/base16\/grid)/, ".json$1");
}
else if (pathname.match(/(\/base16h)?\/grid/))
{
    uriApi = uri.replace(/((\/base16h)?\/grid)/, ".json$1");
}
else if (pathname.match(/\/[A-Z]{2}\+[0123456789ABCDEFGHJKLMNPQRSTVZ]([0123456789ABCDEF]*([GHJKLMNPQRSTVZ])?)?(,[0123456789ABCDEFGHJKLMNPQRSTVZ]([0123456789ABCDEF]*([GHJKLMNPQRSTVZ])?)?)*$/i))
{
    uriApi = uri.replace(/\/([A-Z]{2}\+[0123456789ABCDEFGHJKLMNPQRSTVZ]([0123456789ABCDEF]*([GHJKLMNPQRSTVZ])?)?(,[0123456789ABCDEFGHJKLMNPQRSTVZ]([0123456789ABCDEF]*([GHJKLMNPQRSTVZ])?)?)*)$/i, "/geo:osmcodes:$1.json");
    uriApiJurisd = uri.replace(/\/(([A-Z]{2})\+[0123456789ABCDEFGHJKLMNPQRSTVZ]([0123456789ABCDEF]*([GHJKLMNPQRSTVZ])?)?(,[0123456789ABCDEFGHJKLMNPQRSTVZ]([0123456789ABCDEF]*([GHJKLMNPQRSTVZ])?)?)*)$/i, "/geo:iso_ext:$2.json");
}
else if (pathname.match(/^\/geo:.+$/i))
{
    uriApi = uri + '.json';
    getJurisdAfterLoad = true;
}

if(uriApi !== null && uriApi !== '')
{
    loadGeojson(uriApi,[layerPolygonCurrent,layerPolygonAll],afterLoadCurrent,afterData);
}

if(uriApiJurisd !== null && uriApiJurisd !== '')
{
    loadGeojson(uriApiJurisd,[layerJurisdAll],function(e){afterLoadJurisdAll(e,false)},afterData);
    loadGeojson(uriApiJurisd + '/cover/' + defaultMap.scientificBase,[layerCoverAll],function(e){afterLoadLayerCoverAll(e,false)},function(e){});
}
