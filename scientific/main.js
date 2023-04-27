var openstreetmap = L.tileLayer(osmUrl,{attribution: osmAttrib,detectRetina: true,minZoom: 0,maxNativeZoom: 19,maxZoom: 25 }),
    grayscale = L.tileLayer(cartoUrl, {id:'light_all', attribution: osmAndCartoAttr,detectRetina: true,maxNativeZoom: 22,maxZoom: 25 });

var baseLayers = {
    'Grayscale': grayscale,
    'OpenStreetMap': openstreetmap };

var layerPolygonCurrent = new L.geoJSON(null, {
            style: style,
            onEachFeature: onEachFeature,
            pointToLayer: pointToLayer,
        });

var layerCenterCurrent = new L.geoJSON(null, {
            style: style,
            onEachFeature: onEachFeature,
            pointToLayer: pointToLayer,
        });

var layerPolygonAll = new L.geoJSON(null,{
            style: style,
            onEachFeature: onEachFeaturePolygonAll,
            pointToLayer: pointToLayer,
        });

var layerCenterAll = new L.geoJSON(null,{
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
    'Current center': layerCenterCurrent,
    'All center': layerCenterAll,
    'Current marker': layerMarkerCurrent,
    'All markers': layerMarkerAll,
    'Covers': layerCoverAll,
    'Jurisdictions': layerJurisdAll
};

var defaultMap;

function checkCountry(string,reset=true)
{
    for(var key in countries)
    {
        let regex = new RegExp("^/?" + key + ".*","i");

        if(regex.test(string) || countries[key].isocoden === string)
        {
            defaultMap = countries[key];
            reset ? resetDef() : '';
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

var map = L.map('map',{
    center: defaultMap.center,
    zoom:   defaultMap.zoom,
    zoomControl: false,
    renderer: L.svg(),
    layers: [grayscale, layerPolygonCurrent, layerCenterCurrent, layerCoverAll, layerJurisdAll] });

var toggleTooltipStatus = false;
var toggleCoverStatus = false;

map.attributionControl.setPrefix(false);
map.addControl(new L.Control.Fullscreen({position:'topleft'})); /* https://github.com/Leaflet/Leaflet.fullscreen */
map.on('click', onMapClick);

var zoom   = L.control.zoom({position:'topleft'});
var layers = L.control.layers(baseLayers, overlays,{position:'topleft'});
var escala = L.control.scale({position:'bottomright',imperial: false});

var decodeGgeohash = L.control({position: 'topleft'});
decodeGgeohash.onAdd = function (map) {
    this.container = L.DomUtil.create('div');
    this.label_field  = L.DomUtil.create('label', '', this.container);
    this.field = L.DomUtil.create('input', '', this.container);
    this.button = L.DomUtil.create('button','leaflet-control-button',this.container);

    this.label_field.for = 'fielddecode';
    this.label_field.innerHTML = 'Grid code: ';

    this.field.type = 'text';
    this.field.placeholder = 'e.g.: ' + defaultMap.bases[defaultMap.scientificBase].placeholderDecode;
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

var encodeGgeohash = L.control({position: 'topleft'});
encodeGgeohash.onAdd = function (map) {
    this.container = L.DomUtil.create('div','leaflet-control-encode');
    this.label_field  = L.DomUtil.create('label', '', this.container);
    this.field = L.DomUtil.create('input', '', this.container);
    this.button = L.DomUtil.create('button','leaflet-control-button',this.container);

    this.label_field.for = 'fieldencode';
    this.label_field.innerHTML = 'Equivalent Geo URI:<br/>';
    this.field.type = 'text';
    this.field.placeholder = 'e.g.: ' + defaultMap.bases[defaultMap.scientificBase].placeholderEncode;
    this.field.id = 'fieldencode';
    this.button.type = 'button';
    this.button.innerHTML= "Encode";

    L.DomEvent.disableScrollPropagation(this.container);
    L.DomEvent.disableClickPropagation(this.container);
    L.DomEvent.on(this.button, 'click', getEncode, this.container);
    L.DomEvent.on(this.field, 'keyup', function(data){if(data.keyCode === 13){getEncode(data);}}, this.container);
    return this.container;
  };

var level = L.control({position: 'topleft'});
level.onAdd = function (map) {
    this.container     = L.DomUtil.create('div');
    this.label_level   = L.DomUtil.create('label', '', this.container);
    this.select_level  = L.DomUtil.create('select', '', this.container);

    this.label_level.for = 'level';
    this.label_level.innerHTML = 'Level: ';
    this.select_level.id = 'level_size';
    this.select_level.name = 'level';
    this.select_level.innerHTML = generateSelectLevel(defaultMap.bases[defaultMap.scientificBase],defaultMap.scientificBase);

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
    L.DomEvent.on(this.button, 'click', resetDef, this.container);

    return this.container; };

zoom.addTo(map);
layers.addTo(map);
escala.addTo(map);
decodeGgeohash.addTo(map);
encodeGgeohash.addTo(map);
level.addTo(map);
clear.addTo(map);

var a = document.getElementById('custom-map-controlsa');
var b = document.getElementById('custom-map-controlsb');
a.appendChild(decodeGgeohash.getContainer());
a.appendChild(encodeGgeohash.getContainer());
a.appendChild(level.getContainer());
b.appendChild(clear.getContainer());

function resetDef()
{
    layerPolygonCurrent.clearLayers();
    layerCenterCurrent.clearLayers();
    layerCenterAll.clearLayers();
    layerPolygonAll.clearLayers();
    layerMarkerCurrent.clearLayers();
    layerMarkerAll.clearLayers();
    map.removeLayer(layerCoverAll); toggleCoverStatus = true
    document.getElementById('fielddecode').value = '';
    document.getElementById('fieldencode').value = '';

    map.setView(defaultMap.center, defaultMap.zoom);
    document.getElementById('level_size').innerHTML = generateSelectLevel(defaultMap.bases[defaultMap.scientificBase],defaultMap.scientificBase);
    document.getElementById('fielddecode').placeholder = 'geocode, e.g.: ' + defaultMap.bases[defaultMap.scientificBase].placeholderDecode;
    document.getElementById('fieldencode').placeholder = 'geo: ' + defaultMap.bases[defaultMap.scientificBase].placeholderEncode;
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
            uri += defaultMap.isocode + defaultMap.bases[defaultMap.scientificBase].symbol
        }

        uri += input + ".json"
        document.getElementById('fieldencode').value = '';

        loadGeojson(uri,[layerPolygonCurrent,layerPolygonAll],afterLoadLayer,afterData);
    }
}

function getEncode(noData)
{
    let input = document.getElementById('fieldencode').value

    if(input !== null && input !== '')
    {
        let level = document.getElementById('level_size').value
        let context = defaultMap.isocode;

        var uri = uri_base + (input.match(/^geo:.*/) ? '/' : '/geo:' )

        if(input.match(/.*;u=.*/))
        {
            let u_value = Number(input.split(';u=')[1])

            if(u_value == 0)
            {
                u_value = levelValues[defaultMap.bases[defaultMap.scientificBase].endLevel]
            }

            uri += input.replace(/(.*;u=).*/i, "$1" +  (u_value > 9 ? Math.round(u_value) : Math.round(u_value*10)/10 ) )
        }
        else
        {
            uri += input + ";u=" + level
        }

        uri += ".json/" + defaultMap.scientificBase

        var uri_ = uri + '/' + context

        document.getElementById('fielddecode').value = '';

        input.match(/^geo:.*/) ? input = input.replace(/^geo:(.*)$/i, "$1") : ''

        var popupContent = "latlng: " + input;
        layerPolygonCurrent.clearLayers();
        layerMarkerCurrent.clearLayers();
        L.marker(input.split(/[;,]/,2)).addTo(layerMarkerCurrent).bindPopup(popupContent);
        L.marker(input.split(/[;,]/,2)).addTo(layerMarkerAll).bindPopup(popupContent);

        loadGeojson(uri_,[layerPolygonCurrent,layerPolygonAll],afterLoadLayer,afterData)
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

function onMapClick(e)
{
    let level = document.getElementById('level_size').value
    let context = defaultMap.isocode;

    var uri = uri_base + "/geo:" + e.latlng['lat'] + "," + e.latlng['lng'] + ";u=" + level + ".json/" + defaultMap.scientificBase + '/' + context
    var popupContent = "latlng: " + e.latlng['lat'] + "," + e.latlng['lng'];

    document.getElementById('fieldencode').value = 'geo:' + latRound(e.latlng['lat']) + "," + latRound(e.latlng['lng']) + ";u=" + level;
    document.getElementById('geoUri').innerHTML = 'geo:' + latRound(e.latlng['lat']) + "," + latRound(e.latlng['lng']) + ";u=" + level;

    layerMarkerCurrent.clearLayers();

    L.marker(e.latlng).addTo(layerMarkerCurrent).bindPopup(popupContent);
    L.marker(e.latlng).addTo(layerMarkerAll).bindPopup(popupContent);

    loadGeojson(uri,[layerPolygonCurrent,layerPolygonAll],afterLoadLayer,afterData)
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

    layer.bindTooltip(layerTooltip,{ permanent:toggleTooltipStatus,direction:'auto',className:'tooltipbase16h1c'});
}

function highlightFeature(e)
{
    this.openTooltip();
}

function resetHighlight(e,layer)
{
    layerPolygonCurrent.resetStyle(e.target);
    layerPolygonAll.resetStyle(e.target);
}

function onFeatureClick(feature)
{
    map.fitBounds(feature.target.getBounds());
}

function onEachFeature(feature,layer)
{
    popUpFeature(feature,layer);
    layerTooltipFeature(feature,layer);

    layerCenterCurrent.clearLayers();

    L.circleMarker(layer.getBounds().getCenter(),{color: 'black', radius: 3, weight: 1, opacity: 0.8, fillOpacity: 0.6 }).addTo(layerCenterCurrent);

    if(feature.properties.code)
    {
        document.getElementById('sciCode').innerHTML = (feature.properties.code).replace(/(...)(?!$)/g,'$1.');
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

    L.circleMarker(layer.getBounds().getCenter(),{color: 'black', radius: 3, weight: 1, opacity: 0.8, fillOpacity: 0.6 }).addTo(layerCenterAll);

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

function afterLoadLayer(featureGroup)
{
    let zoom = map.getBoundsZoom(featureGroup.getBounds());
    map.setView(featureGroup.getBounds().getCenter(),zoom-(zoom < 10 ? 1: (zoom < 20 ? 2: (zoom < 24 ? 3: 4))));
}

function afterLoadJurisdAll(featureGroup,fittobounds=true,setmaxbounds=true)
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

    if(setmaxbounds)
    {
        map.setMaxBounds(featureGroup.getBounds())
    }
}

function afterLoadLayerCoverAll(featureGroup,fittobounds=true,setmaxbounds=true)
{
    if(toggleCoverStatus)
    {
        afterLoadJurisdAll(featureGroup,fittobounds,setmaxbounds)
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
            checkCountry(data.features[0].properties.jurisd_base_id,false)
        }

        if (!data.features[0].properties.index)
        {
            if(data.features[0].properties.code)
            {
                var nextURL = uri_base + "/" + defaultMap.isocode + defaultMap.bases[defaultMap.scientificBase].symbol + data.features[0].properties.code
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
                document.getElementById('level_size').innerHTML = generateSelectLevel2(defaultMap.bases[defaultMap.scientificBase],defaultMap.scientificBase,data.features[0].properties.side);

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

var uriApi = ''
var uriApiJurisd = ''

if (pathname.match(/\/[A-Z]{2}\+[0123456789ABCDEFGHJKLMNPQRSTVZ]([0123456789ABCDEF]*([GQHMRVJKNPSTZY])?)?(,[0123456789ABCDEFGHJKLMNPQRSTVZ]([0123456789ABCDEF]*([GQHMRVJKNPSTZY])?)?)*$/i))
{
    uriApi = uri.replace(/\/([A-Z]{2}\+[0123456789ABCDEFGHJKLMNPQRSTVZ]([0123456789ABCDEF]*([GQHMRVJKNPSTZY])?)?(,[0123456789ABCDEFGHJKLMNPQRSTVZ]([0123456789ABCDEF]*([GQHMRVJKNPSTZY])?)?)*)$/i, "/geo:osmcodes:$1.json");
    uriApiJurisd = uri.replace(/\/(([A-Z]{2})\+[0123456789ABCDEFGHJKLMNPQRSTVZ]([0123456789ABCDEF]*([GQHMRVJKNPSTZY])?)?(,[0123456789ABCDEFGHJKLMNPQRSTVZ]([0123456789ABCDEF]*([GQHMRVJKNPSTZY])?)?)*)$/i, "/geo:iso_ext:$2.json");
}
else if (pathname.match(/^\/geo:.+$/i))
{
    uriApi = uri + '.json';
    getJurisdAfterLoad = true;
}

if(uriApi !== null && uriApi !== '')
{
    loadGeojson(uriApi,[layerPolygonCurrent,layerPolygonAll],afterLoadLayer,afterData);
}

if(uriApiJurisd !== null && uriApiJurisd !== '')
{
    loadGeojson(uriApiJurisd,[layerJurisdAll],function(e){afterLoadJurisdAll(e,false,false)},afterData);
    loadGeojson(uriApiJurisd + '/cover/' + defaultMap.scientificBase,[layerCoverAll],function(e){afterLoadLayerCoverAll(e,false,false)},function(e){});
}
