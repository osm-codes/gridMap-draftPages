var uri_base = window.location.protocol + '//' + window.location.hostname;

var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib = '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>';
var cartoUrl = 'https://{s}.basemaps.cartocdn.com/{id}/{z}/{x}/{y}{r}.png';
var cartoAttr = '<a href="https://carto.com/attributions">CARTO</a>';
var osmAndCartoAttr = osmAttrib + '. ' + cartoAttr;
var genericAttrib = '<a href="https://wiki.addressforall.org/doc/osmc:Atribui%C3%A7%C3%B5es" target="_help">info</a>';

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
                maxLength: 9,
                diffl0br: 0,
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
                maxLength: 12,
                diffl0br: 0,
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
                maxLength: 11,
                diffl0br: 0,
                symbol: '+',
                placeholderDecode: 'BR+hF',
                placeholderEncode: '-15.7,-47.8;u=10',
                placeholderList: 'h,7,B',
                selectGrid: [2,4,8,16],
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
                iniLevel: 4,
                endLevel: 36,
                modLevel: 1,
                iniDigit: 1,
                maxLength: 10,
                diffl0br: 4,
                symbol: '+',
                placeholderDecode: 'CM+a2',
                placeholderEncode: '4.8,11.9;u=10',
                placeholderList: 'b,a,c',
                selectGrid: [2,4,8,16],
            },
            base32:
            {
                iniLevel: 5,
                endLevel: 40,
                modLevel: 5,
                iniDigit: 2,
                maxLength: 9,
                diffl0br: 4,
                levelDefault: 35,
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
            base32:
            {
                iniLevel: 5,
                endLevel: 40,
                modLevel: 5,
                iniDigit: 2,
                maxLength: 9,
                diffl0br: 2,
                levelDefault: 40,
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
                maxLength: 11,
                diffl0br: 2,
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
                maxLength: 8,
                diffl0br: 5,
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
                maxLength: 11,
                diffl0br: 5,
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
                maxLength: 7,
                diffl0br: 6,
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
                maxLength: 11,
                diffl0br: 6,
                symbol: '+',
                placeholderDecode: 'UY+2',
                placeholderEncode: '-32.9,-55.9;u=10',
                placeholderList: '2G,3A,01',
                selectGrid: [2,4,8,16],
            },
            base16h1c:
            {
                iniLevel: 6,
                endLevel: 38,
                modLevel: 1,
                iniDigit: 1,
                maxLength: 10,
                diffl0br: 6,
                symbol: '+',
                placeholderDecode: 'UY+gB',
                placeholderEncode: '-32.9,-55.9;u=10',
                placeholderList: '3B,g,hB',
                selectGrid: [2,4,8,16],
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
        postalcodeBase: 'base32',
        isocode: 'SV',
        isocoden: 222,
        jurisdictionPlaceholder: 'SV-',
        selectedBases: ['base16h'],
        bases:
        {
            base16h:
            {
                iniLevel: 8,
                endLevel: 32,
                modLevel: 1,
                iniDigit: 1,
                maxLength: 9,
                diffl0br: 8,
                symbol: '+',
                placeholderDecode: 'SV+a',
                placeholderEncode: '13,6,-89,1;u=10',
                placeholderList: 'b,a,c',
                selectGrid: [2,4,8,16],
            },
        }
    }
};
