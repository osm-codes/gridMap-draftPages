function changeLevel_byDigits(x)
{
    const inputField = document.getElementById('fielddecode');
    let input = inputField.value.trim();

    if (input.length > 0)
    {
        if (x>0)
        {
            inputField.value = input + '7';
        }
        else if (x < 0 && input.length > 1)
        {
            inputField.value = input.substring(0,input.length-1);
        }
        else
        {
            alert('Check code or level limits');
            return;
        }
        getDecode();
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
        for ( var i of (jurisdictions[country][state]['draft']).concat(jurisdictions[country][state]['work']).sort())
            s += '<option>'+i
    }
    jL3dom.innerHTML=s
}

function sel_jurL3(abbrev)
{
    // let country = document.getElementById('sel_jurL1').value;
    let country = defaultMap.isocode;
    let state = document.querySelector('#sel_jurL2').value;
    let city = document.getElementById('sel_jurL3').value;
    if(city != '' && state != '')
    {
        window.location.href = `${uri_base}/${country}-${state}-${city}`;
    }
}

function latRound(x,maxDigits=6) {
  return Number.parseFloat(x).toFixed(maxDigits);
  // 5 or 6 decimal digits for 1 meter, see https://gis.stackexchange.com/a/208739/7505
}

function buildOptionsHTML(options, selectedOption, getOptionLabel) {
    return options.map(option => {
        const isSelected = selectedOption === option ? ' selected' : '';
        return `<option value="${option}"${isSelected}>${getOptionLabel(option)}</option>`;
    }).join('');
}

function updateJurisd(jurisd)
{
    const [jurisd_country, jurisd_state, jurisd_city] = jurisd.split("-", 3);
    const countryStates = jurisdictions[jurisd_country];

    // Build states options
    const statesOptions = buildOptionsHTML(
        Object.keys(countryStates),
        jurisd_state,
        (stateKey) => (jurisd_country !== 'CO' ? stateKey : countryStates[stateKey]['name'])
    );

    // Build city options
    const citiesOptions = buildOptionsHTML(
        [...(countryStates[jurisd_state]['draft'] || []), ...(countryStates[jurisd_state]['work'] || [])].sort(),
        jurisd_city,
        (city) => city
    );

    // Update the dropdowns
    document.getElementById('sel_jurL1').innerHTML = jurisd_country;
    document.getElementById('sel_jurL2').innerHTML = `<option value="">- opt -</option>${statesOptions}`;
    document.getElementById('sel_jurL3').innerHTML = `<option value="">- City -</option>${citiesOptions}`;
}

var openstreetmap = L.tileLayer(osmUrl,{attribution: genericAttrib,detectRetina: true,minZoom: 0,maxNativeZoom: 19,maxZoom: 25 }),
    grayscale = L.tileLayer(cartoUrl, {id:'light_all', attribution: genericAttrib,detectRetina: true,maxNativeZoom: 22,maxZoom: 25 });

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
    attributionControl: true,
    zoomControl: false,
    renderer: L.svg(),
    layers: [grayscale, layerPolygonCurrent, layerPolygonAll, layerCoverAll, layerJurisdAll,layerOlcGhsCurrent,layerOlcGhsAll] });

var toggleTooltipStatus = false;

map.attributionControl.setPrefix(false); // Disable the attribution prefix

// Add fullscreen control
map.addControl(new L.Control.Fullscreen({position:'topleft'})); /* https://github.com/Leaflet/Leaflet.fullscreen */

// Event handler for map click
map.on('click', handleMapClick);

// Standard Leaflet controls
var zoom   = L.control.zoom({position:'topleft'});
var layers = L.control.layers(baseLayers, overlays,{position:'topleft'});
var escala = L.control.scale({position:'bottomright',imperial: false});

