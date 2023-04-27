var uri_base = "."

var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib = '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>';
var cartoUrl = 'https://{s}.basemaps.cartocdn.com/{id}/{z}/{x}/{y}{r}.png';
var cartoAttr = '<a href="https://carto.com/attributions">CARTO</a>';
var osmAndCartoAttr = osmAttrib + '. ' + cartoAttr;

var openstreetmap = L.tileLayer(osmUrl,   {attribution: osmAttrib,detectRetina: true,minZoom: 0,maxNativeZoom: 19,maxZoom: 25 }),
    grayscale = L.tileLayer(cartoUrl, {id:'light_all', attribution: osmAndCartoAttr,detectRetina: true,maxNativeZoom: 22,maxZoom: 25 });

var baseLayers = {
    'Grayscale': grayscale,
    'OpenStreetMap': openstreetmap };

var layerJurisd = new L.geoJSON(null,{
            style: style,
            onEachFeature: onEachFeature,
        });

var overlays = {
    'Feature': layerJurisd
};

var map = L.map('map',{
    center: [-14.09,-57.57],
    zoom:   4,
    zoomControl: false,
    renderer: L.svg(),
    layers: [grayscale, layerJurisd] });

map.attributionControl.setPrefix(false);
map.addControl(new L.Control.Fullscreen({position:'topright'})); /* https://github.com/Leaflet/Leaflet.fullscreen */

var zoom = L.control.zoom({position:'topright'});
var layers = L.control.layers(baseLayers, overlays,{position:'topright'});
var escala = L.control.scale({position:'bottomright',imperial: false});

zoom.addTo(map);
layers.addTo(map);
escala.addTo(map);

function onEachFeature(feature,layer)
{
    let popupContent = "";
    if (feature.properties.osm_id)
    {
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
    }
    else if (feature.olc)
    {
        popupContent += "olc: " + feature.properties.olc;
    }
    else if (feature.ghs)
    {
        popupContent += "ghs: " + feature.properties.ghs;
    }

    layer.bindPopup(popupContent);
    layer.on({click: onFeatureClick});
}

function style(feature)
{
    if (feature.properties.osm_id)
    {
        return {color: 'red', fillColor: 'none', fillOpacity: 0.1};
    }
}

function onFeatureClick(feature)
{
    //console.log(feature);
}

function afterData(data,layer)
{
    if(data.features.length = 1)
    {
        if(data.features[0].properties.isolabel_ext)
        {
            var nextURL = window.location.protocol + "//" + window.location.host + "/" + data.features[0].properties.isolabel_ext + window.location.search
            const nextTitle = 'OSM.codes: ' + data.features[0].properties.isolabel_ext;
            const nextState = { additionalInformation: 'to canonical.' };

            window.history.pushState(nextState, nextTitle, nextURL);
        }
    }
}

function afterLoadJurisdAll(featureGroup)
{
    map.fitBounds(featureGroup.getBounds(),{reset: true});
    map.options.minZoom = map.getZoom();
    map.setMaxBounds(featureGroup.getBounds());
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

        afterData(data);
    })
    .catch(err => {})
}

var uri = window.location.href;
let pathname = window.location.pathname;

if (pathname.match(/^\/(urn|geo):(lex|ghs|olc):.+$/i))
{
    var uriApi = uri + '.json'

    loadGeojson(uriApi,[layerJurisd],afterLoadJurisdAll,function(e){});
}
