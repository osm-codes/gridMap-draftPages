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
    console.log(input)

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
var defaultMapBase;
var toggleTooltipStatus = false;
var toggleCoverStatus = false;
var isLogAfaCodeAbs = false;

function checkCountry(string,reset=true)
{
    for(let key in countries)
    {
        let regex = new RegExp("^/?" + key + ".*","i");

        if(regex.test(string) || countries[key].isocoden === string)
        {
            defaultMap = countries[key];

            if (/^\/*[A-Z]{2}\+/.test(string))
            {
                defaultMapBase = defaultMap.scientificBase;
            }
            else
            {
                defaultMapBase = defaultMap.postalcodeBaseAbs;
                isLogAfaCodeAbs = true;
            }

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


var openstreetmap = L.tileLayer(osmUrl,{/*attribution: genericAttrib,*/detectRetina: true,minZoom: 0,maxNativeZoom: 19,maxZoom: 25 }),
    grayscale = L.tileLayer(cartoUrl, {id:'light_all', /*attribution: genericAttrib,*/detectRetina: true,maxNativeZoom: 22,maxZoom: 25 });

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

var layerPolygonCurrentGrid = new L.geoJSON(null, {
            style: stylePolygonCurrentGrid,
            onEachFeature: onEachFeaturePolygonCurrentGrid,
            pointToLayer: pointToLayer,
            filter: filterLayer,
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

var layerGridAll = new L.geoJSON(null, {
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
    'AFAcode (Active)': layerPolygonCurrent,
    // 'AFAcode (All)': layerPolygonAll,
    'AFAcode (Center)': layerCenterCurrent,
    // 'AFAcode (All center)': layerCenterAll,
    'AFAcode (Grid)': layerPolygonCurrentGrid,
    // 'AFAcode (All grid)': layerGridAll,
    'Markers (Active)': layerMarkerCurrent,
    // 'Markers (All)': layerMarkerAll,
    // 'Coverage': layerCoverAll,
    'Jurisdiction (Official)': layerJurisdAll,
    'OLC/GHS (Active)': layerOlcGhsCurrent,
    'OLC/GHS (All)': layerOlcGhsAll,
};

var map = L.map('map',{
    center: defaultMap.center,
    zoom:   defaultMap.zoom,
    attributionControl: true,
    zoomControl: false,
    renderer: L.svg(),
    layers: [grayscale, layerPolygonCurrent, layerCenterCurrent, layerPolygonCurrentGrid, layerCoverAll, layerJurisdAll,layerOlcGhsCurrent,layerOlcGhsAll] });

map.attributionControl.setPrefix(false);
map.addControl(new L.Control.Fullscreen({position:'topleft'})); /* https://github.com/Leaflet/Leaflet.fullscreen */
map.on('click', handleMapClick);

var zoom   = L.control.zoom({position:'topleft'});
var layers = L.control.layers(baseLayers, overlays,{position:'topleft'});
// var escala = L.control.scale({position:'bottomright',imperial: false});

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

map.addControl(new myLocationControl());


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

  map.addControl(new CustomControlContainer());


[zoom, layers, geoUriDiv, /*escala,*/ decodeGgeohash, encodeGgeohash, level, levelFilter, clear, toggleTooltip]
    .forEach(control => control.addTo(map));

var a = document.getElementById('custom-map-controlsa');
var b = document.getElementById('custom-map-controlsb');
a.appendChild(decodeGgeohash.getContainer());
a.appendChild(encodeGgeohash.getContainer());
a.appendChild(level.getContainer());
a.appendChild(levelFilter.getContainer());
b.appendChild(clear.getContainer());
b.appendChild(toggleTooltip.getContainer());

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

/*

function getDecode(data)
{
    let input = document.getElementById('fielddecode').value

    if (input.match(/^geo:(olc|ghs):.+$/i))
    {
        var uri = uri_base_api + "/" + input;

        loadGeojson(uri,[layerOlcGhsCurrent,layerOlcGhsAll],afterLoadLayer,function(e){});
    }
    else if(input !== null && input !== '')
    {
        var uri = uri_base_api + "/geo:afa:"

        let regex = new RegExp("^" + defaultMap.isocode + "[+].*","i");

        if(!regex.test(input))
        {
            if(defaultMapBase.name === 'base16h')
            {
                uri += defaultMap.isocode + defaultMapBase.symbol
            }
        }

        uri += input
        document.getElementById('fieldencode').value = '';

        loadGeojson(uri,[layerPolygonCurrent,layerPolygonAll],afterLoadLayer,afterData);
    }
}

function getEncode(noData)
{
    let input = document.getElementById('fieldencode').value
    let level = document.getElementById('level_size').value
    let tcode = document.getElementById('tcode').value
    let grid = '' // document.getElementById('grid').value
    let context = defaultMap.isocode;

    let uri = uri_base_api + "/";

    if(input !== null && input !== '' && input.match(/^((geo:((olc|ghs|ghs64|lex):)?)?|(urn:lex:))?(\-?\d+\.?\d*,\-?\d+\.?\d*)(;u=\d+\.?\d*)?$/i))
    {
        let tp = 'geo:' + ( tcode === '' ? '' :  ( tcode === 'none' ? '' : tcode + ':' )  ) ;

        let regex  = /^(.*:)?(\-?\d+\.?\d*,\-?\d+\.?\d*)(;u=\d+\.?\d*)?$/i;
        let regex2 = /^(.*)(;u=)(\d+\.?\d*)$/i;

        if(input.match(regex))
        {
            if (!input.match(/^geo:(olc|ghs|ghs64):.+$/i))
            {
                input = input.replace(regex, tp + "$2$3")
            }

            let u_value;

            if(input.match(regex2))
            {
                u_value = Number(input.split(';u=')[1])

                if(u_value == 0)
                {
                    u_value = levelValues[defaultMapBase.endLevel]
                }

                u_value = (u_value > 9 ? Math.round(u_value) : Math.round(u_value*10)/10 )
            }
            else
            {
                u_value = level
            }

            input = input.replace(regex, "$1$2" + ';u=' + u_value)

            uri += input;

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
                document.getElementById('fielddecode').value = '';

                if(defaultMapBase.name === 'base16h')
                {
                    uri += "/" + defaultMapBase.name;
                }

                layerPolygonCurrent.clearLayers();
                if(grid !== '')
                {
                    uri += '/' + context
                    layerPolygonCurrent.clearLayers();
                    layerCenterCurrent.clearLayers();
                    layerPolygonCurrentGrid.clearLayers();
                    loadGeojson(uriGrid,[layerPolygonCurrentGrid,layerGridAll],afterLoadLayer,afterData)
                }
                else
                {
                    uri += '/' + grid + '/' + context
                    layerPolygonCurrentGrid.clearLayers();
                    loadGeojson(uri,[layerPolygonCurrent,layerPolygonAll],afterLoadLayer,afterData)
                }
            }
        }
    }
}

function onMapClick(e)
{
    let level = document.getElementById('level_size').value
    let grid = '' // document.getElementById('grid').value

    var uri;
    var uriWithGrid;

    if(defaultMapBase.name === 'base16h')
    {
        uri = uri_base_api + "/geo:" + e.latlng['lat'] + "," + e.latlng['lng'] + ";u=" + level + "/" + defaultMapBase.name + '/' + defaultMap.isocode
        uriWithGrid = uri_base_api + "/geo:" + e.latlng['lat'] + "," + e.latlng['lng'] + ";u=" + level + "/" + defaultMapBase.name + (grid ? '/' + grid : '') + '/' + defaultMap.isocode
    }
    else
    {
        uri = uri_base_api + "/geo:" + e.latlng['lat'] + "," + e.latlng['lng'] + ";u=" + level + '/' + defaultMap.isocode
        uriWithGrid = uri_base_api + "/geo:" + e.latlng['lat'] + "," + e.latlng['lng'] + ";u=" + level + (grid ? '/' + grid : '') + '/' + defaultMap.isocode
    }
    var popupContent = "latlng: " + e.latlng['lat'] + "," + e.latlng['lng'];

    document.getElementById('fieldencode').value = 'geo:' + latRound(e.latlng['lat']) + "," + latRound(e.latlng['lng']) + ";u=" + level;
    document.getElementById('geoUri').innerHTML = 'geo:' + latRound(e.latlng['lat']) + "," + latRound(e.latlng['lng']) + ";u=" + level;

    layerMarkerCurrent.clearLayers();

    L.marker(e.latlng).addTo(layerMarkerCurrent).bindPopup(popupContent);
    L.marker(e.latlng).addTo(layerMarkerAll).bindPopup(popupContent);

    if(grid !== '')
    {
        layerPolygonCurrent.clearLayers();
        layerCenterCurrent.clearLayers();
        layerPolygonCurrentGrid.clearLayers();
        loadGeojson(uriWithGrid,[layerPolygonCurrentGrid,layerGridAll],afterLoadLayer,afterData)
    }
    else
    {
        layerPolygonCurrentGrid.clearLayers();
        loadGeojson(uri,[layerPolygonCurrent,layerPolygonAll],afterLoadLayer,afterData)
    }
}*/



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

        // if(isAfacode && context !== null)
        // {
            uri += '/BR'// + context;
        // }
        //
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













// Layer layerPolygonCurrent
function style(feature)
{
    return {color: 'black', fillColor: 'deeppink', fillOpacity: 0.1, weight:0};
}
function layerTooltipFeature3(feature,layer)
{
    layer.bindTooltip(feature.properties.code_subcell,{ permanent:toggleTooltipStatus,direction:'auto',className:'tooltipbase16h1ca'});
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

// Layer layerPolygonCurrentGrid
function highlightFeaturePolygonCurrentGrid(e)
{
    this.openTooltip();
}

function filterLayer(feature, layer) {
        return feature.properties.code_subcell;
    }

function resetHighlightPolygonCurrentGrid(e,layer)
{
    layerPolygonCurrentGrid.resetStyle(e.target);
    layerGridAll.resetStyle(e.target);
}

function stylePolygonCurrentGrid(feature)
{
    if(feature.geometry.type === 'Point')
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
    popUpFeature(feature,layer);
    layerTooltipFeature3(feature,layer);

    layer.on({
        click: onFeatureClick,
        mouseover: highlightFeaturePolygonCurrentGrid,
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

//

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
        popupContent += (feature.properties.type).toUpperCase() + " code: <big><code>" + isLogAfaCodeAbs ? (feature.id) : (feature.properties.logistic_id) + "</code></big><br>";
    }
    else if(feature.properties.index)
    {
        popupContent += "Id: <big><code>" + (feature.properties.index) + "</code></big><br>";
    }
    else
    {
        popupContent += "Id: <big><code>" + isLogAfaCodeAbs ? (feature.id) : (feature.properties.logistic_id) + "</code></big><br>";
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
    else
    {
        var layerTooltip = isLogAfaCodeAbs ? (feature.id) : (feature.properties.logistic_id);
    }

    layer.bindTooltip(layerTooltip,{ permanent:toggleTooltipStatus,direction:'auto',className:'tooltipbase16h1c'});
}

function layerTooltipFeature2(feature,layer)
{
    layer.bindTooltip(isLogAfaCodeAbs ? (feature.id) : (feature.properties.logistic_id),{ permanent:toggleTooltipStatus,direction:'auto',className:'tooltipbase16h1ca'});
}


function onEachFeature(feature,layer)
{
    popUpFeature(feature,layer);
    layerTooltipFeature(feature,layer);

    layerCenterCurrent.clearLayers();

    L.circleMarker(layer.getBounds().getCenter(),{color: 'black', radius: 3, weight: 1, opacity: 0.8, fillOpacity: 0.6 }).addTo(layerCenterCurrent);


    if(isLogAfaCodeAbs)
    {
        if(feature.properties.logistic_id)
        {
            document.getElementById('logCode').innerHTML = (((((feature.properties.logistic_id).split("~", 2)[1]).replace(/(...)(?!$)/g,'$1.'))).replace(/(\.\.)/g,'\.'));

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
            document.getElementById('sciCode').innerHTML = '<a href="' + uri_base + '/' + feature.id + '">' + defaultMap.isocode + defaultMap.scientificBase.symbol +'<span class="feSchrift">'+ codsci +'</span></a>';
        }
    }
    else
    {
        if(feature.id)
        {
            document.getElementById('sciCode').innerHTML = (((((feature.id).split("+", 2)[1]).replace(/(...)(?!$)/g,'$1.')).replace(/([GQHMRVJKNPSTZY])/g,'\.$1')).replace(/(\.\.)/g,'\.'));
        }
    }

    layer.on({
        click: onFeatureClick,
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
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
            isLogAfaCodeAbs ? (feature.id) : (feature.properties.logistic_id)

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
else if (pathnameNoDot.match(/\/[A-Z]{2}\~.*$/i))
{
    uriApi = uri_base_api + pathnameNoDot.replace(/\/([A-Z]{2}\~.*)$/i, "/geo:afa:$1");
    uriApiJurisd = uri_base_api + pathnameNoDot.replace(/\/(([A-Z]{2})\~.*)$/i, "/geo:iso_ext:$2");
}
else if (pathnameNoDot.match(/\/[A-Z]{2}\+.*$/i))
{
    uriApi = uri_base_api + pathnameNoDot.replace(/\/([A-Z]{2}\+.*)$/i, "/geo:afa:$1");
    uriApiJurisd = uri_base_api + pathnameNoDot.replace(/\/(([A-Z]{2})\+.*)$/i, "/geo:iso_ext:$2");
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
    loadGeojson(uriApiJurisd + '/cover',[layerCoverAll],function(e){afterLoadLayerCoverAll(e,false,false)},function(e){});
}
