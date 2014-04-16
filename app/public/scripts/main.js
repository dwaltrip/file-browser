var FOLDER = 0, FILE = 1;

var Item = Backbone.Model.extend({
    idAttribute: '_id',
    initialize: function() { console.log('-- new Item with name: %s', this.get('name')) },

    url: function() {
      if (this.get('id')) {
        return '/items/' + this.get('id');
      }
      else {
        return '/items';
      }
    },

    hasParent: function() { return (this.get('parentId') || false); },
    isFile: function() { return (this.get('kind') == FILE); },
    isFolder: function() { return (this.get('kind') == FOLDER); },

    parse: function(data) {
      console.log('-- in Item.parse --', JSON.stringify(data));
      if (!data) { return {}; }
      else {
        this.isRoot = data.isRoot;
        if (!this.isRoot) { this.regularItem = true; }

        this.project_name = data.project_name;
        this.back_link = data.back_link;

        if (data.childItems && data.childItems.length > 0) {
          this.projectId = data.childItems[0].projectId;
          this.parentId = data.childItems[0].parentId;
          this.hasChildren = true;
          this.collection = new ChildItemList(data.childItems);
        }

        return data.item; // actual item contents
      }
    },

    toExtendedJSON: function() {
      return _.merge(this.toJSON(), {
        hasParent: this.hasParent(),
        isFile: this.isFile(),
        isFolder: this.isFolder(),
        isRoot: this.isRoot
      });
    }
});


var ChildItemList = Backbone.Collection.extend({
    model: Item,

    initialize: function() { console.log('-- new ChildItemList'); }
});


var ChildItemView = Backbone.View.extend({
    tagName: 'tr',

    initialize: function() {
      console.log('-- new ChildItemView');
      console.log('-- this.model.parentItem:', this.model.parentItem);
      console.log('-- this.model.parentItem.collection.length:', this.model.parentItem.collection.length);
    },

    render: function() {
      var template = new Hogan.Template(Templates.child_row);
      $(this.el).html(template.render(this.model.toExtendedJSON()));
      return this;
    },

    events: {
      'click a': 'showItem'
    },

    showItem: function(event) {
      event.preventDefault();
      console.log('ChildItemView showItem -- model.get(name) --', this.model.get('name') );
      console.log('ChildItemView showItem -- get(name), id, get(id) -- ', this.model.get('name'), this.model.id, this.model.get('id'));
      Backbone.trigger('child-item-clicked', this.model.id);
    },

    /* don't need this with current implementation
    unrender: function() {
      $(this.el).remove();
    },

    remove: function() {
      this.model.destroy();
    }
    */
});


var ItemView = Backbone.View.extend({
    el: '#item-container',

    initialize: function() {
      console.log('-- new ItemView');
      this.loadDataAndRender();
      this.listenTo(Backbone, 'child-item-clicked', function (item_id) { this.loadDataAndRender(item_id); }, this);
    },

    loadDataAndRender: function(item_id) {
      console.log('-- loadDataAndRender -- item_id:', item_id);
      if (item_id) {
        console.log('==== old model -- this.model.id:', this.model.id, this.model.get('id'));
        this.model = new Item({ id: item_id });
        console.log('==== new model -- this.model.id:', this.model.id, this.model.get('id'));
      }
      else
        this.model = new Item();

      var that = this;
      this.model.fetch({ success: function() { that.render() } });
    },

    render: function() {
      var inspector = function () { return function () { console.log('!!!!', this); } };
      var template = new Hogan.Template(Templates.item);
      var that = this;

      /*
      var item = false;
      if (this.model.id || this.model.get('id')) {
        item = this.model.toExtendedJSON();
      }*/
      var item = this.model.toExtendedJSON();

      this.$el.html(template.render({
        project_name: (this.model.project_name || 'Projects'),
        back_link: (this.model.back_link || false),
        hasChildren: (this.model.collection && this.model.collection.length > 0),
        item: item,
        inspect: inspector
      }));


      console.log('--- ItemView.render -- this.model.collection', this.model.collection);
      if (this.model.collection) {
        _(this.model.collection.models).each(function(childItem) {
          that.appendChild(childItem);
        }, this);
      }
    },

    events: {
      'click .back-link-container a': 'goUpOneLevel'
    },

    goUpOneLevel: function(event) {
      event.preventDefault();
      console.log('----- goUpOneLevel -- this.model.get(parentIsRoot):', this.model.get('parentId'));
      this.loadDataAndRender(this.model.get('parentId'));
    },

    appendChild: function(item) {
      console.log('--- appendChild -- item.get(name)', item.get('name'));
      item.parentItem = this.model;
      var childView = new ChildItemView({ model: item });
      $('.child-item-table tbody', this.el).append(childView.render().el);
    }
});

(function($) {
  console.log('-- inside anonymous document ready callback');

  $('.child-item-table tbody').empty();
  var item_view = new ItemView();

})(jQuery);

