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
  },

});

L.control.photoDbGui = function (options) {
  return new L.Control.PhotoDBGui(options);
};

