// (c) 2017 osmcz-app, https://github.com/osmcz/osmcz

// var osmcz = osmcz || {};

L.Control.PhotoDBGui = L.Control.extend({

  options: {
    anchor: [ 250, 250 ],
    position: 'topright',
  },

  initialize: function (options) {
      L.setOptions(this, options);
  },

  onAdd: function (map) {
    this._createButton();
    this._map = map;
    this._precision = 5;

    return this._container;
  },

  destroy: function(){
    if(!this._map) {
        return this;
    }

    this.removeFrom(this._map);

    if (this.onRemove) {
        this.onRemove(this._map);
    }
    return this;
  },

  getElement: function(){
    return this._container;
  },

  _createButton: function(){
    var className = 'leaflet-control-photoDBbtn',
      container = this._container = L.DomUtil.create('div', className);

    var content = [];
    content.push('<a href="#" class="leaflet-control-photoDBbtn-text"></a>');
    container.innerHTML=content.join(" ");

    L.DomEvent.on(container, 'click', this._openSidebar, this);
  },

    _openSidebar: function(e) {
        if (osmcz.sidebar.isVisible()) {
            return;
        }

        osmcz.sidebar.setContent(this._sidebarInit());

        var cnt = document.getElementById("sidebar-content");

        // from http://stackoverflow.com/a/39065147
        const formTemplate = ({ maxSize }) => `
        <h4>Nahrání fotografie</h4>
        <p class='mark text-center'>Vyberte fotografii, doplňte údaje a stiskněte tlačítko [Nahrát fotografii]

        <form id="photoDB-upload-form" name="photoDB-upload-form" method="post" enctype="multipart/form-data" target="upload_target">
            <input type="hidden" name="action" value="file" />
            <input type="hidden" name="MAX_FILE_SIZE" value="${maxSize}" />
            <input type="hidden" id="lat" name="lat" value="0" exif-value="" />
            <input type="hidden" id="lon" name="lon" value="0" exif-value="" />

        <h5>Fotografie</h5>
        <fieldset>
          <img id="photoDB-preview" height="200" src="" alt="Náhled fotografie..." class="thumbnail hidden">
          <input name="uploadedfile" type="file" id="photoDB-file" size="20" class="hidden"/>
          <div id="imgSelBtnDiv">
            <input type="button" id="imgSelBtn" value="Vyberte fotografii" class="btn btn-default btn-xs center-block" />
          </div>
          <div id="photoDB-img-message" class="photoDB-message alert-warning block-center hidden"></div>
        </fieldset>

        <h5>Pozice <span class="smaller">(lat,lon)</span></h5>
        <fieldset id="latlonFs">
            <div class="input-group input-group-sm">
                <div id="latlonSource" class="input-group-btn input-group-btn" data-toggle="buttons">
                    <label id="sourceManual" class="btn btn-secondary btn-default active">
                        <input type="radio" id="latlonSourceManual" name="latlonSource" value="manual" autocomplete="off"> Ručně
                    </label>
                    <label id="sourceExif" class="btn btn-secondary btn-default disabled">
                        <input type="radio" id="latlonSourceExif" name="latlonSource" value="exif" autocomplete="off" checked> Exif
                    </label>
                </div>
                <input type="text" id="latlon" name="latlonDisp" value="" placeholder="--.---, --.---" title="Lat, Lon" class="form-control" readonly />
            </div>
            <div id="photoDB-latlon-message" class="photoDB-message mark text-center" style="display: none;"></span>
        </fieldset>

        <h5>Doplňující údaje</h5>
        <fieldset id="otherData">
            <div class="form">
                <label for="author" class="label-margin">Autor:</label>
                <input type="text" id="author" name="author" placeholder="Vaše jméno/přezdívka" class="form-control input-sm">
                <label for="author" class="label-margin">Licence:</label>
                <select id="license" class="form-control"></select>
                <label for="phototype" class="label-margin">Objekt na fotografii:</label>
                <select id="phototype" class="form-control">
                    <option value="rozcestnik">Rozcestník</option>
                    <option value="infotabule">Informační tabule</option>
                    <option value="mapa">Mapa</option>
                    <option value="panorama">Panorama</option>
                    <option value="jiny">Jiný</option>
                </select>
                <div id="guidepostOptions">
                    <label for="guidepostContent" class="label-margin">Typ rozcestníku:</label>
                    <div id="guidepostContent" class="btn-group btn-group-xs" data-toggle="buttons">
                        <label class="btn btn-default">
                            <input type="checkbox" value="hiking" autocomplete="off">Pěší
                        </label>
                        <label class="btn  btn-default">
                            <input type="checkbox" value="cycle" autocomplete="off">Cyklo
                        </label>
                        <label class="btn  btn-default">
                            <input type="checkbox" value="skir" autocomplete="off">Lyžařský
                        </label>
                        <label class="btn  btn-default">
                            <input type="checkbox" value="horse" autocomplete="off">Koňský
                        </label>
                        <label class="btn  btn-default">
                            <input type="checkbox" value="wheelchair" autocomplete="off">Vozíčkářský
                        </label>
                    </div>
                    <br>
                    <label for="ref" class="label-margin">Ref:</label>
                    <input type="text" id="ref" name="ref" value="" placeholder="Například: XX114 nebo 0123/45" class="form-control input-sm"/>
                </div>
                <label for="note" class="label-margin">Poznámka: </label>
                <input type="text" id="note" name="note" value="" placeholder="Zde můžete vložit poznámku k fotografii" class="form-control input-sm"/>
                <div id="photoDB-otherData-message" class="photoDB-message mark text-center" style="display: none;"></span>
            </div>
        </fieldset>
        <fieldset>
            <div class="photoDB-btn-grp">
                <input type="reset" id="resetBtn" name="reset" value="Reset" class="btn btn-default btn-xs"/>
                <input type="submit" id="submitBtn" name="submitBtn" value="Nahrát fotografii" class="btn btn-default btn-xs pull-right disabled"/>
            </div>
        </fieldset>
        `;

        $('#sidebar-content').html([
            { maxSize: '1000000' }
        ].map(formTemplate));

        var previewContainer = document.getElementById("photoDB-preview");
        var uploadedFile = document.getElementById("photoDB-file");
        var imgSelBtn = document.getElementById("imgSelBtn");
        var sourceExif = document.getElementById("sourceExif");
        var phototype = document.getElementById("phototype");
        var resetBtn = document.getElementById("resetBtn");

//         onload="osmcz.gpcheck.readExif(this)"
//         onchange="osmcz.gpcheck.previewFile(' + osmid + ')"
//         onclick="osmcz.gpcheck.selectImageClicked();"

//         onchange="osmcz.gpcheck.coordSourceChanged('+osmid+');"
//         onchange="osmcz.gpcheck.latlonChanged('+osmid+');"
//         onchange="osmcz.gpcheck.latlonChanged('+osmid+');"

//         onchange="osmcz.gpcheck.coordSourceChanged('+osmid+');"

//         onchange="osmcz.gpcheck.authorChanged(' + osmid + ')"

//         onclick="osmcz.gpcheck.resetForm(' + osmid + ');return false;"
//         onclick="osmcz.gpcheck.uploadFormData(' + osmid + ');return false;"

        L.DomEvent.on(imgSelBtn, 'click', this._selectImageClicked, this);
        L.DomEvent.on(uploadedFile, 'change', this._previewFile, this);
        L.DomEvent.on(previewContainer, 'load', this._readExif, this);
        L.DomEvent.on(sourceExif, 'click', this._sourceExifClicked, this);
        L.DomEvent.on(phototype, 'change', this._phototypeChanged, this);
        L.DomEvent.on(resetBtn, 'click', this._resetForm, this);

        this._getLicenses();

        // Create position marker
        this.positionMarker = L.marker([0, 0], {clickable: false, draggable: true, title: 'Vybrané souřadnice'});

        this.positionMarker
        .on('dragstart', function(event){
            $('#photoDB-upload-form #sourceManual').click();
        }, this)
        .on('drag', function(event){
            var marker = event.target;
            var position = marker.getLatLng();

            this._updateLatLonLabel(position.lat, position.lng);
        }, this)
        .on('dragend', function(event){
            var marker = event.target;
            var position = marker.getLatLng();

            this._updateLatLonLabel(position.lat, position.lng);
        }, this);


        sidebar.on('hidden', this._closeSidebar, this);
        osmcz.sidebar.show();
    },

    _closeSidebar: function(e) {
        this._hideMarker();
        sidebar.off('hidden', this._closeSidebar);
    },

    _sidebarInit: function() {
        var hc = "";

        hc += "<div class='sidebar-inner'>";
        hc += "<!--sidebar from guideposts--> ";
        hc += "  <div id='sidebar-content'>";
        hc += "  </div>";
        hc += "</div>";

        return hc;
    },

    // Form - select image clicked
    _selectImageClicked: function(e) {
        $('#photoDB-upload-form #photoDB-file').click();
    },

    // Form - Exif button clicked
    _sourceExifClicked: function(e) {
        var lat = $('#photoDB-upload-form #lat').attr('exif-value');
        var lon = $('#photoDB-upload-form #lon').attr('exif-value');
        this._updateLatLonLabel(lat, lon);
        this._moveMarker(lat, lon);
    },

    _phototypeChanged: function(e) {
        if (e.target.value == "rozcestnik") {
            $('#photoDB-upload-form #guidepostOptions').show('1');
        } else {
            $('#photoDB-upload-form #guidepostOptions').hide('1');
        }
    },

    _previewFile: function(e) {
        var preview = $('#photoDB-upload-form #photoDB-preview'); //selects the query named img
        var file    = $('#photoDB-upload-form #photoDB-file').prop("files")[0]; //sames as here
        var message = $('#photoDB-upload-form #photoDB-img-message');
        var reader  = new FileReader();

        preview.attr("src", "");
        preview.attr("alt", "Generuji náhled. Počkejte prosím...");

        reader.onloadend = function () {
            preview.attr("src", reader.result);
            preview.attr("alt", "Náhled fotografie...");
        }

        message.html('');

        if (file) {
            reader.readAsDataURL(file); //reads the data as a URL
            preview.attr("style", "display:block");
            preview.attr("class", "center-block");

            // Check file size
            if (file.size > $("#photoDB-upload-form input[name='MAX_FILE_SIZE']").val()) {
                message.html('<span class="glyphicon glyphicon-alert text-danger"></span> Soubor je moc velký!');
                message.show();
            }
        } else {
            preview.attr("src","");
            preview.attr("style", "display:none");
            message.html('<span class="glyphicon glyphicon-alert text-danger" title="Povinné pole!"></span>');
            message.show();
        }

        this._updateSubmitBtnStatus();
    },

    _resetForm: function() {
        this._hideMarker();

        // Show guidepost options block
        $('#photoDB-upload-form #guidepostOptions').show();

        // Hide image thumbnail
        var preview = $('#photoDB-upload-form #photoDB-preview');
        preview.hide();
        preview.attr("src", "");

        // read author and license from cookies

    },

    _updateSubmitBtnStatus: function() {
        // TODO
    },

    // Read exif data of image
    _readExif: function(e){
        var preview = $('#photoDB-upload-form #photoDB-preview'); //selects the query named img
        var btnSourceExif = $('#photoDB-upload-form #sourceExif');
        var btnSourceManual = $('#photoDB-upload-form #sourceManual');
        var message = $('#photoDB-latlon-message');

        $('#photoDB-upload-form #sourceManual').button('toggle')

        this._hideMarker();
        this._updateLatLonLabel(0, 0);


        btnSourceExif.addClass("disabled")
        btnSourceManual.button('toggle');



        function base64ToArrayBuffer (base64) {
            base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
            var binaryString = window.atob(base64);
            var len = binaryString.length;
            var bytes = new Uint8Array(len);
            for (var i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        }

        var exif = EXIF.readFromBinaryFile(base64ToArrayBuffer(e.currentTarget.currentSrc));

        if (!exif) {
            // No exif in image
            message.show();
            message.html("Pozici Vyberete kliknutím do mapy.");
            return;
        }

        var eLatRef = exif.GPSLatitudeRef;
        var eLat = exif.GPSLatitude;
        var eLonRef = exif.GPSLongitudeRef;
        var eLon = exif.GPSLongitude;

        if (eLatRef != null && eLat!= null && eLonRef != null && eLon!= null) {
            var lat=DMSToDD(eLat[0], eLat[1], eLat[2], eLatRef, this._precision); // how to get value of options.precision?
            var lon=DMSToDD(eLon[0], eLon[1], eLon[2], eLonRef, this._precision);
            this._updateLatLonLabel(lat, lon);
            this._showMarker(lat, lon);

            var pLat =  $('#photoDB-upload-form #lat');
            var pLon =  $('#photoDB-upload-form #lon');
            pLat.val(lat);
            pLon.val(lon);

            pLat.attr('exif-value', lat);
            pLon.attr('exif-value', lon);

            btnSourceExif.removeClass("disabled");
            btnSourceExif.button('toggle');
            message.hide();
            message.html("");
        }
    },


    _showMarker: function (lat, lon) {

        if (!lat || !lon) {
            return;
        }

        this._map.setZoom(18, {animate: false});
        this._map.panTo([lat, lon], {animate: false});

        this.positionMarker.setLatLng([lat, lon]);
        this.positionMarker.bindPopup('Presuň mě na cílové místo');
        this.positionMarker.addTo(this._map);
    },

    _moveMarker: function (lat, lon) {

        if (!lat || !lon) {
            return;
        }

        this._map.panTo([lat, lon], {animate: false});
        this.positionMarker.setLatLng([lat, lon]);
    },

    _hideMarker: function () {
        this._map.removeLayer(this.positionMarker);
    },

    _updateLatLonLabel: function(lat, lon) {
        var elatlon = $('#photoDB-upload-form #latlon');

        if (!lat || lat == 0 || !lon ||lon == 0 ) {
            elatlon.val('--.---, --.---');
        } else {
            elatlon.val((lat*1).toFixed(this._precision) + ', ' + (lon*1).toFixed(this._precision));
        }


    },

//     _updateDistanceLabel: function() {
//
//         var latExif = $('#photoDB-upload-form #latExif');
//         var lonExif = $('#photoDB-upload-form #lonExif');
//         var latOsm = $('#photoDB-upload-form #latOsm');
//         var lonOsm = $('#photoDB-upload-form #lonOsm');
// //         var distanceLabel = $('#photoDB-upload-form #gpc-latlon-distance');
//
//
//         if (latExif.val() != "--.---" && !osmcz.coorsError ) {
//             var distance = Math.abs(OSM.distance( {'lat': latOsm.val(), 'lng': lonOsm.val()},
//                                                   {'lat': latExif.val(), 'lng': lonExif.val()})).toFixed(2);
//             if (distance > 50.01) {
//               distanceLabel.html('<span class="glyphicon glyphicon-alert text-warning"></span> '+
//                                  '<strong class="text-warning" title="Rozdíl exif a osm souřadnic je větší než 50 metrů">(Rozdíl: ' +
//                                   distance.replace(/(\d)(?=(\d{3})+\.)/g, '$1 ') + ' metrů)</strong>');
//             } else {
//               distanceLabel.html("(Rozdíl: " + distance.replace(/(\d)(?=(\d{3})+\.)/g, '$1 ') + " metrů)");
//             }
//         } else {
//             distanceLabel.html("");
//         }
//     },

    // Get licenses list from api
    _getLicenses: function() {
        var license = $('#photoDB-upload-form #license option:selected').text();
        if (license == "" ) {
            // Get list of licenses
            $.ajax({
                url: 'https://api.openstreetmap.cz/table/licenseinfo?output=json',
                success: function (data) {
                    if (data != "") {
                        //show result
                        var lcSel = $('#photoDB-upload-form #license');
                        var jsonObj = JSON.parse(data);
                        Object.keys(jsonObj.licenses).forEach(function(k) {
                            lcSel.append($('<option>', {
                                    value: k,
                                    text : jsonObj.licenses[k],
                                    title: jsonObj.licenses[k],
                                    label: k
                                }));
                            });

                        if (Cookies.get("_photoDB_license") != null)
                            lcSel.val(Cookies.get("_photoDB_license")).change();
                    }
                },
                cache: true
            });
        }
    },

    _submit: function() {
        // get radio button value
        $('#latlonSource').find('label.active').find('input').prop('value');

        toastr.success('Fotografie byla odeslána.', 'Děkujeme', {closeButton: true, positionClass: "toast-bottom-center"});
    }



});

L.control.photoDbGui = function (options) {
  return new L.Control.PhotoDBGui(options);
};