// Custom controls
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
    this.label_tcode    = L.DomUtil.create('label', '', this.container);
    this.select_tcode   = L.DomUtil.create('select', '', this.container);
    this.field = L.DomUtil.create('input', '', this.container);
    this.button = L.DomUtil.create('button','leaflet-control-button',this.container);
    this.span = L.DomUtil.create('span','', this.container);
    this.button2 = L.DomUtil.create('button','getGeo-button',this.container);

    this.label_tcode.for = 'tcode';
    this.label_tcode.innerHTML = '';
    this.select_tcode.id = 'tcode';
    this.select_tcode.name = 'tcode';
    // this.select_tcode.innerHTML = '<option value="none">(Free)</option><option value="">AFAcode</option><option value="olc">OLC</option><option value="ghs">GHS</option><option value="ghs64">GHS64</option>'
    this.select_tcode.innerHTML = generateSelectTypeCode('aaa')

    this.label_field.for = 'fieldencode';
    this.label_field.innerHTML = 'Equivalent Geo URI:<br/>';
    this.field.type = 'text';
    this.field.placeholder = 'e.g.: ' + defaultMap.bases[defaultMap.postalcodeBase].placeholderEncode;
    this.field.id = 'fieldencode';
    this.button.type = 'button';
    this.button.innerHTML= "Encode";

    this.span.innerHTML= " or ";

    this.button2.type = 'button';
    this.button2.innerHTML= "My Location";

    L.DomEvent.disableScrollPropagation(this.container);
    L.DomEvent.disableClickPropagation(this.container);
    L.DomEvent.on(this.button, 'click', getEncode, this.container);
    L.DomEvent.on(this.button2, 'click', () => getMyLocation(handleLocation), this.container);
    L.DomEvent.on(this.field, 'keyup', (data) => {if(data.keyCode === 13){getEncode(data);}}, this.container);
    L.DomEvent.on(this.select_tcode, 'change', changePlaceholder, this.container);

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

// Function to create a basic Leaflet control with a label and button
function createControl({ id, label, buttonLabel, buttonAction, position = 'topleft', type = 'button', checkbox = false, checked = false }) {
    const control = L.control({ position });
    control.onAdd = function (map) {
        const container = L.DomUtil.create('div');

        if (label)
        {
            const controlLabel = L.DomUtil.create('label', '', container);
            controlLabel.innerHTML = label;
        }

        if (checkbox)
        {
            const checkboxInput = L.DomUtil.create('input', '', container);
            checkboxInput.type = 'checkbox';
            checkboxInput.id = id;
            checkboxInput.checked = checked;
            L.DomEvent.on(checkboxInput, 'click', buttonAction);
        }
        else
        {
            const button = L.DomUtil.create(type, '', container);
            button.innerHTML = buttonLabel;
            L.DomEvent.on(button, 'click', buttonAction);
        }

        L.DomEvent.disableScrollPropagation(container);
        L.DomEvent.disableClickPropagation(container);

        return container;
    };

    return control;
}

// "Clear all" button control
const clearControl = createControl({id: 'clear', buttonLabel: 'Clear all', buttonAction: resetDef, position: 'topleft'});

// Tooltip toggle control
const toggleTooltipControl = createControl({id: 'tooltip', buttonLabel: 'Tooltip', buttonAction: toggleTooltipLayers, position: 'topleft'});

// Coverage toggle control
const toggleCoverageControl = createControl({id: 'coverage', buttonLabel: 'Coverage', buttonAction: toggleCoverLayers, position: 'topleft'});

// Official Borders toggle control
const officialBordersControl = createControl({id: 'officialborders', buttonLabel: 'Official Borders', buttonAction: toggleOfficialBordersLayers, position: 'topleft'});

// Zoom-click disable control
const zoomClickControl = createControl({id: 'zoomclick', label: 'Disable zoom-click: ', checkbox: true, checked: false, buttonAction: () => {}, position: 'topleft'});

// Keep previous click control
const keepPreviousClickControl = createControl({id: 'keepclick', label: 'Keep previous clicks: ', checkbox: true, checked: true, buttonAction: toggleKeepClick, position: 'topleft'});

// No-tooltip control
const noTooltipControl = createControl({id: 'notooltip', label: 'No tooltip: ', checkbox: true, checked: true, buttonAction: toggleTooltipLayers, position: 'topleft'});


var geoUriDiv = L.control({position: 'topright'});
geoUriDiv.onAdd = function (map) {
    this.container = L.DomUtil.create('div');

    this.container.innerHTML= '<a id="hasGeoUri" href="#fieldencode" title="Latitude,Longitude: click here to get it as Geo URI standard"><span id="geoUri" class="font_small"></span></a>';

    L.DomEvent.disableScrollPropagation(this.container);
    L.DomEvent.disableClickPropagation(this.container);

    return this.container; };

