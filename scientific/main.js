// begin common
function changeLevel_byDigits(x)
{
    let input = document.getElementById('fielddecode').value

    if (input.length > 0)
    {
        if (x>0)
        {
            document.getElementById('fielddecode').value = input.replace(/[^0-9a-f]$/,"") + '7';
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

function generateSelectLevel(base,size=0,filter=0) // 0: all, 1:meio, 2:inteiro, 4:hex, 5:base32, 51:base32 br
{
    let html = '';

    let m=0, p=1, q=0;

    if(filter == 1)    {p=2; q=1;}
    else if(filter==2) {p=2; q=0;}
    else if(filter==4) {p=4; q=0;}
    else if(filter==5) {p=5; q=0;}
    else if(filter==51){p=5; q=1;}

    const endLevel = base.endLevel;

    for (let j=0; j <= endLevel; j++)
    {
        if(j % p !== q) continue;

        m = (j%4 == 0 ? (j/4)+1 : Math.floor(j/4)+2 )

        const area = Math.pow(2, endLevel - j );
        const side = Math.sqrt(area);
        const limiar = (Math.round(side*111.0)/100)

        const formattedSize = side<1000 ? (Math.round(side*100.0)/100)+'m' : (Math.round(side*100.0/1000)/100)+'km' ;

        const symbol = j % 2 === 0 ? '&#9643;' : '&#9645;';

        const selected = ( size <= limiar ? ' selected' : '' )

        html += `<option value="${limiar}"${selected}>L${j} (${m}d) (${formattedSize}) ${symbol}</option>`;
    }

    return html
}

function geoURI_to_geohackString(geoURI)
{
    const re = /^\s*geo:(?:[a-zA-Z_][a-zA-Z_0-9]+:)?(\-?[0-9\.]+),(\-?[0-9\.]+)$/i;
    const a = geoURI.match(re);
    latd = a[1];
	lond = a[2];
	if ( latd != '' ) {
		sign = latd > 0 ? 1 : -1 ;
		lat4 = latd > 0 ? 'N' : 'S' ;
		latd *= sign ;
		lat1 = Math.floor ( latd ) ;
		lat2 = Math.floor ( ( latd - lat1 ) * 60 ) ;
		lat3 = Math.floor ( ( latd - lat1 - lat2 / 60 ) * 3600 ) ;
	}
	if ( lond != '' ) {
		sign = lond > 0 ? 1 : -1 ;
		lon4 = lond > 0 ? 'E' : 'W' ;
		lond *= sign ;
		lon1 = Math.floor ( lond ) ;
		lon2 = Math.floor ( ( lond - lon1 ) * 60 ) ;
		lon3 = Math.floor ( ( lond - lon1 - lon2 / 60 ) * 3600 ) ;
	}
	p = lat1 + '_' + lat2 + '_' + lat3 + '_' + lat4 + '_' ;
	p += lon1 + '_' + lon2 + '_' + lon3 + '_' + lon4 ;
	return p;
}

function go_to_geohackString()
{
    const input = document.getElementById('geoUri').innerHTML;
    // console.log(input)

    if ( input === null || input === '' )
    {
        alert("Error: click the map.");
    }
    else
    {
        const url = 'https://geohack.toolforge.org/geohack.php?params=';
        const p   = geoURI_to_geohackString(input.split(';u=')[0]);
        window.open(url+p, '_blank').focus();
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
    return Number.parseFloat(x).toFixed(6); // 5 or 6 decimal digits for 1 meter, see https://gis.stackexchange.com/a/208739/7505
}



var defaultMap;
var defaultMapIsocode;
var defaultMapBase;
var toggleTooltipStatus = false;
var toggleCoverStatus = false;
var isLogAfaCodeAbs = false;
var getCover = true;
var uri = window.location.href;

let pathname = window.location.pathname;
pathname = pathname.split(/[#]/)[0]

function checkCountry(string,reset=true)
{
    for(let key in countries)
    {
        let regex = new RegExp("^/?" + key + ".*","i");

        if(regex.test(string) || countries[key].isocoden === string)
        {
            defaultMap = countries[key];
            defaultMapIsocode = key;

            if (/^\/*[A-Z]{2}\+.+/.test(string))
            {
                defaultMapBase = defaultMap.scientificBase;
                isLogAfaCodeAbs = false;
            }
            else if (/^\/*[A-Z]{2}\~.+/.test(string))
            {
                defaultMapBase = defaultMap.postalcodeBaseAbs;
                isLogAfaCodeAbs = true;
            }

            reset ? resetDef() : '';
            break;
        }
    }
}

if (pathname.match(/^\/[A-Z]{2}.+$/i))
{
    checkCountry(pathname,false)
}


function createGeoJSONLayer(styleFunc, featureFunc, filterFunc) {
    return new L.geoJSON(null, {
        style: styleFunc || style,
        onEachFeature: featureFunc || onEachFeature,
        pointToLayer: pointToLayer,
        filter: filterFunc || undefined
    });
}

var layerPolygonCurrent = createGeoJSONLayer();
var layerCenterCurrent = createGeoJSONLayer();
var layerPolygonCurrentGrid = createGeoJSONLayer(stylePolygonCurrentGrid,onEachFeaturePolygonCurrentGrid,filterLayer);
var layerOlcGhsCurrent = createGeoJSONLayer(styleOlcGhs, onEachFeatureOlcGhs);
var layerOlcGhsAll = createGeoJSONLayer(styleOlcGhs, onEachFeatureOlcGhsAll);
var layerGridAll = createGeoJSONLayer(stylePolygonCurrentGrid,onEachFeaturePolygonCurrentGrid,filterLayer);
var layerJurisdAll = createGeoJSONLayer(styleJurisdAll,onEachFeatureJurisd);
var layerCoverAll = createGeoJSONLayer(styleCoverAll,onEachFeatureCoverAll);
var layerJurisdAll2 = createGeoJSONLayer(styleJurisdAll2,onEachFeatureJurisd);
var layerPolygonAll = createGeoJSONLayer(style,onEachFeaturePolygonAll);
var layerCenterAll = createGeoJSONLayer(style,onEachFeaturePolygonAll);
var layerMarkerCurrent = new L.featureGroup();
var layerMarkerAll = new L.featureGroup();

var overlays = {
    'AFAcode (Active)': layerPolygonCurrent,
    // 'AFAcode (All)': layerPolygonAll,
    'AFAcode (Center)': layerCenterCurrent,
    // 'AFAcode (All center)': layerCenterAll,
    'AFAcode (Grid)': layerPolygonCurrentGrid,
    // 'AFAcode (All grid)': layerGridAll,
    'Markers (Active)': layerMarkerCurrent,
    // 'Markers (All)': layerMarkerAll,
    'Coverage': layerCoverAll,
    'Jurisdiction (Official)': layerJurisdAll,
    'Jurisdiction (Buffered)': layerJurisdAll2,
    'OLC/GHS (Active)': layerOlcGhsCurrent,
    'OLC/GHS (All)': layerOlcGhsAll,
};

var openstreetmap = L.tileLayer(osmUrl,{/*attribution: genericAttrib,*/detectRetina: true,minZoom: 0,maxNativeZoom: 19,maxZoom: 25 }),
    grayscale = L.tileLayer(cartoUrl, {id:'light_all', /*attribution: genericAttrib,*/detectRetina: true,maxNativeZoom: 22,maxZoom: 25 });

var baseLayers = {
    'Grayscale': grayscale,
    'OpenStreetMap': openstreetmap };

var map = L.map('map',{
    center: defaultMap.center,
    zoom:   defaultMap.zoom,
    attributionControl: true,
    zoomControl: false,
    renderer: L.svg(),
    layers: [grayscale, layerPolygonCurrent, layerCenterCurrent, layerPolygonCurrentGrid, layerJurisdAll2, layerOlcGhsCurrent, layerOlcGhsAll] });

map.attributionControl.setPrefix(false);
map.on('click', handleMapClick);



var decodeGgeohash = L.control({position: 'topleft'});
decodeGgeohash.onAdd = function (map) {
    this.container = L.DomUtil.create('div');
    this.label_field  = L.DomUtil.create('label', '', this.container);
    this.field = L.DomUtil.create('input', '', this.container);
    this.button = L.DomUtil.create('button','leaflet-control-button',this.container);

    this.label_field.for = 'fielddecode';
    this.label_field.innerHTML = 'Grid id: ';

    this.field.type = 'text';
    this.field.placeholder = 'e.g.: ' + defaultMapBase.placeholderDecode;
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
    this.select_tcode.innerHTML = '<option value="none">(Free)</option><option value="">AFAcode</option><option value="olc">OLC</option><option value="ghs">GHS</option>'

    this.label_field.for = 'fieldencode';
    this.label_field.innerHTML = 'Equivalent Geo URI:<br/>';
    this.field.type = 'text';
    this.field.placeholder = 'e.g.: ' + defaultMapBase.placeholderEncode;
    this.field.id = 'fieldencode';
    this.button.type = 'button';
    this.button.innerHTML= "Encode";

    this.span.innerHTML= " or ";

    this.button2.type = 'button';
    this.button2.innerHTML= "Open with Geohack";
    L.DomEvent.disableScrollPropagation(this.container);
    L.DomEvent.disableClickPropagation(this.container);
    L.DomEvent.on(this.button,  'click', getEncode, this.container);
    L.DomEvent.on(this.button2, 'click', () => go_to_geohackString(), this.container);
    L.DomEvent.on(this.field, 'keyup', function(data){if(data.keyCode === 13){getEncode(data);}}, this.container);
    L.DomEvent.on(this.select_tcode, 'change', changePlaceholder, this.container);

    return this.container;
  };

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
    // this.select_grid.innerHTML = generateSelectGrid(defaultMapBase.selectGrid)

    this.label_level.for = 'level';
    this.label_level.innerHTML = '<a href="https://wiki.addressforall.org/doc/osmc:Viz/Navega%C3%A7%C3%A3o" target="_help">Level</a>: ';
    this.select_level.id = 'level_size';
    this.select_level.name = 'level';
    this.select_level.innerHTML = generateSelectLevel(defaultMapBase);

    L.DomEvent.disableScrollPropagation(this.container);
    L.DomEvent.disableClickPropagation(this.container);

    return this.container; };

var levelFilter = L.control({position: 'topleft'});
levelFilter.onAdd = function (map) {
    this.container     = L.DomUtil.create('div');
    this.label_filter  = L.DomUtil.create('label', '', this.container);
    this.select_filter = L.DomUtil.create('select', '', this.container);

    this.label_filter.for = 'filter';
    this.label_filter.innerHTML = 'Level filter: ';
    this.select_filter.id = 'filter_size';
    this.select_filter.name = 'filter';

    // if(defaultMapBase.name === 'base16h')
    // {
    //     this.select_filter.innerHTML = '<option value="0">All</option><option value="1">Half</option><option value="2">Int</option><option value="4">Hexadecimal</option><option value="5">base32</option><option value="51">base32 BR</option>'
    // }
    // else
    // {
    //     this.select_filter.innerHTML = '<option value="0">All</option><option value="1">Half</option><option value="2">Int</option><option value="4">Hexadecimal</option><option value="5">base32</option><option value="51" selected>base32 BR</option>'
    // }

    // Define common options
    const options = [
        { value:  0, label: 'All' },
        { value:  1, label: 'Half' },
        { value:  2, label: 'Int' },
        { value:  4, label: 'Hexadecimal' },
        { value:  5, label: 'base32' },
        { value: 51, label: 'base32 BR' }
    ];

    // Determine if base32 BR (value 51) should be selected
    const selectedValue = (defaultMapBase.name === 'base16h') ? null : 51;

    // Generate HTML options
    const html = options.map(opt => {
        const selectedAttr = (opt.value === selectedValue) ? ' selected' : '';
        return `<option value="${opt.value}"${selectedAttr}>${opt.label}</option>`;
    }).join('');
    // Set innerHTML
    this.select_filter.innerHTML = html;

    L.DomEvent.disableScrollPropagation(this.container);
    L.DomEvent.disableClickPropagation(this.container);

    L.DomEvent.on(this.select_filter, 'change', updateSelectLevel, this.container);

    return this.container; };

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
        container.onclick = () => { getMyLocation(handleLocation); };

        L.DomEvent.disableScrollPropagation(container);
        L.DomEvent.disableClickPropagation(container);
        return container;
    }
});


// Cria um container de controle customizado
const CustomControlContainer = L.Control.extend({
options: { position: 'bottomright' },

onAdd: function(map) {
    const container = L.DomUtil.create('div', 'custom-control-container');

    // Cria o botão de créditos
    const creditBtn = L.DomUtil.create('div', 'leaflet-control');
    creditBtn.innerHTML = '&#8505';
    creditBtn.title = 'Credits';
    creditBtn.onclick = function() {
    window.location.href = 'https://wiki.addressforall.org/doc/osmc:Atribui%C3%A7%C3%B5es'; // Substitua pela URL real
    };

    L.DomEvent.disableClickPropagation(creditBtn);
    container.appendChild(creditBtn);

    // Adiciona a escala dentro do container
    const scale = L.control.scale({ position:'bottomright',imperial: false });
    scale.addTo(map);

    // Move o elemento da escala para dentro do nosso container customizado
    setTimeout(() => {
    const scaleEl = document.querySelector('.leaflet-control-scale');
    if (scaleEl) {
        container.appendChild(scaleEl);
    }
    }, 0);



    return container;
}
});





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


const clearControl = createControl({id: 'clear', buttonLabel: 'Clear all', buttonAction: resetDef, position: 'topleft'});
const toggleTooltipControl = createControl({id: 'tooltip', buttonLabel: 'Tooltip', buttonAction: toggleTooltipLayers, position: 'topleft'});
const toggleCoverageControl = createControl({id: 'coverage', buttonLabel: 'Coverage', buttonAction: toggleCoverLayers, position: 'topleft'});
const officialBordersControl = createControl({id: 'officialborders', buttonLabel: 'Official Borders', buttonAction: toggleOfficialBordersLayers, position: 'topleft'});
const zoomClickControl = createControl({id: 'zoomclick', label: 'Disable zoom-click: ', checkbox: true, checked: true, buttonAction: () => {}, position: 'topleft'});
const keepPreviousClickControl = createControl({id: 'keepclick', label: 'Keep previous clicks: ', checkbox: true, checked: true, buttonAction: toggleKeepClick, position: 'topleft'});
const noTooltipControl = createControl({id: 'notooltip', label: 'No tooltip: ', checkbox: true, checked: true, buttonAction: toggleTooltipLayers, position: 'topleft'});

map.addControl(new myLocationControl());
map.addControl(new CustomControlContainer());
map.addControl(new L.Control.Fullscreen({position:'topleft'})); /* https://github.com/Leaflet/Leaflet.fullscreen */
var zoom   = L.control.zoom({position:'topleft'});
var layers = L.control.layers(baseLayers, overlays,{position:'topleft'});
// var escala = L.control.scale({position:'bottomright',imperial: false});

var controlsToAdd = [
    {control: zoom, target: null},
    {control: layers, target: null},
    // {control: escala, target: null},
    {control: zoomClickControl, target: 'custom-map-controlsa'},
    {control: geoUriDiv, target: null},
    {control: decodeGgeohash, target: 'custom-map-controlsa'},
    {control: encodeGgeohash, target: 'custom-map-controlsa'},
    {control: level, target: 'custom-map-controlsa'},
    {control: levelFilter, target: 'custom-map-controlsa'},
    {control: clearControl, target: 'custom-map-controlsb'},
    {control: toggleTooltipControl, target: 'custom-map-controlsb'},
    {control: officialBordersControl, target: 'custom-map-controlsb'},
    {control: toggleCoverageControl, target: 'custom-map-controlsb'}
];

controlsToAdd.forEach(function(item) {
    item.control.addTo(map);

    if (item.target) {
        var targetElement = document.getElementById(item.target);
        if (targetElement) {
            targetElement.appendChild(item.control.getContainer());
        }
    }
});


function resetDef()
{
    layerPolygonCurrent.clearLayers();
    layerCenterCurrent.clearLayers();
    layerPolygonCurrentGrid.clearLayers();
    layerGridAll.clearLayers();
    layerCenterAll.clearLayers();
    layerPolygonAll.clearLayers();
    layerMarkerCurrent.clearLayers();
    layerMarkerAll.clearLayers();
    layerOlcGhsCurrent.clearLayers();
    layerOlcGhsAll.clearLayers();
    map.removeLayer(layerCoverAll); toggleCoverStatus = true
    // map.setView(defaultMap.center, defaultMap.zoom);
    document.getElementById('level_size').innerHTML = generateSelectLevel(defaultMapBase);
    document.getElementById('grid').innerHTML = generateSelectGrid(defaultMapBase.selectGrid);
    document.getElementById('fielddecode').placeholder = 'geocode, e.g.: ' + defaultMapBase.placeholderDecode;
    document.getElementById('fieldencode').placeholder = 'geo: ' + defaultMapBase.placeholderEncode;
}

function zoomToJurisd()
{
    map.setView(defaultMap.center, defaultMap.zoom);
}

function toggleTooltipLayers()
{
    map.eachLayer(function(l)
    {
        if(map.hasLayer(l))
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
    map.hasLayer(layerPolygonAll) ? map.removeLayer(layerPolygonAll) : map.addLayer(layerPolygonAll)
}

function toggleCoverLayers()
{
    if(getCover)
    {
        loadGeojson(uri_base_api + "/geo:iso_ext:" + defaultMapIsocode + "/cover",[layerCoverAll],function(e){},function(e){});
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

function updateSelectLevel()
{
    let level = document.getElementById('level_size').value
    let filter = document.getElementById('filter_size').value

    document.getElementById('level_size').innerHTML = generateSelectLevel(defaultMapBase,level,filter);
}

function changePlaceholder()
{
    let tcode = document.getElementById('tcode').value
    let input = document.getElementById('fieldencode').value

    if (tcode.match(/^(olc|ghs|ghs64)$/i) && (input === null || input === ''))
    {
        document.getElementById('fieldencode').placeholder = 'e.g.: geo:' + ( tcode === '' ? '' : tcode + ':' ) + defaultMapBase.placeholderEncode;
    }
    else
    {
        document.getElementById('fieldencode').placeholder = 'e.g.: ' + defaultMapBase.placeholderEncode;
    }
}

// Regular expressions for geoURI validation
const regexGeoUri  = /^(geo:((olc|ghs|ghs64):)?)?(\-?\d+\.?\d*,\-?\d+\.?\d*)((;u=)(\d+\.?\d*))?$/i;
const regexLex  = /^(urn|geo):lex:.+$/i;

// Function to check if type is Afacode
function isTypeAfaCode()
{
    const type = document.getElementById('tcode').value;
    return type === '' || type === 'none';
}

// Function to build the geo prefix
function buildGeoPrefix(encode = true)
{
    return encode ? `geo:${isTypeAfaCode() ? '' : `${document.getElementById('tcode').value}:`}` : 'geo:afa:';
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
            u_value = levelValues[defaultMapBase.endLevel]
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
    let uri = `${uri_base_api}/${geouri}`;

    if (isLex) {
        loadGeojson(geouri,[layerJurisdAll],afterLoadJurisdAll,afterData);
        return;
    }

    if (geolocation) {
        window.location.href = `${uri_base_api}/${geouri}`;
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
        // const insidePolygon = isLatLngInsideJurisdiction(latLngArray[0],latLngArray[1],layerJurisdAll2);
        // const context = getJurisdictionContext();

        if(isAfacode)
        {
            if(isLogAfaCodeAbs)
            {
                uri += '/' + defaultMapIsocode
            }
            else
            {
                uri += "/" + defaultMapBase.name + '/' + defaultMapIsocode
            }
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
            // const context = getJurisdictionContext();
            //
            // if (isAfacode && context !== null)
            // {
            //     geouri = buildGeoPrefix(false) + context + defaultMap.postalcodeBase.symbol + geouri
            // }
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
        // let isAfacode = isCode && (isCode[3] === undefined);
        let isAfacode = isTypeAfaCode();

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










// ========== CONFIGURAÇÕES CONSOLIDADAS ==========
var LayerConfig = {
    styles: {
        default: { color: 'black', fillColor: 'deeppink', fillOpacity: 0.1, weight: 0 },
        olcGhs: { color: 'black', fillColor: 'yellow', fillOpacity: 0.1, weight: 0 },
        cover: { color: 'black', fillColor: 'deeppink', fillOpacity: 0.1, weight: 1 },
        jurisdOfficial: { color: 'red', fillColor: 'none', fillOpacity: 0.1, weight: 2, dashArray: '5, 5' },
        jurisdBuffered: { color: 'red', fillColor: 'none', fillOpacity: 0.1 },
        grid: function(feature) {
            return feature.geometry.type === 'Point' ?
                { color: 'deeppink', weight: 1 } :
                { color: 'deeppink', fillColor: 'deeppink', fillOpacity: 0.1, weight: 1 };
        }
    },
    tooltips: {
        default: 'tooltipbase16h1c',
        subcell: 'tooltipbase16h1ca'
    },
    circleMarker: { color: 'black', radius: 3, weight: 1, opacity: 0.8, fillOpacity: 0.6 }
};

// ========== FUNÇÕES DE ESTILO CONSOLIDADAS ==========
function style(feature) { return LayerConfig.styles.default; }
function styleOlcGhs(feature) { return LayerConfig.styles.olcGhs; }
function styleCoverAll(feature) { return LayerConfig.styles.cover; }
function styleJurisdAll(feature) { return LayerConfig.styles.jurisdOfficial; }
function styleJurisdAll2(feature) { return LayerConfig.styles.jurisdBuffered; }
function stylePolygonCurrentGrid(feature) { return LayerConfig.styles.grid(feature); }

// ========== UTILITÁRIO PARA CIRCLE MARKERS ==========
function addCircleMarkerToLayer(layer, targetLayer) {
    L.circleMarker(layer.getBounds().getCenter(), LayerConfig.circleMarker).addTo(targetLayer);
}


function onFeatureClick(feature)
{
    let zoomclick = document.getElementById('zoomclick')
    zoomclick.checked ? '' : map.fitBounds(feature.target.getBounds())
}

function pointToLayer(feature,latlng)
{
    return L.circleMarker(latlng,LayerConfig.circleMarker);
}
function filterLayer(feature, layer) {
        return feature.properties.code_subcell;
    }

function highlightFeature(e)
{
    this.openTooltip();
}
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



function resetHighlight(e,layer)
{
    layerPolygonCurrent.resetStyle(e.target);
    layerPolygonAll.resetStyle(e.target);
}
function resetHighlightOlcGhs(e,layer)
{
    layerOlcGhsCurrent.resetStyle(e.target);
    layerOlcGhsAll.resetStyle(e.target);
}

function resetHighlightCoverAll(e,layer)
{
    layerCoverAll.resetStyle(e.target);
}
function resetHighlightPolygonCurrentGrid(e,layer)
{
    layerPolygonCurrentGrid.resetStyle(e.target);
    layerGridAll.resetStyle(e.target);
}







function onEachFeatureOlcGhs(feature,layer)
{
    popUpFeature(feature,layer);
    layerTooltipFeature(feature,layer);
    addCircleMarkerToLayer(layer, layerOlcGhsCurrent);
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
    addCircleMarkerToLayer(layer,layerOlcGhsAll);
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
    addCircleMarkerToLayer(layer,layerCenterAll);
    layer.on({
        click: onFeatureClick,
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
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
function onEachFeaturePolygonCurrentGrid(feature,layer)
{
    popUpFeature(feature,layer);
    layerTooltipFeature3(feature,layer);
    layer.on({
        click: onFeatureClick,
        mouseover: highlightFeature,
        mouseout: resetHighlightPolygonCurrentGrid
    });
}

function onEachFeaturePolygonAllGrid(feature,layer)
{
    popUpFeature(feature,layer);
    layerTooltipFeature2(feature,layer);
    layer.on({
        click: onFeatureClick
    });
}


function onEachFeatureJurisd(feature,layer)
{
    // Criar popup com dados da jurisdição
    var fields = [
        'osm_id', 'jurisd_base_id', 'jurisd_local_id', 'parent_id', 'admin_level',
        'name', 'parent_abbrev', 'abbrev', 'wikidata_id', 'lexlabel', 'isolabel_ext',
        'lex_urn', 'name_en', 'isolevel', 'area'
    ];

    var popupContent = fields.map(function(field) {
        return field + ': ' + (feature.properties[field] || '');
    }).join('<br>');

    document.getElementById('nameJurisd').innerHTML = ' of ' + feature.properties.name;

    layer.bindPopup(popupContent);
}

function onEachFeature(feature,layer)
{
    popUpFeature(feature,layer);
    layerTooltipFeature(feature,layer);

    layerCenterCurrent.clearLayers();

    addCircleMarkerToLayer(layer,layerCenterCurrent);

    if(isLogAfaCodeAbs)
    {
        if(feature.properties.logistic_id)
        {
            document.getElementById('logCode').innerHTML = feature.properties.logistic_id.split("~")[1].replace(/^(.{5})/, '$1-');

            const qr = kjua({
                text: (window.location.origin).toUpperCase() +'/'+ feature.properties.logistic_id,
                render: 'svg',
                size: 150,
                ecLevel: 'L' // L = Low
            });

            document.getElementById('qr-container').replaceChildren(qr);
        }

        if(feature.id)
        {
            const codsci = ((feature.id).split("+",2)[1]).replace(/([GQHMRVJKNPSTZY])/g,'\.$1');
            document.getElementById('sciCode').innerHTML = '<a href="' + uri_base + '/' + feature.id + '">' + defaultMapIsocode + defaultMap.scientificBase.symbol +'<span class="feSchrift">'+ codsci +'</span></a>';
        }
    }
    else
    {
        if(feature.id)
        {
            document.getElementById('sciCode').innerHTML = (((((feature.id).split("+", 2)[1]).replace(/(...)(?!$)/g,'$1.')).replace(/([GQHMRVJKNPSTZY])/g,'\.$1')).replace(/(\.\.)/g,'\.'));



            const qr = kjua({
                text: (window.location.origin).toUpperCase() +'/'+ feature.id,
                render: 'svg',
                size: 150,
                ecLevel: 'L' // L = Low
            });

            document.getElementById('qr-container').replaceChildren(qr);
        }
    }

    layer.on({
        click: onFeatureClick,
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
}




//

function afterLoadLayer(featureGroup)
{
    let zoomclick = document.getElementById('zoomclick')
    let zoom = map.getBoundsZoom(featureGroup.getBounds());
    zoomclick.checked ? '' : map.setView(featureGroup.getBounds().getCenter(),zoom-(zoom < 10 ? 1: (zoom < 20 ? 2: (zoom < 24 ? 3: 4))))
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
    // if(toggleCoverStatus)
    // {
        afterLoadJurisdAll(featureGroup,fittobounds,setmaxbounds)
    // }
    // else
    // {
    //     map.removeLayer(featureGroup);
    //     toggleCoverStatus = true
    // }
}

function afterDataOlcGhs(data,layer)
{
    if(data.features.length = 1)
    {
        if(data.features[0].properties.side)
        {
            document.getElementById('level_size').innerHTML = generateSelectLevel(defaultMapBase,data.features[0].properties.side,document.getElementById('filter_size').value);

            const center = layer.getBounds().getCenter();
            const { lat, lng } = center;
            const stringgeo = 'geo:' + latRound(lat) + "," + latRound(lng) + ";u=" + document.getElementById('level_size').value;

            document.getElementById('geoUri').innerHTML = stringgeo;
            document.getElementById('fieldencode').value = stringgeo;
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
            if( data.type === "FeatureCollection")
            {
                arrayLayer[i].addData(data.features);
            }
            else
            {
                arrayLayer[i].addData(data);
            }
        }

        afterLoad(arrayLayer[0]);

        afterData(data,arrayLayer[0]);

        fixZOrder(overlays);
    })
    .catch(err => {})
}



// end common


// Layer layerPolygonCurrent
function popUpFeature(feature,layer)
{
    sufix_area =(feature.properties.area<1000000)? 'm²': 'km²';
    value_area =(feature.properties.area<1000000)? Math.round(feature.properties.area*100.0)/100 : Math.round((feature.properties.area*100/1000000))/100;
    sufix_side =(feature.properties.side<1000)? 'm': 'km';
    value_side =(feature.properties.side<1000)? Math.round(feature.properties.side*100.0)/100 : Math.round(feature.properties.side*100.0/1000)/100;

    var popupContent = "";

    if(feature.properties.type)
    {
        popupContent += (feature.properties.type).toUpperCase() + " code: <big><code>" + (feature.properties.code) + "</code></big><br>";
    }
    else if(feature.properties.index)
    {
        popupContent += "Id: <big><code>" + (feature.properties.index) + "</code></big><br>";
    }
    else
    {
        popupContent += "Id: <big><code>" + (isLogAfaCodeAbs ? (feature.properties.logistic_id) : (feature.id) ) + "</code></big><br>";
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
    else if(feature.properties.type)
    {
        var layerTooltip = feature.properties.code;
    }
    else
    {
        var layerTooltip = (isLogAfaCodeAbs ? (feature.properties.logistic_id) : (feature.id) );
    }

    layer.bindTooltip(layerTooltip,{ permanent:toggleTooltipStatus,direction:'auto',className:'tooltipbase16h1c'});
}

function layerTooltipFeature2(feature,layer)
{
    layer.bindTooltip((isLogAfaCodeAbs ? (feature.properties.logistic_id) : (feature.id) ),{ permanent:toggleTooltipStatus,direction:'auto',className:'tooltipbase16h1ca'});
}

function layerTooltipFeature3(feature,layer)
{
    layer.bindTooltip(feature.properties.code_subcell,{ permanent:toggleTooltipStatus,direction:'auto',className:'tooltipbase16h1ca'});
}

function afterData(data,layer)
{
    if( data.type === "Feature" || ( data.type === "FeatureCollection" && data.features.length == 1) )
    {
        if( data.type === "FeatureCollection")
        {
            data = data.features[0]
        }

        if(data.properties.jurisd_base_id)
        {
            checkCountry(data.properties.jurisd_base_id,false)
        }

        if (!data.properties.index)
        {
            if(isLogAfaCodeAbs)
            {
                if(data.properties.logistic_id)
                {
                    var nextURL = uri_base + "/" + data.properties.logistic_id
                    const nextTitle = 'AFA.codes: ' + data.properties.logistic_id;
                    const nextState = { additionalInformation: 'to canonical.' };

                    window.history.pushState(nextState, nextTitle, nextURL);

                    document.getElementById('fielddecode').value = data.properties.logistic_id;

                    if(data.properties.truncated_code)
                    {
                        alert("Geocódigo truncado. Número de dígitos excedeu o limite de níveis da grade.");
                    }
                }
            }
            else
            {
                if(data.id)
                {
                    var nextURL = uri_base + "/" + data.id
                    const nextTitle = 'AFA.codes: ' + data.id;
                    const nextState = { additionalInformation: 'to canonical.' };

                    window.history.pushState(nextState, nextTitle, nextURL);

                    document.getElementById('fielddecode').value = data.id;

                    if(data.properties.truncated_code)
                    {
                        alert("Geocódigo truncado. Número de dígitos excedeu o limite de níveis da grade.");
                    }
                }
            }

            if(data.properties.side)
            {
                document.getElementById('level_size').innerHTML = generateSelectLevel(defaultMapBase,data.properties.side,document.getElementById('filter_size').value);

                const center = layer.getBounds().getCenter();
                const { lat, lng } = center;
                const stringgeo = 'geo:' + latRound(lat) + "," + latRound(lng) + ";u=" + document.getElementById('level_size').value;

                document.getElementById('geoUri').innerHTML = stringgeo;
                document.getElementById('fieldencode').value = stringgeo;
            }
        }
    }
}



var uriApi = ''
var uriApiJurisd = ''

const reg_esp_caracter = /\./g
pathnameNoDot = pathname.replace(reg_esp_caracter,"");

if (pathname.match(/\/base16\/grid/))
{
    uriApi = uri.replace(/(\/base16\/grid)/, "$1");
}
else if (pathname.match(/(\/base16h)?\/grid/))
{
    uriApi = uri.replace(/((\/base16h)?\/grid)/, "$1");
}
else if (pathnameNoDot.match(/\/[A-Z]{2}[\~\-].*$/i))
{

    // Extrai o código após a barra
    const match = pathnameNoDot.match(/\/([A-Z]{2})([\~\-])(.*)$/i);

    const countryCode = match[1]; // BR
    const restOfCode = match[3];  // 9Z0QQVGR ou 9Z0QQ-VGR

    // Remove qualquer hífen, normaliza com ~
    const normalizedCode = `${countryCode}~${restOfCode.replace(/-/g, "")}`;

    uriApi = uriApi = `${uri_base_api}/geo:afa:${normalizedCode}`;
    uriApiJurisd = uri_base_api + "/geo:iso_ext:" + defaultMapIsocode;
}
else if (pathnameNoDot.match(/\/[A-Z]{2}\+.*$/i))
{
    uriApi = uri_base_api + pathnameNoDot.replace(/\/([A-Z]{2}\+.*)$/i, "/geo:afa:$1");
    uriApiJurisd = uri_base_api + "/geo:iso_ext:" + defaultMapIsocode;
}
else if (pathname.match(/\/[A-Z]{2}\/geo:(olc|ghs):.+$/i))
{
    loadGeojson(uri.replace(/\/[A-Z]{2}\/(geo:(olc|ghs).*)$/i, "/$1"),[layerOlcGhsCurrent,layerOlcGhsAll],afterLoadLayer,afterDataOlcGhs)
    loadGeojson(uri.replace(/\/([A-Z]{2})\/(geo:(olc|ghs).*)$/i, "/geo:iso_ext:$1"),[layerJurisdAll],function(e){afterLoadJurisdAll(e,false,false)},afterData);
}
else if (pathname.match(/^\/geo:.+$/i))
{
    uriApi = uri;
    getJurisdAfterLoad = true;
}

if(uriApi !== null && uriApi !== '')
{
    loadGeojson(uriApi,[layerPolygonCurrent,layerPolygonAll],afterLoadLayer,afterData);
}

if(uriApiJurisd !== null && uriApiJurisd !== '')
{
    loadGeojson(uriApiJurisd,[layerJurisdAll],function(e){afterLoadJurisdAll(e,false,false)},afterData);
    loadGeojson(uriApiJurisd + '/buffer',[layerJurisdAll2],function(e){afterLoadLayerCoverAll(e,false,false)},function(e){});
}
