'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "f9eae289e75d03809f487cb97dda2495",
"assets/FontManifest.json": "5a32d4310a6f5d9a6b651e75ba0d7372",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/images/header.png": "0a9a9639caa284f7052baa046edfb591",
"assets/images/headerjosenildo1.png": "80c46bbe606816dd4378b27bfcc0b794",
"assets/images/headerjosenildo2.png": "0a9a9639caa284f7052baa046edfb591",
"assets/images/icon/brazil.png": "3fc8860c56a93364c00c45ea5c18aa73",
"assets/images/icon/usa.png": "e499f1fbaeb06cf2b9f6ddfd4de672b5",
"assets/images/josenildo_transparente.png": "e5a172087f0451ac58a472633844c6b5",
"assets/images/navbar_logo.png": "0a9545f6340afd62a99f63344808d4c9",
"assets/images/project_1.png": "aff34e30aaf3d653a9d46c2ab5d54f58",
"assets/images/project_2.png": "1ba1d098221bd952885c1fbe040bcc90",
"assets/images/project_3.png": "06bf815c9e3dbc551795d9865b017296",
"assets/images/projeto_desenvolvedor.png": "ad5d1cb54d7bda50cac4b78266f64c58",
"assets/lib/locale/i18n_br.json": "86bbfdcc2bb961884f16eebf34e67c0f",
"assets/lib/locale/i18n_de.json": "d1def2efb201c2232d0050232148e56d",
"assets/lib/locale/i18n_en.json": "e2b3b990f4102be34d9601bc4ca2c255",
"assets/lib/locale/i18n_es.json": "027d5d35958ec86932df8c7aa8f672a1",
"assets/lib/locale/i18n_fr.json": "ea55bbc5432b729fc82be3764c3b2232",
"assets/lib/locale/i18n_hi.json": "63eaa60fddb71647eacb30488605aa7b",
"assets/lib/locale/i18n_pl.json": "855f80ac2e666de56ed0899a099bbed4",
"assets/lib/locale/i18n_sv.json": "15784150915196da7372b8e09546803f",
"assets/lib/locale/i18n_te.json": "1a6aff0952a6aceec028e2a04590facf",
"assets/lib/locale/i18n_vn.json": "ce21421d1441f3bb930a71d910b3566d",
"assets/lib/locale/translations.dart": "da091d89826af7d81529fbd55c4ed1a1",
"assets/NOTICES": "f3eae491e1e0f61ea7886d04e116196d",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "115e937bb829a890521f72d2e664b632",
"assets/packages/font_awesome_flutter/lib/fonts/fa-brands-400.ttf": "831eb40a2d76095849ba4aecd4340f19",
"assets/packages/font_awesome_flutter/lib/fonts/fa-regular-400.ttf": "a126c025bab9a1b4d8ac5534af76a208",
"assets/packages/font_awesome_flutter/lib/fonts/fa-solid-900.ttf": "d80ca32233940ebadc5ae5372ccd67f9",
"favicon-16x16.png": "83af74e17555fb7547f3d5f73ff5f0f2",
"favicon-32x32.png": "0b6ac602a4e5eea95e9eb09eb56710bb",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "778b5c326be8a178966eb15233fbf691",
"/": "778b5c326be8a178966eb15233fbf691",
"main.dart.js": "88e96022d8c7001482eeb2e9565cca9c",
"manifest.json": "ef8ec79247642ba9533153acfc0193ad",
"version.json": "01119dfb10345ae18a2d2f2fa67f05e7"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