// Create a "My Location" control
const myLocationControl = L.Control.extend({
    options: {
        position: 'topleft'
    },
    onAdd: function () {
        // Criação do contêiner para o botão com as classes do Leaflet
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

        // Criar o botão dentro do contêiner
        const button = L.DomUtil.create('a', '', container);
        button.innerHTML = '&#8982';
        button.href = '#';
        button.title = 'My location';

        // Event handler for the button click
        container.onclick = () => { getMyLocation(handleLocationJurisd); };

        L.DomEvent.disableScrollPropagation(container);
        L.DomEvent.disableClickPropagation(container);
        return container;
    }
});


map.addControl(new myLocationControl());

[zoom, layers, escala, geoUriDiv, decodeGgeohash, encodeGgeohash, level, clearControl, toggleCoverageControl, officialBordersControl, jurisdictionGgeohash, noTooltipControl, zoomClickControl, keepPreviousClickControl]
    .forEach(control => control.addTo(map));

// // Select the parent elements once
// const containerA = document.getElementById('custom-map-controlsa');
// const containerB = document.getElementById('custom-map-controlsb');
// const containerC = document.getElementById('custom-map-controlsc');
// const containerD = document.getElementById('custom-map-controlsd');
//
// // Create a mapping of controls to append to specific containers
// const controlsToAdd = {
//   containerA: [jurisdictionGgeohash, decodeGgeohash, encodeGgeohash],
//   containerB: [clearControl, toggleCoverageControl, officialBordersControl],
//   containerC: [level],
//   containerD: [noTooltipControl, zoomClickControl, keepPreviousClickControl]
// };
//
// // Loop through each container and append the controls
// Object.entries(controlsToAdd).forEach(([containerKey, controls]) => {
//   const container = window[containerKey]; // Get the actual DOM element from window object
//   if (!container) {
//     console.error(`Container ${containerKey} is undefined or null.`);
//     return; // Skip if the container is not found
//   }
//
//   controls.forEach(control => {
//     if (control && control.getContainer) {
//       container.appendChild(control.getContainer()); // Append only if control is valid
//     } else {
//       console.warn(`Control ${control} does not have a valid getContainer method.`);
//     }
//   });
// });

var a = document.getElementById('custom-map-controlsa');
var b = document.getElementById('custom-map-controlsb');
var c = document.getElementById('custom-map-controlsc');
var d = document.getElementById('custom-map-controlsd');
a.appendChild(jurisdictionGgeohash.getContainer());
a.appendChild(decodeGgeohash.getContainer());
a.appendChild(encodeGgeohash.getContainer());
c.appendChild(level.getContainer());
b.appendChild(clearControl.getContainer());
// b.appendChild(toggleTooltipControl.getContainer());
b.appendChild(toggleCoverageControl.getContainer());
b.appendChild(officialBordersControl.getContainer());
d.appendChild(noTooltipControl.getContainer());
d.appendChild(zoomClickControl.getContainer());
d.appendChild(keepPreviousClickControl.getContainer());

