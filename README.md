# gridMap-draftPages
Experimental and internal-testing webpages for "map + geocode" visualization and grid navigation.

The `OSM.codes/{$geocode}` endpoint is redirected to postal or scientific geocodes. See `src/conf.nginx`.

## Postal geocodes
See `src/postal`.

## Scientific geocodes
See `src/scientific`.

## Complete panel

See `src/view`.

## Minificação e Compressão

```bash
terser logistic/main.js --compress --mangle --output logistic/main.min.js
terser scientific/main.js --compress --mangle --output scientific/main.min.js
terser logistic_br/main.js --compress --mangle --output logistic_br/main.min.js
terser resources/js/def.js --compress --mangle --output resources/js/def.min.js
```
