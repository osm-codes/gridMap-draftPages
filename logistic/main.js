function changeLevel_byDigits(x)
{
    let input = document.getElementById('fielddecode').value

    if (input.length > 0)
    {
        if (x>0)
        {
            document.getElementById('fielddecode').value = input + '7';
            getDecode();
        }
        else if (x < 0 && input.length > 1)
        {
            document.getElementById('fielddecode').value = input.substring(0,input.length-1);
            getDecode();
        }
        else
        {
            alert('Check code or level limits');
        }
    }
    else
    {
        alert('Click a point first.');
    }
}

//////////////

function sel_jurL1(abbrev)
{
    if (abbrev>'')
    {
        let jL2dom = document.getElementById('sel_jurL2');
        let s = '<option value="">- opt -</option>'
        for ( var i of Object.keys(jurisdictions[abbrev]) )
            s += '<option value="' + i + '">' + (abbrev != 'CO' ? i : jurisdictions[abbrev][i]['name'])
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

    if(state != '')
    {
        for ( var i of jurisdictions[country][state]['mun'] )
            s += '<option>'+i
    }
    jL3dom.innerHTML=s
}

function sel_jurL3(abbrev)
{
    // let country = document.getElementById('sel_jurL1').value;
    let country = defaultMap.isocode;
    let state = document.querySelector('#sel_jurL2').value;
    let jL3dom = document.getElementById('sel_jurL3').value;
    if(jL3dom != '' && state != '')
    {
        window.location.href = uri_base + '/' + country + '-' + state + '-' + document.getElementById('sel_jurL3').value;
    }
}

function latRound(x,maxDigits=6) {
  return Number.parseFloat(x).toFixed(maxDigits);
  // 5 or 6 decimal digits for 1 meter, see https://gis.stackexchange.com/a/208739/7505
}

function updateJurisd(jurisd)
{
    document.getElementById('sel_jurL1').innerHTML = jurisd.split("-",3)[0];

    let s = '<option value="">- opt -</option>'
    for ( var i of Object.keys(jurisdictions[jurisd.split("-",3)[0]]) )
        // s += '<option' + (jurisd.split("-",3)[1] == i ? ' selected>' : '>') +i

        s += '<option value="' + i + '"' + (jurisd.split("-",3)[1] == i ? ' selected>' : '>') + (jurisd.split("-",3)[0] != 'CO' ? i :   jurisdictions[jurisd.split("-",3)[0]][i]['name'])

    document.getElementById('sel_jurL2').innerHTML=s

    s = '<option value="">- City -</option>'
    for ( var i of jurisdictions[jurisd.split("-",3)[0]][jurisd.split("-",3)[1]]['mun'] )
        s += '<option' + (jurisd.split("-",3)[2] == i ? ' selected>' : '>') +i
    document.getElementById('sel_jurL3').innerHTML=s
}

var openstreetmap = L.tileLayer(osmUrl,{attribution: osmAttrib,detectRetina: true,minZoom: 0,maxNativeZoom: 19,maxZoom: 25 }),
    grayscale = L.tileLayer(cartoUrl, {id:'light_all', attribution: osmAndCartoAttr,detectRetina: true,maxNativeZoom: 22,maxZoom: 25 });

var baseLayers = {
    'Grayscale': grayscale,
    'OpenStreetMap': openstreetmap};

var layerPolygonCurrent = new L.geoJSON(null, {
            style: style,
            onEachFeature: onEachFeature,
            pointToLayer: pointToLayer,
        });

var layerPolygonAll = new L.geoJSON(null,{
            style: style,
            onEachFeature: onEachFeaturePolygonAll,
            pointToLayer: pointToLayer,
        });

var layerOlcGhsCurrent = new L.geoJSON(null, {
            style: styleOlcGhs,
            onEachFeature: onEachFeatureOlcGhs,
            pointToLayer: pointToLayer,
        });

var layerOlcGhsAll = new L.geoJSON(null,{
            style: styleOlcGhs,
            onEachFeature: onEachFeatureOlcGhsAll,
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
    'Current Ggeohash': layerPolygonCurrent,
    'All Ggeohash': layerPolygonAll,
    'Current OLC or GHS': layerOlcGhsCurrent,
    'All OLC or GHS': layerOlcGhsAll,
    'Current marker': layerMarkerCurrent,
    'All markers': layerMarkerAll,
    'Covers': layerCoverAll,
    'Jurisdictions': layerJurisdAll,
};

var defaultMap = countries['BR'];
var sizeCurrentCell = 0;
var centerCurrentCell;
var getJurisdAfterLoad = false;
var jurisdIsMultipolygon = false;
var size_shortestprefix = 0;
var getCover = true;

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
pathname = pathname.split(/[#]/)[0]

if (pathname.match(/^\/[A-Z]{2}.+$/i))
{
    checkCountry(pathname,false)
}

var map = L.map('map',{
    center: defaultMap.center,
    zoom:   defaultMap.zoom,
    maxBoundsViscocity: 1,
    zoomControl: false,
    renderer: L.svg(),
    layers: [grayscale, layerPolygonCurrent, layerPolygonAll, layerCoverAll, layerJurisdAll,layerOlcGhsCurrent,layerOlcGhsAll] });

var toggleTooltipStatus = false;

map.attributionControl.setPrefix(false);
map.addControl(new L.Control.Fullscreen({position:'topleft'})); /* https://github.com/Leaflet/Leaflet.fullscreen */
map.on('click', onMapClick);

var zoom   = L.control.zoom({position:'topleft'});
var layers = L.control.layers(baseLayers, overlays,{position:'topleft'});
var escala = L.control.scale({position:'bottomright',imperial: false});

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
    this.field.placeholder = 'e.g.: ' + defaultMap.bases[defaultMap.postalcodeBase].placeholderDecode;
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
    this.span = L.DomUtil.create('span','', this.container);
    this.button2 = L.DomUtil.create('button','getGeo-button',this.container);
    this.span2 = L.DomUtil.create('span','', this.container);
    this.label_tcode    = L.DomUtil.create('label', '', this.container);
    this.select_tcode   = L.DomUtil.create('select', '', this.container);

    this.label_tcode.for = 'tcode';
    this.label_tcode.innerHTML = '';
    this.select_tcode.id = 'tcode';
    this.select_tcode.name = 'tcode';
    this.select_tcode.innerHTML = '<option value="">OSMcode</option><option value="olc">OLC</option><option value="ghs">GHS</option><option value="ghs64">GHS64</option>'

    this.label_field.for = 'fieldencode';
    this.label_field.innerHTML = 'Equivalent Geo URI:<br/>';
    this.field.type = 'text';
    this.field.placeholder = 'e.g.: ' + defaultMap.bases[defaultMap.postalcodeBase].placeholderEncode;
    this.field.id = 'fieldencode';
    this.button.type = 'button';
    this.button.innerHTML= "Encode";

    this.span.innerHTML= " or ";
    this.span2.innerHTML= " or ";

    this.button2.type = 'button';
    this.button2.innerHTML= "My Location";

    L.DomEvent.disableScrollPropagation(this.container);
    L.DomEvent.disableClickPropagation(this.container);
    L.DomEvent.on(this.button, 'click', getEncode, this.container);
    L.DomEvent.on(this.button2, 'click', getMyLocation, this.container);
    L.DomEvent.on(this.field, 'keyup', function(data){if(data.keyCode === 13){getEncode(data);}}, this.container);
    return this.container;
  };

var level = L.control({position: 'topleft'});
level.onAdd = function (map) {
    this.container     = L.DomUtil.create('div');
    this.label_level   = L.DomUtil.create('label', '', this.container);
    this.select_level  = L.DomUtil.create('select', '', this.container);

    this.label_level.for = 'level';
    this.label_level.innerHTML = '<a href="https://wiki.addressforall.org/doc/osmc:Viz/Navega%C3%A7%C3%A3o" target="_help">Level</a>: ';
    this.select_level.id = 'level_size';
    this.select_level.name = 'level';

    L.DomEvent.disableScrollPropagation(this.container);
    L.DomEvent.disableClickPropagation(this.container);

    return this.container; };

var clear = L.control();
clear.onAdd = function (map) {
    this.container = L.DomUtil.create('div');
    this.button    = L.DomUtil.create('button','leaflet-control-button',this.container);

    this.button.type = 'button';
    this.button.innerHTML= "Clear all";

    L.DomEvent.disableScrollPropagation(this.button);
    L.DomEvent.disableClickPropagation(this.button);
    L.DomEvent.on(this.button, 'click', resetDef, this.container);

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
    this.button.innerHTML= "Coverage";

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

var keepPreviousClick = L.control({position: 'topleft'});
keepPreviousClick.onAdd = function (map) {
    this.container = L.DomUtil.create('div');
    this.label     = L.DomUtil.create('label', '', this.container);
    this.checkbox  = L.DomUtil.create('input', '', this.container);

    this.label.for= 'keepclick';
    this.label.innerHTML= 'Keep previous clicks: ';
    this.checkbox.id = 'keepclick';
    this.checkbox.type = 'checkbox';
    this.checkbox.checked = true;

    L.DomEvent.disableScrollPropagation(this.container);
    L.DomEvent.disableClickPropagation(this.container);
    L.DomEvent.on(this.checkbox, 'click', toggleKeepClick, this.container);

    return this.container; };

var noTooltip = L.control({position: 'topleft'});
noTooltip.onAdd = function (map) {
    this.container = L.DomUtil.create('div');
    this.label     = L.DomUtil.create('label', '', this.container);
    this.checkbox  = L.DomUtil.create('input', '', this.container);

    this.label.for= 'notooltip';
    this.label.innerHTML= 'No tooltip: ';
    this.checkbox.id = 'notooltip';
    this.checkbox.type = 'checkbox';
    this.checkbox.checked = false;

    L.DomEvent.disableScrollPropagation(this.container);
    L.DomEvent.disableClickPropagation(this.container);
    L.DomEvent.on(this.checkbox, 'click', toggleCoverLayers, this.container);

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
keepPreviousClick.addTo(map);

var a = document.getElementById('custom-map-controlsa');
var b = document.getElementById('custom-map-controlsb');
var c = document.getElementById('custom-map-controlsc');
var d = document.getElementById('custom-map-controlsd');
a.appendChild(jurisdictionGgeohash.getContainer());
a.appendChild(decodeGgeohash.getContainer());
a.appendChild(encodeGgeohash.getContainer());
c.appendChild(level.getContainer());
b.appendChild(clear.getContainer());
b.appendChild(toggleTooltip.getContainer());
b.appendChild(toggleCover.getContainer());
d.appendChild(noTooltip.getContainer());
d.appendChild(zoomClick.getContainer());
d.appendChild(keepPreviousClick.getContainer());

function resetDef()
{
    layerPolygonCurrent.clearLayers();
    layerPolygonAll.clearLayers();
    layerMarkerCurrent.clearLayers();
    layerMarkerAll.clearLayers();
    map.removeLayer(layerCoverAll);
    document.getElementById('fielddecode').value = '';
    document.getElementById('fieldencode').value = '';
    document.getElementById('fielddecode').placeholder = 'e.g.: ' + defaultMap.bases[defaultMap.postalcodeBase].placeholderDecode;
    document.getElementById('fieldencode').placeholder = 'geo:'   + defaultMap.bases[defaultMap.postalcodeBase].placeholderEncode;
    // map.fitBounds(layerJurisdAll.getBounds());
    const nextTitle = 'Logistic OSMcodes';
    const nextState = { additionalInformation: 'to canonical.' };
    window.history.pushState(nextState, nextTitle, (window.location.href).split(/[~]/)[0]);
}

function zoomToJurisd()
{
    map.setView(defaultMap.center, defaultMap.zoom);
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

function toggleKeepClick()
{
    if(map.hasLayer(layerPolygonAll))
    {
        map.removeLayer(layerPolygonAll);
    }
    else
    {
        map.addLayer(layerPolygonAll)
    }
}

function toggleCoverLayers()
{
    if(getCover)
    {
        let input = defaultMap.isocode + '-' + document.getElementById('sel_jurL2').value + '-' + document.getElementById('sel_jurL3').value
        loadGeojson(uri_base + "/" + input + ".json/cover/" + defaultMap.scientificBase,[layerCoverAll],function(e){},function(e){});
        getCover = false;
    }
    else
    {
        map.hasLayer(layerCoverAll) ? map.removeLayer(layerCoverAll) : map.addLayer(layerCoverAll);
        fixZOrder(overlays);
    }
}

function generateSelectLevel(base,baseValue,size_shortestprefix,size=0)
{
    let html = '';

    for (let i = base.iniLevel, k=base.iniDigit; i <= base.endLevel; i+=base.modLevel, k++)
    {
        if (k >= size_shortestprefix)
        {
            html += '<option value="' + levelValues[i] + (  size > 0 ?  (Math.floor(size) <= levelSize[i] ? '" selected>' : '">')  :  (i == base.levelDefault ? '" selected>' : '">')  ) + 'L' + (0.5*i - 0.5*base.diffl0br).toString() + ' (' + ((levelSize[i]<1000)? Math.round(levelSize[i]) : Math.round(levelSize[i]/1000)) + ((levelSize[i]<1000)? 'm': 'km') + ')</option>'
        }
    }
    return html
}

function getDecode(data)
{
    let fdvalue = document.getElementById('fielddecode').value;
    let input = defaultMap.isocode + '-' + document.getElementById('sel_jurL2').value + '-' + document.getElementById('sel_jurL3').value + defaultMap.bases[defaultMap.defaultBase].symbol + fdvalue;

    if (fdvalue.match(/^geo:(olc|ghs):.+$/i))
    {
        var uri = uri_base + "/" + fdvalue + ".json";

        loadGeojson(uri,[layerOlcGhsCurrent,layerOlcGhsAll],afterLoadLayer,function(e){});
    }
    else if(input !== null && input !== '')
    {
        var uri = uri_base + "/geo:osmcodes:"

        let regex = new RegExp("^" + defaultMap.isocode + "[+-~].*","i");

        if(!regex.test(input))
        {
            uri += defaultMap.isocode + defaultMap.bases[defaultMap.defaultBase].symbol
        }

        uri += input + ".json"
        document.getElementById('fieldencode').value = '';

        loadGeojson(uri,[layerPolygonCurrent,layerPolygonAll],afterLoadLayer,afterData);
    }
}

function getEncode(noData)
{
    let input = document.getElementById('fieldencode').value
    let level = document.getElementById('level_size').value
    let tcode = document.getElementById('tcode').value

    let uri = uri_base + "/";

    if(input !== null && input !== '' && input.match(/^((geo:((olc|ghs|ghs64|lex):)?)?|(urn:lex:))?(\-?\d+\.?\d*,\-?\d+\.?\d*)(;u=\d+\.?\d*)?$/i))
    {
        if (input.match(/^(urn|geo):(lex):.+$/i))
        {
            uri += input + ".json";
            loadGeojson(uri,[layerJurisdAll],afterLoadJurisdAllCheckLocation,afterData);
        }
        else
        {
            let tp = 'geo:' + ( tcode === '' ? '' : tcode + ':' ) ;

            let regex  = /^(.*:)(\-?\d+\.?\d*,\-?\d+\.?\d*)(;u=\d+\.?\d*)?$/i;
            let regex2 = /^(.*)(;u=)(\d+\.?\d*)$/i;

            if(input.match(regex))
            {
                input = input.replace(regex, tp + "$2$3")
            }

            let u_value;

            if(input.match(regex2))
            {
                u_value = Number(input.split(';u=')[1])

                if(u_value == 0)
                {
                    u_value = levelValues[defaultMap.bases[defaultMap.postalcodeBase].endLevel]
                }

                u_value = (u_value > 9 ? Math.round(u_value) : Math.round(u_value*10)/10 )
            }
            else
            {
                u_value = level
            }

            input = input.replace(regex, "$1$2" + ';u=' + u_value)

            uri += input + ".json";

            let latlong = input.replace(/^geo:(.*:)?(.*)$/i, "$2")
            let popupContent = "latlng: " + latlong;
            layerMarkerCurrent.clearLayers();
            L.marker(latlong.split(/[;,]/,2)).addTo(layerMarkerCurrent).bindPopup(popupContent);
            L.marker(latlong.split(/[;,]/,2)).addTo(layerMarkerAll).bindPopup(popupContent);

            if (input.match(/^geo:(olc|ghs|ghs64):.+$/i))
            {
                loadGeojson(uri,[layerOlcGhsCurrent,layerOlcGhsAll],afterLoadLayer,function(e){})
            }
            else
            {
                uri += '/' + defaultMap.isocode + '-' + document.getElementById('sel_jurL2').value + '-'+ document.getElementById('sel_jurL3').value

                document.getElementById('fielddecode').value = '';

                layerPolygonCurrent.clearLayers();
                loadGeojson(uri,[layerPolygonCurrent,layerPolygonAll],afterLoadLayer,afterData)
            }
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
            if ( (isMarkerInsidePolygon(position.coords.latitude, position.coords.longitude, memberLayer)) || jurisdIsMultipolygon )
            {
                // console.log("in");
                document.getElementById('fieldencode').value = 'geo:'+ position.coords.latitude +','+ position.coords.longitude
                getEncode();
            }
            else
            {
                alert("Error: location out of " + context + ".");
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
            if ( (isMarkerInsidePolygon(position.coords.latitude, position.coords.longitude, memberLayer)) || jurisdIsMultipolygon )
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

function sortAndRemoveDuplicates(value)
{
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

function onMapClick(e)
{
    let level = document.getElementById('level_size').value
    let country = defaultMap.isocode;
    let state = document.getElementById('sel_jurL2').value;
    let jL3dom = document.getElementById('sel_jurL3').value;
    let context = country + '-' + state + '-'+ jL3dom

    var uri = uri_base + "/geo:" + e.latlng['lat'] + "," + e.latlng['lng'] + ";u=" + level + ".json" + (defaultMap.postalcodeBase != 'base32' ? '/' + defaultMap.postalcodeBase : '') + '/' + context
    var popupContent = "latlng: " + e.latlng['lat'] + "," + e.latlng['lng'];

    let decimals = (level <= 64 ? 5 : 4)

    layerJurisdAll.eachLayer(
        function(memberLayer)
        {
            if ( (isMarkerInsidePolygon(e.latlng['lat'], e.latlng['lng'], memberLayer)) || jurisdIsMultipolygon )
            {
                document.getElementById('fieldencode').value = 'geo:' + latRound(e.latlng['lat']) + "," + latRound(e.latlng['lng']) + ";u=" + level;
                document.getElementById('geoUri').innerHTML = 'geo:' + latRound(e.latlng['lat'],decimals) + "," + latRound(e.latlng['lng'],decimals) //+ ";u=" + level;

                layerMarkerCurrent.clearLayers();

                L.marker(e.latlng).addTo(layerMarkerCurrent).bindPopup(popupContent);
                L.marker(e.latlng).addTo(layerMarkerAll).bindPopup(popupContent);

                loadGeojson(uri,[layerPolygonCurrent,layerPolygonAll],afterLoadLayer,afterData)
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
    sufix_area =(feature.properties.area<1000000)? 'm²': 'km²';
    value_area =(feature.properties.area<1000000)? feature.properties.area: Math.round((feature.properties.area*100/1000000))/100;
    sufix_side =(feature.properties.side<1000)? 'm': 'km';
    value_side =(feature.properties.side<1000)? Math.round(feature.properties.side*100.0)/100 : Math.round(feature.properties.side*100.0/1000)/100;

    var popupContent = "";

    if(feature.properties.short_code )
    {
        popupContent += "Logistic code: <big><code>" + (feature.properties.short_code.split(/[~]/)[1]) + "</code></big><br>";
        popupContent += "Area: " + value_area + " " + sufix_area + "<br>";
        popupContent += "Side: " + value_side + " " + sufix_side + "<br>";

        if(feature.properties.isolabel_ext)
        {
            popupContent += "Jurisdiction label: <code>" + feature.properties.isolabel_ext + "</code><br>";
        }

        if(feature.properties.jurisd_local_id )
        {
            popupContent += "Jurisdiction code: " + feature.properties.jurisd_local_id + "<br>";
        }
    }
    else
    {
        if(feature.properties.type)
        {
            popupContent += (feature.properties.type).toUpperCase() + " code: <big><code>" + (feature.properties.code) + "</code></big><br>";
        }
        else
        {
            popupContent += "Code: <big><code>" + (feature.properties.code) + "</code></big><br>";
        }
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
        document.getElementById('sciCode').innerHTML = '<a href="' + uri_base + '/' + defaultMap.isocode + defaultMap.bases[defaultMap.scientificBase].symbol + feature.properties.scientic_code + '">' + defaultMap.isocode + defaultMap.bases[defaultMap.scientificBase].symbol + feature.properties.scientic_code +'</a>';
    }

    if(feature.properties.short_code)
    {
        document.getElementById('sel_jurL3').innerHTML == feature.properties.short_code.split(/[-~]/)[2] ? '' : updateJurisd(feature.properties.isolabel_ext)
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

// Layer layerOlcGhsAll

function highlightFeatureOlcGhs(e)
{
    const layer = e.target;

    let noTooltip = document.getElementById('notooltip')

    if(noTooltip.checked)
    {
        this.closeTooltip();
        layer.setStyle({
            color: 'yellow',
            weight:1
        });

        layer.bringToFront();
    }
    else
    {
        this.openTooltip();
    }
}

function resetHighlightOlcGhs(e,layer)
{
    layerOlcGhsCurrent.resetStyle(e.target);
    layerOlcGhsAll.resetStyle(e.target);
}

function styleOlcGhs(feature)
{
    return {color: 'black', fillColor: 'yellow', fillOpacity: 0.1, weight:0};
}

function onEachFeatureOlcGhs(feature,layer)
{
    popUpFeature(feature,layer);
    layerTooltipFeature(feature,layer);

    L.circleMarker(layer.getBounds().getCenter(),{color: 'black', radius: 3, weight: 1, opacity: 0.8, fillOpacity: 0.6 }).addTo(layerOlcGhsCurrent);

    layer.on({
        click: onFeatureClick,
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
}

function onEachFeatureOlcGhsAll(feature,layer)
{
    popUpFeature(feature,layer);
    layerTooltipFeature(feature,layer);

    L.circleMarker(layer.getBounds().getCenter(),{color: 'black', radius: 3, weight: 1, opacity: 0.8, fillOpacity: 0.6 }).addTo(layerOlcGhsAll);

    layer.on({
        click: onFeatureClick,
        mouseover: highlightFeatureOlcGhs,
        mouseout: resetHighlightOlcGhs
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

    jurisdIsMultipolygon = feature.properties.is_multipolygon;
    size_shortestprefix = feature.properties.size_shortestprefix;
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

    document.getElementById('level_size').innerHTML = generateSelectLevel(defaultMap.bases[defaultMap.postalcodeBase],defaultMap.postalcodeBase,size_shortestprefix);
}

function afterLoadJurisdAllCheckLocation(featureGroup,fittobounds=true)
{
    afterLoadJurisdAll(featureGroup,fittobounds)

    getMyLocationJurisd()
}

function afterData(data,layer)
{
    if(data.features.length = 1)
    {
        if(data.features[0].properties.jurisd_base_id)
        {
            checkCountry(data.features[0].properties.jurisd_base_id,false)
        }

        if(data.features[0].properties.isolabel_ext && !data.features[0].properties.short_code)
        {
            var nextURL = uri_base + "/" + data.features[0].properties.canonical_pathname
            const nextTitle = 'OSM.codes: ' + data.features[0].properties.canonical_pathname;
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

                    var uri = uri_base + "/geo:iso_ext:" + data.features[0].properties.isolabel_ext + ".json";

                    loadGeojson(uri,[layerJurisdAll],function(e){afterLoadJurisdAll(e,false)},function(e){});
                }

                var nextURL = uri_base + "/" + data.features[0].properties.short_code
                const nextTitle = 'OSM.codes: ' + data.features[0].properties.short_code;
                const nextState = { additionalInformation: 'to canonical.' };

                window.history.pushState(nextState, nextTitle, nextURL);

                document.getElementById('fielddecode').value = data.features[0].properties.short_code.split(/[~]/)[1];
                let df_short_code = '<small>'+(data.features[0].properties.short_code).replace(/~/,'</small>~');
                document.getElementById('canonicalCode').innerHTML = df_short_code.replace( /([a-z])([A-Z])/g, '$1.$2' );

                if(data.features[0].properties.truncated_code)
                {
                    alert("Geocódigo truncado. Número de dígitos excedeu o limite de níveis da grade.");
                }

                if(data.features[0].properties.side)
                {
                    sizeCurrentCell = data.features[0].properties.side;

                    document.getElementById('level_size').innerHTML = generateSelectLevel(defaultMap.bases[defaultMap.postalcodeBase],defaultMap.postalcodeBase,size_shortestprefix,sizeCurrentCell);

                    let level = document.getElementById('level_size').value
                    let decimals = (level <= 64 ? 5 : 4)

                    centerCurrentCell = layer.getBounds().getCenter();
                    const { lat, lng } = centerCurrentCell;

                    document.getElementById('geoUri').innerHTML  = 'geo:' + latRound(lat,decimals) + "," + latRound(lng,decimals);
                    document.getElementById('fieldencode').value = 'geo:' + latRound(lat)          + "," + latRound(lng)          + ";u=" + document.getElementById('level_size').value;
                }
            }
            else if(data.features[0].properties.code)
            {
                document.getElementById('fielddecode').value = data.features[0].properties.code;
            }
        }
    }
}

function afterDataOlcGhs(data,layer)
{
    if(data.features.length = 1)
    {
        if(data.features[0].properties.side)
        {
            sizeCurrentCell = data.features[0].properties.side;

            document.getElementById('level_size').innerHTML = generateSelectLevel(defaultMap.bases[defaultMap.postalcodeBase],defaultMap.postalcodeBase,size_shortestprefix,sizeCurrentCell);

            let level = document.getElementById('level_size').value
            let decimals = (level <= 64 ? 5 : 4)

            centerCurrentCell = layer.getBounds().getCenter();
            const { lat, lng } = centerCurrentCell;

            document.getElementById('geoUri').innerHTML  = 'geo:' + latRound(lat,decimals) + "," + latRound(lng,decimals);
            document.getElementById('fieldencode').value = 'geo:' + latRound(lat)          + "," + latRound(lng)          + ";u=" + document.getElementById('level_size').value;
        }
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
const reg_esp_caracter = /\./g

if (pathname.match(/^\/[A-Z]{2}-[A-Z]{1,3}-[A-Z]+$/i))
{
    uriApi = uri.replace(/\/([A-Z]{2}-[A-Z]{1,3}-[A-Z]+)$/i, "/geo:iso_ext:$1.json");
    loadGeojson(uriApi,[layerJurisdAll],afterLoadJurisdAllCheckLocation,afterData);
}
else if (pathname.match(/\/CO-\d+$/i))
{
    uriApi = uri.replace(/\/CO-(\d+)$/i, "/geo:co-divipola:$1.json");
    loadGeojson(uriApi,[layerJurisdAll],afterLoadJurisdAllCheckLocation,afterData);
}
else if (pathname.match(/\/BR-\d+$/i))
{
    uriApi = uri.replace(/\/BR-(\d+)$/i, "/geo:br-geocodigo:$1.json");
    loadGeojson(uriApi,[layerJurisdAll],afterLoadJurisdAllCheckLocation,afterData);
}
else if (pathname.match(/\/(BR-[A-Z]+)$/i))
{
    uriApi = uri.replace(/\/(BR-[A-Z]+)$/i, "/geo:iso_ext:$1.json");
    loadGeojson(uriApi,[layerJurisdAll],afterLoadJurisdAllCheckLocation,afterData);
}
else if (pathname.match(/^\/geo:(olc|ghs):.+$/i))
{
    loadGeojson(uri + '.json',[layerOlcGhsCurrent,layerOlcGhsAll],afterLoadLayer,function(e){})
}
else if (pathname.match(/\/([A-Z]{2}-[A-Z]{1,3}-[A-Z]+)\/geo:(olc|ghs):.+$/i))
{
    loadGeojson(uri.replace(/\/[A-Z]{2}-[A-Z]{1,3}-[A-Z]+\/(geo:(olc|ghs).*)$/i, "/$1.json"),[layerOlcGhsCurrent,layerOlcGhsAll],afterLoadLayer,afterDataOlcGhs)
    loadGeojson(uri.replace(/\/([A-Z]{2}-[A-Z]{1,3}-[A-Z]+)\/(geo:(olc|ghs).*)$/i, "/geo:iso_ext:$1.json"),[layerJurisdAll],function(e){afterLoadJurisdAll(e,false,false)},function(e){});
}
else
{
    pathnameNoDot = pathname.replace(reg_esp_caracter,"");

    if (pathnameNoDot.match(/\/[A-Z]{2}~[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+(,[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+)*$/i))
    {
        uriApi = pathnameNoDot.replace(/\/([A-Z]{2}~[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+(,[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+)*)$/i, "/geo:osmcodes:$1.json");
        uriApiJurisd = pathnameNoDot.replace(/\/(([A-Z]{2})~[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+(,[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+)*)$/i, "/geo:iso_ext:$2.json");
    }
    else if (pathnameNoDot.match(/^\/([A-Z]{2})-\d+(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+$/i))
    {
        uriApi = pathnameNoDot.replace(/\/(([A-Z]{2})-\d+(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+)$/i, "/geo:osmcodes:$1.json");

        if (pathnameNoDot.match(/^\/BR-\d+(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+$/i))
        {
            uriApiJurisd = pathnameNoDot.replace(/\/BR-(\d+)(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+$/i, "/geo:br-geocodigo:$1.json");
        }
        else if (pathnameNoDot.match(/^\/CO-\d+(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+$/i))
        {
            uriApiJurisd = pathnameNoDot.replace(/\/CO-(\d+)(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+$/i, "/geo:co-divipola:$1.json");
        }
    }
    else if (pathnameNoDot.match(/^\/[A-Z]{2}(-[A-Z]{1,3}-[A-Z]+)(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+$/i))
    {
        uriApi = pathnameNoDot.replace(/\/([A-Z]{2}(-[A-Z]{1,3}-[A-Z]+)(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+)$/i, "/geo:osmcodes:$1.json");
        uriApiJurisd = pathnameNoDot.replace(/\/(([A-Z]{2}(-[A-Z]{1,3}-[A-Z]+))(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ]+)$/i, "/geo:iso_ext:$2.json");
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
        loadGeojson(uriApi,[layerPolygonCurrent,layerPolygonAll],afterLoadCurrent,afterData);
    }

    if(uriApiJurisd !== null && uriApiJurisd !== '')
    {
        loadGeojson(uriApiJurisd,[layerJurisdAll],function(e){afterLoadJurisdAll(e,false)},function(e){});
    }
}