function resetDef()
{
    layerPolygonCurrent.clearLayers();
    layerPolygonAll.clearLayers();
    layerMarkerCurrent.clearLayers();
    layerMarkerAll.clearLayers();
    layerOlcGhsCurrent.clearLayers();
    layerOlcGhsAll.clearLayers();
    map.removeLayer(layerCoverAll);
    document.getElementById('fielddecode').value = '';
    document.getElementById('fieldencode').value = '';
    document.getElementById('fielddecode').placeholder = 'e.g.: ' + defaultMap.bases[defaultMap.postalcodeBase].placeholderDecode;
    document.getElementById('fieldencode').placeholder = 'geo:'   + defaultMap.bases[defaultMap.postalcodeBase].placeholderEncode;
    document.getElementById('logCode').innerHTML = '(click the map)';
    // map.fitBounds(layerJurisdAll.getBounds());
    const nextTitle = 'Logistic AFAcodes';
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
function toggleOfficialBordersLayers()
{
    map.hasLayer(layerJurisdAll) ? map.removeLayer(layerJurisdAll) : map.addLayer(layerJurisdAll);
}
function generateSelectLevel(base,baseValue,size_shortestprefix,size=0)
{
    let html = '';

    for (let i = base.iniLevel, k=base.iniDigit; i <= base.endLevel; i+=base.modLevel, k++)
    {
        if (k > size_shortestprefix)
        {
            html += '<option value="' + levelValues[i] + (  size > 0 ?  (Math.floor(size) <= levelSize[i] ? '" selected>' : '">')  :  (i == base.levelDefault ? '" selected>' : '">')  ) + 'L' + (0.5*i - 0.5*base.diffl0br).toString() + ' (' + ((levelSize[i]<1000)? Math.round(levelSize[i]) : Math.round(levelSize[i]/1000)) + ((levelSize[i]<1000)? 'm': 'km') + ')</option>'
        }
    }
    return html
}

function generateSelectTypeCode(type)
{
    let html = '';
    avalue=['none','','olc','ghs','ghs64'];
    aname=['(Free)','AFAcode','OLC','GHS','GHS64'];

    for (let i = 0; i < 4; i++)
    {
        html += '<option value="' + avalue[i] + ( avalue[i] == type ?  '" selected>' : '">' ) + aname[i] + '</option>'
    }
    return html
}

// https://stackoverflow.com/questions/31790344/determine-if-a-point-reside-inside-a-leaflet-polygon
function isMarkerInsidePolygonOrMultiPolygon(x, y, poly) {
    let inside = false;
    const polys = poly.getLatLngs();

    // Check if the input is a multi-polygon or a single polygon
    const isMultiPolygon = Array.isArray(polys[0]) && Array.isArray(polys[0][0]);

    // Function to check if a point is inside a polygon
    const checkInside = (polyPoints) => {
        for (let k = 0, l = polyPoints.length - 1; k < polyPoints.length; l = k++) {
            const xi = polyPoints[k].lat, yi = polyPoints[k].lng;
            const xj = polyPoints[l].lat, yj = polyPoints[l].lng;

            const intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
    };

    if (isMultiPolygon) {
        // Iterate through each polygon in the multi-polygon
        for (const polys2 of polys) {
            for (const polyPoints of polys2) {
                checkInside(polyPoints);
            }
        }
    } else {
        // Single polygon case
        for (const polyPoints of polys) {
            checkInside(polyPoints);
        }
    }

    return inside;
}

function isLatLngInsideJurisdiction(lat,lng,layer)
{
    let inside = false
    layer.eachLayer(
        function(memberLayer)
        {
            if ( isMarkerInsidePolygonOrMultiPolygon(lat,lng, memberLayer) )
            {
                inside = true;
            }
        }
    );

    return inside;
}

// Function to get the jurisdiction context based on selected values
function getJurisdictionContext() {
    const country = defaultMap.isocode;
    const state = document.getElementById('sel_jurL2').value;
    const city = document.getElementById('sel_jurL3').value;

    if (state !== null && state !== '' && city !== null && city !== '')
    {
        return `${country}-${state}-${city}`;
    }

    return null;
}

// Function to check if type is Afacode
function isTypeAfaCode()
{
    const type = document.getElementById('tcode').value;
    return type === '' || type === 'none';
}

// Function to build the geo prefix
function buildGeoPrefix(encode = true)
{
    return encode ? `geo:${isTypeAfaCode() ? '' : `${document.getElementById('tcode').value}:`}` : 'geo:osmcodes:';
}

// Regular expressions for geoURI validation
const regexGeoUri  = /^(geo:((olc|ghs|ghs64):)?)?(\-?\d+\.?\d*,\-?\d+\.?\d*)((;u=)(\d+\.?\d*))?$/i;
const regexLex  = /^(urn|geo):lex:.+$/i;

function changePlaceholder()
{
    let input = (document.getElementById('fieldencode').value).trim()
    const geoPrefix = buildGeoPrefix();

    if ( input === null || input === '' )
    {
        document.getElementById('fieldencode').placeholder = `e.g.: ${geoPrefix}${defaultMap.bases[defaultMap.postalcodeBase].placeholderEncode}`;
    }
    else
    {
        if(input.match(regexGeoUri))
        {
            input = input.replace(regexGeoUri, `${geoPrefix}$4$5`)
            document.getElementById('fieldencode').value = `${input}`;
        }
    }
}

function checkUValue(input)
{
    const match = input.match(regexGeoUri);
    let u_value = document.getElementById('level_size').value;

    if(match && match[7] !== undefined)
    {
        u_value = Number(match[7])

        if(u_value == 0)
        {
            u_value = levelValues[defaultMap.bases[defaultMap.postalcodeBase].endLevel]
        }

        u_value = (u_value > 9 ? Math.round(u_value) : Math.round(u_value*10)/10 )
    }

    return u_value;
}

// Function to add a marker to the specified layers
function addMarker(layerMarkerCurrent,layerMarkerAll,latLng)
{
    const latlng  = `${latRound(latLng.lat)},${latRound(latLng.lng)}`;

    const popupContent = `latlng: ${latlng}`;

    // Clear the current markers
    layerMarkerCurrent.clearLayers();

    // Create markers for both layers
    L.marker(latLng).addTo(layerMarkerCurrent).bindPopup(popupContent);
    L.marker(latLng).addTo(layerMarkerAll).bindPopup(popupContent);
}

// Main function for processing geolocation URI and loading layers
function processGeoUri(geouri,isAfacode,encode, isLex = false, geolocation = false)
{
    let layerToLoad;
    let afterDataCallback;
    let context;
    let uri = `${uri_base}/${geouri}.json`;

    if (isLex) {
        loadGeojson(geouri,[layerJurisdAll],afterLoadJurisdAll,afterData);
        return;
    }

    if (geolocation) {
        window.location.href = `${uri_base}/${geouri}`;
        return;
    }

    switch (isAfacode)
    {
        case true:
            layerToLoad = [layerPolygonCurrent, layerPolygonAll];
            afterDataCallback = afterData;
            break;
        case false:
            layerToLoad = [layerOlcGhsCurrent, layerOlcGhsAll];
            afterDataCallback = afterDataOlcGhs;
            break;
    }

    if(encode)
    {
        const latlng = geouri.replace(regexGeoUri, "$4");
        const latLngArray = latlng.split(/[;,]/, 2);
        const insidePolygon = isLatLngInsideJurisdiction(latLngArray[0],latLngArray[1],layerJurisdAll);
        const context = getJurisdictionContext();

        if(isAfacode && context !== null)
        {
            uri += '/' + context;
        }

        // if( isAfacode && context !== null && !insidePolygon )
        // {
        //     alert("Error: outside of current jurisdiction.");
        // }
        // else
        // {
            addMarker(layerMarkerCurrent,layerMarkerAll,L.latLng(latLngArray))
            loadGeojson(uri,layerToLoad,afterLoadLayer,afterDataCallback);
        // }
    }
    else
    {
        loadGeojson(uri,layerToLoad,afterLoadLayer,afterDataCallback);
    }
}

function getDecode(data)
{
    let geouri = (document.getElementById('fielddecode').value).trim();

    if(geouri !== null && geouri !== '')
    {
        const isCode = true; //geouri.match(regexGeoUri);
        const isAfacode = true; //isCode && (isCode[3] == undefined);

        if (isCode)
        {
            const context = getJurisdictionContext();

            if (isAfacode && context !== null)
            {
                geouri = buildGeoPrefix(false) + context + defaultMap.bases[defaultMap.defaultBase].symbol + geouri
            }
            processGeoUri(geouri, isAfacode, encode = false, isLex = false, geolocation = false);
        }
    }
}

function getEncode(noData)
{
    let geouri = (document.getElementById('fieldencode').value).trim()

    if(geouri !== null && geouri !== '')
    {
        const isCode = geouri.match(regexGeoUri);
        const isLex  = geouri.match(regexLex);
        let isAfacode = isCode && (isCode[3] === undefined);

        if (isCode || isLex)
        {
            if (isCode)
            {
                geouri = buildGeoPrefix() + isCode[4] + ';u=' + checkUValue(geouri);
            }
            processGeoUri(geouri, isAfacode, encode = true, isLex, geolocation = false);
        }
    }
}

function handleMapClick(e)
{
    const isAfacode = isTypeAfaCode();
    const geoPrefix = buildGeoPrefix();
    let geouri = `${geoPrefix}${latRound(e.latlng.lat)},${latRound(e.latlng.lng)}`;
    geouri += ';u=' + checkUValue(geouri);

    processGeoUri(geouri,isAfacode,encode = true);
}

function handleLocationError(error) {
    const messages = {
        [error.PERMISSION_DENIED]: "User denied the request for Geolocation.",
        [error.POSITION_UNAVAILABLE]: "Location information is unavailable.",
        [error.TIMEOUT]: "The request to get user location timed out.",
        [error.UNKNOWN_ERROR]: "An unknown error occurred."
    };

    alert(messages[error.code] || "An unexpected error occurred.");
}

function getMyLocation(callback)
{
    if (navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(callback,handleLocationError)
    }
    else
    {
        alert("Geolocation is not supported by this browser.");
    }
}

function buildGeoUri(position, includeAccuracy = false)
{
    const { latitude, longitude, accuracy } = position.coords;
    let geouri = `${buildGeoPrefix()}${latitude},${longitude}`;

    if (includeAccuracy && accuracy > 100)
    {
        const userConfirmed = confirm(`Poor GPS accuracy: ${accuracy} m. Do you want to include this in the geolocation?`);

        if (userConfirmed)
        {
            geouri += `;u=${accuracy}`;
        }
    }

    return geouri;
}

function handleLocation(position)
{
    const geouri = buildGeoUri(position, true);

    processGeoUri(geouri,isAfacode = isTypeAfaCode(),encode = true, isLex = false, geolocation = false);
}

function handleLocationJurisd(position)
{
    const geouri = buildGeoUri(position, false);

    processGeoUri(geouri,isAfacode = isTypeAfaCode(),encode = true, isLex = false, geolocation = true);
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

// Layer layerPolygonCurrent
function style(feature)
{
    return {color: 'black', fillColor: 'deeppink', fillOpacity: 0.1, weight:0};
}

function popUpFeature(feature,layer)
{
    sufix_area =(feature.properties.area<1000000)? 'm²': 'km²';
    value_area =(feature.properties.area<1000000)? Math.round(feature.properties.area*100.0)/100 : Math.round((feature.properties.area*100/1000000))/100;
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
        else if(feature.properties.index)
        {
            popupContent += "Code: <big><code>" + (feature.properties.index) + "</code></big><br>";
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
        const codsci = (feature.properties.scientic_code).replace(/([GQHMRVJKNPSTZY])/g,'\.$1');
        document.getElementById('sciCode').innerHTML = '<a href="' + uri_base + '/' + defaultMap.isocode + defaultMap.bases[defaultMap.scientificBase].symbol + feature.properties.scientic_code + '">' + defaultMap.isocode + defaultMap.bases[defaultMap.scientificBase].symbol +'<span class="feSchrift">'+ codsci +'</span></a>';
    }

    if(feature.properties.short_code)
    {
        document.getElementById('sel_jurL3').innerHTML == feature.properties.short_code.split(/[-~]/)[2] ? '' : updateJurisd(feature.properties.isolabel_ext)
        document.getElementById('logCode').innerHTML = (feature.properties.short_code.split(/[~]/)[1]).replace(reg, '$1.');
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
function styleJurisdAll(feature) {
    return {
        color: 'red',          // Cor da linha
        fillColor: 'none',     // Cor do preenchimento (nenhum preenchimento)
        fillOpacity: 0.1,      // Opacidade do preenchimento
        weight: 2,             // Espessura da linha
        dashArray: '5, 5'      // Padrão de linha tracejada (5px de traço e 5px de espaço)
    };
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
    // zoomclick.checked ? map.setView(featureGroup.getBounds().getCenter(),map.getZoom()) : map.setView(featureGroup.getBounds().getCenter(),zoom-(zoom < 10 ? 1: (zoom < 20 ? 2: (zoom < 24 ? 3: 4))))
    zoomclick.checked ? '' : map.setView(featureGroup.getBounds().getCenter(),zoom-(zoom < 10 ? 1: (zoom < 20 ? 2: (zoom < 24 ? 3: 4))))
}

function afterLoadCurrent(featureGroup)
{
    let zoom = map.getBoundsZoom(featureGroup.getBounds());
    map.setView(featureGroup.getBounds().getCenter(),zoom-(zoom < 10 ? 1: (zoom < 20 ? 2: (zoom < 24 ? 3: 4))));
}

function afterLoadJurisdAll(featureGroup,fittobounds=true,genSelect=true)
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

    if(genSelect)
    {
        document.getElementById('level_size').innerHTML = generateSelectLevel(defaultMap.bases[defaultMap.postalcodeBase],defaultMap.postalcodeBase,size_shortestprefix);
    }
}

function generateBorderLinks(borderList)
{
    return borderList.map(item => {
        // Monta o link (a URL pode ser ajustada conforme necessário)
        return `<a href="./${item}" title="AFAcodes of ${item}">${item}</a>`;
    }).join(', ');  // Une os links
}

function afterData(data,layer)
{
    if(data.features.length = 1)
    {
        if(data.features[0].properties.jurisd_base_id)
        {
            checkCountry(data.features[0].properties.jurisd_base_id,false)

            if(data.features[0].properties.shares_border_with)
            {
                // Usar a função para gerar os links
                const borderLinksHtml = generateBorderLinks(data.features[0].properties.shares_border_with);

                // Caso você queira adicionar os links a um elemento HTML com o id 'borderLinks', pode fazer o seguinte:
                document.getElementById('borderLinks').innerHTML = borderLinksHtml;
            }
        }

        if(data.features[0].properties.isolabel_ext && !data.features[0].properties.short_code)
        {
            var nextURL = uri_base + "/" + data.features[0].properties.canonical_pathname
            const nextTitle = 'AFA.codes: ' + data.features[0].properties.canonical_pathname;
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
                const nextTitle = 'AFA.codes: ' + data.features[0].properties.short_code;
                const nextState = { additionalInformation: 'to canonical.' };

                window.history.pushState(nextState, nextTitle, nextURL);


                document.getElementById('fielddecode').value = data.features[0].properties.short_code.split(/[~]/)[1];
                let df_short_code = ''

                if(data.features[0].properties.isolabel_ext_abbrev)
                {
                    df_short_code = '<small>'+(data.features[0].properties.isolabel_ext_abbrev)+ '~</small>' + data.features[0].properties.short_code.split(/[~]/)[1];
                }
                else
                {
                    df_short_code = '<small>'+(data.features[0].properties.short_code).replace(/~/,'~</small>');
                }

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

            document.getElementById('tcode').innerHTML = generateSelectTypeCode(data.features[0].properties.type);

            let level = document.getElementById('level_size').value
            let decimals = (level <= 64 ? 5 : 4)

            centerCurrentCell = layer.getBounds().getCenter();
            const { lat, lng } = centerCurrentCell;

            document.getElementById('geoUri').innerHTML  = 'geo:' + data.features[0].properties.type + ':' + latRound(lat,decimals) + "," + latRound(lng,decimals);
            document.getElementById('fieldencode').value = 'geo:' + data.features[0].properties.type + ':' + latRound(lat)          + "," + latRound(lng)          + ";u=" + document.getElementById('level_size').value;

            var nextURL = uri_base + "/geo:" + data.features[0].properties.type + ':' + data.features[0].properties.code
            const nextTitle = 'AFA.codes: ' + data.features[0].properties.code;
            const nextState = { additionalInformation: 'to canonical.' };

            window.history.pushState(nextState, nextTitle, nextURL);
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

// Remove prefixo 'geo:' se for sucedido por [A-Z]{2}.
// Exemplo:  /geo:BR-Sampa~LCGHJ -> /BR-Sampa~LCGHJ
if (pathname.startsWith('/geo:') && pathname.match(/^\/geo:[A-Z]{2}-.*?$/i))
{
    pathname = pathname.replace(/\/geo:(.*)$/i, "/$1");

}

// Function to generate URI and load GeoJSON
const loadGeoApi = (pattern, prefix, suffix, afterLoad, afterData) => {
    const match = pathname.match(pattern);
    if (match)
    {
        loadGeojson( pathname.replace(pattern, `/${prefix}:${match[1]}${suffix}`) , [layerJurisdAll] , afterLoad , afterData );
    }
};

// Define patterns and corresponding parameters
const patterns = [
    { regex: /\/CO-(\d+)((~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ\.]+)?$/i, prefix: 'geo:co-divipola',  suffix: '.json', afterLoad: afterLoadJurisdAll, afterData: afterData },
    { regex: /\/BR-(\d+)((~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ\.]+)?$/i, prefix: 'geo:br-geocodigo', suffix: '.json', afterLoad: afterLoadJurisdAll, afterData: afterData },
    { regex: /\/CM-(\d+)((~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ\.]+)?$/i, prefix: 'geo:cm-code', suffix: '.json', afterLoad: afterLoadJurisdAll, afterData: afterData },
    { regex: /^\/([A-Z]{2}(-[A-Z0-9]+){1,2})((~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ\.]+)?$/i, prefix: 'geo:iso_ext', suffix: '.json', afterLoad: afterLoadJurisdAll, afterData: afterData },
    { regex: /^\/([A-Z]{2}(-[A-Z0-9]+){1,2})\/geo:(olc|ghs):.+$/i, prefix: 'geo:iso_ext', suffix: '.json', afterLoad: (e) => afterLoadJurisdAll(e, false), afterData: function(e){} }/*,
    { regex: /\/([A-Z]{2})~[0123456789BCDFGHJKLMNPQRSTUVWXYZ\.]+(,[0123456789BCDFGHJKLMNPQRSTUVWXYZ\.]+)*$/i, prefix: 'geo:iso_ext',  suffix: '.json', afterLoad: afterLoadJurisdAll, afterData: afterData }*/
];
// Load GeoJSON for each pattern
// Resolve jurisdiction
// Exemplo: /CO-15001       -> /geo:co-divipola:15001.json
//          /BR-3550308     -> /geo:br-geocodigo:3550308.json
//          /CM-20101       -> /geo:cm-code:20101.json
//          /BR-Sampa       -> /geo:iso_ext:BR-Sampa.json
//          /BR-SP-SaoPaulo -> /geo:iso_ext:BR-SP-SaoPaulo.json
//          /BR-SP-SP       -> /geo:iso_ext:BR-SP-SP.json
//          /BR-SP          -> /geo:iso_ext:BR-SP.json
//          /CM-YE1         -> /geo:iso_ext:CM-YE1.json
//          /BR-Rio         -> /geo:iso_ext:BR-Rio.json
patterns.forEach(({ regex, prefix, suffix, afterLoad }) => {
    loadGeoApi(regex, prefix, suffix, afterLoad, afterData);
});

// Resolve requisições OLC e GHS com e sem contexto
// Acresenta sufixo '.json' se existir o sufixo geo:(olc|ghs):.
// Exemplo:  /geo:olc:-23.550408,-46.633110;u=3           -> /geo:olc:-23.550408,-46.633110;u=3.json
// Exemplo:  /BR-Sampa/geo:olc:-23.550408,-46.633110;u=3  -> /geo:olc:-23.550408,-46.633110;u=3.json
if (pathname.match(/^(\/[A-Z]{2}(-[A-Z0-9]+){1,2})?\/geo:(olc|ghs):.+$/i))
{
    loadGeojson(pathname.replace(/^(\/[A-Z]{2}(-[A-Z0-9]+){1,2})?\/(geo:(olc|ghs):.+)$/i, "/$3.json"),[layerOlcGhsCurrent,layerOlcGhsAll],afterLoadLayer,afterDataOlcGhs)
}
else
{
    let uriApi = ''
    // Resolve AFAcodes logistico se municipio é numérico ou string.
    // Exemplo: /BR-3550308~LCGHJ     -> /geo:osmcodes:BR-3550308~LCGHJ.json
    //          /CO-15001~8HJF20      -> /geo:osmcodes:CO-15001~8HJF20.json
    //          /CM-20101~0G220       -> /geo:osmcodes:CM-20101~0G220.json
    //          /CM-CE-Yaounde1~0G220 -> /geo:osmcodes:CM-CE-Yaounde1~0G220.json
    //          /CM-YE1~0G220         -> /geo:osmcodes:CM-YE1~0G220.json
    if (pathname.match(/^\/((([A-Z]{2})-\d+)|([A-Z]{2}((-[A-Z0-9]+){1,2})))(~|-)[0123456789BCDFGHJKLMNPQRSTUVWXYZ\.]+(,[0123456789BCDFGHJKLMNPQRSTUVWXYZ\.]+)*$/i))
    {
        pathname = pathname.replace(/\./g,""); // Remove ponto, caso exista
        uriApi = pathname.replace(/\/(.+)$/i, "/geo:osmcodes:$1.json");
    }
    else if (pathname.match(/^\/geo:.+$/i))
    {
        uriApi = pathname + '.json';
        getJurisdAfterLoad = true;
    }

    if(uriApi !== '')
    {
        loadGeojson(uri_base + uriApi,[layerPolygonCurrent,layerPolygonAll],afterLoadCurrent,afterData);
    }
}
