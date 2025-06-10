var uri_base = window.location.protocol + '//' + window.location.hostname;

var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib = '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>';
var cartoUrl = 'https://{s}.basemaps.cartocdn.com/{id}/{z}/{x}/{y}{r}.png';
var cartoAttr = '<a href="https://carto.com/attributions">CARTO</a>';
var osmAndCartoAttr = osmAttrib + '. ' + cartoAttr;
var genericAttrib = '<a href="https://wiki.addressforall.org/doc/osmc:Atribui%C3%A7%C3%B5es" target="_help">info</a>';

var countries = {
    BR:
    {
        name: 'Brasil',
        center: [-15.796,-47.880],
        zoom: 4,
        current_zoom: 4,
        defaultBase: 'base32',
        scientificBase: 'base16h',
        postalcodeBase: 'base32',
        isocode: 'BR',
        isocoden: 76,
        jurisdictionPlaceholder: 'BR-SP-SaoPaulo',
        selectedBases: ['base32','base16h'],
        bases:
        {
            base16h:
            {
                endLevel: 40,
                symbol: '+',
                placeholderDecode: 'BR+3F',
                placeholderEncode: '-15.7,-47.8;u=10',
                placeholderList: '3,5,7,B',
                selectGrid: [2,4,8,16],
            },
            base32:
            {
                endLevel: 40,
                iniLevel: 0,
                levelDefault: 35,
                symbol: '~',
                placeholderDecode: '42',
                placeholderEncode: '-15.7,-47.8;u=10',
                placeholderList: '3,5,7,A',
                selectGrid: [32],
            }
        }
    },
    CM:
    {
        name: 'Cameroun',
        center: [4.8,11.9],
        zoom: 6,
        current_zoom: 6,
        defaultBase: 'base32',
        scientificBase: 'base16h',
        postalcodeBase: 'base32',
        isocode: 'CM',
        isocoden: 120,
        jurisdictionPlaceholder: 'CM-',
        selectedBases: ['base32','base16h'],
        bases:
        {
            base16h:
            {
                endLevel: 36,
                symbol: '+',
                placeholderDecode: 'CM+a2',
                placeholderEncode: '4.8,11.9;u=10',
                placeholderList: 'b,a,c',
                selectGrid: [2,4,8,16],
            },
            base32:
            {
                endLevel: 36,
                iniLevel: 1,
                levelDefault: 31,
                symbol: '~',
                placeholderDecode: '3D5',
                placeholderEncode: '4.8,11.9;u=10',
                placeholderList: '3D5,3D4,2',
                selectGrid: [32],
            },
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
            base16h:
            {
                endLevel: 38,
                symbol: '+',
                placeholderDecode: 'CO+0A2',
                placeholderEncode: '3.5,-72.3;u=10',
                placeholderList: '0A,0B,0C',
                selectGrid: [2,4,8,16],
            },
            base32:
            {
                endLevel: 38,
                iniLevel: 3,
                levelDefault: 33,
                symbol: '~',
                placeholderDecode: '3D5',
                placeholderEncode: '3.5,-72.3;u=10',
                placeholderList: '3D5,3D4,2',
                selectGrid: [32],
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
            base16h:
            {
                endLevel: 35,
                symbol: '+',
                placeholderDecode: 'EC+0E',
                placeholderEncode: '-1.1,-78.4;u=10',
                placeholderList: '0E,0A,05',
                selectGrid: [2,4,8,16],
            },
            base32:
            {
                endLevel: 35,
                iniLevel: 0,
                levelDefault: 35,
                symbol: '~',
                placeholderDecode: '5P',
                placeholderEncode: '-1.1,-78.4;u=10',
                placeholderList: '5P,FL,J9',
                selectGrid: [32],
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
        scientificBase: 'base16h',
        postalcodeBase: 'base32',
        isocode: 'UY',
        isocoden: 868,
        jurisdictionPlaceholder: 'UY-CA-LasPiedras',
        selectedBases: ['base32','base16h'],
        bases:
        {
            base16h:
            {
                endLevel: 36,
                symbol: '+',
                placeholderDecode: 'UY+2',
                placeholderEncode: '-32.9,-55.9;u=10',
                placeholderList: '2G,3A,01',
                selectGrid: [2,4,8,16],
            },
            base32:
            {
                endLevel: 36,
                iniLevel: 4,
                levelDefault: 29,
                symbol: '~',
                placeholderDecode: '3',
                placeholderEncode: '-32.9,-55.9;u=10',
                placeholderList: '3,2C,4F',
                selectGrid: [32],
            }
        }
    },
    SV:
    {
        name: 'El Salvador',
        center: [13.6,-89.1],
        zoom: 6,
        current_zoom: 6,
        defaultBase: 'base32',
        scientificBase: 'base16h',
        postalcodeBase: 'base16h2',
        isocode: 'SV',
        isocoden: 222,
        jurisdictionPlaceholder: 'SV-SA-SantaAna',
        selectedBases: ['base16h'],
        bases:
        {
            base16h:
            {
                endLevel: 32,
                symbol: '+',
                placeholderDecode: 'SV+a',
                placeholderEncode: '13,6,-89,1;u=10',
                placeholderList: 'b,a,c',
                selectGrid: [2,4,8,16],
            },
            base16h2:
            {
                endLevel: 32,
                iniLevel: 0,
                levelDefault: 32,
                symbol: '+',
                placeholderDecode: 'SV+a',
                placeholderEncode: '13,6,-89,1;u=10',
                placeholderList: 'b,a,c',
                selectGrid: [2,4,8,16],
            }
        }
    }
};
